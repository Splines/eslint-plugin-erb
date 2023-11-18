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
 * @param {string} text text of the file
 * @param {string} filename filename of the file
 * @returns {Array<{ filename: string, text: string }>} source code blocks to lint.
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
 * Transforms the messages form ESLint such that they point to the correct
 * location in the source code.
 * @param {Array<Message[]>} messages An array containing one array of messages
 *    for each code block returned from `preprocess`. As we only deal with one
 *    code block, this array contains only *one* array of messages.
 * @param {string} filename filename of the file.
 * @returns {Message[]} A flattened array of messages with mapped locations.
 */
function postprocess(messages, filename) {
  const transformedMessages = messages[0].map(adjustMessage);
  return transformedMessages;

  // TODO: delete from cache
}

function calculateOffsetLineStrategy(index, line, lineOffsets) {
  const indexKey = offsetMap.findKeyJustSmallerThan(index, line);

  if (indexKey !== undefined) {
    const offsets = lineOffsets.get(indexKey);
    return {
      lineOffset: offsets.lineOffset,
      columnOffset: offsets.columnOffset,
    };
  }

  // Situation: line: our_index is on the left side of [..., ..., ...]
  // We need to find the next smaller line number that is present in the map
  // Therefore: Fallback to normal index strategy
  return calculateOffsetNormalIndexStrategy(index);
}

function calculateOffsetNormalIndexStrategy(index) {
  const indexKey = offsetMap.findKeyJustSmallerThan(index, null);
  if (!indexKey) {
    // Can only happen at the beginning of the file before first ERB tag
    return {
      lineOffset: 0,
      columnOffset: 0,
    };
  }
  const offsets = offsetMap.lookupIndex(indexKey);
  return {
    lineOffset: offsets.lineOffset,
    columnOffset: 0,
  };
}

function calculateOffset(index, line) {
  const lineOffsets = offsetMap.lookupLine(line);
  if (lineOffsets) {
    return calculateOffsetLineStrategy(index, line, lineOffsets);
  }
  else {
    return calculateOffsetNormalIndexStrategy(index);
  }
}

/**
 * Adjusts ESLint messages to point to the correct location in the source code.
 * @param {Message} message message form ESLint
 * @returns {Message} same message, but adjusted to the correct location
 */
function adjustMessage(message) {
  if (!(message.line && message.column)) {
    return message;
  }

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
