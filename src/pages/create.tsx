import React, { ReactElement } from "react";
import Layout from "../components/layout";
import SEO from "../components/seo";
import InputForm from "../components/InputForm";
import firebase from "firebase";
import Game from "../game/Game";
import { navigate } from "@reach/router";
import validateName from "../utils/validateName";
import { Link } from "gatsby";

const CreatePage = (): ReactElement => {

	return (

		<Layout linkHome>
			<SEO title="Create Game"/>
			<h3>New Game</h3>
			<p><Link to={"/join"}>Join a game instead</Link></p>
			<InputForm
				label={"Your Name"}
				buttonText={"Create Game"}
				autoFocus
				onSubmit={(name): void => {
					firebase
						.auth()
						.onAuthStateChanged((user) => {
							if (!user) {
								firebase.auth().signInAnonymously();
								return;
							}
							Game.create(name, user.uid)
								.then((game) => navigate(`/game/${game.code}`));
						});
				}}
				validate={validateName}
			/>
		</Layout>
	);
};

export default CreatePage;
