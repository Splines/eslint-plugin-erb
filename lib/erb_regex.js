const erbRegex = /<%[\s\S]*?%>/g;

const erbRegexSingleQuoted = new RegExp("'" + erbRegex.source + "'", "g");
const erbRegexDoubleQuoted = new RegExp("\"" + erbRegex.source + "\"", "g");
const erbRegexBacktickQuoted = new RegExp("`" + erbRegex.source + "`", "g");

const erbRegexChained = new RegExp(
  erbRegex.source + "|" + erbRegexSingleQuoted.source
  + "|" + erbRegexDoubleQuoted.source + "|" + erbRegexBacktickQuoted.source, "g",
);

module.exports = {
  erbRegexChained,
};
