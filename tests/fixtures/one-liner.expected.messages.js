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
    endColumn: 15,
    fix: {
      range: [2, 14],
      text: "\"#<%= id %>\"",
    },
  },
  {
    ruleId: "@stylistic/eol-last",
    severity: 2,
    message: "Newline required at end of file but not found.",
    line: 1,
    column: 24,
    nodeType: "Program",
    messageId: "missing",
    fix: { range: [23, 23], text: "\n" },
  },
];

module.exports = messages;
