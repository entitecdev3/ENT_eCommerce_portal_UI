sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
], function(
	BaseController,
	JSONModel,
	Filter,
	FilterOperator
) {
	"use strict";

	return BaseController.extend("ent.ui.ecommerce.controller.ClientList", {
        onInit: function onInit(oEvent) {
			this._oRouter = this.getRouter();
			this.getRouter()
            .getRoute("ClientList")
            .attachPatternMatched(this._matchedHandler, this);
			
			
		},
		onAfterRendering:function(){
			this.getView().byId('navLeftBtn').setVisible(false);
			const selectedTreeItem = 'Client List';
			const headerTitle = new JSONModel({ selectedTreeItem });
			this.getView().byId('selectedItemHeader').setModel(headerTitle);
			this.getView().byId('selectedItemHeader').updateBindings();
			this.getClientList();
			debugger;
		},
		_matchedHandler:function(){
			this.getModel("appView").setProperty("/layout", "OneColumn");
			this.getModel("appView").setProperty("/User", sessionStorage.userName);
			this.getClientList();
			
			// this.getUsersData();
			// this.getCustomData();			
		},
		getClientList:function(){
			var that=this;
			if(!that.getModel("appView").getProperty("/ClientList")){
				this.middleWare.callMiddleWare("/ClientList", "GET", {})
				.then(function (data, status, xhr) {
					that.getModel("appView").setProperty("/ClientList",data);
				})
				.catch(function (jqXhr, textStatus, errorMessage) {
				that.middleWare.errorHandler(jqXhr, that);  
				});
			}
			
		},
		onClientListSearch: function (oEvent) {
			var sValue = oEvent.getParameter("query");
			var oFilter = new Filter({
			  filters: [
				new Filter("CardCode", FilterOperator.Contains, sValue),
				new Filter("CardName", FilterOperator.Contains, sValue),
				new Filter("MailCity", FilterOperator.Contains, sValue),
			  ],
			  and: false,
			});
			var oBinding = this.getView().byId("idClientlist").getBinding("items");
			
			oBinding.filter(oFilter);
		},
		onClientListSelect:function(oEvent){
			// oItem.getBindingContext().getProperty("DocEntry")
			debugger;
			// var bReplace = !Device.system.phone;
			this.getRouter().navTo(
				"ClientsListDetail",
				{
					objectId: oEvent.getParameter("listItem").getBindingContext("appView").getObject().CardCode,
				}
			  );
		},
		
	});
});