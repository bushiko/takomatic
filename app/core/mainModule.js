define([
	'angularAMD',
	'core/routes',
  	// libraries
	'ui-router',
	'angular-resource',
  'ui-leaflet',
	'ng-map'
], function(angularAMD, routes) {
	'use strict';

	var mainModule = angular.module('mainModule', ['ui.router', 'ngMap', 'ngResource', 'ui-leaflet']);

	mainModule.config(routes);

  mainModule.constant('API_URL', 'http://localhost:8000');
	mainModule.constant('MAPBOX_API_KEY', 'pk.eyJ1IjoiYnVzaGlrbyIsImEiOiJjaXlxNWQ5b2QwMDA0MzNqeWF0cnJpZjZjIn0.E285dGJXFW58Qm6q-GdmIg');

	mainModule.run(function($state) {

    $state.go('main');
  });

	return angularAMD.bootstrap(mainModule);
});
