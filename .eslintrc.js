"use strict";

const stylistic = require("@stylistic/eslint-plugin");

const customized = stylistic.configs.customize({
  "indent": 2,
  "quotes": "double",
  "jsx": false,
  "quote-props": "always",
  "semi": "always",
});

module.exports = {
  root: true,

  parserOptions: {
    ecmaVersion: 2024,
    sourceType: "module",
  },

  env: {
    node: true,
    es6: true,
  },

  extends: "eslint:recommended",

  plugins: [
    "@stylistic",
  ],

  rules: {
    ...customized.rules,
    "no-unused-vars": "warn",
  },
};
