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
    version: "2.0.0",
  },
  configs: {
    "recommended": {
      files: ["**/*.js.erb"],
      processor: processor,
    },
    // for the old non-flat config ESLint API
    "recommended-legacy": {
      plugins: ["erb"],
      overrides: [
        {
          files: ["**/*.js.erb"],
          processor: "erb/erbProcessor",
        },
      ],
    },
  },
  processors: {
    erbProcessor: processor,
  },
};

module.exports = plugin;
