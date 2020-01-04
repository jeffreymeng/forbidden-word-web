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
var fontawesome_svg_core_1 = require("@fortawesome/fontawesome-svg-core");
var free_brands_svg_icons_1 = require("@fortawesome/free-brands-svg-icons");
var free_solid_svg_icons_1 = require("@fortawesome/free-solid-svg-icons");
require("../styles/index.scss");
var jquery_1 = __importDefault(require("jquery"));
var Game_1 = __importDefault(require("./game/Game"));
var firebase_1 = require("./game/firebase");
initFonts();
initHandlers();
function initHandlers() {
    jquery_1.default("#home-host").click(function () {
        jquery_1.default(".view").addClass("hidden");
        jquery_1.default("#view-host").removeClass("hidden");
        jquery_1.default(".selected")
            .removeClass("selected");
        jquery_1.default("#home-host")
            .addClass("selected");
        jquery_1.default("#host-name").focus();
    });
    jquery_1.default("#home-join").click(function () {
        jquery_1.default(".view").addClass("hidden");
        jquery_1.default("#view-join").removeClass("hidden");
        jquery_1.default(".selected")
            .removeClass("selected");
        jquery_1.default("#home-join")
            .addClass("selected");
        jquery_1.default("#join-code").focus();
    });
    jquery_1.default("#home-rules").click(function () {
        jquery_1.default(".view").addClass("hidden");
        jquery_1.default("#view-rules").removeClass("hidden");
        jquery_1.default(".selected")
            .removeClass("selected");
        jquery_1.default("#home-rules")
            .addClass("selected");
    });
    jquery_1.default("#join-btn").click(function () {
        return __awaiter(this, void 0, void 0, function () {
            var code, name, valid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        code = (jquery_1.default("#join-code").val() + "").toUpperCase();
                        name = jquery_1.default("#join-name").val() + "";
                        console.log(name);
                        if (name.replace(/\s/g, "") === "") {
                            jquery_1.default("#join-error").text("Error: Names may not be only whitespace.");
                            return [2 /*return*/];
                        }
                        jquery_1.default("#join-btn").attr("disabled", "disabled").text("Loading...");
                        console.log(name);
                        jquery_1.default("#join-error").text("");
                        console.log("start");
                        return [4 /*yield*/, Game_1.default.validateJoinCode(code)];
                    case 1:
                        valid = _a.sent();
                        if (valid) {
                            firebase_1.firebase.auth().onAuthStateChanged(function (user) {
                                return __awaiter(this, void 0, void 0, function () {
                                    var game;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                if (!!user) return [3 /*break*/, 2];
                                                return [4 /*yield*/, firebase_1.login()];
                                            case 1:
                                                user = _a.sent();
                                                _a.label = 2;
                                            case 2:
                                                console.log(user.uid, user);
                                                game = new Game_1.default(code, user, name);
                                                if (game.initialized) {
                                                    window.location.href = "/game.html#" + code;
                                                }
                                                game.on("initialized", function () {
                                                    window.location.href = "/game.html#" + code;
                                                });
                                                return [2 /*return*/];
                                        }
                                    });
                                });
                            });
                        }
                        else {
                            jquery_1.default("#join-error").text("Error: Invalid game code.");
                            jquery_1.default("#join-btn").removeAttr("disabled").text("Join Game");
                        }
                        return [2 /*return*/];
                }
            });
        });
    });
    jquery_1.default("#host-btn").click(function () {
        return __awaiter(this, void 0, void 0, function () {
            var name;
            return __generator(this, function (_a) {
                name = jquery_1.default("#host-name").val() + "";
                if (name.replace(/\s/g, "") === "") {
                    jquery_1.default("#noNameError").removeClass("hidden");
                    return [2 /*return*/];
                }
                jquery_1.default("#host-btn").attr("disabled", "disabled").text("Loading...");
                firebase_1.firebase.auth().onAuthStateChanged(function (user) {
                    return __awaiter(this, void 0, void 0, function () {
                        var game;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!!user) return [3 /*break*/, 2];
                                    return [4 /*yield*/, firebase_1.login()];
                                case 1:
                                    user = _a.sent();
                                    _a.label = 2;
                                case 2:
                                    console.log(user.uid, user);
                                    return [4 /*yield*/, Game_1.default.createGame(name, user)];
                                case 3:
                                    game = _a.sent();
                                    console.log(user, game);
                                    localStorage.setItem("currentGameID", game.id);
                                    window.location.href = "/game.html#" + game.id;
                                    return [2 /*return*/];
                            }
                        });
                    });
                });
                return [2 /*return*/];
            });
        });
    });
    jquery_1.default("#join-code").focus();
}
function initFonts() {
    //render a subset of font awesome icons
    fontawesome_svg_core_1.library.add(free_brands_svg_icons_1.faGithub, free_solid_svg_icons_1.faCircle);
    fontawesome_svg_core_1.dom.watch();
}
