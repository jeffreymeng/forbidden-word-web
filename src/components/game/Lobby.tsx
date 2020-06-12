import Player from "../../game/Player";
import React, { ReactElement } from "react";
import Layout from "../layout";
import SEO from "../seo";
import { Button, Modal, Spinner } from "react-bootstrap";
import QRCode from "qrcode.react";

function Share({ code }: { code: string }): ReactElement {
	const [error, setError] = React.useState(false);
	const [copyText, setCopyText] = React.useState("Copy Join Link");
	const [showModal, setShowModal] = React.useState(false);
	const handleClose = (): void => setShowModal(false);
	const link = `https://forbiddenwords.jeffkmeng.com/game/${code}`;

	return (<>
		{/*
		// @ts-ignore*/}
		<p>{typeof window !== "undefined" && typeof navigator.share !== "undefined" ? <>
			<a onClick={(): void => {
				// alert("SHARE")
				// @ts-ignore
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
					at the QR code.</p>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={handleClose}>
					Close
				</Button>

			</Modal.Footer>
		</Modal>
	</>);

}

export default function Lobby({ players, code, isHost, onKick, onGameStart }: {
	players: Player[];
	code: string;
	isHost: boolean;
	onKick: (id: string) => Promise<void>;
	onGameStart: () => void;
}): ReactElement {
	const [kickData, setKickData] = React.useState({
		name: "",
		id: "",
	});
	const [kicking, updateKicking] = React.useReducer((state: string[], action: { type: "add"; id: string } | { type: "remove"; id: string; }) => {
		console.log(state, action, state.filter(k => k !== action.id));
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
			{isHost && <Button block
							   onClick={onGameStart}
							   disabled={sortedPlayers.length < 2}>{sortedPlayers.length < 2 ? "At least 1 more player required to start game" : "Start Game"}</Button>}
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
							.catch(() => updateKicking({ type: "remove", id }));
						setShowKickModal(false);
					}}>
						Kick {kickData.name}
					</Button>
				</Modal.Footer>
			</Modal>

		</Layout>);
}