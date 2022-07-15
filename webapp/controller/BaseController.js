sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"ent/ui/ecommerce/dbapi/dbapi",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"../model/formatter",
	"sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, History, dbapi,Fragment,JSONModel,MessageToast,formatter,Filter,FilterOperator) {
	"use strict";

	return Controller.extend("ent.ui.ecommerce.controller.BaseController", {
		middleWare: dbapi,
		/**
		 * Convenience method for accessing the router in every controller of the application.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		/**
		 * @override
		 */
		 formatter: formatter,
		onInit: function () {
			// Controller.prototype.onInit.apply(this, arguments);


		},
		getRouter: function () {
			return this.getOwnerComponent().getRouter();
		},

		/**
		 * Convenience method for getting the view model by name in every controller of the application.
		 * @public
		 * @param {string} sName the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function (sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model in every controller of the application.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Convenience method for getting the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Event handler for navigating back.
		 * It there is a history entry we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the master route.
		 * @public
		 */
		onNavBack: function () {
			var sPreviousHash = History.getInstance().getPreviousHash();

			if (sPreviousHash !== undefined) {
				// eslint-disable-next-line sap-no-history-manipulation
				history.go(-1);
			} else {
			this.getRouter().navTo("tiles", {}, true);
			}
		},
		onLogOut: function () {
			var that = this;
			this.middleWare.callMiddleWare("/Logout", "POST", {})
				.then(function (data, status, xhr) {
					sessionStorage.session_id = null;
					that.getModel("appView").setProperty("/layout", "OneColumn");
					that.getModel("appView").setProperty("/logOut", true);
					that.getRouter().navTo("login");
				})
				.catch(function (jqXhr, textStatus, errorMessage) {

					that.middleWare.errorHandler(jqXhr, that);
				});
		},
		onHomePress:function(){
			var that=this;
			that.getModel("appView").setProperty("/layout", "OneColumn");
			that.getModel("appView").setProperty("/logOut", true);
			that.getRouter().navTo("tiles");
		},
		onThemeChange: function (oEvent) {
			sap.ui.getCore().applyTheme('sap_horizon')
		},
		onThemeChangeDark: function (oEvent) {
			sap.ui.getCore().applyTheme('sap_fiori_3_dark');
		},
		onDatabasePress:function(oEvent){
			var oMessage=this.getView().getModel("appView").getProperty("/loginDatabaseName");
			MessageToast.show(oMessage);
			// var oButton = oEvent.getSource(),
            // oView = this.getView();
			// if (!this.__pPopover) {
			// 	this.__pPopover = Fragment.load({
			// 	name: "ent.ui.ecommerce.fragments.popoverTencet",
			// 	controller: this,
			// 	}).then(function (oPopover) {
			// 	oView.addDependent(oPopover);
			// 	return oPopover;
			// 	});
			// }
			// this.__pPopover.then(function (oPopover) {
			// 	oPopover.openBy(oButton);
			// });
		},
		convertFileToUrl: function(vContent) {
			var regex = /data:(\w.*);base64,/gm;
			var m = regex.exec(vContent),
				decodedPdfContent = atob(vContent.replace(regex, ""));
			var byteArray = new Uint8Array(decodedPdfContent.length);
			for (var i = 0; i < decodedPdfContent.length; i++) {
				byteArray[i] = decodedPdfContent.charCodeAt(i);
			}
			var blob = new Blob([byteArray.buffer], {
				type: m ? m[1] : 'application/pdf'
			});
			jQuery.sap.addUrlWhitelist("blob");
			return URL.createObjectURL(blob);
		},
		getCustomData:function(){
			var that=this;
			this.middleWare.callMiddleWare("/CustomAttribute", "GET", {})
			.then(function (data, status, xhr) {
				that.getModel("appView").setProperty("/customData",data);
				var customData=that.getModel("appView").getProperty("/customData/visibleTiles");
			if(customData){
				that.getModel("appView").setProperty("/visibleRDA",customData.includes("RDA"));
				that.getModel("appView").setProperty("/visiblePLM", customData.includes("PLM"));
				that.getModel("appView").setProperty("/visibleConsolidation", customData.includes("CONSOLIDATION"));
				that.getModel("appView").setProperty("/visibleTimeSheet", false);
				if(customData.includes("TIMESHEET")){
					var oConfig=that.getModel("config").getJSON();
					oConfig=JSON.parse(oConfig);
					if(oConfig.hiddenTiles){
						that.getModel("appView").setProperty("/visibleTimeSheet", false);
					}
					else{
						that.getModel("appView").setProperty("/visibleTimeSheet", true);
					}
				}
				// that.getModel("appView").setProperty("/visibleTimeSheet", customData.includes("TIMESHEET"));
				// that.getModel("config").updateBindings();
			}
			})
			.catch(function (jqXhr, textStatus, errorMessage) {
				// that.getView().setBusy(false);
				// ofrag.setBusy(false);
			  that.middleWare.errorHandler(jqXhr, that);  
			});
		},
		onUserPress:function(oEvent){
			var oButton = oEvent.getSource(),
            oView = this.getView();
			if (!this._pPopover) {
				this._pPopover = Fragment.load({
				name: "ent.ui.ecommerce.fragments.UserMenu",
				controller: this,
				}).then(function (oPopover) {
				oView.addDependent(oPopover);
				return oPopover;
				});
			}
			this._pPopover.then(function (oPopover) {
				oPopover.openBy(oButton);
			});
		},
		onUserPasswordChange:function(oEvent){
			var oButton = oEvent.getSource();
			if(oButton.getId().includes("idMangerPasswordUpdate")){
				this.EmpId=oButton.getParent().getBindingContext("appView").getObject().empID;
			}
			else{
				this.EmpId=this.getView().getModel("appView").getProperty("/customData/EmpID");
			}
            var oView = this.getView();
			
			if (!this.passwordFrag) {
				this.passwordFrag = Fragment.load({
				name: "ent.ui.ecommerce.fragments.PasswordChange",
				controller: this,
				}).then(function (oPopover) {
				oView.addDependent(oPopover);
				
				return oPopover;
				});
			}
			this.passwordFrag.then(function (oPopover) {
				var oJson= new JSONModel({ "password":"","confirmPassword":""});
				oPopover.setModel(oJson);
				oPopover.open();
			});
		},
		onPasswordChangeOkay:function(oEvent){
			var oData=oEvent.getSource().getModel().getData();
			// this.EmpId
			if(oData.password!==oData.confirmPassword){
				MessageToast.show("Password Didn't Match.")
				return;
			}
			var oPaylaod={
				"empId":this.EmpId,
				"password": oData.password
			}
			var that=this;
			// that.getView().setBusy(true);
			this.middleWare.callMiddleWare("/changePassword", "POST", oPaylaod)
					.then(function (data, status, xhr) {
						// that.getView().setBusy(false);
						MessageToast.show("Password Updated Successfully");
						that.passwordFrag.then(function (oPopover) {
							oPopover.close();
						});
						// var session_id = data.entSessionId;
						// sessionStorage.session_id = session_id;
						// sessionStorage.userName = data.userName;
						// sessionStorage.userID = data.customAttributes.EmpID;
						// that.getModel("appView").setProperty("/customData", data.customAttributes);
						// that.getModel("appView").setProperty("/User", sessionStorage.userName);
						// that.getRouter().navTo("tiles");
					})
					.catch(function (jqXhr, textStatus, errorMessage) {
						that.middleWare.errorHandler(jqXhr,that);
					});
				
		},
		onPasswordChangeCancel:function(oEvent){
			this.passwordFrag.then(function (oPopover) {
				
				oPopover.close();
			});	
		},
		onSeePasswordClick:function(oEvent){
			var oInput=oEvent.getSource();
			if(oInput.getType()==="Password"){
				setTimeout(function(){
					oInput.setType("Password");
					oInput.setValueHelpIconSrc("sap-icon://show");
				},2000)
				oInput.setType("Text");
				oInput.setValueHelpIconSrc("sap-icon://hide");
			}
			else{
				oInput.setType("Password");
				oInput.setValueHelpIconSrc("sap-icon://show");
			}
		},
		callClientValueHelps:function(){
			this.getVH_SalesPerson();
			this.getVH_OHEM();
			this.getVH_Industry();
			this.getVH_Groups();
			this.getVH_PayTermsGrpCode();
			this.getVH_Country();
			this.getVH_State();
		},
		getVH_SalesPerson:function(){
			return new Promise(function(resolve){
				this.middleWare.callMiddleWare("/VH_salesPerson", "GET", {})
			.then(function (data, status, xhr) {
				this.getModel("appView").setProperty("/VH_salesPerson",data);
				resolve(data);
			}.bind(this))
			.catch(function (jqXhr, textStatus, errorMessage) {
				this.middleWare.errorHandler(jqXhr, this);
				return;  
			}.bind(this));
			}.bind(this));
		},
		getVH_OHEM:function(){
			return new Promise(function(resolve){
				this.middleWare.callMiddleWare("/VH_OHEM", "GET", {})
				.then(function (data, status, xhr) {
					this.getModel("appView").setProperty("/VH_OHEM",data);
					resolve(data)
				}.bind(this))
				.catch(function (jqXhr, textStatus, errorMessage) {
					this.middleWare.errorHandler(jqXhr, this);  
					return;
				}.bind(this));
			}.bind(this));	
		},
		getVH_Industry:function(){
			return new Promise(function(resolve){
				this.middleWare.callMiddleWare("/VH_Industry", "GET", {})
			.then(function (data, status, xhr) {
				this.getModel("appView").setProperty("/VH_Industry",data);
				resolve(data);
			}.bind(this))
			.catch(function (jqXhr, textStatus, errorMessage) {
				this.middleWare.errorHandler(jqXhr, this);
				return;  
			}.bind(this));
			}.bind(this));
			
		},
		getVH_Groups:function(){
			return new Promise(function(resolve){
				this.middleWare.callMiddleWare("/VH_Groups", "GET", {})
				.then(function (data, status, xhr) {
					this.getModel("appView").setProperty("/VH_Groups",data);
					resolve(data);
				}.bind(this))
				.catch(function (jqXhr, textStatus, errorMessage) {
					this.middleWare.errorHandler(jqXhr, this);
					return;  
				}.bind(this));
			}.bind(this));
			
		},
		getVH_PayTermsGrpCode:function(){
			return new Promise(function(resolve){
				this.middleWare.callMiddleWare("/VH_PayTermsGrpCode", "GET", {})
				.then(function (data, status, xhr) {
					this.getModel("appView").setProperty("/VH_PayTermsGrpCode",data);
					resolve(data);
				}.bind(this))
				.catch(function (jqXhr, textStatus, errorMessage) {
					this.middleWare.errorHandler(jqXhr, this);
					return;  
				}.bind(this));
			}.bind(this));
			
		},
		getVH_Country:function(){
			return new Promise(function(resolve){
				this.middleWare.callMiddleWare("/VH_Country", "GET", {})
				.then(function (data, status, xhr) {
					this.getModel("appView").setProperty("/VH_Country",data);
					resolve(data);
				}.bind(this))
				.catch(function (jqXhr, textStatus, errorMessage) {
					this.middleWare.errorHandler(jqXhr, this);
					return;  
				}.bind(this));
			}.bind(this));
			
		}, 
		getVH_State:function(oQuery){
			return new Promise(function(resolve){
				this.middleWare.callMiddleWare("/VH_State?Country="+oQuery, "GET", {})
				.then(function (data, status, xhr) {
					this.getModel("appView").setProperty("/VH_State",data);
					this.getModel("appView").updateBindings();
					resolve(data);
				}.bind(this))
				.catch(function (jqXhr, textStatus, errorMessage) {
					this.middleWare.errorHandler(jqXhr, this);
					return;  
				}.bind(this));
			}.bind(this));
			
		},
		formatOwnerCode:async function(value){
			var oData=this.getView().getModel("appView").getProperty("/VH_OHEM");
			if(!oData){
				try {
					var d=await this.getVH_OHEM();
					// this.formatOwnerCode(value)	
				} catch (error) {
					this.middleWare.errorHandler(error,this);
				}
			}	
			if(value){
				
				oData=this.getView().getModel("appView").getProperty("/VH_OHEM");
				for (var index = 0; index < oData.length; index++) {
					var element = oData[index];
					if (element.empID.toString() === value.toString()) {
						let str=element.firstName+" "+element.lastName;
						return str;
					}
				}
			}

		},
		formatFrontOffice:async function(value){
			var oData=this.getView().getModel("appView").getProperty("/VH_OHEM");
			if(!oData){
				try {
					var d=await this.getVH_OHEM();
					// this.formatFrontOffice(value)	
				} catch (error) {
					this.middleWare.errorHandler(error,this);
				}
			}	
			if(value){
				
				oData=this.getView().getModel("appView").getProperty("/VH_OHEM");
				for (var index = 0; index < oData.length; index++) {
					var element = oData[index];
					if (element.Code.toString() === value.toString()) {
						let str=element.firstName+" "+element.lastName;
						return str;
					}
				}
			}

		},
		formatSalesPerson:async function(value){
			var oData=this.getView().getModel("appView").getProperty("/VH_salesPerson");
			if(!oData){
				try {
					var d=await this.getVH_SalesPerson();
					// this.formatSalesPerson(value)	
				} catch (error) {
					this.middleWare.errorHandler(error,this);
				}
			}	
			if(value){
				
				oData=this.getView().getModel("appView").getProperty("/VH_salesPerson");
				for (var index = 0; index < oData.length; index++) {
					var element = oData[index];
					if (element.SlpCode.toString() === value.toString()) {
						let str=element.SlpName;
						return str;
					}
				}
			}
		},
		formatIndustry:async function(value){
			var oData=this.getView().getModel("appView").getProperty("/VH_Industry");
			if(!oData){
				try {
					var d=await this.getVH_Industry();
					// this.formatSalesPerson(value)	
				} catch (error) {
					this.middleWare.errorHandler(error,this);
				}
			}	
			if(value){
				oData=this.getView().getModel("appView").getProperty("/VH_Industry");
				for (var index = 0; index < oData.length; index++) {
					var element = oData[index];
					if (element.IndCode.toString() === value.toString()) {
						let str=element.IndDesc;
						return str;
					}
				}
			}
		},
		// formatGroup:async function(value){
		// 	if(value){
		// 		var oData=this.getView().getModel("appView").getProperty("/VH_Groups");
		// 		if(!oData){
		// 			try {
		// 				var d=await this.getVH_Groups();
		// 				// this.formatSalesPerson(value)	
		// 			} catch (error) {
		// 				this.middleWare.errorHandler(error,this);
		// 			}
		// 		}	
		// 		oData=this.getView().getModel("appView").getProperty("/VH_Groups");
		// 		for (var index = 0; index < oData.length; index++) {
		// 			var element = oData[index];
		// 			if (element.GroupCode.toString() === value.toString()) {
		// 				let str=element.GroupName;
		// 				return str;
		// 			}
		// 		}
		// 	}
		// },
		// formatPayTermsGrpCode:async function(value){
		// 	if(value){
		// 		var oData=this.getView().getModel("appView").getProperty("/VH_PayTermsGrpCode");
		// 		if(!oData){
		// 			try {
		// 				var d=await this.getVH_PayTermsGrpCode();
		// 				this.formatPayTermsGrpCode(value)	
		// 			} catch (error) {
		// 				this.middleWare.errorHandler(error,this);
		// 			}
		// 		}	
		// 		oData=this.getView().getModel("appView").getProperty("/VH_PayTermsGrpCode");
		// 		for (var index = 0; index < oData.length; index++) {
		// 			var element = oData[index];
		// 			if (element.GroupNum.toString() === value.toString()) {
		// 				let str=element.PymntGroup;
		// 				return str;
		// 			}
		// 		}
		// 	}
		// },
		formatPayTerm:async function(value1,value2){
			var oData2=this.getView().getModel("appView").getProperty("/VH_PayTermsGrpCode");
			if(!oData2){
				try {
					var d=await this.getVH_PayTermsGrpCode();
					// this.formatPayTermsGrpCode(value)	
				} catch (error) {
					this.middleWare.errorHandler(error,this);
				}
			}	
			var oData1=this.getView().getModel("appView").getProperty("/VH_Groups");
			if(!oData1){
				try {
					var d=await this.getVH_Groups();
					// this.formatSalesPerson(value)	
				} catch (error) {
					this.middleWare.errorHandler(error,this);
				}
			}	
			if(value1){
				oData2=this.getView().getModel("appView").getProperty("/VH_PayTermsGrpCode");
				oData1=this.getView().getModel("appView").getProperty("/VH_Groups");
				for (var index = 0; index < oData2.length; index++) {
					var element2 = oData2[index];
					if (element2.GroupNum.toString() === value2.toString()) {
						for (let j = 0; j < oData1.length; j++) {
							const element1 = oData1[j];
							if (element1.PayMethCod.toString() === value1.toString()) {
								let str=element1.PayMethCod+" - "+element1.Descript+" - "+element2.PymntGroup;
								return str;
							}
							
						}
						// let str=element2.PymntGroup;
						// return str;
					}
				}
			}
		},
		getUsersData:function(){
			var that=this;
			// this.getView().setBusy(true);
			that.getModel("appView").setProperty("/userTileVisibility",true);
			this.middleWare.callMiddleWare("/users", "GET", {})
			.then(function (data, status, xhr) {
				// that.getView().setBusy(false);
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
		},
		getClientList:function(){
			var that=this;
			// if(!that.getModel("appView").getProperty("/ClientList"))
			{
				this.middleWare.callMiddleWare("/ClientList", "GET", {})
				.then(function (data, status, xhr) {
					that.getModel("appView").setProperty("/ClientListLength",data.length);
					that.getModel("appView").setProperty("/ClientList",data);
				})
				.catch(function (jqXhr, textStatus, errorMessage) {
				that.middleWare.errorHandler(jqXhr, that);  
				});
			}
			
		},
		getVatCode:async function(){
			var that=this;
			var oItem=this.getView().getModel("appView").getProperty("/CartData");
			if(oItem)
			{	
				var oItemCode = oItem.map(({ ItemCode }) => "'"+ItemCode+"'");
				console.log(oItemCode)
				var data=await this.middleWare.callMiddleWare("/getVATRATE?ItemCode="+oItemCode, "GET", {}).then();
				// var odec =parseInt(data).toFixed(2);
				// return data;
				for (let index = 0; index < oItem.length; index++) {
					const element = oItem[index];
					let oArr = data.filter(function (item) {
						if (item.ItemCode == element.ItemCode) {
							return item;
						}
        			});
					element.VatCode=oArr?oArr[0].Rate:"0"
				}
				this.getView().getModel("appView").setProperty("/CartData",oItem);
			}
			
		},
		getEntUserParms:function(){
			var that=this;
			if(!that.getModel("appView").getProperty("/U_ENT_PORTAL_PARAMS")){
				this.middleWare.callMiddleWare("/U_ENT_PORTAL_PARAMS", "GET", {})
				.then(function (data, status, xhr) {
					that.getModel("appView").setProperty("/U_ENT_PORTAL_PARAMS",data);
					// that.getModel("appView").setProperty("/ClientList",data);
				})
				.catch(function (jqXhr, textStatus, errorMessage) {
				that.middleWare.errorHandler(jqXhr, that);  
				});
			}
		},
		onCartPress:function(oEvent){
			debugger;
			this.getShopCartData();
			var oButton = oEvent.getSource(),
					oView = this.getView();
  
			if (!this.cartPopover) {
			  this.cartPopover = Fragment.load({
				id: oView.getId(),
				name: "ent.ui.ecommerce.fragments.CartPopupOver",
				controller: this
			  }).then(function(oPopover) {
				oView.addDependent(oPopover);
				// oPopover.bindElement("/ProductCollection/0");
				return oPopover;
			  });
			}
			this.cartPopover.then(function(oPopover) {
			  oPopover.openBy(oButton);
			});
		},
		onCartCloseButton:function(){
			this.cartPopover.then(function(oPopover) {
				oPopover.close();
			  });
		},
		onCartConfirmButton:function(){
			this.getRouter().navTo("ShoppingCart", {});
		},
		onCartItemDelete:function(oEvent){
			debugger;
			var oPath=oEvent.getParameter("listItem").getBindingContext("appView").getPath();
			var oIndex=oPath.split("/")[oPath.split("/").length-1];
			var oCartData=this.getView().getModel("appView").getProperty("/CartData");
			oCartData.splice(parseInt(oIndex),1);
			this.getView().getModel("appView").setProperty("/CartData",oCartData);
			this.getView().getModel("appView").updateBindings();
			this.updateShopCartData();
			oEvent.getSource().getParent().openBy(this.getView().byId("idCartButton"));
		},
		getShopCartData:function(oForce){
			var that=this;
			debugger;
			if(!that.getModel("appView").getProperty("/CheckoutCart") || oForce){
				this.middleWare.callMiddleWare("/CheckoutCart", "GET", {},'F')
				.then(function (data, status, xhr) {
					that.getModel("appView").setProperty("/CheckoutCart",data);
					if(data.U_CartContent){
						var oCart=atob(data.U_CartContent);
						oCart=JSON.parse(oCart);
						that.getModel("appView").setProperty("/DocDueDate",oCart.Date);
						that.getModel("appView").setProperty("/comment",oCart.Comment);
						that.getModel("appView").setProperty("/CardCode",oCart.Customer);
						that.getModel("appView").setProperty("/CartSalesQuat",oCart.SalesQuat);
						that.getModel("appView").setProperty("/CartData",oCart.CartData); 
				// 		let result = oCart.CartData.map(({ ItemCode }) => ItemCode);
				// console.log(result)
						// that.getModel("appView").setProperty("/TotalDiscount",oCart.DocDiscount); 
						that.getModel("appView").setProperty("/TotalCartData",oCart.CartData.length.toString());
						if(that.getView().getId().includes("ShoppingCart")){
							if(that.getView().byId("idCartCustomers").getSelectedKey()){
								that.getView().byId("idCartCustomers").fireChange();
							}
						}
						that.tableData = oCart.CartData;
					}
					// that.getModel("appView").setProperty("/ClientList",data);
				})
				.catch(function (jqXhr, textStatus, errorMessage) {
				that.middleWare.errorHandler(jqXhr, that);  
				});
			}
		},
		updateShopCartData:function(date,customer,salesQuatation,oComment,oDocDiscount,oBusy){
			var that=this;
			if(that.getModel("appView").getProperty("/CartData")){
				var oCartData=that.getModel("appView").getProperty("/CartData");
				date=date?date:that.getModel("appView").getProperty("/DocDueDate");
				customer=customer?customer:that.getModel("appView").getProperty("/CardCode");
				salesQuatation=salesQuatation==0?salesQuatation:that.getModel("appView").getProperty("/CartSalesQuat");
				oComment=oComment?oComment:that.getModel("appView").getProperty("/comment");
				// oDocDiscount=oDocDiscount?oDocDiscount:that.getModel("appView").getProperty("/TotalDiscount");
				var aPaylaod={
					"Date":date,
					"Customer":customer,
					"SalesQuat":salesQuatation,
					"Comment":oComment,
					"CartData":oCartData,
					// "DocDiscount":oDocDiscount
				};
				var oCartString=JSON.stringify(aPaylaod);

				var oPaylaod= {
					"cartData": btoa(oCartString)
				};
				// btoa(JSONStringify(oCartData));
				console.log(oPaylaod)
				// buf.toString('base64')
				// Buffer.from(str, 'base64')
				let abusoBusyoBusyoBusyy=oBusy?'T':'F'
				this.middleWare.callMiddleWare("/updateCart", "PUT",oPaylaod,oBusy)
				.then(function (data, status, xhr) {
					that.getShopCartData(true);
					// that.getModel("appView").setProperty("/CheckoutCart",data);
					// that.getModel("appView").setProperty("/ClientList",data);
				})
				.catch(function (jqXhr, textStatus, errorMessage) {
				that.middleWare.errorHandler(jqXhr, that);  
				});
			}
		},
		clearShopCartData:function(){
			var that=this;
			if(that.getModel("appView").getProperty("/CartData")){
				var oPaylaod= {
					"cartData": ''
				};
				this.middleWare.callMiddleWare("/updateCart", "PUT",oPaylaod)
				.then(function (data, status, xhr) {
					that.getShopCartData(true);
					// that.getModel("appView").setProperty("/CheckoutCart",data);
					// that.getModel("appView").setProperty("/ClientList",data);
				})
				.catch(function (jqXhr, textStatus, errorMessage) {
				that.middleWare.errorHandler(jqXhr, that);  
				});
			}
		},
		onCustomerPress:function(oEvent){
			var oButton = oEvent.getSource(),
					oView = this.getView();
			if(!this.getView().getModel("appView").getProperty("/ClientList")){
				this.getClientList();	
			}
			if (!this.custPopover) {
			  this.custPopover = Fragment.load({
				id: oView.getId(),
				name: "ent.ui.ecommerce.fragments.CustomerPopupOver",
				controller: this
			  }).then(function(oPopover) {
				oView.addDependent(oPopover);
				// oPopover.bindElement("/ProductCollection/0");
				return oPopover;
			  });
			}
			this.custPopover.then(function(oPopover) {
			  oPopover.openBy(oButton);
			});
		},
		onClientListSearchPopup:function(oEvent){
			var sValue = oEvent.getParameter("newValue");
			var oFilter = new Filter({
			  filters: [
				new Filter("CardCode", FilterOperator.Contains, sValue),
				new Filter("CardName", FilterOperator.Contains, sValue)
			  ],
			  and: false,
			});
			var oBinding = this.getView().byId("idCustomerPoperOverList").getBinding("items");
			
			oBinding.filter(oFilter);
		},
		onCustomerPopOverSelect:function(oEvent){
			debugger;
			var oViewId=this.getView().getId();
			var oSelectedItem=oEvent.getSource().getBindingContext("appView").getObject();
			this.getView().byId('idCustomerButton').setText(oSelectedItem.CardName);
			this.getView().byId('idCustomerButton').setTooltip(oSelectedItem.CardName);
			this.getView().byId('idCustomerButton').setType("Critical");
			this.getView().byId('idCustomerButton').setIcon("sap-icon://alert");
			this.getModel("appView").setProperty("/MasterSelectedCustomer",{"CardCode":oSelectedItem.CardCode,"CardName":oSelectedItem.CardName});
			if(oViewId.includes("SalesQuotation")){
				this.getView().byId("idgetSalesQuotationList").firePress();
			}
			if(oViewId.includes("SalesOrder")){
				this.getView().byId("idgetSalesOrderList").firePress();
			}
			if(oViewId.includes("Items")){
				this.getView().byId("idGetItemData").firePress();
			}
			this.custPopover.then(function(oPopover) {
				oPopover.close();
			  });
		},
		onCustPopupOverCloseButton:function(){
			this.custPopover.then(function(oPopover) {
				oPopover.close();
			  });
		},
		onCustomerPopOverSelectionClear:function(){
			var oViewId=this.getView().getId();
			var oText=this.getModel("i18n").getProperty("genericCustomer");
			this.getView().byId('idCustomerButton').setText(oText);
			this.getView().byId('idCustomerButton').setTooltip(oText);
			this.getView().byId('idCustomerButton').setType("Default");
			this.getView().byId('idCustomerButton').setIcon("sap-icon://globe");
			this.getModel("appView").setProperty("/MasterSelectedCustomer",undefined);
			if(oViewId.includes("SalesQuotation")){
				this.getView().byId("idgetSalesQuotationList").firePress();
			}
			if(oViewId.includes("SalesOrder")){
				this.getView().byId("idgetSalesOrderList").firePress();
			}
			if(oViewId.includes("Items")){
				this.getView().byId("idGetItemData").firePress();
			}
			this.custPopover.then(function(oPopover) {
				oPopover.close();
			  });
		},
		setCustomerButtonData:function(){
			var oData=this.getModel("appView").getProperty("/MasterSelectedCustomer/CardName");
			if(oData){
				this.getView().byId('idCustomerButton').setText(oData);
				this.getView().byId('idCustomerButton').setTooltip(oData);
				this.getView().byId('idCustomerButton').setType("Critical");
				this.getView().byId('idCustomerButton').setIcon("sap-icon://alert");
			}else{
				var oText=this.getModel("i18n").getProperty("genericCustomer");
				this.getView().byId('idCustomerButton').setText(oText);
				this.getView().byId('idCustomerButton').setTooltip(oText);
				this.getView().byId('idCustomerButton').setType("Default");
				this.getView().byId('idCustomerButton').setIcon("sap-icon://globe");
			}
		},
	});
});