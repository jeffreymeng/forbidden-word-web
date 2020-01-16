import { dom, library } from '@fortawesome/fontawesome-svg-core';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import '../styles/index.scss';
import $ from "jquery";
import Game from './game/Game';
import { firebase, login } from "./game/firebase";
import { User } from "firebase";

initFonts();
initHandlers();




function initHandlers() {
    // Right now, and when the hash changes, change the page
    $(window).on("hashchange", function() {
        let page = window.location.hash.substring(1);
        if (["host", "rules"].indexOf(page) < 0) {
            page = "join";
        }
        $(".view").addClass("hidden");
        $(".selected").removeClass("selected");
        let elementToFocusMap = {
            host:"#host-name",
            join:"#join-code",
            rules:false
        };
        $(`#view-${page}`).removeClass("hidden");
        $(`#home-${page}`).addClass("selected");
        if (elementToFocusMap[page]) {
            $(elementToFocusMap[page]).focus();
        }
    }).trigger("hashchange");


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
        let valid = await Game.validateJoinCode(code);

        if (valid) {
            firebase.auth().onAuthStateChanged(async function(user) {
                if (!user) {
                    user = await login();
                }
                console.log(user.uid, user);
                let game = new Game(code, user, name);
                if (game.initialized) {
                    window.location.href = "/game.html#" + code;
                }
                game.on("initialized", function() {
                    window.location.href = "/game.html#" + code;
                });

            })


        } else {
            $("#join-error").text("Error: Invalid game code.");
            $("#join-btn").removeAttr("disabled").text("Join Game");
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
            let game = await Game.createGame(name, user);
            console.log(user, game);
            window.location.href = "/game.html#" + game.id;
        })
    });

    $("#join-code").focus();
}

function initFonts() {
    //render a subset of font awesome icons
    library.add(faGithub, faCircle);
    dom.watch();
}

