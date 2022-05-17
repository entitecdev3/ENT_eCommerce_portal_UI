sap.ui.define([
	"./BaseController", "sap/m/MessageBox"
], function (
	BaseController,
	MessageBox
) {
	"use strict";

	return BaseController.extend("ent.ui.ecommerce.controller.Login", {
		onInit: function onInit(oEvent) {
			// this._oRouter = this.getOwnerComponent().getRouter();
			// this._oRouter.getRoute("App").attachMatched(this._matchedHandler, this);
			this.getRouter()
				.getRoute("login")
				.attachPatternMatched(this._matchedHandler, this);
			//this.getOwnerComponent().getRouter().attachRouteMatched(this._onRouteMatched, this);
			// this.oResource = this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},
		_matchedHandler: function (oEvent) {
			this.getModel("appView").setProperty("/layout", "OneColumn");
			var that=this;
			var oConfig=this.getModel("config").getJSON();
			oConfig=JSON.parse(oConfig);
			if(!that.getModel("appView").getProperty("/logOut")){
				if(oConfig['login-auto-submit']){
					this.getView().byId("idLoginButton").firePress();
				}
			}
			
			// if(sessionStorage.session_id.includes("ENT")){
			// 	that.getRouter().navTo("tiles");
			// }
			if(window.location.href.includes("Login-Email")){
				// window.location.search.split("=");
				var payload = {
					"loginEmail": window.location.search.split("=")[1]
				}
				this.DirectLogin(payload);
			}
			this.getModel("appView").setProperty("/selectLang", navigator.language.split("-")[0].toLowerCase());
	
			if(sessionStorage.Header){
				var oSess=sessionStorage.Header;
				oSess=oSess.split("\r\n");
				for (let index = 0; index < oSess.length; index++) {
					const element = oSess[index].toLowerCase();
					if(element){
						if(element.includes("login-email")){
							var oEmail=element.split(":")[1];//originalText.split(" ").join("");
							var payload = {
								"loginEmail": oEmail.split(" ").join("")
							}
							this.DirectLogin(payload);
							break;
						}
					}
					
				}
			}
			this.getCompanies();
		},
		onLanguageSelect: function(oEvent) {
			var selectedlaunguage = this.getView().byId("languageSelect").getSelectedKey();
			sap.ui.getCore().getConfiguration().setLanguage(selectedlaunguage);
		},
		DirectLogin:function(payload){
			var that=this;
			that.getModel("appView").setProperty("/User", payload.loginEmail);
			this.getView().setBusy(true);
				this.middleWare.callMiddleWare("/Login", "POST", payload)
					.then(function (data, status, xhr) {
						that.getView().setBusy(false);
						var session_id = data.entSessionId;
						sessionStorage.session_id = session_id;
						sessionStorage.userName = data.userName;
						sessionStorage.userID = data.customAttributes.EmpID;
						that.getModel("appView").setProperty("/customData", data.customAttributes);
						that.getModel("appView").setProperty("/User", sessionStorage.userName);
						that.getRouter().navTo("tiles");
					})
					.catch(function (jqXhr, textStatus, errorMessage) {
						that.getView().setBusy(false);
						that.getView().byId("userid").setValueState('Error');
						that.getView().byId("pwd").setValueState('Error');
						// MessageBox.error(jqXhr.responseText);
						that.middleWare.errorHandler(jqXhr,that);
					});
		},
		getCompanies:function(){
			var that=this;
			this.middleWare.callMiddleWare("/getCompanies", "GET", {})
					.then(function (data, status, xhr) {
						debugger;
						// that.getView().setBusy(false);
						// var session_id = data.entSessionId;
						// sessionStorage.session_id = session_id;
						// sessionStorage.userName = data.userName;
						// sessionStorage.userID = data.customAttributes.EmpID;
						that.getModel("appView").setProperty("/companies", data);
						// that.getModel("appView").setProperty("/User", sessionStorage.userName);
						// that.getRouter().navTo("tiles");
					})
					.catch(function (jqXhr, textStatus, errorMessage) {
						// that.getView().setBusy(false);
						// that.getView().byId("userid").setValueState('Error');
						// that.getView().byId("pwd").setValueState('Error');
						// // MessageBox.error(jqXhr.responseText);
						that.middleWare.errorHandler(jqXhr,that);
					});
		},
		Login: function () {
			var that = this;
			// {
			//     "pattern": "",
			//     "name": "login",
			//     "target": "login"
			// },

			// var database = "DEV_OCS_TS20";
			// var keyUI = this.getView().byId("idKeyUI").getSelectedKey();
			var userName = this.getView().byId("userid").getValue();
			var password = this.getView().byId("pwd").getValue();
			var database = this.getView().byId("idDatabase").getSelectedKey();
			that.getModel("appView").setProperty("/User", userName);
			// if (userName == "") {
			// 	this.getView().byId("userid").setValueState('Error');
			// 	this.getView().byId("userid").setValueStateText('Please enter the User Name');
			// 	return;
			// }
			// else {
			// 	this.getView().byId("userid").setValueState('None');
			// }
			// if (password === "") {
			// 	this.getView().byId("pwd").setValueState('Error');
			// 	this.getView().byId("pwd").setValueStateText('Please enter the password');
			// 	return;
			// }
			// else {
			// 	this.getView().byId("pwd").setValueState('None');
			// }
			var payload = {
				"username": userName,
				"password": password,
				"database": database
			}
			// this.getView().setBusy(true);
			this.middleWare.callMiddleWare("/Login", "POST", payload)
				.then(function (data, status, xhr) {
					// that.getView().setBusy(false);
					var session_id = data.entSessionId;
					sessionStorage.session_id = session_id;
					sessionStorage.authType = data.authType;
					sessionStorage.userName = data.userName;
					that.getModel("appView").setProperty("/customData", data.customAttributes);
					that.getModel("appView").setProperty("/User", sessionStorage.userName);
					that.getModel("appView").setProperty("/authType", sessionStorage.authType);
					that.getRouter().navTo("tiles");
				})
				.catch(function (jqXhr, textStatus, errorMessage) {
					 
					that.getView().setBusy(false);
					that.getView().byId("userid").setValueState('Error');
					that.getView().byId("pwd").setValueState('Error');
					// MessageBox.error(jqXhr.responseText);
					that.middleWare.errorHandler(jqXhr,that);
				});
		}
	});
});