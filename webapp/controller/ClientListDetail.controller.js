sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment"
], function(
	BaseController,
	JSONModel,
	Filter,
	FilterOperator,
	Fragment
) {
	"use strict";

	return BaseController.extend("ent.ui.ecommerce.controller.ClientList", {
        onInit: function onInit(oEvent) {
			this._oRouter = this.getRouter();
			this.getRouter()
            .getRoute("ClientsListDetail")
            .attachPatternMatched(this._matchedHandler, this);
		},
		onAfterRendering:function(){
			this.getView().byId('navLeftBtn').setVisible(false);
			const selectedTreeItem = 'Client List Details';
			const headerTitle = new JSONModel({ selectedTreeItem });
			this.getView().byId('selectedItemHeader').setModel(headerTitle);
			this.getView().byId('selectedItemHeader').updateBindings();
			// this.callValueHelps();
		},
		_matchedHandler:function(oEvent){
			this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
			this.getModel("appView").setProperty("/User", sessionStorage.userName);
			this.cardCode=oEvent.getParameter("arguments").objectId;	
			this.getClientDetails();	
			this.getClientProperties();
			this.getClientData();
			this.getView().getModel("appView").setProperty("/EditMode",false);
		},
	
		getClientDetails:function(){
			var that =this;
			this.getClientActivities();
			this.middleWare.callMiddleWare("/resource/BusinessPartners('"+this.cardCode+"')", "GET", {})
			.then(function (data, status, xhr) {
				that.getModel("appView").setProperty("/ClientDetails",data);
				that.getView().getModel("appView").updateBindings();
			})
			.catch(function (jqXhr, textStatus, errorMessage) {
			that.middleWare.errorHandler(jqXhr, that);  
			});
		},
		getClientActivities:function(){
			var that=this;
			// if(!that.getModel("appView").getProperty("/ClientListActivites")){
				this.middleWare.callMiddleWare("/ClientListActivities?CardCode="+this.cardCode, "GET", {})
				.then(function (data, status, xhr) {
					that.getModel("appView").setProperty("/ClientListActivites",data);
				})
				.catch(function (jqXhr, textStatus, errorMessage) {
				that.middleWare.errorHandler(jqXhr, that);  
				});
			// }
		},
		getClientProperties:function(){
			var that=this;
			this.middleWare.callMiddleWare("/ClientListPropertiesField", "GET", {})
			.then(function (data, status, xhr) {
				that.getModel("appView").setProperty("/ClientListPropertiesField",data);
				var oSimpleForm=that.getView().byId("idProperty--idPropertiesClientList");
				var oSimpleForm1=that.getView().byId("idPropertyEdit--idPropertiesClientList");
				oSimpleForm.destroyContent();
				oSimpleForm1.destroyContent();
				const oLabel=function(oText){
					return new sap.m.Label({
						text: oText
					});
				};
				const oCheckBox=function(oPath){
					return new sap.m.CheckBox({
						selected:{
							path:oPath,
							formatter:function(oValue){	
								if(oValue){
								  if(oValue.includes("Y")){
									return true;
								  }
								}
								return false
							}
						},
						editable:false
					});
				};
				for (let index = 0; index < data.length; index++) {
					const element = data[index];
					var oBindProp="appView>/ClientDetails/Properties"+element.GroupCode
					oSimpleForm.addContent(oLabel(element.GroupName));
					oSimpleForm.addContent(oCheckBox(oBindProp));		
					oSimpleForm1.addContent(oLabel(element.GroupName));
					oSimpleForm1.addContent(oCheckBox(oBindProp));
				}
			})
			.catch(function (jqXhr, textStatus, errorMessage) {
				that.middleWare.errorHandler(jqXhr, that);  
			});
		},
		getClientData:function(){
			var that =this;
			this.getClientActivities();
			this.middleWare.callMiddleWare("/ClientData?ClientId="+this.cardCode, "GET", {})
			.then(function (data, status, xhr) {
				const clientDetails = data.map(el => {
					return {
					  ...el,
					  U_sc1: that.formatNumberValue(el.U_sc1, 'notnr'),
					  U_sc2: that.formatNumberValue(el.U_sc2, 'notnr'),
					  U_sc3: that.formatNumberValue(el.U_sc3, 'notnr'),
					  U_sc4: that.formatNumberValue(el.U_sc4, 'notnr')
					}
				  });
				that.getModel("appView").setProperty("/clientData",clientDetails);
				that.getView().getModel("appView").updateBindings();
			})
			.catch(function (jqXhr, textStatus, errorMessage) {
				that.middleWare.errorHandler(jqXhr, that);  
			});
		},
		formatNumberValue: function(value, uom, id, lineid) {
			const decimals = 2;// parseInt(this.appParams.MES_UOM_NONPZ_DECIMALI);
			if (uom !== 'NR') {
			  const stringValue = value.toString();
			  const matchExp = new RegExp('^-?\\d+(?:\.\\d{0,' + decimals + '})?');
			  const stringWithDecimals = stringValue.match(matchExp);
			  const decimalValue = parseFloat(stringWithDecimals[0]);
			  // if (id === 95 && lineid === 2) debugger
			  return decimalValue;
			} else {
			  return parseInt(value);
			}
		},
		onEditModePress:function(){
			this.getView().getModel("appView").setProperty("/EditMode",true);
			this.getView().getModel("appView").updateBindings();
		},
		onEditModeCancel:function(){
			this.getView().getModel("appView").setProperty("/EditMode",false);
			this.getView().getModel("appView").updateBindings();
		},
		onClientDetailsFilterPress:function(oEvent){
			 debugger;
			 var oQuery=oEvent.getParameter("newValue");
			 var oTable=oEvent.getSource().getParent().getParent();
			 var oFilter = new Filter({
				filters: [
				  new Filter("U_nomegrart", FilterOperator.Contains, oQuery),
				],
				and: false,
			  });
			var oBinding=oTable.getBinding("items");
			oBinding.filter(oFilter);
		},
		onIconTabSelect:function(oEvent){
			debugger;
			var oKey=oEvent.getParameter("selectedKey");
			this.getView().getModel("appView").setProperty("/iconKey",oKey);
		},
		onDateChange:function(oEvent){
			var oView = this.getView();
			debugger;	
			this.oStartChange=true;
			this.oSelctActivityPath=oEvent.getSource().getParent().getBindingContext("appView").getPath();
			var oData=this.getView().getModel("appView").getProperty(this.oSelctActivityPath);
			if(oEvent.getSource().getId().includes("start")){
				this.getView().getModel("appView").setProperty("/oTime",oData.BeginTime);
				this.getView().getModel("appView").setProperty("/oDate",new Date(oData.Recontact)); 
			}
			else{
				this.oStartChange=false;
				this.getView().getModel("appView").setProperty("/oTime",oData.ENDTime);
				this.getView().getModel("appView").setProperty("/oDate",new Date(oData.endDate));
			}
			// create popover
			if (!this._pDialog) {
				this._pDialog = Fragment.load({
					id: oView.getId(),
					name: "ent.ui.ecommerce.fragments.DateTimePicker",
					controller: this
				}).then(function(oDialog){
					oView.addDependent(oDialog);

					oDialog.attachAfterOpen(function () {
						debugger;
					}.bind(this));
					return oDialog;
				}.bind(this));
			}
			this._pDialog.then(function(oDialog) {
				oDialog.open();
			});
		},
		handleCancelDTP:function(oEvent){
			this._pDialog.then(function(oDialog) {
				oDialog.close();
			});
		},
		handleOKPressDTP:function(){
			debugger;
			this._pDialog.then(function(oDialog) {
				oDialog.close();
			});	
		},
	});
});