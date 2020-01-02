import * as firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

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

export default firebase;