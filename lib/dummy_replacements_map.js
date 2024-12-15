/**
 * Map that tracks the replacements that have been made in the processed text
 * alongside their unique id. This id is just a counter that is incremented
 * for each replacement, see preprocess.js.
 */
class DummyReplacementsMap {
  constructor() {
    this.map = new Map();
  }

  addMapping(id, originalText, dummyText) {
    this.map.set(id, [originalText, dummyText]);
  }

  /**
   * Applies the replacements from the map to the given text.
   * @param {string} text - The text to apply the replacements to.
   * @returns {string} - The text with the replacements applied.
   */
  apply(text) {
    let lintableText = text;
    for (const [_id, [originalText, dummyText]] of this.map) {
      lintableText = lintableText.replace(dummyText, originalText);
    }
    return lintableText;
  }
}

module.exports = {
  DummyReplacementsMap,
};
