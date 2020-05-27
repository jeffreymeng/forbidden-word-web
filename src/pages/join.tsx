import React, { ReactElement } from "react";
import { Link, navigate, PageProps } from "gatsby";
import Layout from "../components/layout";
import SEO from "../components/seo";
import firebase from "../firebase";
import InputForm from "../components/InputForm";

const JoinPage = (props: PageProps): ReactElement => {

	return (

		<Layout linkHome>
			<SEO title="Join Game"/>
			<h3>Join a Game</h3>
			<p><Link to={"/create"}>Create a game instead</Link></p>
			<InputForm
				label={"Game Code (case insensitive)"}
				buttonText={"Join Game"}
				autoFocus
				style={{
					textTransform: "uppercase",
				}}
				transformer={(value): string => {
					// if they paste a link with a code, just take the code
					const res = /(?:.*\/)game[^a-zA-Z0-9]*([a-zA-Z0-9]{4,})/i.exec(value);
					return res ? res[1].toUpperCase() : value.toUpperCase();
				}}
				validate={(code, setError): boolean => {
					if (code.trim() == "") {
						setError("Please enter a game code.");
						return false;
					} else if (!/^[A-Za-z0-9]{4,64}$/.test(code.trim())) {
						setError("Please enter a valid game code. Codes contain only letters and numbers, and are generally 4+ characters.");
						return false;
					} else {
						setError("");
						return true;
					}
				}}
				onSubmit={(code, setError, setLoading): void => {
					firebase
						.firestore()
						.collection("games")
						.doc(code.toUpperCase())
						.get()
						.then((snapshot) => {
							if (!snapshot.exists) {
								setError("No active game exists with that code. Either the game is now over, or the code was mistyped.");
								setLoading(false);
								return;
							}
							navigate("/game/" + code.toUpperCase());
						});
				}}
			/>

		</Layout>
	);
};

export default JoinPage;
