enum PlayerStatus {
	KICKED = "kicked",
	LEFT = "left",
	ACTIVE = "active",
}

enum PlayerWordStatus {
	CHOOSING = "choosing",
	READY = "ready"
}

interface PlayerData {
	name: string;
	id: string;
	status: PlayerStatus;
	wordStatus: PlayerWordStatus;
}

class Player {
	public name: string;
	public readonly id: string;
	public status: PlayerStatus;
	public isHost: boolean;
	public readonly isLocalPlayer: boolean;
	public wordStatus?: PlayerWordStatus;

	constructor(name: string, id: string, status: PlayerStatus, host = false, isLocalPlayer = false, wordStatus: PlayerWordStatus = null) {
		this.name = name;
		this.id = id;
		this.status = status;
		this.isHost = host;
		this.isLocalPlayer = isLocalPlayer;
		this.wordStatus = wordStatus;
	}

	public equals(otherPlayer: Player): boolean {
		// check that the two objects are identical
		return this.name === otherPlayer.name && this.id === otherPlayer.id && this.status === otherPlayer.status
			&& this.isHost === otherPlayer.isHost && this.isLocalPlayer === otherPlayer.isLocalPlayer &&
			this.wordStatus === otherPlayer.wordStatus;
	}

	/**
	 * Convert the class into a firebase-ready JSON object.
	 * Note that this does NOT necessarily contain all the properties.
	 */
	public toJSON(): PlayerData {
		// drop this.host because we don't need that for firebase
		return {
			name: this.name,
			id: this.id,
			status: this.status,
			wordStatus: this.wordStatus,
		};
	}

	/**
	 * Utility function for checking if two player arrays are equal (ignoring order).
	 * @param a - The first player array
	 * @param b - The second player array
	 */
	public static equalArrays(a: Player[], b: Player[]): boolean {
		console.log(a, b);
		if (a.length !== b.length) return false;
		const comparator = (i: Player, j: Player): number => i.id.localeCompare(j.id);
		const sortedB = b.sort(comparator);
		return a.sort(comparator).every((el, i) => el.equals(sortedB[i]));
	}


}

export { PlayerStatus, PlayerWordStatus, PlayerData, Player };
export default Player;