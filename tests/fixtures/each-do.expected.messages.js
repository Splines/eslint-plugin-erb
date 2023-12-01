const messages = [
  {
    ruleId: "no-empty",
    severity: 2,
    message: "Empty block statement.",
    line: 1,
    column: 21,
    nodeType: "BlockStatement",
    messageId: "unexpected",
    endLine: 1,
    endColumn: 23,
    suggestions: [
      {
        messageId: "suggestComment",
        data: { type: "block" },
        fix: { range: [21, 21], text: " /* empty */ " },
        desc: "Add comment inside empty block statement.",
      },
    ],
    suppressions: [{ kind: "directive", justification: "" }],
  },
  {
    ruleId: "@stylistic/quotes",
    severity: 2,
    message: "Strings must use doublequote.",
    line: 2,
    column: 13,
    nodeType: "Literal",
    messageId: "wrongQuotes",
    endLine: 2,
    endColumn: 23,
    fix: {
      range: [37, 47],
      text: "\"<%= j %>\"",
    },
  },
  {
    ruleId: "no-empty",
    severity: 2,
    message: "Empty block statement.",
    line: 3,
    column: 21,
    nodeType: "BlockStatement",
    messageId: "unexpected",
    endLine: 3,
    endColumn: 23,
    suggestions: [
      {
        messageId: "suggestComment",
        data: { type: "block" },
        fix: { range: [134, 134], text: " /* empty */ " },
        desc: "Add comment inside empty block statement.",
      },
    ],
    suppressions: [{ kind: "directive", justification: "" }],
  },
  {
    ruleId: "@stylistic/eol-last",
    severity: 2,
    message: "Newline required at end of file but not found.",
    line: 3,
    column: 10,
    nodeType: "Program",
    messageId: "missing",
    fix: { range: [72, 72], text: "\n" },
  },
];

module.exports = messages;
