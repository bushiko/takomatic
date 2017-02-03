define([
	'mainModule',
	// 'core/directives/mapDash/mapDash',
  'google-maps',
  'core/resources/driverResource',
  'core/resources/clientResource',
], function(mainModule) {
	'use strict';

	mainModule.controller('mainController', mainController);

	function mainController($scope, NgMap, driverResource, clientResource) {
		var _this = this;

    this.init = function() {
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

    	this.markers = [{
  			position:getRandomCoords(BOUNDS),
  			label: 'random1'
  		}, {
  			position: getRandomCoords(BOUNDS),
  			label: 'random2'
  		}];

  		// $interval(function() {
  		// 	_this.markers[0].position = getRandomCoords(BOUNDS);
  		// }, 500);

      NgMap.getMap().then(function(map) {
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

        var rectangle = new google.maps.Rectangle({
            bounds: mapBounds,
            editable: false,
            draggable: false
          });
        rectangle.setMap(map);
      });

      // Obtenemos drivers
      driverResource.query(function(res) {
      	console.log(res);
      });

      // Obtenemos clients
      clientResource.query(function(res) {
      	console.log(res);
      });
    };


    // returns a formated string '[lat, lng]'
    function getRandomCoords(bounds) {
    	var randLat = getRandomFloat(bounds.sw.lat, bounds.ne.lat);
    	var randLng = getRandomFloat(bounds.sw.lng, bounds.ne.lng)
			return '['+randLat+', '+randLng+']';
		}

		function getRandomFloat(lim1, lim2) {
			return (Math.random() * (Math.max(lim1, lim2) - Math.min(lim1, lim2)) + Math.min(lim1, lim2)).toFixed(8);
		}

    this.init();
	};
});
