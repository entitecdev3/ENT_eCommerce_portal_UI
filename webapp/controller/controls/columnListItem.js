sap.ui.define([

    "sap/m/ColumnListItem"

], function(ColumnListItem) {

    'use strict';

    return ColumnListItem.extend("project1.control.myColumnListItem", {

        metadata:{

            properties : {

                "backgroundColor" : "string"

              }

        },

        onAfterRendering : function() {

            // make sure that onAfterRendering function in VBox is not overwritten

            if (ColumnListItem.prototype.onAfterRendering) {

              ColumnListItem.prototype.onAfterRendering.apply(this, arguments);

            }

            if (this.getBackgroundColor()) {

              this.$().css("background-color", "#" + this.getBackgroundColor());

            }

          },

          renderer: { }

    });

});