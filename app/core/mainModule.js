define([
	'angularAMD',
	'core/routes',
	'ui-router'
], function(angularAMD, routes) {
	'use strict';

	var mainModule = angular.module('mainModule', ['ui.router']);


	mainModule.config(routes);

	return angularAMD.bootstrap(mainModule);
});
