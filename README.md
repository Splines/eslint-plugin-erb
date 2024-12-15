# eslint-plugin-erb

**Lint your JavaScript code inside ERB files (`.js.erb`).**
A zero-dependency plugin for [ESLint](https://eslint.org/).
<br>Also lints your **HTML code** in `.html.erb` if you want to.

![showcase-erb-lint-gif](https://github.com/Splines/eslint-plugin-erb/assets/37160523/623d6007-b4f5-41ce-be76-5bc0208ed636?raw=true)

> **Warning**
> v2.0.0 is breaking. We use the new ESLint flat config format. Use `erb:recommended-legacy` if you want to keep using the old `.eslintrc.js` format.

## Usage

### Install

Install the plugin alongside [ESLint](https://eslint.org/docs/latest/use/getting-started):

```sh
npm install --save-dev eslint eslint-plugin-erb
```

### Configure

Starting of v9 ESLint provides a [new flat config format](https://eslint.org/docs/latest/use/configure/configuration-files-new) (`eslint.config.js`). Also see the [configuration migration guide](https://eslint.org/docs/latest/use/configure/migration-guide). Use it as follows and it will automatically lint all your **JavaScript code** in `.js.erb` files:

```js
// eslint.config.js
import erb from "eslint-plugin-erb";

export default [
  erb.configs.recommended,
  {
    linterOptions: {
      // The "unused disable directive" is set to "warn" by default.
      // For the ERB plugin to work correctly, you must disable
      // this directive to avoid issues described here
      // https://github.com/eslint/eslint/discussions/18114
      // If you're using the CLI, you might also use the following flag:
      // --report-unused-disable-directives-severity=off
      reportUnusedDisableDirectives: "off",
    },
    // your other configuration options
  }
];
```

<details>
<summary>See more complete example</summary>

```js
// eslint.config.js
import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import globals from "globals";
import erb from "eslint-plugin-erb";

const customizedStylistic = stylistic.configs.customize({
  "indent": 2,
  "jsx": false,
  "quote-props": "always",
  "semi": "always",
  "brace-style": "1tbs",
});

const customGlobals = {
  MyGlobalVariableOrFunctionOrClassOrWhatever: "readable",
};

// [1] https://eslint.org/docs/latest/use/configure/configuration-files-new#globally-ignoring-files-with-ignores

export default [
  js.configs.recommended,
  erb.configs.recommended,
  // Globally ignoring the following files
  // "Note that only global ignores patterns can match directories.
  // 'ignores' patterns that are specific to a configuration will
  // only match file names." ~ see [1]
  {
    ignores: [
      "node_modules/",
      "tests/fixtures/",
      "tmp/",
    ],
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
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...customGlobals,
        ...globals.browser,
        ...globals.node,
      },
    },
    linterOptions: {
      // The "unused disable directive" is set to "warn" by default.
      // For the ERB plugin to work correctly, you must disable
      // this directive to avoid issues described here
      // https://github.com/eslint/eslint/discussions/18114
      // If you're using the CLI, you might also use the following flag:
      // --report-unused-disable-directives-severity=off
      reportUnusedDisableDirectives: "off",
    },
  },
];
```

</details>

<details>

<summary>Alternative way to configure the processor</summary>

With this variant you have a bit more control over what is going on, e.g. you could name your files `.js.special-erb` and still lint them (if they contain JS and ERB syntax).

```js
// eslint.config.js
import erb from "eslint-plugin-erb";

export default [
  {
    files: ["**/*.js.erb"],
    processor: erb.processors.processorJs,
  },
  {
    linterOptions: {
      // The "unused disable directive" is set to "warn" by default.
      // For the ERB plugin to work correctly, you must disable
      // this directive to avoid issues described here
      // https://github.com/eslint/eslint/discussions/18114
      // If you're using the CLI, you might also use the following flag:
      // --report-unused-disable-directives-severity=off
      reportUnusedDisableDirectives: "off",
    },
    // your other configuration options
  }
];
```

</details>

<details>
<summary>Legacy: you can still use the old `.eslintrc.js` format</summary>

You can extend the `plugin:erb/recommended-legacy` config that will enable the ERB processor on all `.js.erb` files. **Note that instead of "plugin:erb/recommended", you now have to use "plugin:erb/recommended-legacy"**.

```js
// .eslintrc.js
module.exports = {
    extends: "plugin:erb/recommended-legacy"
};
```

Or you can configure the processor manually:

```js
// .eslintrc.js
module.exports = {
    plugins: ["erb"],
    overrides: [
        {
            files: ["**/*.js.erb"],
            processor: "erb/processorJs"
        }
    ]
};
```

</details>

If you also want to lint **HTML code** in `.html.erb` files, you can use our preprocessor in conjunction with the amazing [`html-eslint`](https://html-eslint.org/) plugin. Install `html-eslint`, then add the following to your ESLint config file (flat config format):

```js
// eslint.config.js
import erb from "eslint-plugin-erb";

export default [
  // your other configurations...
  {
    processor: erb.processors["processorHtml"],
    ...html.configs["flat/recommended"],
    files: ["**/*.html", "**/*.html.erb"],
    rules: {
        ...html.configs["flat/recommended"].rules,
        "@html-eslint/indent": ["error", 2],
        // other rules...
    },
  }
];
```

Additionally, you might want to add the following option to the other objects (`{}`) in `export default []`, since other rules might be incompatible with HTML files:

```js
ignores: ["**/*.html**"],
```

## Editor Integrations

The [ESLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) for VSCode has built-in support for the ERB processor once you've configured it in your `.eslintrc.js` file as shown above.

If you're using VSCode, you may find this `settings.json` options useful:

```jsonc
{
    "editor.formatOnSave": false, // it still autosaves with the options below
    //////////////////////////////////////
    // JS (ESLint)
    //////////////////////////////////////
    // https://eslint.style/guide/faq#how-to-auto-format-on-save
    // https://github.com/microsoft/vscode-eslint#settings-options
    "eslint.format.enable": true,
    "[javascript]": {
        "editor.formatOnSave": false, // to avoid formatting twice (ESLint + VSCode)
        "editor.defaultFormatter": "dbaeumer.vscode-eslint" // use ESLint plugin
    },
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": "explicit" // Auto-fix ESLint errors on save
    },
    // this disables VSCode built-int formatter (instead we want to use ESLint)
    "javascript.validate.enable": false,
    //////////////////////////////////////
    // Files
    //////////////////////////////////////
    "files.exclude": {
        "node_modules/": false,
    },
    "files.associations": {
        "*.js.erb": "javascript"
    },
}
```

## Limitations

- Does not account for code indentation inside `if/else` ERB statements, e.g.
this snippet

```js
<% if you_feel_lucky %>
    console.log("You are lucky 🍀");
<% end %>
```

will be autofixed to

```js
<% if you_feel_lucky %>
console.log("You are lucky 🍀");
<% end %>
```

- No support for ESLint suggestions (but full support for Autofixes as shown in the GIF above)
