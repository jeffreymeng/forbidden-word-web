"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("../styles/device-mode.scss");
var jquery_1 = __importDefault(require("jquery"));
var fontawesome_svg_core_1 = require("@fortawesome/fontawesome-svg-core");
var free_solid_svg_icons_1 = require("@fortawesome/free-solid-svg-icons");
var Game_1 = require("./game/Game");
var firebase_1 = require("./game/firebase");
var tippy_js_1 = __importDefault(require("tippy.js"));
require("tippy.js/dist/tippy.css");
var clipboard_1 = __importDefault(require("clipboard"));
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
function init() {
    return __awaiter(this, void 0, void 0, function () {
        var id, valid, user;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    initFonts();
                    id = (window.location.pathname.split("/").length >= 3 ? window.location.pathname.split("/")[3] : false) || window.location.hash.substring(1);
                    console.log(id, window.location.pathname.split("/"), window.location.hash);
                    valid = false;
                    if (!id) return [3 /*break*/, 2];
                    return [4 /*yield*/, Game_1.Game.validateJoinCode(id)];
                case 1:
                    valid = _a.sent();
                    _a.label = 2;
                case 2:
                    if (!valid) {
                        alert("Invalid game ID");
                        window.location.href = "/index.html";
                    }
                    return [4 /*yield*/, firebase_1.login()];
                case 3:
                    user = _a.sent();
                    return [4 /*yield*/, connect(user, id)];
                case 4:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function initHandlers(game) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            jquery_1.default("#game-leave").on("click", function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!confirm("Are you sure you want to leave?")) return [3 /*break*/, 2];
                            game.off("player-leave");
                            return [4 /*yield*/, game.leave()];
                        case 1:
                            _a.sent();
                            // $(window).off("beforeunload", beforeUnloadHandler);
                            window.location.href = "/index.html";
                            return [2 /*return*/];
                        case 2: return [2 /*return*/];
                    }
                });
            }); });
            if (game.isHost) {
                jquery_1.default(document).on("click", ".remove-user", function () {
                    var id = jquery_1.default(this).attr("data-player-id");
                    console.log("remove", id);
                    if (confirm("Kick " + jquery_1.default(this).attr("data-player-name") + "?")) {
                        game.kick(id);
                    }
                });
            }
            return [2 /*return*/];
        });
    });
}
function connect(user, id) {
    return __awaiter(this, void 0, void 0, function () {
        var gameRef, gameData, player, game;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    gameRef = firebase_1.firebase.firestore()
                        .collection("games")
                        .doc(id);
                    return [4 /*yield*/, gameRef
                            .get()];
                case 1:
                    gameData = _a.sent();
                    if (gameData.exists) {
                        gameData = gameData.data();
                    }
                    else {
                        alert("Invalid Game ID");
                        window.location.href = "/index.html";
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, gameRef
                            .collection("players")
                            .doc(user.uid)
                            .get()];
                case 2:
                    player = _a.sent();
                    if (player.exists) {
                        player = player.data();
                        game = new Game_1.Game(id, user, player.name, player.isHost, true);
                        jquery_1.default("#loading").addClass("hidden");
                        jquery_1.default("#lobby").removeClass("hidden");
                        processGameJoin(game, user);
                    }
                    else {
                        // Ask for a username
                        jquery_1.default("#loading").addClass("hidden");
                        jquery_1.default("#join").removeClass("hidden");
                        jquery_1.default("#username-submit").on("click", function () {
                            var name = jquery_1.default("#username-input").val() + "";
                            if (name.replace(/\s/g, "") === "") {
                                jquery_1.default("#join-error").text("Error: Names may not be only whitespace.");
                                return;
                            }
                            jquery_1.default("#username-submit").attr("disabled", "disabled").text("Loading...");
                            console.log(name);
                            jquery_1.default("#join-error").text("");
                            jquery_1.default("#join").addClass("hidden");
                            jquery_1.default("#lobby").removeClass("hidden");
                            game = new Game_1.Game(id, user, name, false);
                            processGameJoin(game, user);
                        });
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function processGameJoin(game, user) {
    console.log(game);
    console.log(user);
    jquery_1.default("#game-code").text(game.id);
    var uncopiedText = "Click to copy to clipboard";
    var failText = "Press " + (navigator.platform.substring(0, 3) === "Mac" ? "Cmd" : "Ctrl") + "+C to copy";
    var successText = "Copied!";
    var gameCodeTooltip = tippy_js_1.default(document.querySelector("#game-code"), {
        content: uncopiedText
    });
    var clipboard = new clipboard_1.default('#game-code', {
        text: function () { return game.id; }
    });
    clipboard.on('success', function (e) {
        console.info('Action:', e.action);
        console.info('Text:', e.text);
        console.info('Trigger:', e.trigger);
        gameCodeTooltip.setContent(successText);
        gameCodeTooltip.show();
        setTimeout(function () {
            gameCodeTooltip.setContent(uncopiedText);
        }, 1000);
        e.clearSelection();
    });
    clipboard.on('error', function (e) {
        console.error('Action:', e.action);
        console.error('Trigger:', e.trigger);
        gameCodeTooltip.setContent(failText);
        gameCodeTooltip.show();
        setTimeout(function () {
            gameCodeTooltip.setContent(uncopiedText);
        }, 1000);
    });
    jquery_1.default("#username").text(game.username);
    var usernameTooltip = tippy_js_1.default(document.querySelector("#username"), {
        content: "Click to change username"
    });
    jquery_1.default("#username").on("click", function () {
        var newUsername = prompt("Please enter your new username");
        game.username = newUsername;
    });
    initHandlers(game).then(function () {
        jquery_1.default(".footer").removeClass("hidden");
        jquery_1.default("body").on("click", ".remove-player", function () {
            confirm("Remove " + jquery_1.default(this).attr("data-userName") + jquery_1.default(this).attr("data-userId") + "?");
        });
        game.on("player-join", function (e) {
            console.log("User joined", e);
            // sanitize usernames
            jquery_1.default("#user-list").append(getUserlistUserElement(e.data, game));
        });
        game.on("player-leave", function (e) {
            if (e.data.isHost) {
                alert("Host Left. You should leave");
            }
            else if (e.data.id == user.uid) {
                // The current player was kicked
                alert("You have been disconnected by the host.");
                window.location.reload();
            }
            console.log("User left", e);
            jquery_1.default("#userList-user" + e.data.id).remove();
        });
        console.log(game.eventListeners);
    });
}
init();
/**
 * Generate an li for the user list from a username. This method can safely be used with user inputted usernames.
 * @param userId - The ID of the user.
 * @param username - The username of the user. The username will be sanitized before it is added to the element.
 * @param isHost - Whether or not the user is a host.
 */
function getUserlistUserElement(player, game) {
    var userLi = document.createElement("li");
    userLi.id = "userList-user" + player.id;
    userLi.appendChild(document.createTextNode(player.name));
    if (player.isHost) {
        var crown = document.createElement("i");
        crown.className = "fas fa-crown";
        userLi.appendChild(crown);
    }
    else if (game.isHost) {
        // If the player we are adding is not the current user, and the current user is host, render the remove button
        var removeLink = document.createElement("button");
        removeLink.className = "remove-user";
        removeLink.setAttribute("data-player-id", player.id);
        removeLink.setAttribute("data-player-name", player.name);
        var removeIcon = document.createElement("i");
        removeIcon.className = "fas fa-times-circle";
        removeLink.appendChild(removeIcon);
        userLi.appendChild(removeLink);
    }
    if (player.id == game.user.uid) {
        userLi.className = "userlist-player userlist-current-user";
    }
    else {
        userLi.className = "userlist-player";
    }
    return userLi;
}
function initFonts() {
    //render a subset of font awesome icons
    fontawesome_svg_core_1.library.add(free_solid_svg_icons_1.faCrown, free_solid_svg_icons_1.faTimesCircle);
    fontawesome_svg_core_1.dom.watch();
}
