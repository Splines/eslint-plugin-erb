const { coordinatesToIndex, indexToColumn } = require("./file_coordinates.js");
const { calculateOffset } = require("./offset_calculation.js");

function transformFix(message, originalText, lintableText, offsetMap, dummyReplacementsMap) {
  const newRange = calculateNewRange(message, originalText, lintableText, offsetMap);
  const newFixText = transformFixText(message, newRange, originalText,
    offsetMap, dummyReplacementsMap);

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

function transformFixText(message, newRange, originalText, offsetMap, dummyReplacementsMap) {
  const fixText = message.fix.text;

  if (isOverlappingRange(newRange, offsetMap)) {
    return dummyReplacementsMap.apply(fixText);
  }

  return fixText;
}

function isOverlappingRange(newRange, offsetMap) {
  for (const index of offsetMap.offsetLookup.keys()) {
    if (index >= newRange[0] && index <= newRange[1]) {
      return true;
    }
  }
  return false;
}

module.exports = { transformFix };
