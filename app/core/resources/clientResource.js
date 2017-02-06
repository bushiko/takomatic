define(['angularAMD'], function(angularAMD){
	'use strict';

	angularAMD.service('clientResource', clientResource);
	
	function clientResource($resource, API_URL) {
		return $resource(API_URL + '/client/:client_id', {
			}, {
			save: {
				method: 'POST',
				transformRequest: angular.identity,
				headers: {'Content-Type': undefined}
			},
		});
	}
});
