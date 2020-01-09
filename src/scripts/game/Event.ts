import { Player } from "./Game";

namespace Event {

    export type Any = Player.Any;

    abstract class Event {
        public name: string;
        public data: any;

        protected constructor(data?: any, name?: string) {
            this.name = name;
            this.data = data;
        }
    }

    export namespace Player {

        export type Any = Join | Modify | Leave;

        abstract class PlayerEvent extends Event {
            public data: Player;

            protected constructor(data?: Player, name?: string) {
                super(data, name);
            }

        }

        export class Join extends PlayerEvent {
            constructor(data?: Player, name?: string) {
                super(data, name);
            }
        }

        export class Modify extends PlayerEvent {
            constructor(data?: Player, name?: string) {
                super(data, name);
            }
        }

        export class Leave extends PlayerEvent {
            constructor(data?: Player, name?: string) {
                super(data, name);
            }
        }
    }
}
export { Event };
export default Event;