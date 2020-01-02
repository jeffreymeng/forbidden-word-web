import { range } from "./utils";

describe("range", () => {
    test("Numbers 1", () => {
        return expect(range("3-7")).toBe("34567");
    });

    test("Numbers 2", () => {
        return expect(range("0-9")).toBe("0123456789");
    });

    test("Single Number", () => {
        return expect(range("3")).toBe("3");
    });

    test("Multiple Numbers", () => {
        return expect(range("289")).toBe("289");
    });

    test("Multiple Number Ranges", () => {
        return expect(range("3-58-9")).toBe("34589");
    });

    test("Letters 1", () => {
        return expect(range("a-z")).toBe("abcdefghijklmnopqrstuvwxyz");
    });

    test("Letters 2", () => {
        return expect(range("A-Z")).toBe("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    });

    test("Letters 3", () => {
        return expect(range("l-p")).toBe("lmnop");
    });

    test("Letters 4", () => {
        return expect(range("L-P")).toBe("LMNOP");
    });

    test("A few letters", () => {
        return expect(range("axOZ")).toBe("axOZ");
    });

    test("Multiple Letter Ranges", () => {
        return expect(range("d-gQ-S")).toBe("defgQRS");
    });

    test("Letters and Numbers", () => {
        return expect(range("3-6d-gQ-S")).toBe("3456defgQRS");
    });

    test("Everything", () => {
        return expect(range("3-5d-g79Q-Z")).toBe("345defg79QRSTUVWXYZ");
    });

    test("Literal Dash", () => {
        return expect(range("Hello, world \\- Obama a-c")).toBe("Hello, world - Obama abc");
    });

    test("Escaped backslash", () => {
        return expect(range("Hello, world \\- Obama \\\\ \\\\-^ a-c")).toBe("Hello, world - Obama \\ \\]^ abc");
    });

});


// describe ("generateRandomID", () => {
//
//     const myMockFn = jest
//             .fn()
//             .mockReturnValue('default')
//             .mockImplementation(() => {
//
//             })
//             .mockName('firebase.firestore()');
//
// });