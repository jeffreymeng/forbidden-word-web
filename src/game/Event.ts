import Player from "./Player";

export class Event {
  public readonly timestamp: number;
  constructor() {
    this.timestamp = new Date().getTime();
  }
}

export class InitializedEvent extends Event {

}
export class KickedEvent extends Event {

}

export class PlayerModifiedEvent extends Event {
  constructor(public players: Player[], public oldPlayers: Player[]) {
    super();
  }

}
export type EventName = "player_modified" | "initialized" | "kicked";
