sap.ui.define([
	"./BaseController",
], function(
	BaseController
) {
	"use strict";

	return BaseController.extend("ent.ui.ecommerce.controller.user", {
        onInit: function onInit(oEvent) {
			this._oRouter = this.getRouter();
			this.getRouter()
            .getRoute("user")
            .attachPatternMatched(this._matchedHandler, this);
		},
		_matchedHandler:function(){
			this.getModel("appView").setProperty("/layout", "OneColumn");
			this.getModel("appView").setProperty("/User", sessionStorage.userName);
			this.getUsersData();
			this.getCustomData();			
		},
		getUsersData:function(){
			var that=this;
			this.getView().setBusy(true);
			that.getModel("appView").setProperty("/userTileVisibility",true);
			this.middleWare.callMiddleWare("/users", "GET", {})
			.then(function (data, status, xhr) {
				that.getView().setBusy(false);
				that.getModel("appView").setProperty("/users",data);
				if(data.length===0){
					that.getModel("appView").setProperty("/userTileVisibility",false);
				}
							// that.getModel("config").updateBindings();
			
			})
			.catch(function (jqXhr, textStatus, errorMessage) {
				// that.getView().setBusy(false);
				// ofrag.setBusy(false);
			  that.middleWare.errorHandler(jqXhr, that);  
			});
		}
	
	});
});