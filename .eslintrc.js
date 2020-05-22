module.exports = {
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: "module",
        ecmaFeatures: {
            jsx: true,
        },
    },
    plugins: ["@typescript-eslint", "eslint-plugin-react"],
    env: {
        browser: true,
        node: true,
        jest: true,
        es6: true,
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
        "prettier",
        "prettier/@typescript-eslint",
        "prettier/babel",
        "prettier/react",
    ],

    rules: {
        "@typescript-eslint/explicit-function-return-type": "off",
        semi: ["warn", "always"],
    },
    overrides: [
        {
            files: ["**/*.ts", "**/*.tsx"],
            rules: {
                "@typescript-eslint/explicit-function-return-type": ["error"],
                "@typescript-eslint/no-namespace": "off",
            },
        },
    ],
};
