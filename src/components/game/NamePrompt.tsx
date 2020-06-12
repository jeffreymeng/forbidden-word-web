import React, { ReactElement } from "react";
import Layout from "../layout";
import SEO from "../seo";
import { Link } from "gatsby";
import { Alert } from "react-bootstrap";
import InputForm from "../InputForm";

export default function NamePrompt({ onSubmit, code, validate, kicked }: {
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
				autoFocus
				buttonText={"Join"}
				label={"Your Name"}
				onSubmit={(name, setError, setLoading): void => {
					onSubmit(name).catch((error) => {
						console.log(error);
						if (error.code == "already_started") {
							setError("You can't join this lobby right now because they are in the middle of a game." +
								" Once their game is over, you will be able to join this lobby.");
						}
						setLoading(false);
					});
				}}
				validate={validate}
			/>
		</Layout>
	);
}
