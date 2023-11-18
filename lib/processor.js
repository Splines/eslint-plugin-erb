/**
 * @fileoverview Process ERB files for consumption by ESLint.
 * @author Splines
 */

"use strict";

const coordinates = require("./file_coordinates.js");

const erbRegex = /<%[\s\S]*?%>/g;
const erbRegexSingleQuoted = /'<%[\s\S]*?%>'/g;
const erbRegexDoubleQuoted = /"<%[\s\S]*?%>"/g;
const erbRegexBacktickQuoted = /`<%[\s\S]*?%>`/g;
const erbRegexChained = new RegExp(
  erbRegex.source + "|"
    + erbRegexSingleQuoted.source + "|"
    + erbRegexDoubleQuoted.source + "|"
    + erbRegexBacktickQuoted.source, "g",
);

// end index processed -> (add_lines, add_columns)
const offsetLookup = new Map();
let offsetLookupSimple = new Map();
let textLookupLintable = "";

// function removeLinebreaks(str) {
//   return str.replace(/[\r\n]+/gm, "");
// }
const DUMMY_STR = "/* eslint-disable */X/* eslint-enable */";
const DUMMY_LEN = DUMMY_STR.length;

/**
 * Extracts lintable code blocks from Markdown text.
 * @param {string} text The text of the file.
 * @param {string} filename The filename of the file
 * @returns {Array<{ filename: string, text: string }>} Source code blocks to lint.
 */
function preprocess(text, filename) {
  let lintableTextArr = text.split("");

  let match;
  let numAddLinesCounter = 0;
  let numDiffChars = 0;

  while ((match = erbRegexChained.exec(text)) !== null) {
    // Match information
    const startIndex = match.index;
    const matchText = match[0];
    const matchLength = matchText.length;
    const endIndex = startIndex + matchLength;
    const matchLines = matchText.split("\n");

    // Lines
    numAddLinesCounter += matchLines.length - 1;

    // Columns
    const coordinatesStartIndex = coordinates.indexToColumn(text, startIndex);
    const endColumnAfter = coordinatesStartIndex.column + DUMMY_LEN;
    const coordinatesEndIndex = coordinates.indexToColumn(text, endIndex);
    const endColumnBefore = coordinatesEndIndex.column;
    const numAddColumns = endColumnBefore - endColumnAfter;
    console.log(`before: ${endColumnBefore}, after: ${endColumnAfter}, add: ${numAddColumns}`);

    // Replace in text
    lintableTextArr[startIndex] = DUMMY_STR;
    const replaceArgs = Array(matchLength - 1).join(".").split(".");
    // -> results in ['', '', '', '', ...]
    lintableTextArr.splice(startIndex + 1, matchLength - 1, ...replaceArgs);

    // Store in map
    numDiffChars += DUMMY_LEN - matchLength;
    const key = coordinatesEndIndex.line - numAddLinesCounter;
    console.log(`startIndex line: ${coordinatesStartIndex.line}, numAddLinesCounter: ${numAddLinesCounter}, key: ${key}`);
    const endIndexProcessed = endIndex + numDiffChars;

    const newPartialMap = new Map();
    newPartialMap.set(endIndexProcessed, [numAddLinesCounter, numAddColumns]);
    offsetLookupSimple = new Map([...offsetLookupSimple, ...newPartialMap]);

    // TODO: outsource this map-specific stuff
    if (offsetLookup.has(key)) {
      const exisitingMap = offsetLookup.get(key);
      const mergedMap = new Map([...exisitingMap, ...newPartialMap]);
      offsetLookup.set(key, mergedMap);
    }
    else {
      offsetLookup.set(key, newPartialMap);
    }
  }

  const lintableText = lintableTextArr.join("");
  textLookupLintable = lintableText;
  console.log("=====================================");
  console.log(offsetLookup);
  console.log(offsetLookupSimple);
  console.log("-------------------------------------");
  console.log(lintableText);
  console.log("=====================================");
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
  let relevantOffsetLookups = offsetLookup.get(line);
  let shouldModifyColumn = true;
  if (!relevantOffsetLookups) {
    shouldModifyColumn = false;
    relevantOffsetLookups = offsetLookupSimple;
  }

  console.log(`Index is: ${index}`);
  console.log(`relevantOffsetLookups: ${relevantOffsetLookups}`);
  console.log(relevantOffsetLookups);
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
    // shouldModifyColumn = true and therefore relevantOffsetLookup is offsetLookup.get(line)
    // -> we need to find the next smaller line number that is present in the map
    // get index of line number in the relevantOffsetLookups map
    const keysSimple = Array.from(offsetLookupSimple.keys());
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
    const offsets = offsetLookupSimple.get(keySmallerAgain);
    return {
      lineOffset: offsets[0],
      columnOffset: 0, // overwrite
    };
  }

  const offsets = relevantOffsetLookups.get(keyJustSmallerThanIndex);
  return {
    lineOffset: offsets[0],
    columnOffset: shouldModifyColumn ? offsets[1] : 0,
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
  const index = coordinates.coordinatesToIndex(textLookupLintable, message.line, message.column);
  const offset = calculateOffset(index, message.line);

  const indexEnd = coordinates.coordinatesToIndex(textLookupLintable, message.endLine, message.endColumn);
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
