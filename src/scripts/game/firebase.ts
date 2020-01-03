import * as firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import { User } from "firebase";

const config = {
    apiKey: "AIzaSyA4MSqu0TrSwd-UeokGmeA0Ia3r6G5NHng",
    authDomain: "forbidden-word-online.firebaseapp.com",
    databaseURL: "https://forbidden-word-online.firebaseio.com",
    projectId: "forbidden-word-online",
    storageBucket: "forbidden-word-online.appspot.com",
    messagingSenderId: "425960262979",
    appId: "1:425960262979:web:078ffd38fb72fce94ab3f6",
    measurementId: "G-FT3CZPHEM1"
};
firebase.initializeApp(config);

async function login(): Promise<User> {
    await firebase.auth().signInAnonymously().catch(function(error) {

        console.log(error);
        throw "Login Error. There may be additional log information above.";
    });
    if (firebase.auth().currentUser == null) {
        throw "Login Error";
    }
    return firebase.auth().currentUser;

}

export { login, firebase };
export default firebase;