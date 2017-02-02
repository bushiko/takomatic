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

				var directionsService =  new google.maps.DirectionsService();


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
				var markerPos = getRandomCoords();
				var randomMrk = new google.maps.Marker({
			    	position: markerPos,
			    	label: 'Random 1',
			    	map: map
			  	});

				var markerDestination = getRandomCoords();
				var request = {
					origin: markerPos,
					destination: markerDestination,
					travelMode: google.maps.TravelMode.WALKING
				};
				directionsService.route(request, function(result, status) {
					console.log(result);

					if (status == google.maps.DirectionsStatus.OK) {
						var paths = [];
						result.routes[0].legs[0].steps.forEach(function(_step) {
							_step.path.forEach(function(_path) {
								return paths.push(_path);
							});
						});

						autoRefresh(paths);
						/*var paths = result.routes[0].legs[0].steps[0].path;
						autoRefresh(paths);*/
					}
				});


				var rectangle = new google.maps.Rectangle({
			    	bounds: mapBounds,
			    	editable: false,
			    	draggable: false
			  	});
				rectangle.setMap(map);


				function autoRefresh(pathCoords) {
					var i, route;
					
					route = new google.maps.Polyline({
						path: [],
						geodesic : true,
						strokeColor: '#FF0000',
						strokeOpacity: 1.0,
						strokeWeight: 2,
						editable: false,
						map:map
					});
					
					for (i = 0; i < pathCoords.length; i++) {
						setTimeout(function (coords)
						{
							route.getPath().push(coords);
							randomMrk.setPosition(coords);
						}, 200 * i, pathCoords[i]);
					}
				}



				function getRandomCoords() {
					return new google.maps.LatLng(
			    		getRandomFloat(BOUNDS.sw.lat, BOUNDS.ne.lat), 
			    		getRandomFloat(BOUNDS.sw.lng, BOUNDS.ne.lng));
				}

				function getRandomFloat(lim1, lim2) {
					return (Math.random() * (Math.max(lim1, lim2) - Math.min(lim1, lim2)) + Math.min(lim1, lim2)).toFixed(8)
				}
			}
		};
	};
});
