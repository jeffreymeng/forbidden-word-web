import '../styles/device-mode.scss';
import $ from "jquery";
import { dom, library } from '@fortawesome/fontawesome-svg-core';
import { faCrown, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

import { Game, GameData, GameStatus, Player, PlayerStatus} from './game/Game';
import Event  from "./game/Event";
import { firebase, login } from "./game/firebase";
import { Query } from "./utils/Query";
import { User } from "firebase";

import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import ClipboardJS from "clipboard";
import MicroModal from 'micromodal';
import '../styles/micromodal.scss';

/*
TODO:
- GameStatus
    - Base gameplay off this, to update simply use firebase fieldvalue increment in an update
    - Host starts game, randomly assigns partners, can kick

- After kicking, host can choose to reset the game code to prevent the user from rejoining. All current users will be kept. This is the same thing as the stage of the game
    known as remake.
    - When remaking, all active users are moved to the new game. This is done by pinging the user and making the user rejoin on the client side. On the client side, the URL
    is not actually reloaded, but the address bar URL is edited.
 */
async function init() {
    MicroModal.init({
        awaitCloseAnimation: true
    });

    initFonts();
    let id = (window.location.pathname.split("/").length >= 3 ? window.location.pathname.split("/")[2] : false) || window.location.hash.substring(1);
    console.log(id, window.location.pathname.split("/"), window.location.hash);
    let valid = false;
    if (id) {
        valid = await Game.validateJoinCode(id);
    }
    if (!valid) {
        alert("Invalid game ID");
        window.location.href = "/index.html?error=100";
    }
    let user = await login();
    await connect(user, id);

}
async function initHandlers(game: Game) {
    $("#game-leave").on("click", async () => {
        if (game.isHost) {
            $("#leave-confirm-host-info").removeClass("hidden");
        }
        console.log(MicroModal);
        MicroModal.init({
            awaitCloseAnimation: true
        });
        MicroModal.show("leave-confirm-modal");

    });

    $("#leave-confirm-btn").click(async () => {

        game.off("player-leave");
        await game.leave();
        MicroModal.close("leave-confirm-modal");
        // $(window).off("beforeunload", beforeUnloadHandler);
        window.location.href = "/";
        return;

    });

    initKick(game);
}
function initKick(game: Game) {
    let toKick;

    if (game.isHost) {
        $(document).on("click", ".remove-user", function() {
            let id = $(this).attr("data-player-id");
            console.log("remove", id);
            $(".remove-user-confirm-name").text($(this).attr("data-player-name"));
            toKick = id;
            MicroModal.show("remove-user-confirm-modal");

        });

    }
    $(document).on("click", "#remove-user-confirm-btn", () => {
        game.kick(toKick);

        // Using the data attribute can work in unintended ways on mobile
        MicroModal.close("remove-user-confirm-modal");
    });
}
async function connect(user: User, id: string) {

    let gameRef = firebase.firestore()
            .collection("games")
            .doc(id);
    let gameData: firebase.firestore.DocumentSnapshot | GameData = await gameRef
            .get();
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
        $("#username-input").val(Query.get("username") || "");
        if (Query.get("ref") === "host_disconnect") {
            $("#join-error").text("You have been disconnected by the host. You may still rejoin.");
        }
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
    let uncopiedText = "Click to copy to clipboard";
    let failText = "Press " + (navigator.platform.substring(0,3) === "Mac" ? "Cmd" : "Ctrl") + "+C to copy";
    let successText = "Copied!";
    const gameCodeTooltip = tippy(document.querySelector("#game-code"), {
        content: uncopiedText
    });
    const clipboard = new ClipboardJS('#game-code', {
        text: () => game.id
    });
    clipboard.on('success', function(e) {
        console.info('Action:', e.action);
        console.info('Text:', e.text);
        console.info('Trigger:', e.trigger);
        gameCodeTooltip.setContent(successText);
        gameCodeTooltip.show();
        setTimeout(() => {
            gameCodeTooltip.setContent(uncopiedText);
        }, 1000);
        e.clearSelection();
    });

    clipboard.on('error', function(e) {
        console.error('Action:', e.action);
        console.error('Trigger:', e.trigger);
        gameCodeTooltip.setContent(failText);
        gameCodeTooltip.show();
        setTimeout(() => {
            gameCodeTooltip.setContent(uncopiedText);
        }, 1000);
    });


    $("#username").text(game.username);
    const usernameTooltip = tippy(document.querySelector("#username"), {
        content: "Click to change username"
    });
    $("#username").on("click", () => {
        let newUsername = prompt("Please enter your new username");
        if (newUsername.replace(/\s/g,"") === "") {
            alert("Error: Names may not be only whitespace.");
            return;
        }
        $("#username").text("Updating...").attr("disabled", "disabled");
        game.updateUsername(newUsername).then(() => {
            $("#username").text(newUsername).removeAttr("disabled");
        });

    });

    initHandlers(game).then(function() {
        $(".footer").removeClass("hidden");
        $("body").on("click", ".remove-player", function() {
            confirm("Remove " + $(this).attr("data-userName") + $(this).attr("data-userId") + "?");
        });
        game.on("player-join", function(e: Event.Player.Join) {
            console.log("User joined", e);
            // order it so that the current user is always first, and the host is always next (unless they are the same)
            if (e.data.id === game.user.uid) {
                $("#user-list").prepend(getUserlistUserElement(e.data, game));
            } else if(e.data.isHost && $("#userList-user" + game.user.uid).length > 0) {
                // If the current user has already been added:
                $("#userList-user" + game.user.uid).after(getUserlistUserElement(e.data, game));
            } else if (e.data.isHost) {
                // If the current user hasn't already been added
                $("#user-list").prepend(getUserlistUserElement(e.data, game));
            } else {
                $("#user-list").append(getUserlistUserElement(e.data, game));
            }

        });

        game.on("player-modify", function(e: Event.Player.Modify) {
            console.log("user modified", e);
            console.log(getUserlistUserElement(e.data, game));
            $("#userList-user" + e.data.id).replaceWith(getUserlistUserElement(e.data, game));
        });

        game.on("player-leave", function(e: Event.Player.Leave) {
            if (e.data.isHost) {
                alert("Host Left. You should leave");
            } else if (e.data.id == user.uid) {
                // The current player was kicked
                console.log(e.data.id, user.uid);
                // Window.location.href doesn't always reload the page, because there is a hash.
                let newUrl = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "") + window.location.pathname + Query.set("ref", "host_disconnect", Query.set("username", e.data.name)) + window.location.hash;
                console.log(window.location.href != newUrl, newUrl);
                if (window.location.href != newUrl) {
                    console.log("change");
                    window.location.href = newUrl;
                } else {
                    console.log("reload");
                    window.location.reload();
                }
                return;
            }
            console.log("User left", e);
            $("#userList-user" + e.data.id).remove();
        });
        console.log(game.eventListeners);
    });
}
init();

/**
 * Generate an li for the user list from a username. This method can safely be used with user inputted usernames.
 * @param player - The player to generate the li for.
 * @param game - The game.
 */
function getUserlistUserElement(player: Player, game: Game): HTMLElement {
    let userLi = document.createElement("li");
    userLi.id = "userList-user" + player.id;
    userLi.appendChild(document.createTextNode(player.name));
    if (player.isHost) {
        let crown = document.createElement("i");
        crown.className = "fas fa-crown";
        userLi.appendChild(crown);
    } else if (game.isHost) {
        // If the player we are adding is not the current user, and the current user is host, render the remove button
        let removeLink = document.createElement("button");
        removeLink.className = "remove-user";
        removeLink.setAttribute("data-player-id", player.id);
        removeLink.setAttribute("data-player-name", player.name);
        let removeIcon = document.createElement("i");
        removeIcon.className = "fas fa-times-circle";
        removeLink.appendChild(removeIcon);
        userLi.appendChild(removeLink);
    }
    if (player.id == game.user.uid) {
        userLi.className = "userlist-player userlist-current-user";
    } else {
        userLi.className = "userlist-player";
    }
    return userLi;
}

function initFonts() {
    //render a subset of font awesome icons
    library.add(faCrown, faTimesCircle);
    dom.watch();
}
