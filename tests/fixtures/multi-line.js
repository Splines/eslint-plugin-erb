    const a = "before"
<%= render partial: 'questions/domains/expression',
            locals: { a: a, b: b,
                       c: "c" } %>
 console.log("afterwards");