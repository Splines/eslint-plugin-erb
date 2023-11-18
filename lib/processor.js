/**
 * @fileoverview Process ERB files for consumption by ESLint.
 * @author Splines
 */
"use strict";

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
    const firstMatchLine = matchLines[0];
    const lastMatchLine = matchLines[matchLines.length - 1];

    // Lines
    numAddLinesCounter += matchLines.length - 1;

    // Columns
    // Get the number of columns from the first line of the match to the startIndex
    const linesUpToStartIndex = text.slice(0, startIndex).split("\n");
    const endColumnAfter = linesUpToStartIndex[linesUpToStartIndex.length - 1].length + DUMMY_LEN + 1;

    const linesUpToEndIndex = text.slice(0, endIndex).split("\n");
    const endColumnBefore = linesUpToEndIndex[linesUpToEndIndex.length - 1].length + 1;

    const numAddColumns = endColumnBefore - endColumnAfter;
    console.log(`before: ${endColumnBefore}, after: ${endColumnAfter}, add: ${numAddColumns}`);

    // Replace in text
    lintableTextArr[startIndex] = DUMMY_STR;
    const replaceArgs = Array(matchLength - 1).join(".").split(".");
    // -> results in ['', '', '', '', ...]
    lintableTextArr.splice(startIndex + 1, matchLength - 1, ...replaceArgs);

    // Store in map
    const endIndexProcessed = (startIndex + numDiffChars) + DUMMY_LEN;
    offsetLookup.set(endIndexProcessed, [numAddLinesCounter, numAddColumns]);

    numDiffChars += DUMMY_LEN - matchLength;
  }

  // const lintableText = text.replace(erbRegexChained, DUMMY_STR)
  const lintableText = lintableTextArr.join("");
  textLookupLintable = lintableText;
  console.log("=====================================");
  console.log(offsetLookup);
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
  const lines = textLookupLintable.split("\n"); // TODO: outsource
  let index = 0;
  for (let i = 0; i < message.line; i++) { // lines are 1-based (!)
    // Add the length of each line plus 1 for the newline character
    index += lines[i].length + 1;
  }
  // Add the column number
  index += message.column;

  // Find out offsets
  const keys = Array.from(offsetLookup.keys());
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

  const offsets = offsetLookup.get(keyJustSmallerThanIndex);
  const newCoordinates = {
    line: message.line + offsets[0],
    column: message.column + offsets[1],
    endLine: message.endLine + offsets[0],
    endColumn: message.endColumn + offsets[1],
  };

  // TODO: Adjust fixes and suggestions

  return { ...message, ...newCoordinates, message: String(index) };
}

module.exports = {
  preprocess,
  postprocess,
  supportsAutofix: true,
};
