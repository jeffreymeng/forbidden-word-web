import Query from "./Query";


describe("Query.get without URL", () => {
    test("Decode Query", () => {
        expect(Query.get("a"))
                .toBe("Query A");
    });
});

describe("Query.get with URL", () => {

    test("Decode Query", () => {
        expect(Query.get("q", "?q=Hello%20World&foo=hi"))
                .toBe("Hello World");
    });

    test("Decode Query in full URL", () => {
        expect(Query.get("q", "https://example.com/page.html?q=Hello%20World&foo=hi"))
                .toBe("Hello World");
    });

    test("Decode More Complicated Queries", () => {
        expect(Query.get("query",
                "?query=" + encodeURIComponent("ABCDEFGHIJKLMNOPWQRSTUVWXYZ~`" +
                "!@#$%^&*()1234567890_+-={}|:\"<>?[]\\;',./") + "&foo=hi"))
                .toBe("ABCDEFGHIJKLMNOPWQRSTUVWXYZ~`!@#$%^&*()1234567890_+-={}|:\"<>?[]\\;',./");
    });

    test("Boolean Query", () => {
        expect(Query.get("q", "?q=&foo=hi"))
                .toBe("");
    });

    test("Empty Query", () => {
        expect(Query.get("q", "?q=&foo=hi"))
                .toBe("");
    });

    test("Nonexistent Query", () => {
        expect(Query.get("q", "?foo=hi"))
                .toBe(null);
    });

    test("Preserve numbers as string", () => {
        expect(Query.get("q", "?q=0"))
                .toBe("0");
    });

    test("Preserve booleans as string", () => {
        expect(Query.get("q", "?q=false"))
                .toBe("false");
    });

    test("Don't get parameters in hash tag.", () => {
        expect(Query.get("q", "?#q=helloworld"))
                .toBe(null);
    });
});

describe("Query.getAll without string", () => {
    test("Decode Query", () => {
        expect(Query.getAll())
                .toEqual({
                    a: "Query A",
                });
    });
});

describe("Query.getAll with string", () => {
    test("Basic", () => {

        expect(Query.getAll("https://example.com/example?foo=Hello%20World&bar=&baz"))
                .toEqual({
                    foo: "Hello World",
                    bar: "",
                    baz: "",
                });
    });
    test("Don't get parameters in hash tag.", () => {
        expect(Query.getAll("?#q=helloworld"))
                .toEqual({});
    });

    test("Deeper objects", () => {
        expect(Query.getAll("https://random.url.com?Target=Offer&Method=findAll&filters%5Bhas_goals_enabled%5D%5B" +
                "TRUE%5D=1&filters%5Bstatus%5D=active&fields%5B%5D=id&fields%5B%5D=name&fields%5B%5D=default_goal_name"))
                .toEqual({
                    "Target": "Offer",
                    "Method": "findAll",
                    "fields": [
                        "id",
                        "name",
                        "default_goal_name",
                    ],
                    "filters": {
                        "has_goals_enabled": {
                            "TRUE": "1",
                        },
                        "status": "active",
                    },
                });
    });
});

describe("Query.getString with string", () => {
    test("Basic", () => {
        expect(Query.getString("https://example.com/example?foo=Hello%20World&bar=baz#anchor")).toBe("?foo=Hello%20World&bar=baz");
    });
    test("Question Mark only", () => {
        expect(Query.getString("example.com?")).toBe("?");
    });
    test("No Query String", () => {
        expect(Query.getString("https://example.com/dir/page.ext")).toBe("");
    });
    test("Don't get parameters in hash tag.", () => {
        expect(Query.getString("http://example.com?#q=helloworld")).toBe("?");
    });
});

describe("Query.getString without string", () => {
    test("Decode Query", () => {
        expect(Query.getString()).toBe("?a=Query%20A");
    });
});

describe("Query.set without string", () => {
    test("Add Query", () => {

    });
});
