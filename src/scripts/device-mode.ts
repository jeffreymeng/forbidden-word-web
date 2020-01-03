import '../styles/device-mode.scss'
import Game from './game/Game';
import { firebase, login } from "./game/firebase";

async function connect() {
    let user = await login();
    let game = await Game.reconnect("ZVEWP", user);
    console.log(game);
    console.log(user);
}
connect();