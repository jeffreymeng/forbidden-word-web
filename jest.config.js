module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: "src",
  "globals": {
    "window": {
      "location":{
        "href":"",
        "search":""
      }
    }
  }
};