define(['angularAMD'], function(angularAMD){
	'use strict';

	angularAMD.service('driverResource', driverResource);
	
	function driverResource($resource, API_URL) {
		return $resource(API_URL + '/driver/:driver_id', {
			}, {
			save: {
				method: 'POST',
				transformRequest: angular.identity,
				headers: {'Content-Type': undefined}
			},
		});
	}
});
