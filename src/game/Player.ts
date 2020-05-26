enum PlayerStatus {
	KICKED = "kicked",
	LEFT = "left",
	ACTIVE = "active",
}

interface PlayerData {
	name: string;
	id: string;
	status: PlayerStatus;
}

class Player {
	public name: string;
	public readonly id: string;
	public status: PlayerStatus;
	public isHost: boolean;
	public readonly isLocalPlayer: boolean;

	constructor(name: string, id: string, status: PlayerStatus, host = false, isLocalPlayer = false) {
		this.name = name;
		this.id = id;
		this.status = status;
		this.isHost = host;
		this.isLocalPlayer = isLocalPlayer;
	}

	public equals(otherPlayer: Player): boolean {
		return this.name == otherPlayer.name && this.id == otherPlayer.id && this.status == otherPlayer.status;
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

export { PlayerStatus, PlayerData, Player };
export default Player;