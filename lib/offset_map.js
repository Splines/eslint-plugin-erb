/* Sample view of the relevant data structures:

this.lineOffsetLookup = {
  1 => Map(1) { 43 => [ 0, -23 ] },
  2 => Map(1) { 92 => [ 0, -17 ] },
  6 => Map(1) { 224 => [ 3, 5 ] },
  7 => Map(1) { 303 => [ 6, 6 ] },
  12 => Map(1) { 605 => [ 6, -3 ] },
  18 => Map(2) { 813 => [ 6, -26 ], 856 => [ 6, -43 ] },
  21 => Map(1) { 942 => [ 6, 95 ] }
}

this.offsetLookup = {
  43 => [ 0, -23 ],
  92 => [ 0, -17 ],
  224 => [ 3, 5 ],
  303 => [ 6, 6 ],
  605 => [ 6, -3 ],
  813 => [ 6, -26 ],
  856 => [ 6, -43 ],
  942 => [ 6, 95 ]
}

Each index stored corresponds to an "end index" of the respective ERB tag,
but when it it processed already, i. e. replaced by a dummy comment.

*/

class OffsetMap {
  constructor() {
    // (line number in processed text) -> (this.offsetLookup map with keys for that line)
    this.lineOffsetLookup = new Map();

    // (index in processed text) -> { lineOffset, columnOffset }
    this.offsetLookup = new Map();
  }

  /**
   *
   * @param {Number} index end index in processed text
   * @param {Number} line line number in processed text
   * @param {Number} lineOffset number of lines that have to be added to a warning
   * in the processed text
   * @param {Number} columnOffset number of columns that have to be added to a
   * warning in the processed text
   */
  addMapping(index, line, lineOffset, columnOffset) {
    // Multiple ERB tags can be opened and closed on the same line
    let sameLineAdditionalColumnOffset = 0;
    let existingLineMap = new Map();

    if (this.lineOffsetLookup.has(line)) {
      existingLineMap = this.lineOffsetLookup.get(line);
      const highestIndex = Math.max(...Array.from(existingLineMap.keys()));
      sameLineAdditionalColumnOffset = existingLineMap.get(highestIndex).columnOffset;
    }

    // Construct new entry for data structures
    const newPartialMap = new Map();
    newPartialMap.set(index, {
      lineOffset: lineOffset,
      columnOffset: columnOffset + sameLineAdditionalColumnOffset,
    });

    // Update data structures (don't care if its inefficient, it works fast enough)
    this.lineOffsetLookup.set(line, new Map([...existingLineMap, ...newPartialMap]));
    this.offsetLookup = new Map([...this.offsetLookup, ...newPartialMap]);
  }
}

module.exports = {
  OffsetMap,
};
