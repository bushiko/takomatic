define([
	'angularAMD',
	'core/routes',
  	// libraries
	'ui-router',
	'angular-resource',
	'angular-moment',
  	'ui-leaflet',
], function(angularAMD, routes) {
	'use strict';

	var mainModule = angular.module('mainModule', 
		['ui.router', 'ngResource', 'ui-leaflet',
		'angularMoment']);

	mainModule.config(routes);

  	mainModule.constant('API_URL', 'http://localhost:8000');
	mainModule.constant('MAPBOX_API_KEY', 'pk.eyJ1IjoiYnVzaGlrbyIsImEiOiJjaXlxNWQ5b2QwMDA0MzNqeWF0cnJpZjZjIn0.E285dGJXFW58Qm6q-GdmIg');

	mainModule.run(function($state) {

    $state.go('main');

    // Prefix para los markers con fontAwesome
     L.AwesomeMarkers.Icon.prototype.options.prefix = 'fa';
  });

	return angularAMD.bootstrap(mainModule);
});
