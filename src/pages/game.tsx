import React, { ReactElement } from "react";
import Layout from "../components/layout";
import SEO from "../components/seo";
import NotFoundPage from "./404";
import { navigate, WindowLocation } from "@reach/router";
import { Button, Spinner } from "react-bootstrap";
import firebase from "../firebase";

export default function GamePage({ location }: { location: WindowLocation }): ReactElement {
  const id = location.pathname.split("/").length >= 2 ? location.pathname.split("/")[2] : "";
  const [data, setData] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [userid, setUserid] = React.useState("");
  console.log(data);

  React.useEffect(() => {
    if (!firebase) return;
    firebase
      .firestore()
      .collection("games")
      .doc(id)
      .onSnapshot((snapshot) => {
        setData(snapshot.data());
        setLoading(false);
      });
    const unsubscribe = firebase
      .auth()
      .onAuthStateChanged(user => setUserid(user?.uid || ""));
    return (): void => unsubscribe();
  }, [firebase]);
  if (!id) return <NotFoundPage/>;
  if (loading) {
    return (
      <Layout>
        <SEO title={"Loading..."}/>
        <p className="text-center">
          <Spinner animation={"border"} as={"span"}/>
        </p>
      </Layout>
    );
  } else if (!data) {
    return (
      <Layout>
        <SEO title={"Game not Found"}/>
        <h3>Game Not Found</h3>
        <p>Sometimes, games are deleted after they are no longer useful to save on server costs.</p>
        <p>You can create your a new game, or join a game, from the home page.</p>
        <Button onClick={(): Promise<void> => navigate("/")}>Return to home page</Button>

      </Layout>
    );
  }
  return (
    <Layout>
      <SEO title={"Play"}/>
      <h3>Play {id}</h3>
      <ul>
        {data.playerNames
          .sort((a, b) => {
            if (a.id == userid ) {
              return 1;
            } else if (b.id == userid) {
              return -1;
            } else if (a.id == data.host) {
              return 1;
            } else if (b.id == data.host) {
              return -1;
            }
            // default alphabetic order
            return a.localeCompare(b);
          })
          .map(player => <li key={player.id}>{player.name} {player.id == data.host && <i>(Host)</i>} {player.id == userid && <i>(You)</i>}</li>)}
      </ul>
    </Layout>
  );
}