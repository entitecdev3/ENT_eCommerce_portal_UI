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
            .getRoute("ClientsListDetail")
            .attachPatternMatched(this._matchedHandler, this);
		},
		onAfterRendering:function(){
			this.getView().byId('navLeftBtn').setVisible(false);
			const selectedTreeItem = 'Client List Details';
			const headerTitle = new JSONModel({ selectedTreeItem });
			this.getView().byId('selectedItemHeader').setModel(headerTitle);
			this.getView().byId('selectedItemHeader').updateBindings();
		},
		_matchedHandler:function(oEvent){
			this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
			this.getModel("appView").setProperty("/User", sessionStorage.userName);
			this.cardCode=oEvent.getParameter("arguments").objectId;	
			this.getClientDetails();	
			this.getClientProperties();
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
			if(!that.getModel("appView").getProperty("/ClientListActivites")){
				this.middleWare.callMiddleWare("/ClientListActivities?CardCode="+this.cardCode, "GET", {})
				.then(function (data, status, xhr) {
					that.getModel("appView").setProperty("/ClientListActivites",data);
				})
				.catch(function (jqXhr, textStatus, errorMessage) {
				that.middleWare.errorHandler(jqXhr, that);  
				});
			}
		},
		getClientProperties:function(){
			var that=this;
			this.middleWare.callMiddleWare("/ClientListPropertiesField", "GET", {})
			.then(function (data, status, xhr) {
				
				that.getModel("appView").setProperty("/ClientListPropertiesField",data);
				var oSimpleForm=that.getView().byId("idPropertiesClientList");
				oSimpleForm.destroyContent();
				
				for (let index = 0; index < data.length; index++) {
					const element = data[index];
					let oLabel =new sap.m.Label();
					// let oText=new sap.m.Text();
					let oBindProp="appView>/ClientDetails/Properties"+element.GroupCode
					let oText =new sap.m.CheckBox({
						selected:{
							path:oBindProp,
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
					oLabel.setText(element.GroupName);
					oSimpleForm.addContent(oLabel);
					// oText.bindProperty("text","appView>/ClientDetails/Properties"+element.GroupCode);
					// oText.bindProperty("selected","path:'appView>/ClientDetails/Properties"+element.GroupCode);
					// oText.bindProperty("editable",'false');
					oSimpleForm.addContent(oText);	
				}
			})
			.catch(function (jqXhr, textStatus, errorMessage) {
				that.middleWare.errorHandler(jqXhr, that);  
			});
		},
	});
});