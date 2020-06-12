import React, { ReactElement } from "react";
import Layout from "../components/layout";
import SEO from "../components/seo";
import Player, { PlayerStatus } from "../game/Player";
import { Spinner } from "react-bootstrap";
import Game, { GameStatus } from "../game/Game";
import firebase from "../firebase";
import validateName from "../utils/validateName";
import { Link } from "gatsby";
import { navigate } from "@reach/router";
import Lobby from "../components/game/Lobby";
import AssignWords from "../components/game/AssignWords";
import NamePrompt from "../components/game/NamePrompt";
import DisplayWords from "../components/game/DisplayWords";

export default function GamePage(): ReactElement {
	const code = typeof window === "undefined" ? "" : location.pathname.split("/").length >= 2 ? location.pathname.split("/")[2] : "";

	const [game, setGame] = React.useState<Game>();
	const [players, setPlayers] = React.useState<Player[]>([]);
	const [uid, setUID] = React.useState("");
	const [loading, setLoading] = React.useState(true);
	const [kicked, setKicked] = React.useState(false);
	const [gameNotFound, setGameNotFound] = React.useState(false);
	const [status, setStatus] = React.useState<GameStatus>(null);
	const [targetWord, setTargetWord] = React.useState("");
	const [words, setWords] = React.useState<null | Record<string, string>>(null);
	React.useEffect(() => {
		if (!code || !uid) return;
		const gameInstance = new Game(code, uid);

		setGame(gameInstance);
		gameInstance.connect(() => {
			setGameNotFound(true);
			setLoading(false);
			// no need to terminate the outer function early since no events will be fired anyways.
		});

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
		gameInstance.on("status_changed", (e) => {
			setStatus(e.status);
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
	React.useEffect(() => {
		if (status == GameStatus.TALKING && !words) {
			game.getAssignedWords().then(words => {
				console.log(words);
				setWords(words);
			});
		}
	}, [status]);

	if (code !== code.toUpperCase()) {
		navigate("/game/" + code.toUpperCase(), {
			replace: true,
		});
	}
	if (loading) {
		return (
			<Layout>
				<SEO title={"Loading"}/>
				<p className="text-center">
					<Spinner animation={"border"} as={"span"}/>
				</p>
			</Layout>);
	}
	if (gameNotFound) {
		return <Layout>
			<SEO title={"Game Not Found"}/>
			<h3>404</h3>
			<p>We couldn&apos;t find an active game at this location. Either you mistyped the link, or the game is now
				over.</p>
			<p><Link to={"/join"}>Join a different game</Link> | <Link to={"/"}>Back to home page</Link></p>
		</Layout>;
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

	if (status == GameStatus.STARTING) {
		return (
			<Layout>
				<SEO title={"Loading"}/>
				<p className="text-center">
					<Spinner animation={"border"} as={"span"}/>
				</p>
				<p className={"text-center"}>Starting Game...</p>
			</Layout>);
	} else if (status == GameStatus.IN_LOBBY) {
		return <Lobby players={players} code={code} onGameStart={(): Promise<void> => game.start()} isHost={game.isHost}
					  onKick={(id): Promise<void> => game.kick(id)}/>;
	} else if (status == GameStatus.CHOOSE_WORD) {
		return <AssignWords uid={uid} assignments={game.assignments} players={game.players}
							targetWord={targetWord}
							onEdit={(): Promise<void> => game.unassignWord(game.assignments[uid])}
							onSubmit={(value, setError, setSubmitting): void => {
								const word = value.trim();
								game.assignWord(game.assignments[uid], word)
									.then(() => {
										setTargetWord(word);
										setSubmitting(false);
									})
									.catch((e) => {
										console.log(e);
										setError("An unknown error occurred. Please try again later.");
									});
							}
							}/>;
	} else if (status == GameStatus.TALKING) {
		return <DisplayWords words={words} players={players}/>;
	} else {
		console.log(status, game);
		return (
			<Layout>
				<SEO title={"Loading"}/>
				<h3>Error: Unreachable State</h3>
				<p>If you&apos;re seeing this page, then there has been an internal error in the application logic for
					forbidden words.</p>
				<p>You can alert me of this error by emailing <a
					href={`mailto:forbiddenwords@jeffkmeng.com?subject=${encodeURIComponent("Unreachable State Error in game " + code)}&body=${encodeURIComponent(
						"Here's the debug data that you asked for: " + btoa(JSON.stringify({
							gameData: game,
							navigator: navigator.userAgent,
						})),
					)}`}>forbiddenwords@jeffkmeng.com</a>. Please include a copy
					of the below encoded debug data, which will be prepopulated if you email using the above link.</p>
				<p style={{
					wordBreak: "break-word",
				}}>
					{btoa(JSON.stringify({ gameData: game, navigator: navigator.userAgent }))}
				</p>
			</Layout>);
	}
}
