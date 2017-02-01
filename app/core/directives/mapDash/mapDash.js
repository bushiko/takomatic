define([
	'angularAMD',
	'text!core/directives/mapDash/view.html',
	'google-maps'
], function (angularAMD, templateView) {
	'use strict';

	angularAMD.directive('mapDash', mapDash);

	function mapDash($timeout, $window, $sce) {
		return {
			template: templateView,
			restrict: 'E',
			scope: {
			},
			link: function(scope, el, attrs) {
				var BOUNDS = {
					sw: {
						lat: 19.3575374,
						lng: -99.1908466
					},
					ne: {
						lat: 19.4140716,
						lng: -99.1535356
					}
				};

				var mapContainer = document.querySelector('#map-dash');
				var map = new google.maps.Map(mapContainer, {
					minZoom: 13,
					mapTypeId: google.maps.MapTypeId.ROADMAP
				});


				var sW = new google.maps.LatLng(BOUNDS.sw.lat, BOUNDS.sw.lng);
				var nE = new google.maps.LatLng(BOUNDS.ne.lat, BOUNDS.ne.lng);
				var mapBounds = new google.maps.LatLngBounds(sW, nE);
				map.fitBounds(mapBounds);

				// Evitar ir más lejos del los mapBounds
				var center = map.getCenter();
				google.maps.event.addListener(map, 'center_changed', function() {
					if(mapBounds.contains(map.getCenter())) {
						return center = map.getCenter();
					}
					map.panTo(center);
				});

				// Random marker
				var randomMrk = new google.maps.Marker({
			    position: new google.maps.LatLng(
			    	getRandomFloat(BOUNDS.sw.lat, BOUNDS.ne.lat), 
			    	getRandomFloat(BOUNDS.sw.lng, BOUNDS.ne.lng)),
			    label: 'Random 1',
			    map: map
			  });

				var rectangle = new google.maps.Rectangle({
			    bounds: mapBounds,
			    editable: false,
			    draggable: false
			  });
				rectangle.setMap(map);

				function getRandomFloat(lim1, lim2) {
					return (Math.random() * (Math.max(lim1, lim2) - Math.min(lim1, lim2)) + Math.min(lim1, lim2)).toFixed(8)
				}
			}
		};
	};
});
