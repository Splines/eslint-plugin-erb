/**
 * @fileoverview Enables the processor for ERB file extensions.
 * @author Splines
 */
"use strict";

const processor = require("./processor");

module.exports = {
  processors: {
    "embedded-ruby": processor,
  },
};
