const messages = [
  {
    ruleId: "@stylistic/quotes",
    severity: 2,
    message: "Strings must use doublequote.",
    line: 1,
    column: 3,
    nodeType: "Literal",
    messageId: "wrongQuotes",
    endLine: 1,
    endColumn: 47,
    fix: {
      range: [2, 46],
      text: "\"#/* eslint-disable */{}/* eslint-enable */\"",
    },
  },
  {
    ruleId: "@stylistic/eol-last",
    severity: 2,
    message: "Newline required at end of file but not found.",
    line: 1,
    column: 56,
    nodeType: "Program",
    messageId: "missing",
    fix: { range: [55, 55], text: "\n" },
  },
];

module.exports = messages;
