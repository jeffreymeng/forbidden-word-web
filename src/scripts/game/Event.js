"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Event = /** @class */ (function () {
    function Event(data, name) {
        this.name = name;
        this.data = data;
    }
    return Event;
}());
exports.Event = Event;
var PlayerEvent;
(function (PlayerEvent_1) {
    var PlayerEvent = /** @class */ (function (_super) {
        __extends(PlayerEvent, _super);
        function PlayerEvent(data, name) {
            return _super.call(this, data, name) || this;
        }
        return PlayerEvent;
    }(Event));
    PlayerEvent_1.PlayerEvent = PlayerEvent;
    var PlayerJoinEvent = /** @class */ (function (_super) {
        __extends(PlayerJoinEvent, _super);
        function PlayerJoinEvent(data, name) {
            return _super.call(this, data, name) || this;
        }
        return PlayerJoinEvent;
    }(PlayerEvent));
    PlayerEvent_1.PlayerJoinEvent = PlayerJoinEvent;
    var PlayerChangeEvent = /** @class */ (function (_super) {
        __extends(PlayerChangeEvent, _super);
        function PlayerChangeEvent(data, name) {
            return _super.call(this, data, name) || this;
        }
        return PlayerChangeEvent;
    }(PlayerEvent));
    PlayerEvent_1.PlayerChangeEvent = PlayerChangeEvent;
    var PlayerLeaveEvent = /** @class */ (function (_super) {
        __extends(PlayerLeaveEvent, _super);
        function PlayerLeaveEvent(data, name) {
            return _super.call(this, data, name) || this;
        }
        return PlayerLeaveEvent;
    }(PlayerEvent));
    PlayerEvent_1.PlayerLeaveEvent = PlayerLeaveEvent;
})(PlayerEvent || (PlayerEvent = {}));
exports.PlayerEvent = PlayerEvent;
exports.default = Event;
