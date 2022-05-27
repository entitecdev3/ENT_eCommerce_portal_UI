sap.ui.define(
    [
      "./BaseController",
      "sap/ui/model/json/JSONModel",
      "ent/ui/ecommerce/controller/controls/TreeController",
      "ent/ui/ecommerce/controller/controls/InputGroupsController",
      "ent/ui/ecommerce/controller/controls/FormSearchDialog",
      "ent/ui/ecommerce/controller/controls/KeyWordSearch"
    ],
    function(BaseController, JSONModel, treeController, inputGroupsController, formSearchDialog, keyWordSearch) {
      "use strict";
  
      return BaseController.extend("App.Dashboard.Dashboard.controller.App", {
        onInit: function(evt) {
          const itemChange = this.getRouter().getRoute("ItemCatalogue");
          this.getView().byId('navBackBtn').setVisible(false);
          this.formDialog = null;
  
          this.keyWordMethod = 'AND';
          const keyWordMethodModel = new JSONModel({ keyWordMethod: this.keyWordMethod });
          this.getView().byId('keyWordMethodBtn').setModel(keyWordMethodModel);
          this.getView().byId('keyWordMethodBtn').updateBindings();
          itemChange.attachPatternMatched(this._onObjectMatched, this);
        },
        onNavLeft: function() {
          this.getRouter().navTo("tiles", {});
        },
        _onObjectMatched: function() {
          // header title
          this.getView().byId('navBackBtn').setVisible(false);
          const selectedTreeItem = 'Parametri di ricerca';
          const headerTitle = new JSONModel({ selectedTreeItem });
          this.getView().byId('selectedItemHeader').setModel(headerTitle);
          this.getView().byId('selectedItemHeader').updateBindings();
          inputGroupsController.clearInput(this);
        },
        onAfterRendering: function(evt) {
          const groupContainers = Array.from(document.querySelectorAll('[id*="--groupsContainer"]'));
          this.currentGroupContainer = groupContainers[groupContainers.length - 1];
          this.currentGroupContainer.style.visibility = 'hidden';
  
          if (evt.getParameters().id > '__xmlview0') {
            treeController.init(this);
          }
        },
        onTreeSelectionChange: function(evt) {
          treeController.onSelectionChange(this, evt, inputGroupsController);
        },
        onInputGroupsSearch: function() {
          inputGroupsController.onInputGroupsSearch(this);
        },
        onInputsReset: function() {
          inputGroupsController.onInputsReset(this);
        },
        onInputSearch: function(evt) {
          formSearchDialog.initActiveData(this, evt);
          formSearchDialog.open(this);
        },
        onFormDialogClose: function() {
          formSearchDialog.close(this);
        },
        onFormDialogConfirm: function() {
          formSearchDialog.confirm(this);
        },
        onFormFilterPress: function(evt) {
          formSearchDialog.filter(this, evt);
        },
        onKeyWordSearch: function(evt) {
          keyWordSearch.onSearch(this, evt);
        },
        onKeyWordMethodToggle: function() {
          keyWordSearch.toggleMethod(this);
        }
      });
    }
  );
  