import firebase from "./firebase";

import { generateRandomId } from "./utils";
import { User }  from "firebase";

interface Player {
    id?: string;
    name: string;
    isHost: boolean;
}

interface GameData {
    active: boolean;
    host: string;
    status: GameStatus;
    timestamp: number;
}
enum GameStatus {
    HOST_DISCONNECT = -1,
    WAITING_FOR_PLAYERS = 1,
    ASSIGNING_WORDS = 2,
    IN_PROGRESS = 3,
    RESTARTING = 4,


}
enum PlayerStatus {
    READY = "READY",
    ASSIGNING_WORDS = "ASSIGNING_WORDS",
    IN_PROGRESS = "IN_PROGRESS"
}

class Event {
    name: string;
    data: any;

    constructor(name?: string, data?: any) {
        this.name = name;
        this.data = data;
    }
}

/**
 * A Game is a representation of a forbidden word Game.
 * To create a new game on the server, use the static method Game.new().
 * To link to a game that exists on the server, use new Game(); or Game.reconnect();.
 */
class Game {

    /**
     *  The ID of the game instance.
     */
    public readonly id: string;

    /**
     * The username of the current player.
     */
    public readonly username: string;

    /**
     * Whether the current user is the host.
     */
    public isHost: boolean;

    /**
     * Whether the game has been initialized. A game is initialized if it's state is represented on the server.
     */
    public initialized: boolean;

    /**
     * The currently logged in user.
     */
    public readonly user: User;

    /**
     * List of event handlers.
     */
            // Supported events (WIP): user-join user-leave initialized
    eventListeners: object = {};

    /**
     * Create a new representation of a game.
     * @param id - The game ID
     * @param user - A firebase user object, containing a user ID
     * @param name - The nickname of the user.
     * @param isHost - Whether the user is the host of the game.
     * @param initialized - Whether the game has been initialized with a connection on the server.
     */
    constructor(id: string, user: User, name:string, isHost: boolean = false, initialized = false) {
        this.id = id;
        this.user = user;
        this.username = name;
        this.isHost = isHost;
        this.initialized = initialized || isHost;
        this.initializeListeners();
        if (!initialized) {
            this.join();
        }
    }

    /**
     * Add a game event listener.
     * @param eventNames - The name(s) of the events to attach the listener to.
     * @param callback - The function to call when the event is called.
     */
    on(eventNames: string|string[], callback:((e?: Event) => void)) {
        if (typeof eventNames == "string") {
            eventNames = eventNames.split(" ");
        }
        for (let i = 0; i < eventNames.length; i ++) {
            if (!this.eventListeners[eventNames[i]]) {
                this.eventListeners[eventNames[i]] = [];
            }
            this.eventListeners[eventNames[i]].push(callback);
        }
    }

    /**
     * Remove a game event listener.
     * @param eventNames - The name(s) of the events from which to remove the listener
     * @param callback - The specific callback to remove. If not provided, all callbacks will be removed.
     */
    off(eventNames: string|string[], callback?:((e?: Event) => void)) {
        if (typeof eventNames == "string") {
            eventNames = eventNames.split(" ");
        }
        for (let i = 0; i < eventNames.length; i ++) {
            if (!callback) {
                this.eventListeners[eventNames[i]] = [];
            } else {
                for (let j = 0; j < this.eventListeners[eventNames[i]]; j ++) {
                    if (this.eventListeners[eventNames[i]][j] == callback) {
                        delete this.eventListeners[eventNames[i]][j];
                    }
                }
            }

        }
    }

    /**
     * Add the user to the firebase representation of the game.
     * @param name - The nickname of the user.
     */
    join() {
        if (this.initialized) {
            console.warn("Warning: The game has already been initialized. Cannot re-join a game.");
        }

        let id = this.id;
        return firebase.firestore()
                .collection("games")
                .doc(id)
                .collection("players")
                .doc(this.user.uid)
                .set({
                    name:this.username,
                    isHost:this.isHost
                }).then(() => {
                    this.initialized = true;
                    this.trigger("initialized");
                })
                .catch((error) => {
                    console.log(error);
                    throw error;
                });


    }

    trigger(eventName: string, eventData?: any) {
        let e = new Event(eventName, eventData);
        for (let i = 0; i < this.eventListeners[eventName].length; i ++) {
            this.eventListeners[eventName][i](e);
        }
    }

    /**
     * Initialize the Game event listeners.
     */
    protected initializeListeners() {

        let gameRef = firebase.firestore()
                .collection("games")
                .doc(this.id);

        gameRef.collection("players")
                .onSnapshot((snapshot) => {
                    snapshot.docChanges().forEach((change) => {
                        if (change.type === "added") {
                            this.trigger("user-join", {
                                userData:change.doc.data(),
                                userId:change.doc.id
                            });
                        }
                        if (change.type === "modified") {
                            console.log("Modified player: ", {
                                userData:change.doc.data(),
                                userId:change.doc.id
                            });
                        }
                        if (change.type === "removed") {
                            this.trigger("user-leave", {
                                userData:change.doc.data(),
                                userId:change.doc.id
                            });
                        }
                    });
                });

    }

    /**
     * Leave the game. If the current user is the host, and the game has not yet started, the game will be terminated.
     */
    async leave() {
        if (this.isHost) {
            firebase.firestore()
                    .collection("games")
                    .doc(this.id)
                    .update({
                        status:GameStatus.HOST_DISCONNECT,
                        active:false
                    });
        }
        return firebase.firestore()
                .collection("games")
                .doc(this.id)
                .collection("players")
                .doc(this.user.uid)
                .delete();
    }

    /**
     * Create a new game on the server, and join it as the host.
     * @param name - The nickname for the current user.
     * @param user - The firebase user object of the current user.
     */
    static async createGame(name: string, user: User): Promise<Game> {

        let id = await generateRandomId();

        let gameData = {
            timestamp:new Date().getTime(),
            active:true,
            host:user.uid,
            status:GameStatus.WAITING_FOR_PLAYERS
        };
        let gameRef = firebase.firestore()
                .collection("games")
                .doc(id);
        await gameRef
            .set(gameData)
            .then(async function() {
                await gameRef.collection("players")
                        .doc(user.uid)
                        .set({
                            name,
                            isHost:true
                        });


            }).catch(function(e) {
                console.log("ERROR", e);
                throw e;
            });
        return new Game(id, user, name, true);

    }

    /**
     * Validates a given game code.
     */
    static async validateJoinCode(id: string) {
        let data = await firebase.firestore()
                .collection("games")
                .doc(id)
                .get();
        return data.exists;
    }

}

export {Game, GameData, GameStatus, Player, PlayerStatus}
export default Game;