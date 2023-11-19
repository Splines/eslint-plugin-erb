const { coordinatesToIndex, indexToColumn } = require("./file_coordinates.js");
const { calculateOffset } = require("./offset_calculation.js");

function transformFix(message, originalText, lintableText, offsetMap) {
  const newRange = calculateNewRange(message, originalText, lintableText, offsetMap);
  const newFixText = transformFixText(message, newRange, originalText);

  return {
    range: newRange,
    text: newFixText,
  };
}

function calculateNewRange(message, originalText, lintableText, offsetMap) {
  let lastIndex = -1;
  let lastIndexMapped = -1;

  return message.fix.range.map((index) => {
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
  });
}

function transformFixText(message, newRange, originalText) {
  const fixText = message.fix.text;

  switch (message.ruleId) {
    case "@stylistic/quotes": {
      const quoteChar = fixText[0];
      const originalTextWithoutQuoteChars = originalText
        .slice(newRange[0] + 1, newRange[1] - 1);
      return `${quoteChar}${originalTextWithoutQuoteChars}${quoteChar}`;
    }
    default:
      return fixText;
  }
}

module.exports = { transformFix };
