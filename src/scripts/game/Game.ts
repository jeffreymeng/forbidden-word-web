import firebase from "./firebase";

import { generateRandomId } from "./utils";
import { User }  from "firebase";

interface Player {
    id: string;
    name: string;
}

/**
 * A Game is a representation of a forbidden word Game.
 * To create a new game on the server, use the static method Game.new().
 * To link to a game that exists on the server, use new Game();
 */
class Game {
    // Game status constants
    static readonly WAITING_FOR_PLAYERS = "WAITING";
    static readonly ASSIGNING_WORDS = "ASSIGNING";
    static readonly IN_PROGRESS = "PLAYING";
    static readonly RESTARTING = "RESTARTING";

    public id: string;
    public name: string;
    public isHost: boolean;
    public initialized: boolean;
    public user: User;

    constructor(id: string, user: User, name:string, isHost: boolean = false) {
        this.id = id;
        this.user = user;
        this.name = name;
        this.isHost = isHost;
        if (!isHost) {
            this.join(name);
        }
    }
    test() {
        console.log(this.id, 21309);
        firebase.firestore()
                .collection("games")
                .doc(this.id)
                .update({
                    test:"2345678"
                });
    }
    join(name:string) {
        let id = this.id;
        return firebase.firestore()
                .collection("games")
                .doc(id)
                .collection("players")
                .doc(this.user.uid)
                .set({
                    name,
                    isHost:false
                })
                .then(() => {
                    this.initialized = true;
                }).catch((error) => {
                    console.log(error);
                    throw error.message;
                });
    }
    static async createGame(name: string, user: User): Promise<Game> {

        let game = await generateRandomId().then(async function(id: string) {

            console.log(id);
            let gameData = {
                timestamp:new Date().getTime(),
                active:true,
                host:user.uid,
                status:Game.WAITING_FOR_PLAYERS
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

                    console.log("DONE: ", id);

                }).catch(function(e) {
                    console.log("ERROR", e);
                });
            console.log(id,user);
            return new Game(id, user, name, true);
        });
console.log(game);
        return game;

    }
}

export default Game;