// The words "after" and "before" refer to "after" and "before" processing,
// i.e. replacing of respective ERB tags with dummy comments.

const cache = require("./cache.js");

const { indexToColumn } = require("./file_coordinates.js");

// how annoying is that kind of import in JS ?!
var OffsetMap = require("./offset_map.js").OffsetMap;

const ERB_REGEX = /<%[\s\S]*?%>/g;

/**
 * Transforms the given text into lintable text. We do this by stripping out
 * ERB tags and replacing them with dummy comments. Additionally, we keep track
 * of the offset introduced by this replacement, so that we can adjust the
 * location of messages in the postprocess step later.
 * @param {string} text text of the file
 * @param {string} filename filename of the file
 * @param {string} dummyString dummy string to replace ERB tags with
 *                             (this is language-specific)
 * @returns {Array<{ filename: string, text: string }>} source code blocks to lint
 */
function preprocess(text, filename, dummyString) {
  let lintableTextArr = text.split("");

  let match;
  let numAddLines = 0;
  let numDiffChars = 0;
  const offsetMap = new OffsetMap();

  while ((match = ERB_REGEX.exec(text)) !== null) {
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
    const endColumnAfter = coordStartIndex.column + dummyString.length;
    const coordEndIndex = indexToColumn(text, endIndex);
    const endColumnBefore = coordEndIndex.column;
    const numAddColumns = endColumnBefore - endColumnAfter;

    replaceTextWithDummy(lintableTextArr, startIndex, matchLength - 1, dummyString);

    // Store in map
    const lineAfter = coordEndIndex.line - numAddLines;
    numDiffChars += dummyString.length - matchLength;
    const endIndexAfter = endIndex + numDiffChars;
    offsetMap.addMapping(endIndexAfter, lineAfter, numAddLines, numAddColumns);
  }

  const lintableText = lintableTextArr.join("");
  cache.add(filename, text, lintableText, offsetMap);
  return [lintableText];
}

/**
 * In-place replaces the text (as array) at the given index, for a given length,
 * with a dummy string.
 *
 * Note that the dummy string is inserted at the given index as one big string.
 * Subsequent characters for the length of the match are replaced with empty
 * strings in the array.
 */
function replaceTextWithDummy(lintableTextArr, startIndex, length, dummyString) {
  lintableTextArr[startIndex] = dummyString;
  const replaceArgs = Array(length).join(".").split(".");
  // -> results in ['', '', '', '', ...]
  lintableTextArr.splice(startIndex + 1, length, ...replaceArgs);
}

function preprocessJs(text, filename) {
  const dummyString = "/* eslint-disable */{}/* eslint-enable */";
  return preprocess(text, filename, dummyString);
}

function preprocessHtml(text, filename) {
  const dummyString = "<!-- -->";
  return preprocess(text, filename, dummyString);
}

module.exports = {
  preprocessJs,
  preprocessHtml,
};
