sap.ui.define([
  "sap/ui/core/mvc/XMLView"
], function(XMLView) {
  "use strict";

  XMLView.create({
    viewName: "main.view.App"  // maps to webapp/view/App.view.xml
  }).then(function(oView) {
    oView.placeAt("content");
  });
});
