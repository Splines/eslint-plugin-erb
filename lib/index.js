const { preprocessJs, preprocessHtml } = require("./preprocess.js");
const postprocess = require("./postprocess.js");

// Load processors
const processorJs = {
  meta: {
    name: "processJs",
  },
  preprocess: preprocessJs,
  postprocess,
  supportsAutofix: true,
};
const processorHtml = {
  meta: {
    name: "processHtml",
  },
  preprocess: preprocessHtml,
  postprocess,
  supportsAutofix: true,
};

// Define & export plugin
const plugin = {
  meta: {
    name: "eslint-plugin-erb",
    version: "2.1.0",
  },
  configs: {
    "recommended": {
      files: ["**/*.js.erb"],
      processor: processorJs,
    },
    // for the old non-flat config ESLint API
    "recommended-legacy": {
      plugins: ["erb"],
      overrides: [
        {
          files: ["**/*.js.erb"],
          processor: "erb/processorJs",
        },
      ],
    },
  },
  processors: {
    processorJs: processorJs,
    processorHtml: processorHtml,
  },
};

module.exports = plugin;
