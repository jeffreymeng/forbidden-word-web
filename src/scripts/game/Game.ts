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
    WAITING_FOR_PLAYERS = "WAITING_FOR_PLAYERS",
    ASSIGNING_WORDS = "ASSIGNING_WORDS",
    IN_PROGRESS = "IN_PROGRESS",
    RESTARTING = "RESTARTING"

}
enum PlayerStatus {
    READY = "READY",
    ASSIGNING_WORDS = "ASSIGNING_WORDS",
    IN_PROGRESS = "IN_PROGRESS"
}
/**
 * A Game is a representation of a forbidden word Game.
 * To create a new game on the server, use the static method Game.new().
 * To link to a game that exists on the server, use new Game(); or Game.reconnect();.
 */
class Game {




    public id: string;
    public name: string;
    public isHost: boolean;
    public initialized: boolean;
    public user: User;

    /**
     * Create a new representation of a game.
     * @param id - The game ID
     * @param user - A firebase user object, containing a user ID
     * @param name - The nickname of the user.
     * @param isHost - Whether the user is the host of the game.
     */
    constructor(id: string, user: User, name:string, isHost: boolean = false) {
        this.id = id;
        this.user = user;
        this.name = name;
        this.isHost = isHost;
        if (!isHost) {
            this.join(name);
        }
    }

    /**
     * Add the user to the firebase representation of the game.
     * @param name - The nickname of the user.
     */
    join(name:string) {
        let id = this.id;
        return firebase.firestore()
                .collection("games")
                .doc(id)
                .collection("players")
                .doc(this.user.uid)
                .set({
                    name,
                    isHost:this.isHost
                })
                .then(() => {
                    this.initialized = true;
                }).catch((error) => {
                    console.log(error);
                    throw error.message;
                });
    }

    /**
     * Get a Game object linked to a user that has already previously joined the game. The same effect can also be achieved
     * using new Game(), but reconnect requires less information than new Game() does.
     * @param id - The ID of the game to reconnect to.
     * @param user - The firebase user object of the logged in user that has already joined a game.
     * @returns - A new Game() instance.
     */
    static async reconnect(id: string, user: User): Promise<Game> {
        let gameRef = firebase.firestore()
                .collection("games")
                .doc(id);
        let gameData: firebase.firestore.DocumentSnapshot | GameData = await gameRef
                .get();
        if (gameData.exists) {
            gameData = <GameData>gameData.data();
        } else {
            throw "NoGameError: No initialized game could be found at the specified location.";
        }

        let player: firebase.firestore.DocumentSnapshot | Player = await gameRef
                .collection("players")
                .doc(user.uid)
                .get();
        if (player.exists) {
            player = <Player>player.data();
        } else {
            throw "NoPlayerError: The current player is not part of the game."
        }

        return new Game(id, user, player.name, player.isHost);

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
}

export default Game;