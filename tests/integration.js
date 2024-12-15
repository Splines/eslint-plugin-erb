const fs = require("fs");
const assert = require("chai").assert;
const plugin = require("../lib/index.js");
const { ESLint } = require("eslint");

const eslint = new ESLint({
  fix: true,
  overrideConfigFile: "./tests/eslint.test.config.js",
  overrideConfig: {
    processor: plugin.processors.processorJs,
    files: ["**/*.js"],
  },
});

async function runTest(filename, expectedFilename) {
  const testCode = fs.readFileSync(filename, "utf-8");
  const result = await eslint.lintText(testCode, { filePath: filename });
  const expectedCode = fs.readFileSync(expectedFilename, "utf-8");
  assert.strictEqual(result[0].output, expectedCode);
}

describe("Integration tests (JS)", () => {
  const mapFiles = [
    "common",
    "each-do",
    "multi-line",
    "multiple-erb-in-one-line",
    "one-liner",
    "multiple-properties",
  ];
  mapFiles.forEach((name) => {
    it(`performs linting as we expect it on ${name}.js`, async () => {
      await runTest(`tests/fixtures/${name}.js`, `tests/fixtures/${name}.expected.js`, eslint);
    });
  });
});
