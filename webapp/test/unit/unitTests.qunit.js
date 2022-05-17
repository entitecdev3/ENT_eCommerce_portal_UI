/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"ent/ui/ecommerce/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});