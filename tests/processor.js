const fs = require("fs");

const assert = require("chai").assert;
const p = require("../lib/preprocess.js");
const cache = require("../lib/cache.js");

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
    it(`replaces ruby with dummy string in "${name}.js"`, () => {
      const text = fs.readFileSync(`tests/fixtures/${name}.js`, "utf-8");
      const textLintableExpected = fs.readFileSync(`tests/fixtures/${name}.pre.js`, "utf-8");

      const textLintable = p(text)[0];
      assert.equal(textLintable, textLintableExpected);
    });
  });

  const offsets = [
    {
      name: "one-liner",
      expected: {
        lineOffsetLookup: new Map([
          [1, new Map([
            [45, { lineOffset: 0, columnOffset: -32 }],
          ])],
        ]),
        offsetLookup: new Map([
          [45, { lineOffset: 0, columnOffset: -32 }],
        ]),
      },
    },
    {
      name: "multi-line",
      expected: {
        lineOffsetLookup: new Map([
          [2, new Map([
            [64, { lineOffset: 2, columnOffset: -7 }],
          ])],
        ]),
        offsetLookup: new Map([
          [64, { lineOffset: 2, columnOffset: -7 }],
        ]),
      },
    },
    {
      name: "common",
      expected: {
        lineOffsetLookup: new Map([
          [1, new Map([
            [50, { lineOffset: 0, columnOffset: -26 }],
          ])],
          [3, new Map([
            [155, { lineOffset: 1, columnOffset: -13 }],
          ])],
          [9, new Map([
            [268, { lineOffset: 1, columnOffset: -18 }],
          ])],
          [11, new Map([
            [349, { lineOffset: 1, columnOffset: -32 }],
          ])],
        ]),
        offsetLookup: new Map([
          [50, { lineOffset: 0, columnOffset: -26 }],
          [155, { lineOffset: 1, columnOffset: -13 }],
          [268, { lineOffset: 1, columnOffset: -18 }],
          [349, { lineOffset: 1, columnOffset: -32 }],
        ]),
      },
    },
    {
      name: "each-do",
      expected: {
        lineOffsetLookup: new Map([
          [1, new Map([
            [41, { lineOffset: 0, columnOffset: -17 }],
          ])],
          [2, new Map([
            [96, { lineOffset: 0, columnOffset: -33 }],
          ])],
          [3, new Map([
            [154, { lineOffset: 0, columnOffset: -32 }],
          ])],
        ]),
        offsetLookup: new Map([
          [41, { lineOffset: 0, columnOffset: -17 }],
          [96, { lineOffset: 0, columnOffset: -33 }],
          [154, { lineOffset: 0, columnOffset: -32 }],
        ]),
      },
    },
  ];
  offsets.forEach(({ name, expected }) => {
    it(`correctly constructs offset map for "${name}.js`, () => {
      const text = fs.readFileSync(`tests/fixtures/${name}.js`, "utf-8");
      p(text, name);
      const offsetMap = cache.get(name).offsetMap;
      assert.deepEqual(offsetMap.lineOffsetLookup, expected.lineOffsetLookup);
      assert.deepEqual(offsetMap.offsetLookup, expected.offsetLookup);
    });
  });
});
