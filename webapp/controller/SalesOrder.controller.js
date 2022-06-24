sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment",
], function(
	BaseController,
	JSONModel,
	Filter,
	FilterOperator,
	Fragment
) {
	"use strict";

	return BaseController.extend("ent.ui.ecommerce.controller.SalesOrder", {
        onInit: function onInit(oEvent) {
			this._oRouter = this.getRouter();
			this.getRouter()
            .getRoute("SalesOrder")
            .attachPatternMatched(this._matchedHandler, this);
			
			
		},
		onNavLeft: function() {
			this.getRouter().navTo("tiles", {});
		  },
		onAfterRendering:function(){
			this.getView().byId('navBackBtn').setVisible(false);
			const selectedTreeItem = 'Sales Order';
			const headerTitle = new JSONModel({ selectedTreeItem });
			this.getView().byId('selectedItemHeader').setModel(headerTitle);
			this.getView().byId('selectedItemHeader').updateBindings();
			this.getSalesOrderList();
			// this.callClientValueHelps();
			// this.getModel("appView").setProperty("/ClientListVisTotal",0);
			// this.getModel("appView").setProperty("/ClientListLength",0);
			// // this.getClientList();
		},
		_matchedHandler:function(){
			this.getModel("appView").setProperty("/layout", "OneColumn");
			this.getModel("appView").setProperty("/User", sessionStorage.userName);
			this.getSalesOrderList();
			this.setCustomerButtonData();
			this.getClientList();
			var oText=this.getModel("i18n").getProperty("last3month");
			this.getView().getModel("appView").setProperty("/DateFilter",oText);
			// this.getUsersData();
			// this.getCustomData();			
		},
		getSalesOrderList:function(oFilter){
			var that=this;
			if(!oFilter || oFilter.getId()){
				var d = new Date();
					d.setMonth(d.getMonth() - 3);
				let aFilter={};
				aFilter.DocDate={
					"start":new Date(),
					"end":d
				}
				if(that.getView().getModel("appView").getProperty("/MasterSelectedCustomer")){
					// that.getView().byId("searchField").setValue(that.getView().getModel("appView").getProperty("/MasterSelectedCustomer/CardCode"));
					aFilter.CardCode=that.getView().getModel("appView").getProperty("/MasterSelectedCustomer/CardCode");
				}
				oFilter=JSON.stringify(aFilter);
			}
			if(!that.getModel("appView").getProperty("/SalesOrderList") || oFilter){
				this.middleWare.callMiddleWare("/getSalesOrder?oQuery="+oFilter, "GET", {})
				.then(function (data, status, xhr) {
					that.getModel("appView").setProperty("/SalesOrderListLength",data.length);
					that.getModel("appView").setProperty("/SalesOrderList",data);
					var oSearch=that.getModel("appView").getProperty("/oSalesClientSearch");
					if(oSearch){
						that.getView().byId("searchField").setValue(oSearch);
						var oFilter = new Filter({
							filters: [
							  new Filter("CardCode", FilterOperator.Contains, oSearch),
							  new Filter("CardName", FilterOperator.Contains, oSearch),
							  // new Filter("MailCity", FilterOperator.Contains, sValue),
							],
							and: false,
						  });
						  var oBinding = that.getView().byId("idSalesOrderList").getBinding("items");
						  
						  oBinding.filter(oFilter);

					}
					// else if(that.getView().getModel("appView").getProperty("/MasterSelectedCustomer")){
					// 	that.getView().byId("searchField").setValue(that.getView().getModel("appView").getProperty("/MasterSelectedCustomer/CardCode"));
					// 	var oFilter = new Filter({
					// 		filters: [
					// 		  new Filter("CardCode", FilterOperator.Contains, that.getView().getModel("appView").getProperty("/MasterSelectedCustomer/CardCode")),
					// 		//   new Filter("CardName", FilterOperator.Contains, oSearch),
					// 		  // new Filter("MailCity", FilterOperator.Contains, sValue),
					// 		],
					// 		and: false,
					// 	  });
					// 	  var oBinding = that.getView().byId("idSalesOrderList").getBinding("items");
						  
					// 	  oBinding.filter(oFilter);
					// }
					// that.getView().byId("searchField").fireLiveChange();
				})
				.catch(function (jqXhr, textStatus, errorMessage) {
				that.middleWare.errorHandler(jqXhr, that);  
				});
			}	
		},
		onOpenViewSettings: function (oEvent) {
			var sDialogTab = "filter";
			if (oEvent.getSource() instanceof sap.m.Button) {
			  var sButtonId = oEvent.getSource().getId();
			//   if (sButtonId.match("sort")) {
			// 	sDialogTab = "sort";
			//   } else if (sButtonId.match("group")) {
			// 	sDialogTab = "group";
			//   }
			}
			// load asynchronous XML fragment
			if (!this.byId("viewSettingsDialog")) {
			  Fragment.load({
				id: this.getView().getId(),
				name: "ent.ui.ecommerce.fragments.ViewSetting",
				controller: this,
			  }).then(
				function (oDialog) {
					debugger;
				  // connect dialog to the root view of this component (models, lifecycle)
				  this.getView().addDependent(oDialog);
				  oDialog.addStyleClass(
					this.getOwnerComponent().getContentDensityClass()
				  );
				  oDialog.open(sDialogTab);
				}.bind(this)
			  );
			} else {
				debugger;
			  this.byId("viewSettingsDialog").open(sDialogTab);
			}
		},
		onConfirmViewSettingsDialog:function(oEvent){
			debugger;
			var aFilterItems = oEvent.getParameter("filterItems");
			function formatDate(date) {
				var d = new Date(date),
					month = '' + (d.getMonth() + 1),
					day = '' + d.getDate(),
					year = d.getFullYear();
			
				if (month.length < 2) 
					month = '0' + month;
				if (day.length < 2) 
					day = '0' + day;
			
				return [year, month, day].join('-');
			};
			var oFilter={};
			var d1=new Date();
			aFilterItems.forEach(function (oItem) {
				switch (oItem.getKey()) {
				  case "1month":
					var d = new Date();
					d.setMonth(d.getMonth() - 1);
					// aFilters.push(new Filter("DocDate ", FilterOperator.BT, formatDate(d),formatDate(d1)));
					oFilter.DocDate={
						"start":d1,
						"end":d
					}
					break;
				  case "3month":
					var d = new Date();
					d.setMonth(d.getMonth() - 3);
					// aFilters.push(new Filter("DocDate ", FilterOperator.BT, formatDate(d),formatDate(d1)));
					oFilter.DocDate={
						"start":d1,
						"end":d
					}
					break;
				  case "6month":
					var d = new Date();
					d.setMonth(d.getMonth() - 6);
					// aFilters.push(new Filter("DocDate ", FilterOperator.BT, formatDate(d),formatDate(d1)));
					oFilter.DocDate={
						"start":d1,
						"end":d
					}
					break;
				  case "12month":
					var d = new Date();
					d.setMonth(d.getMonth() - 12);
					// aFilters.push(new Filter("DocDate ", FilterOperator.BT, formatDate(d),formatDate(d1)));
					oFilter.DocDate={
						"start":d1,
						"end":d
					}
					break;
				  case "open":
					// aFilters.push(new Filter("DocumentStatus", FilterOperator.EQ, "'bost_Open'"));
					break; 
				  case "cancel":
					// aFilters.push(new Filter("Cancelled ", FilterOperator.EQ, "'tYES'"));
					break; 
				  case "close":
					// aFilters.push(new Filter("DocumentStatus", FilterOperator.EQ, "'bost_Close'"));
					break;    
				  default:
					break;
				}
				this.applyFilter(JSON.stringify(oFilter));
				// DocumentStatus
				// aCaptions.push(oItem.getText());
			}.bind(this));
		},
		applyFilter:function(oFilter){
			// var oSalesOrderList=this.getView().byId("idSalesOrderList");
			// oSalesOrderList.getBinding("items").filter(oFilter);
			this.getSalesOrderList(oFilter);

		},
		onClientListSelect:function(oEvent){
			// oItem.getBindingContext().getProperty("DocEntry")
			// var bReplace = !Device.system.phone;
			this.getRouter().navTo(
				"SalesOrderDetail",
				{
					objectId: oEvent.getParameter("listItem").getBindingContext("appView").getObject().DocEntry,
				}
			  );
			this.getView().byId("idSalesQuotationList").removeSelections();
		},
		onSalesOrderListSearch:function(oEvent){
			var sValue = oEvent.getParameter("newValue");
			var oFilter = new Filter({
			  filters: [
				new Filter("CardCode", FilterOperator.Contains, sValue),
				new Filter("CardName", FilterOperator.Contains, sValue),
				// new Filter("MailCity", FilterOperator.Contains, sValue),
			  ],
			  and: false,
			});
			var oBinding = this.getView().byId("idSalesOrderList").getBinding("items");
			
			oBinding.filter(oFilter);
		}
	});
});