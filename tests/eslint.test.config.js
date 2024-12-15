const js = require("@eslint/js");
const stylistic = require("@stylistic/eslint-plugin");
const globals = require("globals");

const customizedStylistic = stylistic.configs.customize({
  "indent": 2,
  "jsx": false,
  "quote-props": "always",
  "semi": "always",
  "brace-style": "1tbs",
});

module.exports = [
  js.configs.recommended,
  {
    plugins: {
      "@stylistic": stylistic,
    },
    rules: {
      ...customizedStylistic.rules,
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@stylistic/quotes": ["error", "double", { avoidEscape: true }],
    },
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.mocha,
      },
    },
  },
];
