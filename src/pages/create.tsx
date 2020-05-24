import React, { ReactElement } from "react";
import Layout from "../components/layout";
import SEO from "../components/seo";
import InputForm from "../components/InputForm";
import firebase from "firebase";
import Game from "../game/Game";
import { navigate } from "@reach/router";
import validateName from "../utils/validateName";

const CreatePage = (): ReactElement => {

  return (

    <Layout>
      <SEO title="Create Game"/>
      <h3>New Game</h3>
      <InputForm
        label={"Your Name"}
        buttonText={"Create Game"}
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
