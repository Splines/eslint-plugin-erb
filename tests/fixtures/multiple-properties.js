const obj = new Object (   {
    property1:  "<%= @value1 %>",
   propertyInBetween: "abc",
  property2 : "<%= @value2 %>",
});
<%= if @value3 %>
 console. log(obj);
<% end %>
