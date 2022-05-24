sap.ui.define([
	"./BaseController",
], function(
	BaseController
) {
	"use strict";

	return BaseController.extend("ent.ui.ecommerce.controller.Tiles", {
        onInit: function onInit(oEvent) {
			debugger;
			this._oRouter = this.getRouter();
			this.getRouter()
            .getRoute("tiles")
            .attachPatternMatched(this._matchedHandler, this);
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