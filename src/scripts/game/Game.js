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
var firebase_1 = __importDefault(require("./firebase"));
var utils_1 = require("./utils");
var Event_1 = require("./Event");
var GameStatus;
(function (GameStatus) {
    GameStatus[GameStatus["HOST_DISCONNECT"] = -1] = "HOST_DISCONNECT";
    GameStatus[GameStatus["WAITING_FOR_PLAYERS"] = 1] = "WAITING_FOR_PLAYERS";
    GameStatus[GameStatus["ASSIGNING_WORDS"] = 2] = "ASSIGNING_WORDS";
    GameStatus[GameStatus["IN_PROGRESS"] = 3] = "IN_PROGRESS";
    GameStatus[GameStatus["RESTARTING"] = 4] = "RESTARTING";
})(GameStatus || (GameStatus = {}));
exports.GameStatus = GameStatus;
var PlayerStatus;
(function (PlayerStatus) {
    PlayerStatus["READY"] = "READY";
    PlayerStatus["ASSIGNING_WORDS"] = "ASSIGNING_WORDS";
    PlayerStatus["IN_PROGRESS"] = "IN_PROGRESS";
})(PlayerStatus || (PlayerStatus = {}));
exports.PlayerStatus = PlayerStatus;
/**
 * A Game is a representation of a forbidden word Game.
 * To create a new game on the server, use the static method Game.new().
 * To link to a game that exists on the server, use new Game(); or Game.reconnect();.
 */
var Game = /** @class */ (function () {
    /**
     * Create a new representation of a game.
     * @param id - The game ID
     * @param user - A firebase user object, containing a user ID
     * @param name - The nickname of the user.
     * @param isHost - Whether the user is the host of the game.
     * @param initialized - Whether the game has been initialized with a connection on the server.
     */
    function Game(id, user, name, isHost, initialized) {
        if (isHost === void 0) { isHost = false; }
        if (initialized === void 0) { initialized = false; }
        /**
         * List of event handlers.
         */
        // Supported events (WIP): player-join player-leave initialized
        this.eventListeners = {};
        this.id = id;
        this.user = user;
        this._username = name;
        this.isHost = isHost;
        this.initialized = initialized || isHost;
        this.initializeListeners();
        if (!initialized) {
            this.join();
        }
    }
    Object.defineProperty(Game.prototype, "username", {
        get: function () {
            return this._username;
        },
        set: function (value) {
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Add a game event listener.
     * @param eventNames - The name(s) of the events to attach the listener to.
     * @param callback - The function to call when the event is called.
     */
    Game.prototype.on = function (eventNames, callback) {
        if (typeof eventNames == "string") {
            eventNames = eventNames.split(" ");
        }
        for (var i = 0; i < eventNames.length; i++) {
            if (!this.eventListeners[eventNames[i]]) {
                this.eventListeners[eventNames[i]] = [];
            }
            this.eventListeners[eventNames[i]].push(callback);
        }
    };
    /**
     * Remove a game event listener.
     * @param eventNames - The name(s) of the events from which to remove the listener
     * @param callback - The specific callback to remove. If not provided, all callbacks will be removed.
     */
    Game.prototype.off = function (eventNames, callback) {
        if (typeof eventNames == "string") {
            eventNames = eventNames.split(" ");
        }
        for (var i = 0; i < eventNames.length; i++) {
            if (!callback) {
                this.eventListeners[eventNames[i]] = [];
            }
            else {
                for (var j = 0; j < this.eventListeners[eventNames[i]]; j++) {
                    if (this.eventListeners[eventNames[i]][j] == callback) {
                        delete this.eventListeners[eventNames[i]][j];
                    }
                }
            }
        }
    };
    /**
     * Add the user to the firebase representation of the game.
     * @param name - The nickname of the user.
     */
    Game.prototype.join = function () {
        var _this = this;
        if (this.initialized) {
            console.warn("Warning: The game has already been initialized. Will not re-join a game.");
            return;
        }
        var id = this.id;
        return firebase_1.default.firestore()
            .collection("games")
            .doc(id)
            .collection("players")
            .doc(this.user.uid)
            .set({
            name: this.username,
            isHost: this.isHost
        }).then(function () {
            _this.initialized = true;
            _this.trigger("initialized");
        })
            .catch(function (error) {
            console.log(error);
            throw error;
        });
    };
    /**
     * Trigger an event. All active listeners of that event will be called.
     * @param eventName - The name of the event to trigger.
     * @param event - An Event payload to pass to the listeners. It should accept a single parameter event, which may be an Event or undefined.
     */
    Game.prototype.trigger = function (eventName, event) {
        if (event && !event.name) {
            event.name = eventName;
        }
        if (!this.eventListeners[eventName]) {
            this.eventListeners[eventName] = [];
        }
        for (var i = 0; i < this.eventListeners[eventName].length; i++) {
            this.eventListeners[eventName][i](event);
        }
    };
    /**
     * Initialize the Game event listeners.
     */
    Game.prototype.initializeListeners = function () {
        var _this = this;
        var gameRef = firebase_1.default.firestore()
            .collection("games")
            .doc(this.id);
        gameRef.collection("players")
            .onSnapshot(function (snapshot) {
            snapshot.docChanges().forEach(function (change) {
                var player = change.doc.data();
                player.id = change.doc.id;
                if (change.type === "added") {
                    _this.trigger("player-join", new Event_1.PlayerEvent.PlayerJoinEvent(player));
                }
                if (change.type === "modified") {
                    console.log("Modified player: ", {
                        userData: change.doc.data(),
                        userId: change.doc.id
                    });
                    _this.trigger("player-modify", new Event_1.PlayerEvent.PlayerChangeEvent(player));
                }
                if (change.type === "removed") {
                    _this.trigger("player-leave", new Event_1.PlayerEvent.PlayerLeaveEvent(player));
                }
            });
        });
    };
    /**
     * Leave the game. If the current user is the host, and the game has not yet started, the game will be terminated.
     */
    Game.prototype.leave = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.isHost) {
                    firebase_1.default.firestore()
                        .collection("games")
                        .doc(this.id)
                        .update({
                        status: GameStatus.HOST_DISCONNECT,
                        active: false
                    });
                }
                return [2 /*return*/, firebase_1.default.firestore()
                        .collection("games")
                        .doc(this.id)
                        .collection("players")
                        .doc(this.user.uid)
                        .delete()];
            });
        });
    };
    /**
     * Remove a user. Because the user may still rejoin, this is intended for kicking idle users, not malicious ones.
     * If an unwanted user joins, the host is recommended to start a new game.
     */
    Game.prototype.kick = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this.isHost) {
                    throw "PermissionError: Only the host can kick players";
                }
                return [2 /*return*/, firebase_1.default.firestore()
                        .collection("games")
                        .doc(this.id)
                        .collection("players")
                        .doc(id)
                        .delete()];
            });
        });
    };
    /**
     * Create a new game on the server, and join it as the host.
     * @param name - The nickname for the current user.
     * @param user - The firebase user object of the current user.
     */
    Game.createGame = function (name, user) {
        return __awaiter(this, void 0, void 0, function () {
            var id, gameData, gameRef;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, utils_1.generateRandomId()];
                    case 1:
                        id = _a.sent();
                        gameData = {
                            timestamp: new Date().getTime(),
                            active: true,
                            host: user.uid,
                            status: GameStatus.WAITING_FOR_PLAYERS
                        };
                        gameRef = firebase_1.default.firestore()
                            .collection("games")
                            .doc(id);
                        return [4 /*yield*/, gameRef
                                .set(gameData)
                                .then(function () {
                                return __awaiter(this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, gameRef.collection("players")
                                                    .doc(user.uid)
                                                    .set({
                                                    name: name,
                                                    isHost: true
                                                })];
                                            case 1:
                                                _a.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                });
                            }).catch(function (e) {
                                console.log("ERROR", e);
                                throw e;
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, new Game(id, user, name, true)];
                }
            });
        });
    };
    /**
     * Validates a given game code.
     */
    Game.validateJoinCode = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, firebase_1.default.firestore()
                            .collection("games")
                            .doc(id)
                            .get()];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data.exists];
                }
            });
        });
    };
    return Game;
}());
exports.Game = Game;
exports.default = Game;
