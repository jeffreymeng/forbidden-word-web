import Player, { PlayerWordStatus } from "../../game/Player";
import React, { ReactElement } from "react";
import Layout from "../layout";
import SEO from "../seo";
import InputForm from "../InputForm";
import { Button, Spinner } from "react-bootstrap";

export default function AssignWords({ uid, players, assignments, onSubmit, targetWord, onEdit }: {
	/**
	 * UID of current user
	 */
	uid: string;
	assignments: Record<string, string>;
	players: Player[];
	onSubmit: (value: string, setError: ((error: string) => void), setLoading: ((value: boolean) => void)) => void;
	onEdit: () => Promise<void>;
	targetWord: string;
}): ReactElement {
	console.log(uid, assignments, players);
	const [editLoading, setEditLoading] = React.useState(false);
	const target = React.useMemo(() => players.find(p => p.id == assignments[uid]), [uid, players, assignments]);
	console.log(Object.keys(assignments));
	/**
	 * When the user has submitted, they can edit until everyone else is done
	 * When the user has submitted, it only says 2 players are still choosing, not two other
	 * */
	const playersStillChoosing = players.filter(p => p.wordStatus !== PlayerWordStatus.READY);
	return (<Layout>
		<SEO title={"Choose a word"}/>

		<h3 className="text-center">Choose a word for {target.name}</h3>
		{
			playersStillChoosing.length > 0 ?
				((playersStillChoosing.length === 1 && playersStillChoosing[0].id === uid) ?
					<p className={"text-muted"}>You are the only player still choosing a word.</p> :
					<p className={"text-muted"}>{playersStillChoosing.length} of {players.length} players are still
						choosing
						a word: {playersStillChoosing.map(p => p.name).join(", ")}</p>)
				: <p className={"text-muted"}> No players are still choosing a word. </p>
		}
		{playersStillChoosing.some(p => p.id === uid) ?
			<InputForm label={`${target.name}'s Forbidden Word`} buttonText={"Submit"}
					   validate={(word, setError): boolean => {
						   if (word.trim().length < 1) {
							   setError("Please choose a forbidden word or phrase.");
							   return false;
						   } else if (word.trim().length > 128) {
							   setError("The forbidden word or phrase should not be longer than 128 characters.");
							   return false;
						   }
						   return true;
					   }} onSubmit={onSubmit}
			/> : <>
				<p>You have chosen the word <b>{targetWord}</b> to be the forbidden word for <b>{target.name}</b>.</p><Button
				variant={"primary"} block disabled={editLoading} onClick={(): void => {
				setEditLoading(true);
				onEdit().finally(() => setEditLoading(false));
			}}>{editLoading ? <Spinner animation={"border"} size={"sm"}/> : "Edit"}</Button>
			</>}
		<h3 className={"text-center mt-3"}>All Assignments:</h3>
		<ul>
			{

				Object.keys(assignments).map(chooserID => {
					const chooser = players.find(p => p.id == chooserID);
					const choosee = players.find(p => p.id == assignments[chooserID]);
					return (
						<li key={chooserID + "" + choosee.id}>
							{chooser.id == uid ? "You" : <b>{chooser.name}</b>}
							{" "}will assign a word for{" "}
							{choosee.id == uid ? "you" : <b>{choosee.name}</b>}.</li>);
				})
			}
		</ul>
	</Layout>);
}