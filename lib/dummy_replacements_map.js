/**
 * Array that tracks the replacements that have been made in the processed text,
 * so that we can reverse them later.
 */
class DummyReplacementsMap {
  constructor() {
    this.replacements = [];
  }

  addMapping(originalText, dummyText) {
    this.replacements.push([originalText, dummyText]);
  }

  /**
   * Tries to apply all stored replacements to the given text.
   * @param {string} text - The text to apply the replacements to.
   * @returns {string} - The text with the replacements applied.
   */
  apply(text) {
    let lintableText = text;
    for (const [originalText, dummyText] of this.replacements) {
      lintableText = lintableText.replace(dummyText, originalText);
    }
    return lintableText;
  }
}

module.exports = {
  DummyReplacementsMap,
};
