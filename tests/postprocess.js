const fs = require("fs");

const assert = require("chai").assert;
const { preprocessJs: pre } = require("../lib/preprocess.js");
const post = require("../lib/postprocess.js");
const cache = require("../lib/cache.js");

describe("postprocess", () => {
  it("deletes file from cache after postprocessing", () => {
    const text = 'console.log("Hello world!");';
    const name = "testfile.js";

    pre(text, name);
    assert.exists(cache.get(name));
    assert.isNotEmpty(cache.get(name));

    post([[]], name);
    assert.isUndefined(cache.get(name));
  });

  const mapFiles = [
    "one-liner",
    "common",
    "each-do",
    "multi-line",
    "multiple-erb-in-one-line",
  ];
  mapFiles.forEach((name) => {
    it(`correctly maps location from offset map on ${name}.js`, () => {
      const filename = `tests/fixtures/${name}.js`;
      const text = fs.readFileSync(filename, "utf-8");
      pre(text, filename);

      const esLintMessages = require(`../tests/fixtures/${name}.messages.js`);

      const finalMessages = post([esLintMessages], filename);
      const expectedMessages = require(`../tests/fixtures/${name}.expected.messages.js`);
      assert.deepEqual(expectedMessages, finalMessages);
    });
  });
});
