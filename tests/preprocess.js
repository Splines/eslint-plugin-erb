const assert = require("chai").assert;
const { preprocessJs: p } = require("../lib/preprocess.js");

describe("preprocess", () => {
  it("does not crash", () => {
    p("Hello, world!");
  });

  it("does not crash on empty string", () => {
    p("");
  });

  it("returns an array with just one element", () => {
    const res = p("Hello, world!");
    assert.isArray(res);
    assert.lengthOf(res, 1);
  });

  it("ignores normal text", () => {
    const res = p("Hello, world!")[0];
    assert.equal(res, "Hello, world!");
  });
});
