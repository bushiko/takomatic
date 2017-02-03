define([
	'angularAMD', 
	'pusher',
], function(angularAMD, platform) {
	'use strict';

	angularAMD.service('PusherCli', PusherCli);

	function PusherCli() {
		var _this = this;

		this.init = function() {
			var pusher = new Pusher('1b42b37e2ae014e4b9ac');
			this.client = pusher;

			console.log(this.client);
		};


		// TODO: retornar una promesa que se resolvera
		// una vez el cliente este inicializado
		
		this.getClient = function() {

		};

		this.init();
	}

	return PusherCli;
});
