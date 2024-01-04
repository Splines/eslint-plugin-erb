/**
 * @fileoverview Process ERB files for consumption by ESLint.
 * @author Splines
 */

// Load processor
const preprocess = require("./preprocess.js");
const postprocess = require("./postprocess.js");
const processor = {
  preprocess,
  postprocess,
  supportsAutofix: true,
};

// Define & export plugin
const plugin = {
  meta: {
    name: "eslint-plugin-erb",
    version: "1.1.2",
  },
  configs: {
    recommended: {
      files: ["**/*.js.erb"],
      processor: processor,
    }
  },
  processors: {
    erbProcessor: processor,
  },
};

module.exports = plugin;
