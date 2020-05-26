import React, { ReactElement } from "react";
import Layout from "../components/layout";
import SEO from "../components/seo";
import Player, { PlayerStatus } from "../game/Player";
import { Alert, Button, Modal, Spinner } from "react-bootstrap";
import QRCode from "qrcode.react";
import InputForm from "../components/InputForm";
import Game from "../game/Game";
import firebase from "../firebase";
import validateName from "../utils/validateName";
import { Link } from "gatsby";

function Share({ code }: { code: string }): ReactElement {
	const [error, setError] = React.useState(false);
	const [copyText, setCopyText] = React.useState("Copy Join Link");
	const [showModal, setShowModal] = React.useState(false);
	const handleClose = (): void => setShowModal(false);
	const link = `https://forbiddenwords.jeffkmeng.com/game/${code}`;

	return (<>
		<p>{typeof window !== "undefined" && navigator.share ? <>
			<a onClick={(): void => {
				// alert("SHARE")
				navigator.share({
					title: "Forbidden Words Game " + code,
					text: "Join my forbidden words game! Code: " + code,
					url: link,
				});
			}}>Share Link</a>
		</> : <>Share:{" "}
			<a onClick={(): void => {
				try {
					navigator.clipboard.writeText(link)
						.then(() => setCopyText("Join Link Copied!"))
						.catch(() => setCopyText("Link: " + link));
				} catch {
					setCopyText("Link: " + link);
				}
			}}>{copyText}</a>
			{" "}| <a
				href={`mailto:?subject=${encodeURIComponent("Join my forbidden words game " + code)
				}&body=${encodeURIComponent("Join my forbidden words game! The code is " + code + ".\n" + link)}`}>Email
				Join
				Link</a>
		</>}
			{" "}| <a onClick={(): void => setShowModal(true)}>Show QR Code</a></p>
		<Modal show={showModal} onHide={handleClose}>
			<Modal.Header closeButton>
				<Modal.Title>QR Code</Modal.Title>
			</Modal.Header>
			<Modal.Body className={"text-center"}>
				<QRCode value={link} size={256}/>
				<p className={"text-muted"} style={{
					wordBreak: "break-all",
				}}>{link}</p>
				<p>Tip: Most phones allow you to open a QR code link by opening the camera app and pointing the camera
					at the
					QR
					code.</p>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={handleClose}>
					Close
				</Button>

			</Modal.Footer>
		</Modal>
	</>);

}

function Lobby({ players, code, isHost, onKick }: { players: Player[]; code: string; isHost: boolean; onKick: (id: string) => Promise<void>; }): ReactElement {
	const [kickData, setKickData] = React.useState({
		name: "",
		id: "",
	});
	const [kicking, updateKicking] = React.useReducer((state: string[], action: { type: "add"; id: string } | { type: "remove"; id: string; }) => {
		console.log(state, action, state.filter(k => k !== action.id))
		if (action.type == "add") {
			return [...state, action.id];
		} else {
			return state.filter(k => k !== action.id);
		}
	}, []);
	const [showKickModal, setShowKickModal] = React.useState(false);
	const sortedPlayers = React.useMemo(() => players.sort((a, b): number => {
		if (a.isLocalPlayer || b.isLocalPlayer) {
			return a.isLocalPlayer ? -1 : 1;
		} else if (a.isHost || b.isHost) {
			return a.isHost ? -1 : 1;
		} else {
			return a.name.localeCompare(b.name);
		}
	}), [players]);
	return (
		<Layout>
			<SEO title={"Game Lobby"}/>
			<h3>Game Lobby (code: {code})</h3>
			<Share code={code}/>
			<ul>
				{sortedPlayers.map(p => <li
					key={p.id}>{p.name} {p.isHost && "(Host)"} {p.isLocalPlayer && "(You)"} {isHost && !p.isLocalPlayer && <>({
					kicking.indexOf(p.id) > -1 ? <><Spinner animation={"border"} size={"sm"}/> Kicking...</> : <a
						onClick={(): void => {
							setKickData({
								name: p.name,
								id: p.id,
							});
							setShowKickModal(true);
						}}>Kick</a>})</>}</li>)}
			</ul>
			{isHost && <Button block>Start Game</Button>}
			<Modal show={showKickModal} onHide={(): void => {
				setShowKickModal(false);
			}}>
				<Modal.Header closeButton>
					<Modal.Title>Kick {kickData.name}?</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<h5>Are you sure you want to kick {kickData.name}?</h5>
					<p>They will still be able to rejoin if the game has not started. Kicking is intended for removing
						inactive players.</p>
					<p>If you do not want this player in the game, create a new game with a different code.</p>
				</Modal.Body>
				<Modal.Footer>

					<Button variant="secondary" onClick={(): void => {
						setShowKickModal(false);
					}}>
						Cancel
					</Button>
					<Button variant="danger" onClick={(): void => {
						const id = kickData.id;
						updateKicking({ type: "add", id });
						onKick(id)
							.then(() => updateKicking({ type: "remove", id }))
							.catch(() => updateKicking({ type: "remove", id }))
						setShowKickModal(false);
					}}>
						Kick {kickData.name}
					</Button>
				</Modal.Footer>
			</Modal>

		</Layout>);
}

function NamePrompt({ onSubmit, code, validate, kicked }: {
	onSubmit: (name: string) => Promise<void>;
	code: string;
	validate: (value: string, setError: (error: string) => void) => boolean;
	kicked?: boolean;
}): ReactElement {
	return (
		<Layout>
			<SEO title={"Join Game"}/>
			<h3>Join Game {code}</h3>
			<Link to={"/join"}>Or join a different game</Link>
			{kicked &&
			<Alert variant={"danger"}>You&apos;ve been kicked by the host. You may still rejoin.</Alert>}
			<InputForm
				buttonText={"Join"}
				label={"Your Name"}
				onSubmit={(name, setError, setLoading): void => {
					onSubmit(name).catch((error) => {
						console.log(error);

						setLoading(false);
					});
				}}
				validate={validate}
			/>

			{/*First, challenge all players to make sure they are online. If any players are not, show a modal. */}
		</Layout>
	);
}

export default function GamePage(): ReactElement {
	const code = typeof window === "undefined" ? "" : location.pathname.split("/").length >= 2 ? location.pathname.split("/")[2] : "";
	const [game, setGame] = React.useState<Game>();
	const [players, setPlayers] = React.useState<Player[]>([]);
	const [uid, setUID] = React.useState("");
	const [loading, setLoading] = React.useState(true);
	const [kicked, setKicked] = React.useState(false);
	// React.useEffect(() => {
	// // TODO: figure out if this  is ideal
	// 	window.addEventListener('beforeunload', function (e) {
	// 		// Cancel the event
	// 		e.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will always be shown
	// 		// Chrome requires returnValue to be set
	// 		e.returnValue = '';
	// 	});
	// }, []);
	React.useEffect(() => {
		if (!code || !uid) return;
		const gameInstance = new Game(code, uid);
		setGame(gameInstance);
		gameInstance.connect();
		gameInstance.on("initialized", (): void => {
			setPlayers(gameInstance.players.filter(p => p.status == PlayerStatus.ACTIVE));
			setLoading(false);
		});
		gameInstance.on("player_modified", (e): void => {
			setPlayers(e.players.filter(p => p.status == PlayerStatus.ACTIVE));
		});
		gameInstance.on("kicked", (e) => {
			console.log("Kicked!", gameInstance.players, uid);
			setKicked(true);
		});
		console.log(gameInstance);
		return (): void => gameInstance.disconnect();
	}, [code, uid]);
	React.useEffect(() => {
		const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
			if (!user) {
				firebase.auth().signInAnonymously();
			} else {
				setUID(user.uid);
				unsubscribe();
			}
		});
		return (): void => unsubscribe();
	}, []);
	if (loading) {
		return (
			<Layout>
				<SEO title={"Loading"}/>
				<p className="text-center">
					<Spinner animation={"border"} as={"span"}/>
				</p>
			</Layout>);
	}
	if (!game.hasPlayerID(uid)) {
		// hasPlayerID only returns whether or not it has an active player

		return <NamePrompt kicked={kicked} onSubmit={async (name): Promise<void> => {
			await game.add(new Player(name, uid, PlayerStatus.ACTIVE));
		}} code={code} validate={(name, setError): boolean => {
			if (game.hasName(name)) {
				setError("A player with this username is already in this game. Please choose a different username. Spaces are ignored when checking usernames.");
				return false;
			}
			return validateName(name, setError);
		}}/>;
	}
	return <Lobby players={players} code={code} isHost={game.isHost} onKick={(id): Promise<void> => game.kick(id)}/>;
}
