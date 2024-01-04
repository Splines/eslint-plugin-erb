# eslint-plugin-erb

**Lint your JavaScript code inside ERB files (`.js.erb`).**
A zero-dependency plugin for [ESLint](https://eslint.org/).

![showcase-erb-lint-gif](https://github.com/Splines/eslint-plugin-erb/assets/37160523/623d6007-b4f5-41ce-be76-5bc0208ed636?raw=true)


> [!WARNING]
> v2.0.0 is breaking. We now use the new ESLint flat config format. Use `erb:recommended-legacy` if you want to keep using the old `.eslintrc.js` format.

## Usage

### Install

Install the plugin alongside [ESLint](https://eslint.org/docs/latest/use/getting-started):

```sh
npm install --save-dev eslint eslint-plugin-erb
```


### Configure

Starting of v9 ESLint provides a [new flat config format](https://eslint.org/docs/latest/use/configure/configuration-files-new) (`eslint.config.js`). Also see the [configuration migration guide](https://eslint.org/docs/latest/use/configure/migration-guide). Use it as follows and it will automatically lint all your `.js.erb` files:

```js
// eslint.config.js
import erb from "eslint-plugin-erb";

export default [
  // if you are using VSCode, don't forget to put
  // "eslint.experimental.useFlatConfig": true
  // in your settings.json
  erb.configs.recommended,
  {
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

export default [
  js.configs.recommended,
  erb.configs.recommended,
  {
    ignores: [
      "node_modules/",
    ],
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
  // if you are using VSCode, don't forget to put
  // "eslint.experimental.useFlatConfig": true
  // in your settings.json
  {
    files: ["**/*.js.erb"],
    processor: erb.processors.erbProcessor,
  },
  {
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

Or you can configure the processor manually (advanced):

```js
// .eslintrc.js
module.exports = {
    plugins: ["erb"],
    overrides: [
        {
            files: ["**/*.js.erb"],
            processor: "erb/erbProcessor"
        }
    ]
};
```

</details>





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
    "eslint.experimental.useFlatConfig": true, // use the new flat config format
    "[javascript]": {
        "editor.formatOnSave": false, // to avoid formatting twice (ESLint + VSCode)
        "editor.defaultFormatter": "dbaeumer.vscode-eslint" // use ESLint plugin
    },
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true // Auto-fix ESLint errors on save
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
