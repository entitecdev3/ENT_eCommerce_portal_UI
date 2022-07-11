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
		onNavLeft: function() {
			this.getRouter().navTo("tiles", {});
		  },
		onAfterRendering:function(){
			this.getView().byId('navBackBtn').setVisible(false);
			const selectedTreeItem = 'Client List';
			const headerTitle = new JSONModel({ selectedTreeItem });
			this.getView().byId('selectedItemHeader').setModel(headerTitle);
			this.getView().byId('selectedItemHeader').updateBindings();
			this.callClientValueHelps();
			this.getModel("appView").setProperty("/ClientListVisTotal",0);
			this.getModel("appView").setProperty("/ClientListLength",0);
			this.setCustomerButtonData();
			// this.getClientList();
		},
		_matchedHandler:function(){
			this.getModel("appView").setProperty("/layout", "OneColumn");
			this.getModel("appView").setProperty("/User", sessionStorage.userName);
			this.getClientList();
			this.setCustomerButtonData();
			
			// this.getUsersData();
			// this.getCustomData();			
		},
		// getClientList:function(){
		// 	var that=this;
		// 	if(!that.getModel("appView").getProperty("/ClientList")){
		// 		this.middleWare.callMiddleWare("/ClientList", "GET", {})
		// 		.then(function (data, status, xhr) {
		// 			that.getModel("appView").setProperty("/ClientListLength",data.length);
		// 			that.getModel("appView").setProperty("/ClientList",data);
		// 		})
		// 		.catch(function (jqXhr, textStatus, errorMessage) {
		// 		that.middleWare.errorHandler(jqXhr, that);  
		// 		});
		// 	}
			
		// },
		onClientListSearch: function (oEvent) {
			var sValue = oEvent.getParameter("newValue");
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
			// var bReplace = !Device.system.phone;
			this.getRouter().navTo(
				"ClientsListDetail",
				{
					objectId: oEvent.getParameter("listItem").getBindingContext("appView").getObject().CardCode,
				}
			  );
			this.getView().byId("idClientlist").removeSelections();
		},
		onClientListUpdate:function(oEvent){
			var oTotal=oEvent.getParameter("total");
			this.getModel("appView").setProperty("/ClientListVisTotal",oTotal);
		},
	});
});