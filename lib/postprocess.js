const cache = require("./cache.js");
const { coordinatesToIndex, indexToColumn } = require("./file_coordinates.js");
const { calculateOffset } = require("./offset_calculation.js");
const { transformFix } = require("./autofix.js");

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
  const { originalText, lintableText, offsetMap } = cache.get(filename);

  const transformedMessages = messages[0].map((message) => {
    return adjustMessage(message, originalText, lintableText, offsetMap);
  });
  cache.delete(filename);

  return transformedMessages;
}

/**
 * Adjusts ESLint messages to point to the correct location in the source code.
 * @param {Message} message message form ESLint
 * @returns {Message} same message, but adjusted to the correct location
 */
function adjustMessage(message, originalText, lintableText, offsetMap) {
  if (!Number.isInteger(message.line)) {
    return {
      ...message,
      line: 0,
      column: 0,
    };
  }

  // From now on: assume some kind of positivity, e.g. message.line and
  // message.column exists.

  // Start line/column
  const index = coordinatesToIndex(lintableText, message.line, message.column);
  const offset = calculateOffset(index, message.line, offsetMap);
  let newCoordinates = {
    line: message.line + offset.lineOffset,
    column: message.column + offset.columnOffset,
  };

  // End line/column
  if (Number.isInteger(message.endLine)) {
    const indexEnd = coordinatesToIndex(lintableText, message.endLine, message.endColumn);
    const offsetEnd = calculateOffset(indexEnd, message.endLine, offsetMap);

    newCoordinates = {
      ...newCoordinates,
      endLine: message.endLine + offsetEnd.lineOffset,
      endColumn: message.endColumn + offsetEnd.columnOffset };
  }

  // Autofixes
  const adjustedFix = {};
  if (message.fix) {
    adjustedFix.fix = transformFix(message, originalText, lintableText, offsetMap);
  }

  // TODO: Implement suggestion ranges

  return { ...message, ...newCoordinates, ...adjustedFix };
}

module.exports = postprocess;
