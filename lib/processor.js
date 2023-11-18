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
    const endColumnBefore = coordinates.indexToColumn(text, endIndex).column;
    const numAddColumns = endColumnBefore - endColumnAfter;
    console.log(`before: ${endColumnBefore}, after: ${endColumnAfter}, add: ${numAddColumns}`);

    // Replace in text
    lintableTextArr[startIndex] = DUMMY_STR;
    const replaceArgs = Array(matchLength - 1).join(".").split(".");
    // -> results in ['', '', '', '', ...]
    lintableTextArr.splice(startIndex + 1, matchLength - 1, ...replaceArgs);

    // Store in map
    numDiffChars += DUMMY_LEN - matchLength;
    const key = coordinatesStartIndex.line;
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
  console.llg(offsetLookupSimple);
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

  // Find out offsets
  let relevantOffsetLookups = offsetLookup.get(message.line);
  let shouldModifyColumn = true;
  if (!relevantOffsetLookups) {
    shouldModifyColumn = false;
    relevantOffsetLookups = offsetLookupSimple;
  }

  const keys = Array.from(relevantOffsetLookups.keys());
  keys.sort((a, b) => b - a); // TODO: keys are already sorted, right?!

  let keyJustSmallerThanIndex;
  for (let key of keys) {
    if (key <= index) {
      keyJustSmallerThanIndex = key;
      break;
    }
  }

  if (!keyJustSmallerThanIndex) {
    return message; // nothing to do
  }

  // TODO: transform end index individually (outsource transformIndex function)
  const offsets = relevantOffsetLookups.get(keyJustSmallerThanIndex);
  const newCoordinates = {
    line: message.line + offsets[0],
    column: shouldModifyColumn ? message.column + offsets[1] : message.column,
    endLine: message.line + offsets[0],
    endColumn: shouldModifyColumn ? message.endColumn + offsets[1] : message.endColumn,
  };

  // TODO: Adjust fixes and suggestions

  return { ...message, ...newCoordinates };
}

module.exports = {
  preprocess,
  postprocess,
  supportsAutofix: true,
};
