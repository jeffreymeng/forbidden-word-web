import React, { ReactElement } from "react";
import { navigate, PageProps } from "gatsby";
import Layout from "../components/layout";
import SEO from "../components/seo";
import { Button, Form, Spinner } from "react-bootstrap";
import firebase from "../firebase";

const JoinPage = (props: PageProps): ReactElement => {
	const [code, setCode] = React.useState("");
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState("");
	const errorMessages = {

		invalidCode: "No active game exists with that code.",
		noCode: "You must enter a valid game code (alphanumeric, 4+ characters)",
	};
	return (

		<Layout>
			<SEO title="Join Game"/>
			<h3>Join a Game</h3>
			<Form onSubmit={(e: any): void => {
				if (loading) return;
				e.preventDefault();
				setLoading(true);

				if (code.trim() == "" || !/^[A-Za-z0-9]{4,64}$/.test(code.trim())) {
					setError(errorMessages.noCode);
					setLoading(false);
					return;
				}
				firebase
					.firestore()
					.collection("games")
					.doc(code.toUpperCase())
					.get()
					.then((snapshot) => {
						if (!snapshot.exists) {
							setError(errorMessages.invalidCode);
							setLoading(false);
							return;
						}
						navigate("/game/" + code.toUpperCase());
					});


			}}>
				<Form.Group controlId="code">
					<Form.Label><b>Game Code (case insensitive):</b></Form.Label>
					<Form.Control
						isInvalid={!!error}
						type="text"
						value={code}
						disabled={loading}
						onChange={(e): void => {
							setError("");
							setCode(e.target.value);
						}}
						style={{
							textTransform: "uppercase",
						}}
					/>
					<Form.Control.Feedback type={"invalid"}>
						{error}
					</Form.Control.Feedback>
				</Form.Group>
				<Button type={"submit"} block disabled={loading}>{loading ?
					<Spinner animation={"border"} as={"span"} size="sm"/> : "Join Game"}</Button>
			</Form>
		</Layout>
	);
};

export default JoinPage;
