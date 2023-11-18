/**
 * @fileoverview Process ERB files for consumption by ESLint.
 * @author Splines
 */

"use strict";

// The words "after" and "before" refer to "after" and "before" processing,
// i.e. replacing of respective ERB tags with dummy comments.

const { coordinatesToIndex, indexToColumn } = require("./file_coordinates.js");
const regex = require("./erb_regex.js");

// how annoying is that kind of important in JS ?!
const OffsetMap = require("./offset_map.js").OffsetMap;
const offsetMap = new OffsetMap();

const DUMMY_STR = "/* eslint-disable */X/* eslint-enable */";
const DUMMY_LEN = DUMMY_STR.length;

// TODO: add proper cache based on filename
let cachedLintableText = "";

/**
 * Transforms the given text into lintable text. We do this by stripping out
 * ERB tags and replacing them with dummy comments. Additionally, we keep track
 * of the offset introduced by this replacement, so that we can adjust the
 * location of messages in the postprocess step later.
 * @param {string} text Text of the file
 * @param {string} filename Filename of the file
 * @returns {Array<{ filename: string, text: string }>} Source code blocks to lint.
 */
function preprocess(text, filename) {
  let lintableTextArr = text.split("");

  let match;
  let numAddLines = 0;
  let numDiffChars = 0;

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

    // Replace in text
    lintableTextArr[startIndex] = DUMMY_STR;
    const replaceArgs = Array(matchLength - 1).join(".").split(".");
    // -> results in ['', '', '', '', ...]
    lintableTextArr.splice(startIndex + 1, matchLength - 1, ...replaceArgs);

    // Store in map
    const lineAfter = coordEndIndex.line - numAddLines;
    numDiffChars += DUMMY_LEN - matchLength;
    const endIndexAfter = endIndex + numDiffChars;
    offsetMap.addMapping(endIndexAfter, lineAfter, numAddLines, numAddColumns);
  }

  const lintableText = lintableTextArr.join("");
  cachedLintableText = lintableText;
  return [lintableText];
}

/**
 * Transforms generated messages for output.
 * @param {Array<Message[]>} messages An array containing one array of messages
 *     for each code block returned from `preprocess`.
 * @param {string} filename The filename of the file
 * @returns {Message[]} A flattened array of messages with mapped locations.
 */
function postprocess(messages, filename) {
  // we just deal with one big block = the whole file
  const transformedMessages = messages[0].map(adjustMessage);
  console.log(transformedMessages);
  return transformedMessages;
}

function calculateOffset(index, line) {
  let relevantOffsetLookups = offsetMap.lineOffsetLookup.get(line);
  let shouldModifyColumn = true;
  if (!relevantOffsetLookups) {
    shouldModifyColumn = false;
    relevantOffsetLookups = offsetMap.offsetLookup;
  }

  console.log(`Index is: ${index}`);
  const keys = Array.from(relevantOffsetLookups.keys());
  keys.sort((a, b) => b - a);
  let keyJustSmallerThanIndex;
  for (let key of keys) {
    if (key <= index) {
      keyJustSmallerThanIndex = key;
      break;
    }
  }

  if (!keyJustSmallerThanIndex) {
    // can only happen at the very beginning of the file
    if (!shouldModifyColumn) {
      return {
        lineOffset: 0,
        columnOffset: 0,
      };
    }

    // Situation: line: our_index is on the left side of [..., ..., ...]
    // shouldModifyColumn = true and therefore relevantOffsetLookup is offsetMap.lineOffsetLookup.get(line)
    // -> we need to find the next smaller line number that is present in the map
    // get index of line number in the relevantOffsetLookups map
    const keysSimple = Array.from(offsetMap.offsetLookup.keys());
    keysSimple.sort((a, b) => b - a);
    // guard for beginnings of file where ERB was not introduced yet
    // index smaller than smallest index in map
    if (index < keysSimple[keysSimple.length - 1]) {
      return {
        lineOffset: 0,
        columnOffset: 0,
      };
    }

    let keySmallerAgain;
    for (let key of keysSimple) {
      if (key <= index) {
        keySmallerAgain = key;
        break;
      }
    }
    console.log(`keySmallerAgain: ${keySmallerAgain}`);
    const offsets = offsetMap.offsetLookup.get(keySmallerAgain);
    return {
      lineOffset: offsets.lineOffset,
      columnOffset: 0, // overwrite
    };
  }

  const offsets = relevantOffsetLookups.get(keyJustSmallerThanIndex);
  return {
    lineOffset: offsets.lineOffset,
    columnOffset: shouldModifyColumn ? offsets.columnOffset : 0,
  };
}

/**
 * Adjusts ESLint messages to point to the correct location in the Markdown.
 * @param {Message} message A message from ESLint.
 * @returns {Message} The same message, but adjusted to the correct location.
 */
function adjustMessage(message) {
  if (!(message.line && message.column)) {
    return message;
  }

  console.log("//");
  console.log(message);
  console.log("//");

  // Find out index
  const index = coordinatesToIndex(cachedLintableText, message.line, message.column);
  const offset = calculateOffset(index, message.line);

  const indexEnd = coordinatesToIndex(cachedLintableText, message.endLine, message.endColumn);
  const offsetEnd = calculateOffset(indexEnd, message.endLine);

  const newCoordinates = {
    line: message.line + offset.lineOffset,
    column: message.column + offset.columnOffset,
    endLine: message.endLine + offsetEnd.lineOffset,
    endColumn: message.endColumn + offsetEnd.columnOffset,
  };

  // TODO: Adjust fixes and suggestions

  return { ...message, ...newCoordinates };
}

module.exports = {
  preprocess,
  postprocess,
  supportsAutofix: true,
};
