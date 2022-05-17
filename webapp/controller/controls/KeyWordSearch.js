sap.ui.define([
    "sap/ui/model/json/JSONModel"
  ],
    function keyWordSearch(JSONModel) {
      return {
        onSearch: function(that, evt) {
          if (evt.getParameters().clearButtonPressed) {
            that.getView().byId('keyWordSearchField').setValue(null);
            return;
          }
          const keyWords = evt.getSource().getValue();
          const splitKeyWords = keyWords.split(' ');
          const searchMethod = 'keyWords';
          const searchKeyWordsModel = new JSONModel({ splitKeyWords });
          const searchMethodModel = new JSONModel({ searchMethod });
          const keyWordMethodModel = new JSONModel({ keyWordMethod: that.keyWordMethod });
          that.getOwnerComponent().setModel(searchKeyWordsModel, 'searchKeyWords');
          that.getOwnerComponent().setModel(searchMethodModel, 'searchMethod');
          that.getOwnerComponent().setModel(keyWordMethodModel, 'keyWordMethod');
          that.getRouter().navTo('Items', {});
        },
        toggleMethod: function(that) {
          that.keyWordMethod === 'AND' ? that.keyWordMethod = 'OR' : that.keyWordMethod = 'AND';
          const keyWordMethodModel = new JSONModel({ keyWordMethod: that.keyWordMethod });
          that.getView().byId('keyWordMethodBtn').setModel(keyWordMethodModel);
          that.getView().byId('keyWordMethodBtn').updateBindings();
        }
      };
  });