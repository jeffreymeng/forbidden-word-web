import React, { ReactElement } from "react";
import { navigate, PageProps } from "gatsby";
import Layout from "../components/layout";
import SEO from "../components/seo";
import { Button, Form, Spinner } from "react-bootstrap";
import firebase from "../firebase";
import { generateRandomId } from "../utils/generateRandomId";

const CreatePage = (props: PageProps): ReactElement => {
  const [name, setName] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const errorMessages = {
    nameLength:"You must enter a name between 1 and 32 chraacters long",
    nameFormatting: "Your name must contain at least one letter or number, and contains only letters, numbers, and the following characters: _ - . : @ & # ' \""
  }
  return (

    <Layout>
      <SEO title="Create Game"/>
      <h3>New Game</h3>
      <Form onSubmit={(e): void => {
        if (loading) return;
        e.preventDefault();
        setLoading(true);
        if (!/^[A-Za-z0-9_\- @.:&#'"]{1,32}$/.test(name.trim())) {
          if (name.trim() == "") {
            setError(errorMessages.nameLength);
          }
          setLoading(false);
          return;
        }

        firebase.auth().onAuthStateChanged((user) => {
          console.log("user", user);
          if (!user) {
            firebase.auth().signInAnonymously()
              .catch((e) => {
                console.log(e);
                alert("Internal Server Error: " + e.message);
              });
            return;
          }
          (async (): Promise<void> => {
            try {
              const id = await generateRandomId();
              //we must create the game first, to satisfy the security rules
              await firebase
                .firestore()
                .collection("games")
                .doc(id)
                .set({
                  host: user.uid,
                  status: "in_lobby",
                  rematch: false,
                  created: firebase.firestore.FieldValue.serverTimestamp(),
                  playerNames: [{id:user.uid, name:name.trim()}]
                });
              await firebase
                .firestore()
                .collection("games")
                .doc(id)
                .collection("players")
                .doc(user.uid)
                .set({
                  name: name.trim(),
                  isHost: true
                });
              navigate("/game/" + id);
            } catch (error) {
              setLoading(false);
              console.log(error);
            }
          })();
        });

      }}>
        <Form.Group controlId="code">
          <Form.Label><b>Your Name:</b></Form.Label>
          <Form.Control
            isInvalid={!!error}
            type="text"
            value={name}
            disabled={loading}
            onChange={(e): void => {
              const newName = e.target.value;

              if (newName.trim().length > 32 || newName.trim().length < 1) {
                setError(errorMessages.nameLength);
              } else if (!/^[A-Za-z0-9_\- @.:&#'"]{1,32}$/.test(newName.trim())) {
                setError(errorMessages.nameFormatting);
              } else {
                setError("");
              }
              setName(newName);
            }}
          />
          <Form.Control.Feedback type={"invalid"}>
            {error}
            {/*A player with a similar name is already in this lobby. Please choose a different name.*/}
            {/*Check names by comparing only case insensitive letters and numbers*/}
          </Form.Control.Feedback>
        </Form.Group>
        <Button type={"submit"} block disabled={loading}>{loading ?
          <Spinner animation={"border"} as={"span"} size="sm"/> : "Create Game"}</Button>
      </Form>
    </Layout>
  );
};

export default CreatePage;
