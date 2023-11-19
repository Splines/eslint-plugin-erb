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

module.exports = { calculateOffset };
