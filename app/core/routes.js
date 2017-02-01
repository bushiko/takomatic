define(['angularAMD'], function(angularAMD) {
	'use strict';

	function configuration($stateProvider) {
		$stateProvider
			.state('main', angularAMD.route({
				url: '/',
				controller: 'mainController',
				controllerAs: 'vm',
				templateUrl: 'app/core/components/main/main.html',
				controllerUrl: 'core/components/main/mainController'
			}));
	}

	return configuration;
});