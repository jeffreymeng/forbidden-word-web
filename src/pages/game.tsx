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

function Lobby({ players, code, isHost, onKick }: { players: Player[]; code: string; isHost: boolean; onKick: (id: string) => void; }): ReactElement {
	const [kickName, setKickName] = React.useState("");
	const [kickID, setKickID] = React.useState("");

	return (
		<Layout>
			<SEO title={"Game Lobby"}/>
			<h3>Game Lobby (code: {code})</h3>
			<Share code={code}/>
			<ul>
				{players.map(p => <li key={p.id}>{p.name} {p.host && "(Host)"} {p.isLocalPlayer && "(You)"} {isHost && !p.isLocalPlayer && <>(<a
					onClick={(): void => {
						setKickName(p.name);
						setKickID(p.id);
					}}>Kick</a>)</>}</li>)}
			</ul>
			{isHost && <Button block>Start Game</Button>}
			<Modal show={!!kickName} onHide={(): void => {
				setKickName("");
				setKickID("");
			}}>
				<Modal.Header closeButton>
					<Modal.Title>Kick {kickName}?</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<h5>Are you sure you want to kick {kickName}?</h5>
					<p>They will still be able to rejoin if the game has not started. Kicking is intended for removing inactive players.</p>
					<p>If you do not want this player in the game, create a new game with a different code.</p>
				</Modal.Body>
				<Modal.Footer>

					<Button variant="secondary" onClick={(): void => {
						setKickName("");
						setKickID("");
					}}>
						Cancel
					</Button>
					<Button variant="danger" onClick={(): void => {
						onKick(kickID);
						setKickName("");
						setKickID("");
					}}>
						Kick {kickName}
					</Button>
				</Modal.Footer>
			</Modal>

		</Layout>);
}

function NamePrompt({ onSubmit, code, validate, kicked }: {
	onSubmit: (name: string) => Promise<void>;
	code: string;
	validate: (value: string, setError: (error: string) => void) => boolean;
	kicked?: {
		kicked:false;
	} | {
		kicked:true;
		name:string;
	}; }): ReactElement {
	return (
		<Layout>
			<SEO title={"Join Game"}/>
			<h3>Join Game {code}</h3>
			{kicked.kicked && <Alert variant={"danger"}>You&apos;ve been kicked by the host. You may still rejoin.</Alert>}
			<InputForm
				buttonText={"Join"}
				label={"Your Name"}
				defaultValue={kicked.kicked ? kicked.name : undefined}
				onSubmit={(name, setError, setLoading): void => {
					onSubmit(name).catch((error) => {
						console.log(error);

						setLoading(false);
					});
				}}
				validate={validate}
			/>


		</Layout>
	);
}

export default function GamePage(): ReactElement {
	const code = typeof window === "undefined" ? "" : location.pathname.split("/").length >= 2 ? location.pathname.split("/")[2] : "";
	const [game, setGame] = React.useState<Game>();
	const [players, setPlayers] = React.useState<Player[]>([]);
	const [uid, setUID] = React.useState("");
	const [loading, setLoading] = React.useState(true);
	const [kicked, setKicked] = React.useState<{
		kicked:false;
	} | {
		kicked:true;
		name:string;
	}>({
		kicked:false
	});
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
			console.log("Kicked!");
			gameInstance.hasPlayerID(uid);
			setKicked({
				kicked:true,
				name:gameInstance.players.filter(p => p.id == uid)[0].name
			});
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
	return <Lobby players={players} code={code} isHost={game.isHost} onKick={(id):Promise<void> => game.kick(id)}/>;
}

