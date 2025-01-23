OSM = {
<% if something %>
  MATOMO: <%= Settings.matomo.to_json %>,
<% end %>
  MAX_REQUEST_AREA: <%= Custom.to_yml %>
};
