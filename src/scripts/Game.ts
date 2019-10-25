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
    public id: string;
    public name: string;
    public isHost: boolean;
    public initialized: boolean;
    public user: User;

    constructor(id: string, user: User, name:string, isHost: boolean = false) {
        this.id = id;
        if (!isHost) {
            this.join(name, user);
        }
        this.user = user;
        this.name = name;
        this.isHost = isHost;
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
    join(name:string, user: User) {
        let _this = this;
        let id = this.id;
        return firebase.firestore()
                .collection("games")
                .doc(id)
                .collection("players")
                .doc(id)
                .set({
                    id,
                    name
                })
                .then(function() {
                    _this.initialized = true;
                }).catch(function(error) {
                    console.log(error);
                    throw error.message;
                });
    }
    static async createGame(name: string, user: User): Promise<Game> {

        let game = await generateRandomId().then(async function(id) {

            if (id === false) {
                alert("error");
                return;

            }
            console.log(id);
            await firebase.firestore()
                .collection("games")
                .doc(id)
                .collection("players")
                .add({
                    timestamp:new Date().getTime(),
                    active:true,
                    host:user.uid,
                    players:[
                        {
                            id:user.uid,
                            name:name,
                        }
                    ]
                }).then(function() {


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