define([
	'mainModule',
	'core/directives/mapDash/mapDash'
], function(mainModule) {
	'use strict';

	mainModule.controller('mainController', mainController);

	function mainController($scope) {
		var _this = this;

		console.log('from mainController');
	};
});
