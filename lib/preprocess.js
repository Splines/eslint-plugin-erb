// The words "after" and "before" refer to "after" and "before" processing,
// i.e. replacing of respective ERB tags with dummy comments.

const cache = require("./cache.js");

const { indexToColumn } = require("./file_coordinates.js");
const regex = require("./erb_regex.js");

// how annoying is that kind of important in JS ?!
var OffsetMap = require("./offset_map.js").OffsetMap;

const DUMMY_STR = "/* eslint-disable */X/* eslint-enable */";
const DUMMY_LEN = DUMMY_STR.length;

/**
 * Transforms the given text into lintable text. We do this by stripping out
 * ERB tags and replacing them with dummy comments. Additionally, we keep track
 * of the offset introduced by this replacement, so that we can adjust the
 * location of messages in the postprocess step later.
 * @param {string} text text of the file
 * @param {string} filename filename of the file
 * @returns {Array<{ filename: string, text: string }>} source code blocks to lint.
 */
function preprocess(text, filename) {
  let lintableTextArr = text.split("");

  let match;
  let numAddLines = 0;
  let numDiffChars = 0;
  const offsetMap = new OffsetMap();

  while ((match = regex.erbRegexChained.exec(text)) !== null) {
    // Match information
    const startIndex = match.index;
    const matchText = match[0];
    const matchLength = matchText.length;
    const endIndex = startIndex + matchLength;
    const matchLines = matchText.split("\n");

    // Lines
    numAddLines += matchLines.length - 1;

    // Columns
    const coordStartIndex = indexToColumn(text, startIndex);
    const endColumnAfter = coordStartIndex.column + DUMMY_LEN;
    const coordEndIndex = indexToColumn(text, endIndex);
    const endColumnBefore = coordEndIndex.column;
    const numAddColumns = endColumnBefore - endColumnAfter;

    replaceTextWithDummy(lintableTextArr, startIndex, matchLength - 1);

    // Store in map
    const lineAfter = coordEndIndex.line - numAddLines;
    numDiffChars += DUMMY_LEN - matchLength;
    const endIndexAfter = endIndex + numDiffChars;
    offsetMap.addMapping(endIndexAfter, lineAfter, numAddLines, numAddColumns);
  }

  const lintableText = lintableTextArr.join("");
  cache.add(filename, lintableText, offsetMap);
  return [lintableText];
}

// works in-place
function replaceTextWithDummy(lintableTextArr, startIndex, length) {
  lintableTextArr[startIndex] = DUMMY_STR;
  const replaceArgs = Array(length).join(".").split(".");
  // -> results in ['', '', '', '', ...]
  lintableTextArr.splice(startIndex + 1, length, ...replaceArgs);
}

module.exports = preprocess;
