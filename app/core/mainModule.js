define([
	'angularAMD',
], function(angularAMD) {
	'use strict';

	var mainModule = angular.module('mainModule', []);

	return angularAMD.bootstrap(mainModule);
});
