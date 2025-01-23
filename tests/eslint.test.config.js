const js = require("@eslint/js");
const stylistic = require("@stylistic/eslint-plugin");
const globals = require("globals");
const html = require("@html-eslint/eslint-plugin");

const plugin = require("../lib/index.js");

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
    processor: plugin.processors["processorJs"],
    files: ["**/*.js", "**/*.js.erb"],
  },
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
    ignores: ["**/*.html**"],
    linterOptions: {
      // see https://github.com/Splines/eslint-plugin-erb/releases/tag/v2.0.1
      reportUnusedDisableDirectives: "off",
    },
  },
  {
    // HTML linting (aside from erb_lint)
    files: ["**/*.html", "**/*.html.erb"],
    processor: plugin.processors["processorHtml"],
    ...html.configs["flat/recommended"],
    plugins: {
      "@html-eslint": html,
      "@stylistic": stylistic,
    },
    rules: {
      "@stylistic/eol-last": ["error", "always"],
      "@stylistic/no-trailing-spaces": "error",
      "@stylistic/no-multiple-empty-lines": ["error", { max: 1, maxEOF: 0 }],
      ...html.configs["flat/recommended"].rules,
      // 🎈 Best Practices
      "@html-eslint/no-extra-spacing-text": "error",
      "@html-eslint/no-script-style-type": "error",
      "@html-eslint/no-target-blank": "error",
      // 🎈 Accessibility
      "@html-eslint/no-abstract-roles": "error",
      "@html-eslint/no-accesskey-attrs": "error",
      "@html-eslint/no-aria-hidden-body": "error",
      "@html-eslint/no-non-scalable-viewport": "error",
      "@html-eslint/no-positive-tabindex": "error",
      "@html-eslint/no-skip-heading-levels": "error",
      // 🎈 Styles
      "@html-eslint/attrs-newline": ["error", {
        closeStyle: "newline",
        ifAttrsMoreThan: 5,
      }],
      "@html-eslint/id-naming-convention": ["error", "kebab-case"],
      "@html-eslint/indent": ["error", 2],
      "@html-eslint/sort-attrs": "error",
      "@html-eslint/no-extra-spacing-attrs": ["error", {
        enforceBeforeSelfClose: true,
        disallowMissing: true,
        disallowTabs: true,
        disallowInAssignment: true,
      }],
    },
    linterOptions: {
      // see https://github.com/Splines/eslint-plugin-erb/releases/tag/v2.0.1
      reportUnusedDisableDirectives: "off",
    },
  },
];
