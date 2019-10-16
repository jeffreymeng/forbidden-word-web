import { dom, library } from '@fortawesome/fontawesome-svg-core'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import '../styles/index.scss';
import $ from "jquery";

//render a subset of font awesome icons
library.add(faGithub);
dom.i2svg().then(() => {
    console.debug("Font Awesome Icons Loaded");
});

$("#join-back").click(() => {
    $("#view-join").addClass("hidden");
    $("#view-home").removeClass("hidden");
})

$("#home-join").click(() => {
    $("#view-home").addClass("hidden");
    $("#view-join").removeClass("hidden");
});