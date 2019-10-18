import { dom, library } from '@fortawesome/fontawesome-svg-core';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faCircle } from '@fortawesome/free-solid-svg-icons'
import '../styles/index.scss';
import $ from "jquery";
import firebase from "./firebase";


//render a subset of font awesome icons
library.add(faGithub, faCircle);
dom.watch();

async function validateJoinCode() {
    return new Promise<boolean>((resolve, reject) => {
        resolve(true);
    });
}

async function generateRandomId(tries = 0, minLength = 5) {
    console.log(tries, minLength);
    if (tries > 100) {

        minLength += 2;
    }
    if (tries > 1000) {
        throw "Random Error";
        return false;
    }

    // Avoid 0 and O because they are ambiguous.
    let chars = "123456789ABCDEFGHIJKLMNPQRSTUVWXYZ";
    let result = "";
    for (let i = minLength; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    console.log(result);
    return firebase.firestore()
            .collection("games")
            .doc(result)
            .get()
            .then(function(doc) {
                console.log(doc.exists);
                if (!doc.exists) {
                    console.log(result);
                    return result;
                } else {
                    generateRandomId(tries + 1, minLength)
                        .then(function (id) {
                            console.log("TRY AGAIN");
                            return id;
                        })
                }
            })
}

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
            .removeAttr("disabled");;
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

$("#join-btn").click(function() {

    let code = $("#join-code").val();
    let name = encodeURIComponent($("#join-name").val());
    console.log("start");
    validateJoinCode().then((valid) => {
        if (valid) {
            window.location.href = `game.html?from=home-join&code=${code}&name=${name}`;
        } else {
            alert("invalid");
        }
    });

});

$("#host-btn").click(function() {
    let name = $("#host-name").val();
    if (name.replace(/\s/g,"") === "") {
        $("#noNameError").removeClass("hidden");
        return;
    }
    generateRandomId().then(function(id) {
        if (id === false) {
            alert("error");
            return;

        }
        console.log(id);
        firebase.firestore()
                .collection("games")
                .doc(id)
                .set({
                    timestamp:new Date().getTime(),
                    active:true,
                    users:[
                        name
                    ]
                }).then(function() {
                    window.location.href = `game.html?from=home-host&code=${id}&name=${name}`;
                    console.log("DONE");
                }).catch(function(e) {
                    console.log("ERROR", e);
                });

    });
});