/**
 *
 * @param {string} text Text
 * @param {number} line 1-based line number
 * @param {number} column 1-based column number
 * @returns {number} 0-based index of the character in the text
 * at the given line and column
 */
function coordinatesToIndex(text, line, column) {
  const lines = text.split("\n");

  // Lines
  let index = 0;
  for (let i = 0; i < line - 1; i++) { // lines are 1-based (!)
    index += lines[i].length + 1; // +1 for newline character
  }

  // Column
  index += column;

  return index - 1; // index is 0-based
}

/**
 *
 * @param {*string} text Text
 * @param {*number} index 0-based index in text
 * @returns {*number} 1-based column number
 */
function indexToColumn(text, index) {
  const linesUpToIndex = text.slice(0, index).split("\n");
  const column = linesUpToIndex[linesUpToIndex.length - 1].length;
  const lineNumber = linesUpToIndex.length;

  return {
    line: lineNumber,
    column: column + 1, // column is 1-based
  };
}

module.exports = { coordinatesToIndex, indexToColumn };
