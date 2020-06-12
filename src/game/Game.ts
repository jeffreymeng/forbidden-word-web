import firebase from "../firebase";
import Player, { PlayerData, PlayerStatus, PlayerWordStatus } from "./Player";
import * as Event from "./Event";
import { EventName } from "./Event";
import { generateRandomId } from "../utils/generateRandomId";

interface GameData {
	host: string;
	created: firebase.firestore.Timestamp;
	status: GameStatus;
	assignments?: Record<string, string>;
}


enum GameStatus {
	IN_LOBBY = "in_lobby",
	STARTING = "starting",
	CHOOSE_WORD = "choose_word",
	TALKING = "talking",
}

class PlayerModification {
	public readonly newValue: Player | null;
	public readonly id: string;

	constructor(id: string, newValue: Player | null) {
		this.id = id;
		this.newValue = newValue;
	}
}

/**
 * A representation of a Game on the server.
 */
class Game {
	get assignments(): Record<string, string> {
		return this._assignments;
	}


	protected readonly _code: string;
	protected readonly _uid: string;
	protected _host: string;
	protected _players: Player[] = [];
	protected _initialized = false;
	private _status: GameStatus;
	protected _initializedStatus = {
		data: false,
		players: false,
	};
	private unsubscribeFunctions: (() => void)[] = [];
	protected _connected = false;
	private listeners: Partial<{
		player_modified: ((e: Event.PlayerModifiedEvent) => void)[];
		initialized: ((e: Event.InitializedEvent) => void)[];
		kicked: ((e: Event.KickedEvent) => void)[];
		status_changed: ((e: Event.StatusChangedEvent) => void)[];
	}> = {};
	private _assignments: Record<string, string> = {};

	/**
	 * Creates a new Game representation.
	 * You must call connect() to ensure that it has data which will be synchronized with the server.
	 *
	 * Note that the game must already exist on the server. Call the static Game.create() to create a game on the server.
	 * @param code - The game code.
	 * @param uid - The user id of the local player
	 */
	constructor(code: string, uid: string) {
		this._code = code;
		this._uid = uid;
	}

	// @ts-ignore
	public on(event: "player_modified", handler: (e: Event.PlayerModifiedEvent) => void): void;
	public on(event: "initialized", handler: (e: Event.InitializedEvent) => void): void;
	public on(event: "kicked", handler: (e: Event.KickedEvent) => void): void;
	public on(event: "status_changed", handler: (e: Event.StatusChangedEvent) => void): void;

	/**
	 * Attach the handler to the specified event(s).
	 * @param event - The event to attach the handler to.
	 * @param handler - The handler to be called each time one of the events occurs.
	 */
	public on(event: EventName, handler: (e: Event.Event) => void): void {

		if (this.listeners[event]) {
			this.listeners[event].push(handler);
		} else {
			this.listeners[event] = [handler];
		}

	}

	/**
	 * Detaches all handlers for ALL events.
	 */
	public off(): void;

	/**
	 * Detaches all handlers for the specified event.
	 * @param event - The event to detach all handlers from.
	 */
	public off(event: EventName): void;

	// @ts-ignore
	public off(event: "player_modified", handler: (e: Event.PlayerModifiedEvent) => void): void;
	public off(event: "initialized", handler: (e: Event.InitializedEvent) => void): void;
	public off(event: "kicked", handler: (e: Event.KickedEvent) => void): void;
	public off(event: "status_changed", handler: (e: Event.StatusChangedEvent) => void): void;

	/**
	 * Detaches handlers matching the provided handler from the specified event.
	 * @param event - The event to detach the provided handler from.
	 * @param handler - The original handler used to call on().
	 */
	public off(event: EventName, handler: (e: Event.Event) => void): void;

	public off(event?: EventName, handler?: (e: Event.Event) => void): void {
		if (!event) {
			this.listeners = {};
			return;
		}
		if (this.listeners[event]) {
			if (handler) {
				// @ts-ignore
				this.listeners[event] = this.listeners[event].filter((h: (e: Event.Event) => void) => h != handler);
			} else {
				this.listeners[event] = [];
			}
		}
	}

	/**
	 * Connect to the server.
	 */
	public connect(doesNotExistHandler: () => void): void {
		this.unsubscribeFunctions.push(firebase
			.firestore()
			.collection("games")
			.doc(this.code)
			.onSnapshot(
				{ includeMetadataChanges: true },
				(snapshot: firebase.firestore.DocumentSnapshot<GameData | null>) => {
					console.log("STATUS UPDATE", snapshot.data(), snapshot.metadata);
					if (snapshot.metadata.hasPendingWrites) return;
					if (!snapshot.exists) {
						doesNotExistHandler();
						return;
					}
					this.updateData(snapshot.data());
				}));
		this.unsubscribeFunctions.push(firebase
			.firestore()
			.collection("games")
			.doc(this.code)
			.collection("players")
			.onSnapshot(
				{ includeMetadataChanges: true },
				(snapshot: firebase.firestore.QuerySnapshot<PlayerData>) => {
					if (snapshot.docs.some(s => s.metadata.hasPendingWrites)) return;
					this.updatePlayers(snapshot.docs.map(s => s.data()));
				}));

		this._connected = true;
	}

	/**
	 * Disconnect from the server.
	 */
	public disconnect(): void {
		if (!this.connected) {
			throw new Error("Cannot disconnect a game that was not previously connected. Check gameInstance.connected before disconnecting.");
		}
		this.unsubscribeFunctions.forEach(fn => fn());
		this.unsubscribeFunctions = [];
		this._connected = false;

	}

	protected updateData(data: GameData): void {
		this._host = data.host;
		if (data.assignments) {
			this._assignments = data.assignments;
		}
		const origStatus = this.status;
		this._status = data.status;
		if (this.status !== origStatus) {
			this.fireEvent("status_changed", new Event.StatusChangedEvent(data.status));
		}
		this._initializedStatus = {
			...this._initializedStatus,
			data: true,
		};
		this.fireInitialized();

	}

	/**
	 * Updates the internal players array with the given modification, and fires the appropriate events.
	 * @param data - An array of PlayerData. This should not be the same as the old value.
	 */
	protected updatePlayers(data: PlayerData[]): void {

		const oldPlayers = this._players;
		console.log("UPDATE CALLED", data);
		this._players = data.map(p => new Player(p.name, p.id, p.status, p.id == this.host, p.id == this.uid, p.wordStatus));
		if (this.status == GameStatus.CHOOSE_WORD && this.host && this.players.every(p => p.wordStatus == PlayerWordStatus.READY)) {
			// update the status
			this.startTalkingPhase();
		}
		if (Player.equalArrays(oldPlayers, this.players)) {
			console.warn("Equal arrays were passed to updatePlayers(). No events were fired.");
			return;
		}
		this._initializedStatus = {
			...this._initializedStatus,
			players: true,
		};
		this.fireInitialized();
		this.fireEvent("player_modified", new Event.PlayerModifiedEvent(this.players, oldPlayers));
		if (this.players.find(p => p.id == this._uid)?.status == PlayerStatus.KICKED) {
			this.fireEvent("kicked", new Event.KickedEvent());
		}
	}

	protected startTalkingPhase(): Promise<void> {
		return firebase.firestore()
			.collection("games")
			.doc(this.code)
			.update({
				status: GameStatus.TALKING,
			});
	}

	/**
	 * @returns the forbidden word for all players except the current one.
	 */
	public async getAssignedWords(): Promise<Record<string, string>> {
		if (this.status !== GameStatus.TALKING) {
			throw new Error("Cannot get assigned words from a game that is not in the conversation phase.");
		}

		return Promise.all(
			this.players
				.filter(p => !p.isLocalPlayer)
				.map(p => firebase.firestore()
					.collection("games")
					.doc(this.code)
					.collection("words")
					.doc(p.id)
					.get()
					.then(snapshot => ({
						word: snapshot.data().word,
						id: p.id,
					})),
				),
		)
			.then(wordList => wordList.reduce((acc, el) => {
				return {
					...acc,
					[el.id]: el.word,
				};
			}, {}));

	}

	public async assignWord(targetUID: string, word: string): Promise<void> {
		return this.setAssignedWord(targetUID, word);
	}

	public async unassignWord(targetUID: string): Promise<void> {
		return this.setAssignedWord(targetUID, null);
	}

	private async setAssignedWord(targetUID: string, word?: string): Promise<void> {
		if (this.assignments[this.uid] !== targetUID) {
			throw new Error("A word can only be assigned for the assigned target of this player.");
		}
		const batch = firebase.firestore().batch();
		if (word) {
			batch.set(
				firebase.firestore()
					.collection("games")
					.doc(this.code)
					.collection("words")
					.doc(targetUID), {
					word,
				});
		}
		batch.update(
			firebase.firestore()
				.collection("games")
				.doc(this.code)
				.collection("players")
				.doc(this.uid), {
				wordStatus: word === null ? PlayerWordStatus.CHOOSING : PlayerWordStatus.READY,
			});
		return batch.commit();
	}

	/**
	 * Fires the initialized event if all data has been initialized and the game has not yet been initialized.
	 */
	protected fireInitialized(): void {
		if (!this.initialized && this._initializedStatus.data && this._initializedStatus.players) {
			this.fireEvent("initialized", new Event.InitializedEvent());
			this._initialized = true;
		}
	}

	protected fireEvent(name: "player_modified", event: Event.PlayerModifiedEvent): void;
	protected fireEvent(name: "initialized", event: Event.InitializedEvent): void;
	protected fireEvent(name: "kicked", event: Event.KickedEvent): void;
	protected fireEvent(name: "status_changed", event: Event.StatusChangedEvent): void;

	protected fireEvent(name: EventName, event: Event.Event): void {
		console.log("FIRE: " + name, event);
		// @ts-ignore
		this.listeners[name]?.forEach((handler: (e: Event.Event) => void) => {
			// @ts-ignore
			handler(event);
		});
	}

	/**
	 * Starts the game. Must be host.
	 */
	public async start(): Promise<void> {
		if (!this.isHost) {
			throw new Error("Only the host can start a game.");
		}

		await firebase.firestore()
			.collection("games")
			.doc(this.code)
			.update({
				status: GameStatus.STARTING,
			});
		// wait for a bit to make sure that everything is synchronized.
		await new Promise((resolve) => setTimeout(resolve, 1000));


		await firebase.firestore()
			.collection("games")
			.doc(this.code)
			.update({
				assignments: Game.generateAssignments(this.players),
				status: GameStatus.CHOOSE_WORD,
			});

	}

	static generateAssignments<T extends Player[]>(players: T): Record<keyof T, keyof T> {
		/**
		 * Mutating fisher-yates shuffle
		 */
		const shuffle = <T>(array: T[]): T[] => {
			for (let i = array.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * i);
				const temp = array[i];
				array[i] = array[j];
				array[j] = temp;
			}
			return array;
		};
		return shuffle(players as any as Player[]).reduce((acc, player, i, arr): Partial<Record<keyof T, keyof T>> => {
			const target = i < arr.length - 1 ? arr[i + 1] : arr[0];
			return {
				...acc,
				[player.id]: target.id,
			};
		}, {}) as Record<keyof T, keyof T>;
	}

	/**
	 * Add a Player to the game.
	 * @param player
	 */
	public async add(player: Player): Promise<void> {
		if (this.hasName(player.name)) {
			return Promise.reject({
				code: "username_taken",
				message: "This username has already been taken. Spaces are not considered when comparing usernames.",
			});
		}
		if (!this.connected || !this.initialized) {
			return Promise.reject({
				code: "not_connected",
				message: "The game must be initialized and connected to the server to add a player.",
			});
		}
		if (this.status !== GameStatus.IN_LOBBY) {
			return Promise.reject({
				code: "already_started",
				message: "This game cannot be joined because it has already started",
			});
		}
		await firebase
			.firestore()
			.collection("games")
			.doc(this.code)
			.collection("players")
			.doc(player.id)
			.set(player.toJSON());
	}

	/**
	 * Kick a player. Intended for inactive players, so they may still rejoin.
	 * Must be host to kick.
	 * @param playerID - the ID of the player to kick
	 */
	public async kick(playerID: string): Promise<void> {
		if (!this.isHost) {
			throw new Error("You may not kick a player unless you are the host.");
		}
		if (this.uid == playerID) {
			throw new Error("You can not kick yourself. Use .leave() instead.");
		}
		return firebase.firestore()
			.collection("games")
			.doc(this.code)
			.collection("players")
			.doc(playerID)
			.update({
				status: PlayerStatus.KICKED,
			});

	}

	/**
	 * Determines whether or not the game contains a given player id.
	 * @param id - the user id of the player to test for
	 */
	public hasPlayerID(id: string): boolean {
		console.log("HPID", this.players.filter(p => {
			console.log(p, p.id == id && p.status == PlayerStatus.ACTIVE);
			return p.id == id && p.status == PlayerStatus.ACTIVE;
		}));
		return this.players.some(p => p.id == id && p.status == PlayerStatus.ACTIVE);
	}

	public hasName(name: string): boolean {
		return this._players.some(p => p.status == PlayerStatus.ACTIVE && p.name.replace(/ /g, "") == name.replace(/ /g, ""));
	}

	/**
	 * Returns whether or not the game is connected to the server.
	 */
	get connected(): boolean {
		return this._connected;
	}

	get code(): string {
		return this._code;
	}

	get host(): string {
		return this._host;
	}

	get isHost(): boolean {
		return this.host === this.uid;
	}

	get players(): Player[] {
		return this._players;
	}

	/**
	 * Whether or not this game has been initialized with data from the server.
	 */
	get initialized(): boolean {
		return this._initialized;
	}

	get uid(): string {
		return this._uid;
	}

	get status(): GameStatus {
		return this._status;
	}

	/**
	 * Create a new game on the server, then return a new Game representation of that game.
	 * @param uid - the user ID of the current user
	 * @param name - A username for the current user
	 */
	public static async create(name: string, uid: string): Promise<Game> {
		const code = await generateRandomId();
		//we must do this in order, so we can satisfy the security rules
		await firebase
			.firestore()
			.collection("games")
			.doc(code)
			.set({
				host: uid,
				status: "in_lobby",
				rematch: false,
				created: firebase.firestore.FieldValue.serverTimestamp(),
			});
		await firebase
			.firestore()
			.collection("games")
			.doc(code)
			.collection("players")
			.doc(uid)
			.set(new Player(name, uid, PlayerStatus.ACTIVE).toJSON());

		return new Game(code, uid);
	}


}

export { Game, GameData, GameStatus };
export default Game;