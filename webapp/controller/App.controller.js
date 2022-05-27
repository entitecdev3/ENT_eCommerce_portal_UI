sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("ent.ui.ecommerce.controller.App", {

		onInit: function () {
			var oViewModel,
				fnSetAppNotBusy,
				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

			oViewModel = new JSONModel({
				busy: true,
				delay: 0,
				layout: "OneColumn",
				previousLayout: "",
				actionButtonsInfo: {
					midColumn: {
						fullScreen: false
					}
				},
				logOut:false
			});
			this.setModel(oViewModel, "appView");
			this.getModel("appView").setSizeLimit(5000);

			fnSetAppNotBusy = function () {
				oViewModel.setProperty("/busy", false);
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			};
			if (!window.location.href.includes("language")) {
				const oLang = navigator.language.split("-")[0].toLowerCase();
				if (oLang.includes('en')) {
					sap.ui.getCore().getConfiguration().setLanguage('en');
				}
				else {
					sap.ui.getCore().getConfiguration().setLanguage('it');
				}
			}

			// since then() has no "reject"-path attach to the MetadataFailed-Event to disable the busy indicator in case of an error
			this.getOwnerComponent().getModel("oDataV2").metadataLoaded().then(fnSetAppNotBusy);
			this.getOwnerComponent().getModel("oDataV2").attachMetadataFailed(fnSetAppNotBusy);

			// apply content density mode to root view
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			// this.getCustomData();	
			this.getModel("appView").setProperty("/User", sessionStorage.userName);
			this.getModel("appView").setProperty("/authType", sessionStorage.authType);
			if(sessionStorage.languageCode){
				this.getModel("appView").setProperty("/selectLang", sessionStorage.languageCode);
				sap.ui.getCore().getConfiguration().setLanguage(sessionStorage.languageCode);
			}
		}

	});
});