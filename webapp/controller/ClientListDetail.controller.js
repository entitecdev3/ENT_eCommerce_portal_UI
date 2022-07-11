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
			this.getClientList();
			this.getClientData();
			this.getView().getModel("appView").setProperty("/EditMode",false);
			this.setCustomerButtonData();
			this.getClientPriceList();
		},
	
		getClientDetails:function(){
			var that =this;
			this.getClientActivities();
			this.middleWare.callMiddleWare("/resource/BusinessPartners('"+this.cardCode+"')", "GET", {})
			.then(function (data, status, xhr) {
				that.getModel("appView").setProperty("/ClientDetails",data);
				that.getView().getModel("appView").setProperty("/EditMode",false);
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
					for (let index = 0; index < data.length; index++) {
						const element = data[index];
						element.status='E'
					}
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
		getClientPriceList:function(){
			var that =this;
			this.getClientActivities();
			this.middleWare.callMiddleWare("/ClientListPricelist?CardCode="+this.cardCode, "GET", {})
			.then(function (data, status, xhr) {
				that.getModel("appView").setProperty("/ClientListPricelist",data);
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
			  // if (id === 95 && lineid === 2)
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
		onClientPriceListFilterPress:function(oEvent){
			 var oQuery=oEvent.getParameter("newValue");
			 var oTable=oEvent.getSource().getParent().getParent();
			 var oFilter = new Filter({
				filters: [
				  new Filter("ItemCode", FilterOperator.Contains, oQuery),
				  new Filter("ItemName", FilterOperator.Contains, oQuery),
				],
				and: false,
			  });
			var oBinding=oTable.getBinding("items");
			oBinding.filter(oFilter);
		},
		onIconTabSelect:function(oEvent){
			var oKey=oEvent.getParameter("selectedKey");
			this.getView().getModel("appView").setProperty("/iconKey",oKey);
		},
		onDateChange:function(oEvent){
			var oView = this.getView();
			var oPath=oEvent.getSource().getBindingContext("appView").getPath();
			var oData=this.getView().getModel("appView").getProperty(oPath);
			oData.status=oData.status==='N'?"N":'U';
			this.oStartChange=true;
			this.oSelctActivityPath=oEvent.getSource().getParent().getBindingContext("appView").getPath();
			this.oSelctActivityStart=false;
			var oData=this.getView().getModel("appView").getProperty(this.oSelctActivityPath);
			if(oEvent.getSource().getId().includes("start")){
				this.oSelctActivityStart=true;
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
			this._pDialog.then(function(oDialog) {
				var oDate=oDialog.getContent()[0].getDateValue();
				var oTime=oDialog.getContent()[1].getValue();
				oTime=oTime.split(":")[0]+oTime.split(":")[1];
				var oData=this.getView().getModel("appView").getProperty(this.oSelctActivityPath);
				if(this.oSelctActivityStart){
					oData.Recontact=oDate;
					oData.BeginTime=oTime;
				}
				else{
					oData.endDate=oDate;
					oData.ENDTime=oTime;
				}
				this.getView().getModel("appView").updateBindings();
				oDialog.close();
			}.bind(this));	
		},
		onAddressEditPopup:function(oEvent){
			var oView = this.getView();
			var oBinding=oEvent.getSource().getParent().getBindingContext("appView").getPath();
			this.oAddEditBinding=oBinding;
			var oData=this.getView().getModel("appView").getProperty(oBinding);
			this.getView().getModel("appView").setProperty("/ClientAddressEdit",JSON.parse(JSON.stringify(oData)));
			console.log(oData)
			if (!this.addressDialog) {
				this.addressDialog = Fragment.load({
					id: oView.getId(),
					name: "ent.ui.ecommerce.fragments.ClientAddressEdit",
					controller: this
				}).then(function(oDialog){
					oView.addDependent(oDialog);
					return oDialog;
				}.bind(this));
			}
			this.addressDialog.then(function(oDialog) {
				oDialog.bindElement("appView>/ClientAddressEdit");
				oDialog.open();
			});
		},
		handleOKPressAdressChange:function(){
			var oData=this.getView().getModel("appView").getProperty("/ClientAddressEdit");
			this.getView().getModel("appView").setProperty(this.oAddEditBinding,JSON.parse(JSON.stringify(oData)));
			this.addressDialog.then(function(oDialog) {
				oDialog.close();
			});
		},
		handleCancelPressAdressChange:function(){
			this.addressDialog.then(function(oDialog) {
				oDialog.close();
			});
		},
		onAddressSelection:function(oEvent){
			var oSelectedRow=oEvent.getParameter("listItem").getBindingContext("appView").getObject();
			if(oSelectedRow.AddressType.includes("BillTo")){
				MessageToast.show("Selection Not allowed")
				oEvent.getSource().removeSelections();
			}
		},
		onAddAddress:function(oEvent){
			var oView = this.getView()
			if (!this.addressAddDialog) {
				this.addressAddDialog = Fragment.load({
					id: oView.getId(),
					name: "ent.ui.ecommerce.fragments.addAddress",
					controller: this
				}).then(function(oDialog){
					oView.addDependent(oDialog);
					// oDialog.attachAfterOpen(function () {
					// }.bind(this));
					return oDialog;
				}.bind(this));
			}
			this.addressAddDialog.then(function(oDialog) {
				oDialog.getContent()[0].getItems()[1].setValue("");
				oDialog.open();
			});
		
		},
		handleOKPressAddress:function(oEvent){
			var oAdd=  {
				"AddressName":oEvent.getSource().getParent().getContent()[0].getItems()[1].getValue(),
				"Street": "",
				"ZipCode": "",
				"City": "",
				"County": "",
				"Country": "IT",
				"State": "",
				"AddressType": "bo_ShipTo",
				"StreetNo": "",
			};
			var oData=this.getView().getModel("appView").getProperty("/ClientDetails/BPAddresses");
			oData.unshift(oAdd);
			this.getView().getModel("appView").updateBindings();
			this.addressAddDialog.then(function(oDialog) {
				oDialog.close();
			});
		},
		handleCancelAddress:function(){
			this.addressAddDialog.then(function(oDialog) {
				oDialog.close();
			});
		},
		onAddressDelete:function(oEvent){
			var oPath=oEvent.getSource().getBindingContext("appView").getPath();
			var oIndex=oPath.split("/")[oPath.split("/").length-1];
			var oData=this.getView().getModel("appView").getProperty("/ClientDetails/BPAddresses");
			oData.splice(parseInt(oIndex),1);
			this.getView().getModel("appView").updateBindings();
		},
		formatAddress:function(oV1,oV2,oV3,oV4,oV5,oV6,oV7){
			let str= `${oV1?oV1+" ":""}${oV2?oV2+" ":""}${oV3?oV3+" ":""}${oV4?oV4+" ":""}${oV5?oV5+" ":""}${oV6?oV6+" ":""}${oV7?oV7+" ":""}`;
			if(!str){
				var oLang=this.getModel("i18n").getProperty("addAddress");
				return oLang;
			}
			return str;
		},
		onAddActivites:function(oEvent){
			var oAdd={
				"Action":"",
				"Recontact":new Date(),
				"BeginTime":0,
				"endDate":new Date(),
				"ENDTime":0,
				"Notes":"",
				"CardCode":this.cardCode,
				"status":"N"
			};
			var oData=this.getView().getModel("appView").getProperty("/ClientListActivites");
			oData.unshift(oAdd);
			this.getView().getModel("appView").updateBindings();
		},
		onDeleteActivites:function(oEvent){
			var oPath=oEvent.getParameter("listItem").getBindingContext("appView").getPath();
			var oData=this.getView().getModel("appView").getProperty(oPath);
			oData.status=oData.status==="N" ? "ND" : "D";
			this.getView().getModel("appView").updateBindings();
			var oTable=oEvent.getSource();
			 var oFilter = new Filter({
				filters: [
				  new Filter("status", FilterOperator.NE, 'D'),
				  new Filter("status", FilterOperator.NE, 'ND'),
				],
				and: true,
			  });
			var oBinding=oTable.getBinding("items");
			oBinding.filter(oFilter);
		},
		onCountryChange:async function(oEvent){
			var oKey=oEvent.getParameter("selectedItem").getKey();
			var oItems=oEvent.getSource().getParent().getItems()[9].getItems()
			var data=await this.getVH_State(oKey);
			if(data && data.length>0){
				oItems[0].setVisible(false);
				oItems[1].setVisible(true);
			}
			else{
				oItems[0].setVisible(true);
				oItems[1].setVisible(false);
			}
		},
		formatStateCoVisi:function(){
			var oData=this.getView().getModel("appView").getProperty("/VH_State");
			if(oData.length>0){
				return true;
			}
			return false;
		},
		formatStateInVisi:function(){
			var oData=this.getView().getModel("appView").getProperty("/VH_State");
			if(oData.length>0){
				return false;
			}
			return true;
		},
		onUpdatePress:function(){
			// this.activityBatch();
			// return;
			var oData=this.getView().getModel("appView").getProperty("/ClientDetails");
			// this.getView().setBusy(true);
			this.middleWare.callMiddleWare("/resource/BusinessPartners('"+this.cardCode+"')", "PATCH", oData)
			.then(function (data, status, xhr) {
				// this.getView().setBusy(false);
				// this.getModel("appView").setProperty("/ClientDetails",data);
				// this.getView().getModel("appView").updateBindings();
				// MessageToast.show("Updated")
				this.activityBatch();
			}.bind(this))
			.catch(function (jqXhr, textStatus, errorMessage) {
				// this.getView().setBusy(false);
				this.middleWare.errorHandler(jqXhr, this);  
			}.bind(this));
		},
		onActivityNotesChange:function(oEvent){
			var oPath=oEvent.getSource().getBindingContext("appView").getPath();
			var oData=this.getView().getModel("appView").getProperty(oPath);
			oData.status=oData.status==='N'?"N":'U';
			oData.Notes=oEvent.getParameter("value");
			this.getView().getModel("appView").updateBindings();
		},
		onActivityActionChange:function(oEvent){
			var oPath=oEvent.getSource().getBindingContext("appView").getPath();
			var oData=this.getView().getModel("appView").getProperty(oPath);
			oData.status=oData.status==='N'?"N":'U';
			oData.Action=oEvent.getParameter("selectedItem").getKey();
			this.getView().getModel("appView").updateBindings();
		},
		getSLActivity:function(data){
			var fData=[];
			for (let index = 0; index < data.length; index++) {
				const element = data[index];
				fData[index]={};
				fData[index].ActivityCode=element.ClgCode?element.ClgCode:'';
				fData[index].ActivityProperty=this.getSlAction(element.Action);
				fData[index].ActivityDate=element.Recontact?this.middleWare.onTimeZone(new Date(element.Recontact)):null;
				fData[index].ActivityTime=element.BeginTime;
				fData[index].EndDueDate=element.endDate?this.middleWare.onTimeZone(new Date(element.endDate)):null;
				fData[index].EndTime=element.ENDTime;
				fData[index].Notes=element.Notes;
				fData[index].CardCode=element.CardCode;
				fData[index].status=element.status;
			}
			return fData;
		},
		getSlAction:function(oData){
			if(oData){
				switch (oData) {
				  case "C":
					return "cn_Conversation"
				  case "M":
					return "cn_Meeting"
				  case "T":
					return "cn_Task"
				  case "E":
					return "cn_Note"
				  case "P":
					return "cn_Campaign"
				  case "N":
					return "cn_Other"
				
				  default:
					break;
				}
			}
		},
		getRecord:function(oStatus,method,key){
			//getting all the data
			var oData=this.getView().getModel("appView").getProperty("/ClientListActivites");
			oData=this.getSLActivity(oData);
			//filter the data which is created
			var oAdddedData=oData.filter(function(item){
				return item.status==oStatus;
			});
			//removing the status property for the arr
			const newArr = oAdddedData.map(({status, ...rest}) => {
				return rest;
			});
			var oAttachDData=[];
			if(oStatus==="D"){
				for (let index = 0; index < newArr.length; index++) {
					var oAttachDData=oAttachDData.concat(this.middleWare.batchPayloadGenerator("/Activities",method,newArr[index],key));
				}
			}
			//getting the batch payload
			var oCreatedData=this.middleWare.batchPayloadGenerator("/Activities",method,newArr,key);
			return oCreatedData.concat(oAttachDData);
				// var oNew=that.getRecord("N","POST");
			// var oUpdate=that.getRecord("U","PATCH","DocEntry");	
			// var oDelete=that.getRecord("D","DELETE","DocEntry");
		},
		activityBatch:function(){
			var oNew=this.getRecord("N","POST");
			var oUpdate=this.getRecord("U","PATCH","ActivityCode");	
			var oDelete=this.getRecord("D","DELETE","ActivityCode");
			var oArr=oNew.concat(oUpdate,oDelete);
			var oMessage=this.getModel("i18n").getProperty("updateSuccess");
			if(!oArr){
				MessageToast.show(oMessage);
				// this.getView().setBusy(false);
				this.getClientDetails();
				return;
			}
			if(oArr.length===0){
				MessageToast.show(oMessage);
				// this.getView().setBusy(false);
				this.getClientDetails();
				return;
			}
			let oPayload={"requests":oArr};
			var that=this;
			// that.getView().setBusy(true);
			that.middleWare.callMiddleWare("/batchCall", "POST", oPayload)
			.then(function (data, status, xhr) {
				var oErr=[];
				for (let index = 0; index < data.responses.length; index++) {
					const element = data.responses[index];
					if(element.status.includes('No Content') || element.status.includes('Created')){
						continue;
					}
					else{
						oErr.push(that.middleWare.b1ErrorMessage(element.body))
					}
				}
				// that.getView().setBusy(false);
				if(oErr.length>0){
					MessageBox.error("Error:Activity-\n"+JSON.stringify(oErr));
					return;
				}
				MessageToast.show(oMessage);
				that.getClientDetails();
				// that.getClientActivities();
				
			})
			.catch(function (jqXhr, textStatus, errorMessage) {
				// that.getView().setBusy(false);
				that.middleWare.errorHandler(jqXhr,that);
			});
		},
		onOrderAmountPress:function(oEvent){
			debugger;
			MessageToast.show("ke baat hai");
			this.getView().getModel("appView").setProperty("/oSalesClientSearch",this.getView().getModel("appView").getProperty("/ClientDetails/CardCode"));
			this._oRouter.navTo("SalesOrder");
		}
	});
});