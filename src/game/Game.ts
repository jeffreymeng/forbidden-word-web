import firebase from "../firebase";
import Player, { PlayerData, PlayerStatus } from "./Player";
import * as Event from "./Event";
import { EventName } from "./Event";
import { generateRandomId } from "../utils/generateRandomId";

interface GameData {
	host: string;
	players: PlayerData[];
	created: firebase.firestore.Timestamp;
}


enum GameStatus {
	IN_LOBBY = "in_lobby",
}


/**
 * A representation of a Game on the server.
 */
class Game {

	protected readonly _code: string;
	protected readonly _uid: string;
	protected _host: string;
	protected _isHost: boolean;
	protected _players: Player[] = [];
	protected _initialized = false;
	private unsubscribeFunction: (null | (() => void)) = null;
	protected _connected = false;
	private listeners: Partial<{
		player_modified: ((e: Event.PlayerModifiedEvent) => void)[];
		initialized: ((e: Event.InitializedEvent) => void)[];
		kicked: ((e: Event.KickedEvent) => void)[];
	}> = {};

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
				this.listeners[event] = this.listeners[event].filter(h => h != handler);
			} else {
				this.listeners[event] = [];
			}
		}
	}

	/**
	 * Connect to the server.
	 */
	public connect(): void {
		this.unsubscribeFunction = firebase
			.firestore()
			.collection("games")
			.doc(this.code)
			.onSnapshot((snapshot: firebase.firestore.DocumentSnapshot<GameData>) => {
				this.setData(snapshot.data());
				console.log(snapshot.data());
			});
		this._connected = true;
	}

	/**
	 * Disconnect from the server.
	 */
	public disconnect(): void {
		if (!this.connected) {
			throw new Error("Cannot disconnect a game that was not previously connected. Check gameInstance.connected before disconnecting.");
		}
		this.unsubscribeFunction();
		this._connected = false;

	}

	protected setData(data: GameData): void {
		this._host = data.host;
		this._isHost = data.host == this.uid;
		const newPlayers = data.players.map(p => new Player(p.name, p.id, p.status, p.id == data.host, p.id == this.uid));
		console.log("SETTING PLAYERS", newPlayers, newPlayers[0].status);
		this._players = newPlayers;
		console.log("SET PLAYERS", this.players, this.hasPlayerID(newPlayers[0].id));
		if (!Player.equalArrays(newPlayers, this._players)) {
			this.fireEvent("player_modified", new Event.PlayerModifiedEvent(newPlayers, this._players));
		}
		if (newPlayers.filter(p => p.id == this._uid).length > 0 && newPlayers.filter(p => p.id == this._uid)[0].status == PlayerStatus.KICKED) {
			this.fireEvent("kicked", new Event.KickedEvent());
		}


		if (!this.initialized) {
			this.fireEvent("initialized", new Event.InitializedEvent());
			this._initialized = true;
		}
	}

	protected fireEvent(name: "player_modified", event: Event.PlayerModifiedEvent): void;
	protected fireEvent(name: "initialized", event: Event.InitializedEvent): void;
	protected fireEvent(name: "kicked", event: Event.KickedEvent): void;

	protected fireEvent(name: EventName, event: Event.Event): void {
		console.log("FIRE: " + name, event);
		this.listeners[name]?.forEach((handler) => {
			// @ts-ignore
			handler(event);
		});
	}

	/**
	 * Add a Player to the game.
	 * @param player
	 */
	public async add(player: Player): Promise<void> {
		// TODO: check if they are allowed to join the game based on status
		if (this.hasName(player.name)) {
			return Promise.reject({
				code: "username_taken",
				message: "The player's username has already been taken. Spaces are not considered when comparing usernames.",
			});
		}
		await firebase
			.firestore()
			.collection("games")
			.doc(this.code)
			.update({
				players: firebase.firestore.FieldValue.arrayUnion(player.toJSON()),
			});
	}

	/**
	 * Kick a player. Intended for inactive players, so they may still rejoin.
	 * Must be host.
	 * @param player
	 */
	public async kick(playerID: string): Promise<void> {
		if (!this.isHost) {
			throw new Error("You may not kick a user unless you are the host.");
		}
		if (this.uid == playerID) {
			throw new Error("You can not kick yourself. Use game.leave instead.");
		}

		const ref = firebase.firestore().collection("games").doc(this.code);
		return firebase.firestore().runTransaction(function(transaction) {
			// This code may get re-run multiple times if there are conflicts.
			return transaction.get(ref).then(function(snapshot) {
				if (!snapshot.exists) {
					throw new Error("The game could not be found.");
				}
				let didKick = false;
				console.log(playerID, snapshot.data());
				const newPlayers = snapshot.data().players.map((p: PlayerData) => {
					console.log(p);
					if (p.id == playerID) {
						didKick = true;
						return {
							...p,
							status: PlayerStatus.KICKED,
						};
					}
					return p;
				});
				if (!didKick) {
					throw new Error("The player to be kicked could not be found.");
				}
				transaction.update(ref, { players: newPlayers });
			});
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
		}))
		return this.players.filter(p => p.id == id && p.status == PlayerStatus.ACTIVE).length != 0;
	}

	public hasName(name: string): boolean {
		return this._players.filter(p => p.status == PlayerStatus.ACTIVE && p.name.replace(/ /g, "") == name.replace(/ /g, "")).length > 0;
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
		return this._isHost;
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
				players: [new Player(name, uid, PlayerStatus.ACTIVE).toJSON()],
			});
		await firebase
			.firestore()
			.collection("games")
			.doc(code)
			.collection("players")
			.doc(uid)
			.set({
				name: name,
				isHost: true,
			});

		return new Game(code, uid);
	}


}

export { Game, GameData, GameStatus };
export default Game;