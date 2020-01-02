import firebase from "./firebase";
import shimMatchAll from "string.prototype.matchall/shim";
import * as XRegExp from "xregexp";

// string.prototype.matchAll polyfill
shimMatchAll();


/**
 * Generates a string containing all the unicode characters within the provided regex-style ranges, inclusive. Supports special escape characters "\\-" as literal dash (-), and
 * "\\\\" as literal backslash ("\\")
 * @param ranges - A string containing one or more regex-style ranges, specifying the characters that should be in the return string.
 * @example
 * ```typescript
 * range("a-c"); // "abc"
 * range("d-fkw-z"); // "defkwxyz"
 * range("0-3a-fQZA-C"); // "0123abcdefQZABC"
 * range("Hello, world \\- Obama \\\\ \\\\-^ a-c"); // "Hello, world - Obama \\ \\]^ abc"
 * ```
 *
 */
function range(ranges: string): string;

/**
 * Generates a string containing all the unicode characters between the provided start and end characters, inclusive.
 * @param start - The unicode character to start from.
 * @param end - The unicode character to end at. The value of the character must not be lower than the value of the start character.
 * @example
 *  ```typescript
 *  range("a", "e"); // "abcde"
 *  range("4", "7"); // "4567"
 *  range("W", "Z"); // "WXYZ"
 *  ```
 *
 */
function range(start: string, end: string) : string;

/**
 * Generates a string containing all unicode characters within the provided regex-style range, but without processing any escaped special characters.
 * @param start - The range string
 * @param end - Must be undefined
 * @param processedEscapes - Must be true
 *
 */
function range(start: string, end: undefined, processedEscapes: true) : string;

function range(start: string, end?: string, processedEscapes: boolean = false) : string {
    let result = "";


    if (!end) {
        // If there is only one argument, recursively process the regex-style range.
        if (!processedEscapes) {
            // Escaped dashes (\\-) and escaped escapes (\\\\) should be treated literally
            let segments = XRegExp.split(start, /(?<!\\)\\-/g).map(x => x.replace(/\\\\/g, "\\"));

            let result = "";
            if (segments.length > 1) {
                result = range(segments[0], undefined, true);
                for (let i = 1; i < segments.length; i ++) {
                    result += "-" + range(segments[i], undefined, true);
                }
                return result;
            }
        }


        let re = /(.)(?:-(.))?/g;
        let matches = [...start.matchAll(re)];

        for (let match of matches) {
            result += range(match[1], match[2] || match[1]);
        }

        return result;
    }
    if (end.charCodeAt(0) < start.charCodeAt(0)) {
        throw "InputError: the ending char code is less than the starting char code";
    }
    for (let i = start.charCodeAt(0); i <= end.charCodeAt(0); i ++) {
        result += String.fromCharCode(i);
    }
    return result;

}


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

    // Avoid 0 and O because they are ambiguous.
    let chars = range("1-94A-NP-Z");
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

export { generateRandomId, range };