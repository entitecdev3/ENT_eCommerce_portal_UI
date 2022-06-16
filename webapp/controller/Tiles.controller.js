sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
], function(
	BaseController,
	JSONModel
) {
	"use strict";

	return BaseController.extend("ent.ui.ecommerce.controller.Tiles", {
        onInit: function onInit(oEvent) {
			this._oRouter = this.getRouter();
			this.getRouter()
            .getRoute("tiles")
            .attachPatternMatched(this._matchedHandler, this);
			// this.getRouter().switched(function(oEvent){debugger;},this)
		},
		onAfterRendering:function(){
			this.getView().byId('navLeftBtn').setVisible(false);
			this.getView().byId('navBackBtn').setVisible(false);
			let oTitle=this.getView().getModel('i18n').getProperty('appTitle');
			const toolbarTitle =oTitle;
			const headerTitle = new JSONModel({ toolbarTitle });
			this.getView().byId('toolbarTitle').setModel(headerTitle);
			this.getView().byId('selectedItemHeader').updateBindings();
			// this.callValueHelps();
		},
		_matchedHandler:function(){
			this.getModel("appView").setProperty("/layout", "OneColumn");
			this.getModel("appView").setProperty("/User", sessionStorage.userName);
			this.getCustomData();
			this.getUsersData();			
		},
		press:function(oEvent){
			 
			var id=oEvent.getSource().getId().split("--")[oEvent.getSource().getId().split("--").length-1];
			if(id==="idUserManagement"){
				this._oRouter.navTo("user");
			}
			if(id==="idItemCatalogue"){
				this._oRouter.navTo("ItemCatalogue");
			}
			if(id==="idClientList"){
				this._oRouter.navTo("ClientList");
			}
			if(id==="idCart"){
				this._oRouter.navTo("ShoppingCart");
			}
			if(id==="idSalesQuotation"){
				this._oRouter.navTo("SalesQuotation");
			}
			if(id==="idSalesOrder"){
				this._oRouter.navTo("SalesOrder");
			}
		},
		visibleFunc:function(value){
			
			var oConfig=this.getModel("config").getJSON();
			oConfig=JSON.parse(oConfig);
			if(oConfig.hiddenTiles){
				return false;
			}

			return true;
		}
	});
});