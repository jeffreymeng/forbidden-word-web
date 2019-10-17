import { dom, library } from '@fortawesome/fontawesome-svg-core';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faCircle } from '@fortawesome/free-solid-svg-icons'
import '../styles/index.scss';
import $ from "jquery";

//render a subset of font awesome icons
library.add(faGithub, faCircle);
dom.watch();

async function validateJoinCode() {
    return new Promise<boolean>((resolve, reject) => {
        resolve(true);
    });
}

$("#home-host").click(() => {
    $(".view").addClass("hidden");
    $("#view-host").removeClass("hidden");
});

$("#home-join").click(() => {
    $(".view").addClass("hidden");
    $("#view-join").removeClass("hidden");
});

$("#home-rules").click(() => {
    $(".view").addClass("hidden");
    $("#view-rules").removeClass("hidden");
});

$("#join-btn").click(function() {

    let code = $("#join-code").val();
    let name = encodeURIComponent($("#join-name").val());
    console.log("start");
    validateJoinCode().then((valid) => {
        if (valid) {
            window.location.href = `game.html?from=home&code=${code}&name=${name}`;
        } else {
            alert("invalid");
        }
    });

});