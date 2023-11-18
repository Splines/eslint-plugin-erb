class Cache {
  constructor() {
    // filename -> { lintableText, offsetMap }
    this.cache = new Map();
  }

  add(filename, lintableText, offsetMap) {
    this.cache.set(filename, { lintableText, offsetMap });
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
