import React, { ReactElement } from "react";
import { navigate } from "gatsby";
import Layout from "../components/layout";
import SEO from "../components/seo";
import { Button, Col, Row } from "react-bootstrap";

export default function IndexPage(): ReactElement {
  const [name, setName] = React.useState("");
  const [code, setCode] = React.useState("");
  return (
    <Layout showSubtitle>
      <SEO title="Home"/>

      <Row className={"mt-3"}>
        <Col xs={12} md={6}>
          <Button variant={"outline-primary"} block onClick={(): Promise<void> => navigate("/join")}>
            Join Game
          </Button>
        </Col>
        <Col xs={12} md={6}>
          <Button variant={"outline-primary"} block onClick={(): Promise<void> => navigate("/create")}>
            Create Game
          </Button>
        </Col>
      </Row>


    </Layout>
    /*
    User creates game
    -createRoom
    Users join room
    -userJoinRoom
    Some users leave room
    -userLeaveRoom
    Game Starts
    -pregameReady
    Assign Targets
    Wait for players to write a word
    -gameStart
    Players mark themselves as eliminated when they lose
    -playerEliminated
    All players are marked as eliminated OR host ends game
    -gameEnd
    Return to lobby; Host can click start game to start a new game

     */
  );
};

