import firebase from "./firebase";

async function generateRandomId(tries = 0, minLength = 5) {
    console.log(tries, minLength);
    if (tries > 100) {

        minLength += 2;
    }
    if (tries > 1000) {
        throw "Random Error";
        return false;
    }

    // Avoid 0 and O because they are ambiguous.
    let chars = "123456789ABCDEFGHIJKLMNPQRSTUVWXYZ";
    let result = "";
    for (let i = minLength; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    console.log(result);
    return firebase.firestore()
            .collection("games")
            .doc(result)
            .get()
            .then(function(doc) {
                console.log(doc.exists);
                if (!doc.exists) {
                    console.log(result);
                    return result;
                } else {
                    generateRandomId(tries + 1, minLength)
                            .then(function (id) {
                                console.log("TRY AGAIN");
                                return id;
                            });
                }
            });
}

export { generateRandomId };