# eslint-plugin-erb

**Lint your JavaScript code inside ERB files (`.js.erb`).**
A zero-dependency plugin for [ESLint](https://eslint.org/).

![showcase-erb-lint-gif](https://github.com/Splines/eslint-plugin-erb/assets/37160523/623d6007-b4f5-41ce-be76-5bc0208ed636?raw=true)


## Usage

### Install

Install the plugin alongside [ESLint](https://eslint.org/docs/latest/use/getting-started):

```sh
npm install --save-dev eslint eslint-plugin-erb
```


### Configure

You can extend the `plugin:erb/recommended` config that will enable the ERB processor on all `.js.erb` files.

```js
// .eslintrc.js
module.exports = {
    extends: "plugin:erb/recommended"
};
```

Or you can configure the processor manually (advanced):

```js
// .eslintrc.js
module.exports = {
    plugins: ["erb"],
    overrides: [
        {
            files: ["*.js.erb"],
            processor: "erb/erbProcessor"
        }
    ]
};
```

If you're wondering what a good starting point for your own `.eslintrc.js` file might be, you can use the config from [here](https://github.com/Splines/eslint-plugin-erb/tree/main/tests#environment).


## Editor Integrations

The [ESLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) for VSCode has built-in support for the ERB processor once you've configured it in your `.eslintrc.js` file as shown above.

If you're using VSCode, you may find this `settings.json` options useful:
```jsonc
{
    //////////////////////////////////////
    // JS (ESLint)
    //////////////////////////////////////
    // https://eslint.style/guide/faq#how-to-auto-format-on-save
    // https://github.com/microsoft/vscode-eslint#settings-options
    "editor.formatOnSave": true,
    "eslint.format.enable": true,
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
