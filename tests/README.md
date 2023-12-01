# Testing


## Run tests

```sh
npm test
```


## Environment

For reproduction, this is the ESLint configuration file used to generate the input messages for testing (see the `tests/fixtures/` folder. The files were manually renamed to end with `.js.erb` during this process.

```js
//.eslintrc.js
// Starting with v9, this config will be deprecated in favor of the new
// configuration files [1]. @stylistic is already ready for the new "flat config",
// when it's time, copy the new config from [2].
// [1] https://eslint.org/docs/latest/use/configure/configuration-files-new
// [2] https://eslint.style/guide/config-presets#configuration-factory

// //////////////////////////////////////////
// Stylistic Plugin for ESLint
// //////////////////////////////////////////
// see the rules in [3] and [4].
// [3] https://eslint.style/packages/js#rules
// [4] https://eslint.org/docs/rules/

// eslint-disable-next-line no-undef
require("@stylistic/eslint-plugin");

// eslint-disable-next-line no-undef
module.exports = {
  "root": true,
  "parserOptions": {
    "ecmaVersion": 2024,
    "sourceType": "module"
  },
  "env": {
    "browser": true,
    "jquery": true,
    "es6": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:@stylistic/all-extends"
  ],
  "plugins": [
    "@stylistic",
    "erb"
  ],
  "overrides": [
    {
      "files": ["*.js.erb"],
      "processor": "erb/erbProcessor"
    }
  ],
  "rules": {
    "no-unused-vars": "warn",
    "@stylistic/indent": ["error", 2],
    "@stylistic/quotes": ["error", "double"],
    "@stylistic/array-element-newline": ["error", "consistent"],
    "@stylistic/max-len": [
      "error", {
        "code": 100,
        "ignoreUrls": true
      }
    ]
  }
};
```