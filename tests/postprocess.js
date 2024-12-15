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
});
