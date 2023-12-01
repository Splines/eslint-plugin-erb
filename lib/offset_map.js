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

For brevity, we emit the respective property names and show the values in an
array instead. First number is line offset, second number is column offset.

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

We store the end index of the respective ERB tag and use that as key for our map.
Note that this end index refers to the processed text, i. e. the text after
replacing ERB tags with dummy comments.
The index is an index to the whole text.
Note that line offsets accumulate.

And to add to the good old off-by-one confusion:
Line offsets: 1-based
Column offsets: 0-based
(also see file coordinates)

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

  lookupIndex(index) {
    return this.offsetLookup.get(index);
  }

  lookupLine(line) {
    return this.lineOffsetLookup.get(line);
  }

  // we assume that line has a valid entry in the map, caller needs to check (!)
  findKeyJustSmallerThan(index, line) {
    // Determine which map to use
    let offsetLookup = line ? this.lineOffsetLookup.get(line) : this.offsetLookup;

    const mapIndizes = Array.from(offsetLookup.keys());
    mapIndizes.sort((a, b) => b - a); // from highest to lowest

    let keyJustSmallerThanIndex;
    for (let key of mapIndizes) {
      if (key <= index) {
        keyJustSmallerThanIndex = key;
        return keyJustSmallerThanIndex;
      }
    }

    return undefined;
  }
}

module.exports = {
  OffsetMap,
};
