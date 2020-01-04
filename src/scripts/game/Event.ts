import { Player } from "./Game";

abstract class Event {
    public name: string;
    public data: any;

    protected constructor(data?: any, name?: string) {
        this.name = name;
        this.data = data;
    }
}

namespace PlayerEvent {
    export class PlayerEvent extends Event {
        public data: Player;

        constructor(data?: Player, name?: string) {
            super(data, name);
        }

    }

    export class PlayerJoinEvent extends PlayerEvent {
        constructor(data?: Player, name?: string) {
            super(data, name);
        }
    }

    export class PlayerModifyEvent extends PlayerEvent {
        constructor(data?: Player, name?: string) {
            super(data, name);
        }
    }

    export class PlayerLeaveEvent extends PlayerEvent {
        constructor(data?: Player, name?: string) {
            super(data, name);
        }
    }
}

export { Event, PlayerEvent };
export default Event;