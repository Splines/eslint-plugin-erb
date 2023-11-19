# eslint-plugin-erb

**Lint your JavaScript code inside ERB files (`.js.erb`).**
A zero dependency plugin for [ESLint](https://eslint.org/).

![showcase-erb-lint-small](https://github.com/Splines/eslint-plugin-erb/assets/37160523/e0c32a98-1520-4fb4-a907-f19cb0819da2)


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


## Editor Integrations

The [ESLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) for VSCode has built-in support for the ERB processor once you've configured it in your `.eslintrc.js` file as shown above.


## TODO

- [ ] Add tests
- [ ] Improve in-line documentation
- [ ] Add guide on how to use
