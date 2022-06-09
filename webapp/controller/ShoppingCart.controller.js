sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"ent/ui/ecommerce/controller/controls/RowItemDialog",
], function(
	BaseController,
	JSONModel,
	Filter,
	FilterOperator,
	Fragment,
	MessageToast,
	MessageBox,
	rowItemDialog
) {
	"use strict";

	return BaseController.extend("ent.ui.ecommerce.controller.ShoppingCart", {
        onInit: function onInit(oEvent) {
			this._oRouter = this.getRouter();
			this.getRouter()
            .getRoute("ShoppingCart")
            .attachPatternMatched(this._matchedHandler, this);
		},
		onAfterRendering:function(){
			this.getView().byId('navLeftBtn').setVisible(false);
			const selectedTreeItem = this.getModel('i18n').getProperty('ShoppingCart');
			const headerTitle = new JSONModel({ selectedTreeItem });
			this.getView().byId('selectedItemHeader').setModel(headerTitle);
			this.getView().byId('selectedItemHeader').updateBindings();
			this.getClientList();
			this.getShopCartData(true);
			var oMsg=this.getModel("i18n").getProperty("CreateQuotation");
			this.getView().byId("idSalesCreate").setText(oMsg);
			// this.callValueHelps();
		},
		_matchedHandler:function(oEvent){
			this.getModel("appView").setProperty("/layout", "OneColumn");
			this.getModel("appView").setProperty("/User", sessionStorage.userName);
			this.getView().byId("idCartCustomers").setFilterFunction(function(sTerm, oItem) {
				// A case-insensitive 'string contains' filter
				return oItem.getText().match(new RegExp(sTerm, "i")) || oItem.getKey().match(new RegExp(sTerm, "i"));
			});
			// that.tableData =this.getModel("appView").getProperty("/CartData");
			// this.cardCode=oEvent.getParameter("arguments").objectId;	
			// this.getClientDetails();	
			// this.getClientProperties();
			// this.getClientList();
			// this.getClientData();
			// this.getView().getModel("appView").setProperty("/EditMode",false);
		},
		calculateFinalPrice:function(oEvent){
			debugger;
			var oPath=oEvent.getSource().getParent().getBindingContext("appView").getPath();
			var oData=this.getView().getModel("appView").getProperty(oPath);
			if(oData.discount){
				oData.finalPrice=parseFloat(oData.Prz)-[parseFloat(oData.Prz)*(parseFloat(oData.discount)/100)] ;
			}

			this.getView().getModel("appView").setProperty(oPath,oData);
			this.getView().getModel("appView").updateBindings();
			this.calculateLineTotal(oPath);
		},
		calculateDicount:function(oEvent){
			debugger;
			var oPath=oEvent.getSource().getParent().getBindingContext("appView").getPath();
			var oData=this.getView().getModel("appView").getProperty(oPath);
			// if(parseFloat(oData.finalPrice)>parseFloat(oData.Prz)){
			// 	oData.discount=[[parseFloat(oData.finalPrice)-parseFloat(oData.Prz)]/parseFloat(oData.finalPrice)]*100;
			// }
			// else{
				oData.finalPrice=oEvent.getSource().getValue();
				oData.discount=[[parseFloat(oData.Prz)-parseFloat(oData.finalPrice)]/parseFloat(oData.Prz)]*100;
				oData.discount=oData.discount.toFixed(2);
			// }

			this.getView().getModel("appView").setProperty(oPath,oData);
			this.getView().getModel("appView").updateBindings();
			this.calculateLineTotal(oPath);
		},
		calculateLineTotal:function(oPath){
			var oData=this.getView().getModel("appView").getProperty(oPath);
			oData.LineTotal=parseFloat(oData.cartQunt)*parseFloat(oData.finalPrice);
			this.getView().getModel("appView").setProperty(oPath,oData);
			this.getView().getModel("appView").updateBindings();
			this.calculateFinalTotal();
		},
		onQuantiyChange:function(oEvent){
			var oPath=oEvent.getSource().getParent().getBindingContext("appView").getPath();
			this.calculateLineTotal(oPath);
			
		},
		calculateFinalTotal:function(){
			var oData=this.getView().getModel("appView").getProperty('/CartData');
			var sum=0;
			for (let index = 0; index < oData.length; index++) {
				const element = oData[index];
				if(element.LineTotal){
					sum += parseFloat(element.LineTotal); 
				}
			}
			this.getView().getModel("appView").setProperty('/TotalDoc',sum);
			if(this.getView().getModel("appView").getProperty('/TotalDiscount')){
				var oDis=this.getView().getModel("appView").getProperty('/TotalDiscount');
				var FinalPrice= sum-[sum*(parseFloat(oDis)/100)];
				this.getView().getModel("appView").setProperty('/FinalTotal',FinalPrice);
			}
			else{
				this.getView().getModel("appView").setProperty('/TotalDiscount',0);
				this.getView().getModel("appView").setProperty('/FinalTotal',sum);
			}
			this.getView().getModel("appView").updateBindings();
		},
		overAllDicount:function(){
			var oTotalPrice=this.getView().getModel("appView").getProperty('/TotalDoc');
			var oDiscount=this.getView().getModel("appView").getProperty('/TotalDiscount');
			var FinalPrice= oTotalPrice-[oTotalPrice*(parseFloat(oDiscount)/100)];
			this.getView().getModel("appView").setProperty('/FinalTotal',FinalPrice);
			this.getView().getModel("appView").updateBindings();
		},
		rowItemPress: function(evt) {
			debugger;
			// const itemId = evt.getSource().mProperties.text;
			const itemId =evt.getSource().getBindingContext("appView").getObject().ItemCode;
			// const price=evt.getSource().getBindingContext("appView").getObject().Prz;
			rowItemDialog.open(this, { itemId });
		},
		onItemDialogForward: function() {
			rowItemDialog.forward(this);
		},
		onItemDialogClose: function() {
			rowItemDialog.close(this);
		},
		onCartSubmit:function(){
			var oData=this.getView().getModel("appView").getProperty('/CartData');
			debugger;
			if(!oData){
				MessageToast.show(this.getModel("i18n").getProperty("noCartItem"));
				return;
			}
			if(!this.getView().getModel("appView").getProperty("/CardCode")){
				MessageToast.show(this.getModel("i18n").getProperty("enterCardCode"));
				return;
			}
			if(!this.getView().getModel("appView").getProperty("/DocDueDate")){
				MessageToast.show(this.getModel("i18n").getProperty("enterDueDate"));
				return;
			}
			
			debugger;
			var oDic=(parseFloat(this.getView().getModel("appView").getProperty("/TotalDoc"))*(parseFloat(this.getView().getModel("appView").getProperty("/TotalDiscount"))/100)).toFixed(2);
			var payload={
				"CardCode":this.getView().getModel("appView").getProperty("/CardCode"),
				"DocDueDate":this.getView().getModel("appView").getProperty("/DocDueDate"),
				"DocTotal":this.getView().getModel("appView").getProperty("/FinalTotal").toFixed(2),
				"TotalDiscount":oDic,
				// "TotalDiscount":this.getView().getModel("appView").getProperty("/TotalDiscount"),
				"Comments":this.getView().getModel("appView").getProperty("/comment"),
				"DocumentLines":[]
			};
			var oDocProTo={
				"ItemCode":"",
				"Quantity":"",
				"DiscountPercent":"",
				"Price":""
			};
			for (let index = 0; index < oData.length; index++) {
				const element = oData[index];
				let oLineItem=JSON.parse(JSON.stringify(oDocProTo));
				oLineItem.ItemCode=element.ItemCode;
				oLineItem.Quantity=element.cartQunt;
				oLineItem.DiscountPercent=element.discount;
				oLineItem.Price=element.finalPrice.toFixed(2);
				payload.DocumentLines.push(oLineItem);
			}
			// sap.m.MessageBox.success(JSON.stringify(payload));
			// return;
			if(this.getView().byId('rbg2').getSelectedIndex()===0){
				this.createQuotation(payload);
			}
			else{
				this.createOrder(payload);
			}
		},
		createOrder:function(payload){
			this.middleWare.callMiddleWare("/resource/Orders", "POST", payload)
			.then(function (data, status, xhr) {
				var oMsg=this.getModel("i18n").getProperty("CreatedOrder");
				MessageToast.show(oMsg);
				this.clearShopCartData();
				this.getRouter().navTo("tiles", {}, true);
			}.bind(this))
			.catch(function (jqXhr, textStatus, errorMessage) {
				this.middleWare.errorHandler(jqXhr, this);  
			}.bind(this));
		},
		createQuotation:function(payload){
			this.middleWare.callMiddleWare("/resource/Quotations", "POST", payload)
			.then(function (data, status, xhr) {
				var oMsg=this.getModel("i18n").getProperty("CreatedQuotation");
				MessageToast.show(oMsg);
				this.clearShopCartData();
				this.getRouter().navTo("tiles", {}, true);
			}.bind(this))
			.catch(function (jqXhr, textStatus, errorMessage) {
				this.middleWare.errorHandler(jqXhr, this);  
			}.bind(this));
		},
		onRadioButtonSelect:function(oEvent){
			debugger;
			if(oEvent.getParameter("selectedIndex")===0){
				var oMsg=this.getModel("i18n").getProperty("CreateQuotation");
				this.getView().byId("idSalesCreate").setText(oMsg);
			}
			else{
				var oMsg=this.getModel("i18n").getProperty("CreateOrder");
				this.getView().byId("idSalesCreate").setText(oMsg);
			}
		},
		onCartTableUpdate:function(oEvent){
			debugger;
			var oItems=oEvent.getSource().getItems();
			// [0].getCells()[3].setValue(0)
			for (let index = 0; index < oItems.length; index++) {
				const element = oItems[index];
				element.getCells()[3].setValue(0);
				element.getCells()[3].fireChange();	
			}
		},
	});
});