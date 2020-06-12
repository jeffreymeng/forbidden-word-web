import React, { ReactElement } from "react";
import Layout from "../layout";
import SEO from "../seo";
import { Spinner } from "react-bootstrap";
import Player from "../../game/Player";

export default function DisplayWords({ words, players }: {
	/**
	 * UID of current user
	 */
	words?: Record<string, string>;
	players: Player[];
}): ReactElement {

	return (<Layout>
		<SEO title={"Choose a word"}/>
		{
			words == null && <div className={"text-center"}>
				<Spinner animation={"border"}/>
				<p>Starting Game...</p>
			</div>
		}
		{words != null && <>
			<h3>Have a conversation!</h3>
			<b>Try to get these players to say their respective forbidden words:</b>
			<ul>
				{Object.keys(words).map(id => <li key={id}><b>{players.find(p => p.id == id).name}:</b> {words[id]}
				</li>)}

			</ul>
			
			<h4>Time Remaining: 4:38</h4></>}
	</Layout>);
}

