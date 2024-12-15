if (<%= @success %>) {
  console.log("Success 🎉");
  $("#yeah").html("<%= j render partial: 'yeah',
                          locals: { cool: @cool } %>");
}
else {
  console.log("Sad noises");
}

<% if you_feel_lucky %>
console.log("You are lucky 🍀");
<% end %>
