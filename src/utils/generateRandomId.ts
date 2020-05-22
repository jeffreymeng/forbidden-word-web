import firebase from "../firebase";

/**
 * Generates a random, un-taken random ID of minimum length 5 from a set of characters that does not
 * appear ambiguous in the browser's address bar.
 *
 */
async function generateRandomId(): Promise<string>;

/**
 * Generates a random, un-taken random ID of a specified minimum length from a set of characters that does not
 * appear ambiguous in the browser's address bar.
 * @param minLength - The minimum length of the returned ID.
 */
async function generateRandomId(minLength: number): Promise<string>;

/**
 * Generates a random, un-taken random ID of a specified minimum length from a set of characters that does not
 * appear ambiguous in the browser's address bar.
 * @param minLength - The minimum length of the returned ID.
 * @param tries - The number of tries that have been attempted by the recursive function. This is used as a base case
 *      for the recursion.
 * @hidden
 */
async function generateRandomId(tries: number, minLength: number): Promise<string>;

async function generateRandomId(minLength = 5, tries = 0): Promise<string> {
  console.log(tries, minLength);
  if (tries % 75 == 0 && tries != 0) {
    minLength ++;
  }
  if (tries > 1000) {
    throw "Random ID Generation Error";
  }

  // Use only capital letters to prevent ambiguity
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  console.log(chars);
  let result = "";
  for (let i = minLength; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return firebase.firestore()
    .collection("games")
    .doc(result)
    .get()
    .then(function(doc) {
      if (!doc.exists) {
        return result;
      } else {
        generateRandomId(minLength, ++ tries)
          .then(function (id) {
            return id;
          });
      }
    });
}

export { generateRandomId };