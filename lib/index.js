/**
 * @fileoverview Process ERB files for consumption by ESLint.
 * @author Splines
 */

const preprocess = require("./preprocess");
const postprocess = require("./postprocess");
const processor = {
  preprocess,
  postprocess,
  supportsAutofix: true,
};

module.exports = {
  processors: {
    erbProcessor: processor,
  },
};
