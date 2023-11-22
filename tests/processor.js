// inspired by: https://github.com/eslint/eslint-plugin-markdown/blob/main/tests/lib/p.js

const fs = require("fs");

const assert = require("chai").assert;
const p = require("../lib/preprocess.js");

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

  const replaceStringFiles = ["one-liner", "common", "each-do", "multi-line"];
  replaceStringFiles.forEach((name) => {
    it(`replaces ruby code with dummy strings in file ${name}`, () => {
      const text = fs.readFileSync(`tests/fixtures/${name}.js`, "utf-8");
      const textLintableExpected = fs.readFileSync(`tests/fixtures/${name}.pre.js`, "utf-8");

      const textLintable = p(text)[0];
      assert.equal(textLintable, textLintableExpected);
    });
  });
});
