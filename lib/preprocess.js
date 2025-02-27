// The words "after" and "before" refer to "after" and "before" processing,
// i.e. replacing of respective ERB tags with dummy comments.

const cache = require("./cache.js");

const { indexToColumn } = require("./file_coordinates.js");

// how annoying is that kind of import in JS ?!
var OffsetMap = require("./offset_map.js").OffsetMap;
var DummyReplacementsMap = require("./dummy_replacements_map.js").DummyReplacementsMap;

const ERB_REGEX = /<%[\s\S]*?%>/g;
const HASH = "566513c5d83ac26e15414f2754"; // to avoid collisions with user code

/**
 * Transforms the given text into lintable text. We do this by stripping out
 * ERB tags and replacing them with dummy comments. Additionally, we keep track
 * of the offset introduced by this replacement, so that we can adjust the
 * location of messages in the postprocess step later.
 * @param {string} text text of the file
 * @param {string} filename filename of the file
 * @param {(id) => string} toDummyString function that takes an id and the
 * matched text and returns a dummy string to replace the matched text with.
 * This dummy string must be unique.
 * @returns {Array<{ filename: string, text: string }>} source code blocks to lint
 */
function preprocess(text, filename, toDummyString) {
  let lintableTextArr = text.split("");

  let match;
  let numAddLines = 0;
  let numDiffChars = 0;
  const offsetMap = new OffsetMap();
  const dummyReplacementsMap = new DummyReplacementsMap();

  let matchedId = 0;
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
    const dummy = toDummyString(matchedId, matchText);
    const coordStartIndex = indexToColumn(text, startIndex);
    const endColumnAfter = coordStartIndex.column + dummy.length;
    const coordEndIndex = indexToColumn(text, endIndex);
    const endColumnBefore = coordEndIndex.column;
    const numAddColumns = endColumnBefore - endColumnAfter;
    replaceTextWithDummy(lintableTextArr, startIndex, matchLength - 1, dummy);

    const textWithErbSyntax = text.slice(startIndex, endIndex);
    dummyReplacementsMap.addMapping(textWithErbSyntax, dummy);

    // Store in map
    const lineAfter = coordEndIndex.line - numAddLines;
    numDiffChars += dummy.length - matchLength;
    const endIndexAfter = endIndex + numDiffChars;
    offsetMap.addMapping(endIndexAfter, lineAfter, numAddLines, numAddColumns);

    matchedId += 1;
  }

  const lintableText = lintableTextArr.join("");
  cache.add(filename, text, lintableText, offsetMap, dummyReplacementsMap);
  return [lintableText];
}

/**
 * In-place replaces the text (as array) at the given index, for a given length,
 * with a dummy string.
 *
 * Note that the dummy string is inserted at the given index as one big string.
 * For the length of the match, subsequent characters are replaced with empty
 * strings in the array.
 */
function replaceTextWithDummy(lintableTextArr, startIndex, length, dummy) {
  lintableTextArr[startIndex] = dummy;
  const replaceArgs = Array(length).join(".").split(".");
  // -> results in ['', '', '', '', ...]
  lintableTextArr.splice(startIndex + 1, length, ...replaceArgs);
}

function preprocessJs(text, filename) {
  function wrapInEslintDisable(text) {
    return `/* eslint-disable */${text}/* eslint-enable */`;
  }

  function toDummyString(id, matchText) {
    if (matchText.startsWith("<%=")) {
      return wrapInEslintDisable(`{}/* eslint-plugin-erb ${HASH} ${id} */`);
    }
    return wrapInEslintDisable(`/* eslint-plugin-erb ${HASH} ${id} */`);
  }
  return preprocess(text, filename, toDummyString);
}

function preprocessHtml(text, filename) {
  function toDummyString(id, _matchText) {
    return `<!-- ${HASH} ${id} -->`;
  }
  return preprocess(text, filename, toDummyString);
}

module.exports = {
  preprocessJs,
  preprocessHtml,
};
