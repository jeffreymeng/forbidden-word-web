import '../styles/device-mode.scss'
import { Game, GameData, GameStatus, Player, PlayerStatus} from './game/Game';
import { firebase, login } from "./game/firebase";
import { User } from "firebase";
/*
TODO:
- GameStatus
    - Base gameplay off this, to update simply use firebase fieldvalue increment in an update
    - Host starts game, randomly assigns partners, can kick
 */
import $ from "jquery";
async function init() {

    let id = (window.location.pathname.split("/").length >= 3 ? window.location.pathname.split("/")[3] : false) || window.location.hash.substring(1);
    console.log(id, window.location.pathname.split("/"), window.location.hash);
    let valid = false;
    if (id) {
        valid = await Game.validateJoinCode(id);
    }
    if (!valid) {
        alert("Invalid game ID");
        window.location.href = "/index.html";
    }
    let user = await login();
    await connect(user, id);

}
async function initHandlers(game) {
    $("#game-leave").on("click", async () => {
        if(confirm("Are you sure you want to leave?")) {
            game.off("user-leave");
            await game.leave();
            // $(window).off("beforeunload", beforeUnloadHandler);
            window.location.href = "/index.html";
            return;
        }
    });
    // $(window).on("beforeunload", beforeUnloadHandler);
    // function beforeUnloadHandler() {
    //     return 'You have unsaved changes!';
    // }
}
async function connect(user: User, id: string) {

    let gameRef = firebase.firestore()
            .collection("games")
            .doc(id);
    let gameData: firebase.firestore.DocumentSnapshot | GameData = await gameRef
            .get()
    if (gameData.exists) {
        gameData = <GameData>gameData.data();
    } else {
        alert("Invalid Game ID");
        window.location.href = "/index.html";
        return;
    }

    let player: firebase.firestore.DocumentSnapshot | Player = await gameRef
            .collection("players")
            .doc(user.uid)
            .get();
    let game;
    if (player.exists) {
        player = <Player>player.data();
        game = new Game(id, user, player.name, player.isHost, true);
        $("#loading").addClass("hidden");
        $("#lobby").removeClass("hidden");
        processGameJoin(game, user);
    } else {

        // Ask for a username
        $("#loading").addClass("hidden");
        $("#join").removeClass("hidden");
        $("#username-submit").on("click", function() {
            let name = $("#username-input").val() + "";
            if (name.replace(/\s/g,"") === "") {
                $("#join-error").text("Error: Names may not be only whitespace.");
                return;
            }
            $("#username-submit").attr("disabled", "disabled").text("Loading...");
            console.log(name);
            $("#join-error").text("");


            $("#join").addClass("hidden");
            $("#lobby").removeClass("hidden");
            game = new Game(id, user, name, false);
            processGameJoin(game, user);
        });

    }



}
function processGameJoin(game: Game, user: User) {

    console.log(game);
    console.log(user);
    $("#game-code").text(game.id);
    $("#username").text(game.username);
    initHandlers(game).then(function() {
        $("#game-leave").removeClass("hidden");
        $("body").on("click", ".remove-player", function() {
            confirm("Remove " + $(this).attr("data-userName") + $(this).attr("data-userId") + "?");
        });
        game.on("user-join", function(e) {
            console.log("User joined", e);
            // sanitize usernames
            let userLi = document.createElement("li");
            userLi.id = "userList-user" + e.data.userId;
            userLi.appendChild(document.createTextNode(e.data.userData.name + (e.data.userData.isHost ? " (👑)": "")));
            if (game.isHost && !e.data.userData.isHost) {
                let a = document.createElement('a');

                a.title = "Remove Player";
                a.id = "remove-user" + e.data.userId;
                a.setAttribute("data-userId", e.data.userId);
                a.setAttribute("data-userName", e.data.userData.name);
                a.className = "remove-player";
                a.appendChild(document.createTextNode("remove"));
                userLi.append(document.createTextNode("("));
                userLi.append(a);
                userLi.append(document.createTextNode(")"));

            }
            $("#user-list").append(userLi);
        });

        game.on("user-leave", function(e) {
            if (e.data.userData.isHost) {
                alert("Host Left. You should leave");
            }
            console.log("User left", e);
            $("#userList-user" + e.data.userId).remove();
        });
        console.log(game.eventListeners);
    });
}
init();