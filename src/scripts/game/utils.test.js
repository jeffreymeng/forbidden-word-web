"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
describe("range", function () {
    test("Numbers 1", function () {
        return expect(utils_1.range("3-7")).toBe("34567");
    });
    test("Numbers 2", function () {
        return expect(utils_1.range("0-9")).toBe("0123456789");
    });
    test("Single Number", function () {
        return expect(utils_1.range("3")).toBe("3");
    });
    test("Multiple Numbers", function () {
        return expect(utils_1.range("289")).toBe("289");
    });
    test("Multiple Number Ranges", function () {
        return expect(utils_1.range("3-58-9")).toBe("34589");
    });
    test("Letters 1", function () {
        return expect(utils_1.range("a-z")).toBe("abcdefghijklmnopqrstuvwxyz");
    });
    test("Letters 2", function () {
        return expect(utils_1.range("A-Z")).toBe("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    });
    test("Letters 3", function () {
        return expect(utils_1.range("l-p")).toBe("lmnop");
    });
    test("Letters 4", function () {
        return expect(utils_1.range("L-P")).toBe("LMNOP");
    });
    test("A few letters", function () {
        return expect(utils_1.range("axOZ")).toBe("axOZ");
    });
    test("Multiple Letter Ranges", function () {
        return expect(utils_1.range("d-gQ-S")).toBe("defgQRS");
    });
    test("Letters and Numbers", function () {
        return expect(utils_1.range("3-6d-gQ-S")).toBe("3456defgQRS");
    });
    test("Everything", function () {
        return expect(utils_1.range("3-5d-g79Q-Z")).toBe("345defg79QRSTUVWXYZ");
    });
    test("Literal Dash", function () {
        return expect(utils_1.range("Hello, world \\- Obama a-c")).toBe("Hello, world - Obama abc");
    });
    test("Escaped backslash", function () {
        return expect(utils_1.range("Hello, world \\- Obama \\\\ \\\\-^ a-c")).toBe("Hello, world - Obama \\ \\]^ abc");
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
