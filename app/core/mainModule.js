define([
	'angularAMD',
	'core/routes',
  // libraries
	'ui-router',
  'angular-resource',
  'ng-map'
], function(angularAMD, routes) {
	'use strict';

	var mainModule = angular.module('mainModule', ['ui.router', 'ngMap', 'ngResource']);

	mainModule.config(routes);

  mainModule.constant('API_URL', 'http://localhost:8000');

  mainModule.run(function($state) {

    $state.go('main');
  });

	return angularAMD.bootstrap(mainModule);
});
