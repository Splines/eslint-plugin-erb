const { preprocessJs, preprocessHtml } = require("./preprocess.js");
const { postprocess } = require("./postprocess.js");

// Load processor
const processorJs = {
  preprocess: preprocessJs,
  postprocess,
  supportsAutofix: true,
};
const processorHtml = {
  preprocess: preprocessHtml,
  postprocess,
  supportsAutofix: true,
};

// Define & export plugin
const plugin = {
  meta: {
    name: "eslint-plugin-erb",
    version: "2.0.1",
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
