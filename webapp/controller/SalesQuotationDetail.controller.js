sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function(
	BaseController,
	JSONModel,
	Filter,
	FilterOperator,
	Fragment,
	MessageToast,
	MessageBox
) {
	"use strict";

	return BaseController.extend("ent.ui.ecommerce.controller.SalesQuotationDetail", {
        onInit: function onInit(oEvent) {
			debugger;
			this._oRouter = this.getRouter();
			this.getRouter()
            .getRoute("SalesQuotationDetail")
            .attachPatternMatched(this._matchedHandler, this);
		},
		onAfterRendering:function(){
			this.getView().byId('navLeftBtn').setVisible(false);
			const selectedTreeItem = 'Sales Quotation Details';
			const headerTitle = new JSONModel({ selectedTreeItem });
			this.getView().byId('selectedItemHeader').setModel(headerTitle);
			this.getView().byId('selectedItemHeader').updateBindings();
			// this.callValueHelps();
		},
		_matchedHandler:function(oEvent){
			this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
			this.getModel("appView").setProperty("/User", sessionStorage.userName);
			this.cardCode=oEvent.getParameter("arguments").objectId;	
			this.getSalesQuotationDetail();	
			this.setCustomerButtonData();
			// this.getClientProperties();
			this.getClientList();
			// this.getClientData();
			this.getView().getModel("appView").setProperty("/EditMode",false);
		},
	
		getSalesQuotationDetail:function(){
			var that =this;
			this.middleWare.callMiddleWare("/resource/Quotations("+this.cardCode+")", "GET", {})
			.then(function (data, status, xhr) {
				that.getModel("appView").setProperty("/SalesQuotationDetail",data);
				that.getView().getModel("appView").setProperty("/EditMode",false);
				that.getView().getModel("appView").updateBindings();
			})
			.catch(function (jqXhr, textStatus, errorMessage) {
				that.middleWare.errorHandler(jqXhr, that);  
			});
		},
		onItemGroupDiscountPress:function(oEvent){
			debugger;
			var oObject=oEvent.getSource().getParent().getBindingContext("appView").getObject();
			var oDiscounts={
				"Lvl_20_ItemGroupBP_Discount1":oObject.U_VAR_SC1,
				"Lvl_20_ItemGroupBP_Discount2":oObject.U_VAR_SC2,
				"Lvl_20_ItemGroupBP_Discount3":oObject.U_VAR_SC3,
				"Lvl_20_ItemGroupBP_Discount4":oObject.U_VAR_SC4
			};
			this.getView().getModel("appView").setProperty("/Lvl_20_ItemGroupBP_Discount",oDiscounts);
			var oButton = oEvent.getSource(),
            oView = this.getView();
			if (!this.disPopOver) {
				this.disPopOver = Fragment.load({
				name: "ent.ui.ecommerce.fragments.DiscountPopupOver",
				controller: this,
				}).then(function (oPopover) {
				oView.addDependent(oPopover);
				return oPopover;
				});
			}
			this.disPopOver.then(function (oPopover) {
				oPopover.openBy(oButton);
			}.bind(this));
		},
		onDiscountPopOverCloseButton:function(){
			this.disPopOver.then(function (oPopover) {
				oPopover.close();
			}.bind(this));
		},
	});
});