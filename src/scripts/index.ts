import { dom, library } from '@fortawesome/fontawesome-svg-core';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faCircle } from '@fortawesome/free-solid-svg-icons'
import '../styles/index.scss';
import $ from "jquery";

//render a subset of font awesome icons
library.add(faGithub, faCircle);
dom.watch();


$("#host-back, #join-back").click(() => {
    $("#view-join").addClass("hidden");
    $("#view-host").addClass("hidden");
    $("#view-home").removeClass("hidden");
});

$("#home-host").click(() => {
    $("#view-home").addClass("hidden");
    $("#view-host").removeClass("hidden");
});


$("#home-join").click(() => {
    $("#view-home").addClass("hidden");
    $("#view-join").removeClass("hidden");
});
