class Cache {
  constructor() {
    // filename -> { originalText, lintableText, offsetMap }
    this.cache = new Map();
  }

  add(filename, originalText, lintableText, offsetMap, dummyReplacementsMap) {
    this.cache.set(filename, { originalText, lintableText, offsetMap, dummyReplacementsMap });
  }

  get(filename) {
    return this.cache.get(filename);
  }

  delete(filename) {
    this.cache.delete(filename);
  }
}

const cache = new Cache();
module.exports = cache;
