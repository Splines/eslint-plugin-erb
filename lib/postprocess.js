const cache = require("./cache.js");
const { coordinatesToIndex, indexToColumn } = require("./file_coordinates.js");

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

  // Adjust autofix ranges
  const adjustedFix = {};
  if (message.fix) {
    let lastIndex = -1;
    let lastIndexMapped = -1;

    adjustedFix.fix = {
      range: message.fix.range.map((index) => {
        if (index == lastIndex) {
          return lastIndexMapped;
        }

        const pos = indexToColumn(lintableText, index);
        const offset = calculateOffset(index, pos.line, offsetMap);
        const posOriginal = {
          line: pos.line + offset.lineOffset,
          column: pos.column + offset.columnOffset,
        };
        const indexMapped = coordinatesToIndex(originalText, posOriginal.line, posOriginal.column);

        lastIndex = index;
        lastIndexMapped = indexMapped;

        return indexMapped;
      }),
      text: message.fix.text,
    };
  }

  // TODO: Implement suggestion ranges

  return { ...message, ...newCoordinates, ...adjustedFix };
}

////////////////////////////////////////////////////
// Offset calculation
////////////////////////////////////////////////////

function calculateOffset(index, line, offsetMap) {
  const lineOffsets = offsetMap.lookupLine(line);
  if (lineOffsets) {
    return calculateOffsetLineStrategy(index, line, lineOffsets, offsetMap);
  }
  else {
    return calculateOffsetNormalIndexStrategy(index, offsetMap);
  }
}

function calculateOffsetLineStrategy(index, line, lineOffsets, offsetMap) {
  const indexKey = offsetMap.findKeyJustSmallerThan(index, line);

  if (indexKey !== undefined) {
    const offsets = lineOffsets.get(indexKey);
    return {
      lineOffset: offsets.lineOffset,
      columnOffset: offsets.columnOffset,
    };
  }

  // Situation: our index is on the left side of [..., ..., ...]
  // We need to find the next smaller line number that is present in the map
  // Therefore: Fallback to normal index strategy
  return calculateOffsetNormalIndexStrategy(index, offsetMap);
}

function calculateOffsetNormalIndexStrategy(index, offsetMap) {
  const indexKey = offsetMap.findKeyJustSmallerThan(index, null);

  if (indexKey !== undefined) {
    const offsets = offsetMap.lookupIndex(indexKey);
    return {
      lineOffset: offsets.lineOffset,
      columnOffset: 0,
    };
  }

  // Can only happen at the beginning of the file before first ERB tag
  return {
    lineOffset: 0,
    columnOffset: 0,
  };
}

module.exports = postprocess;
