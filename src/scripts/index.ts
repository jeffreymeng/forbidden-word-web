import { dom, library } from '@fortawesome/fontawesome-svg-core';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faCircle } from '@fortawesome/free-solid-svg-icons'
import '../styles/index.scss';
import $ from "jquery";
import Game from './game/Game';
import { firebase, login } from "./game/firebase";
import { User } from "firebase";

initFonts();
initHandlers();

async function validateJoinCode() {
    return new Promise<boolean>((resolve, reject) => {
        resolve(true);
    });
}



function initHandlers() {
    $("#home-host").click(() => {
        $(".view").addClass("hidden");
        $("#view-host").removeClass("hidden");
        $(".selected")
                .removeClass("selected")
                .removeAttr("tabindex")
                .removeAttr("disabled");
        $("#home-host")
                .addClass("selected")
                .attr("tabindex", -1)
                .attr("disabled", "disabled");
        $("#host-name").focus();
    });

    $("#home-join").click(() => {

        $(".view").addClass("hidden");
        $("#view-join").removeClass("hidden");
        $(".selected")
                .removeClass("selected")
                .removeAttr("tabindex")
                .removeAttr("disabled");
        $("#home-join")
                .addClass("selected")
                .attr("tabindex", -1)
                .attr("disabled", "disabled");
        $("#join-code").focus();
    });

    $("#home-rules").click(() => {
        $(".view").addClass("hidden");
        $("#view-rules").removeClass("hidden");
        $(".selected")
                .removeClass("selected")
                .removeAttr("tabindex")
                .removeAttr("disabled");
        $("#home-rules")
                .addClass("selected")
                .attr("tabindex", -1)
                .attr("disabled", "disabled");
    });

    $("#join-btn").click(async function() {

        let code = ($("#join-code").val() + "").toUpperCase();
        let name = $("#join-name").val() + "";

        console.log(name);
        if (name.replace(/\s/g,"") === "") {
            $("#join-error").text("Error: Names may not be only whitespace.");
            return;
        }
        $("#join-btn").attr("disabled", "disabled").text("Loading...");
        console.log(name);
        $("#join-error").text("");


        console.log("start");
        let valid = await validateJoinCode();

        if (valid) {
            firebase.auth().onAuthStateChanged(async function(user) {
                if (!user) {
                    user = await login();
                }
                console.log(user.uid, user);
                let game = new Game(code, user, name);
                console.log(game, code, name, user);
            })


        } else {
            $("#join-error").text("Error: Invalid game code.");
            alert("invalid");
        }

    });

    $("#host-btn").click(async function() {

        let name = $("#host-name").val() + "";
        if (name.replace(/\s/g,"") === "") {
            $("#noNameError").removeClass("hidden");
            return;
        }
        $("#host-btn").attr("disabled", "disabled").text("Loading...");
        firebase.auth().onAuthStateChanged(async function(user) {
            if (!user) {
                user = await login();
            }

            console.log(user.uid, user);
            let game = Game.createGame(name, user);
            console.log(user, game);
        })
    });

    $("#join-code").focus();
}

function initFonts() {
    //render a subset of font awesome icons
    library.add(faGithub, faCircle);
    dom.watch();
}

