define([
	'mainModule',
	// 'core/directives/mapDash/mapDash',
  'google-maps',
  'core/resources/driverResource',
  'core/resources/clientResource',
  'core/services/PusherCli',
  // 'core/factory/Driver'
], function(mainModule) {
	'use strict';

	mainModule.controller('mainController', mainController);

	function mainController($scope, $timeout, $interval, $http, $filter,
    driverResource, clientResource, PusherCli, MAPBOX_API_KEY, API_URL) {
		var _this = this;

    var mockPaths = [];


    this.init = function() {
      this.driverList = [];
      this.clientList = [];

      this.maxbounds = {};
      this.markers = [];
      this.paths = {};

      this.layers = {
        baselayers: {
          mapboxGlLayer: {
            name: 'mapbox',
            type: 'xyz',
            url: 'https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?access_token=' + MAPBOX_API_KEY,
          }
        },
        overlays: {
          nearest: {
            name: 'Cliente mas cercano',
            type: 'group',
            visible: true
          },
          driverTrail: {
            name: 'Huella de conductor',
            type: 'group',
            visible: true
          }
        }
      };

      $http.get(API_URL+'/bounds').then(function(res) {
        _this.maxbounds = {
          southWest: res.data.south_west,
          northEast: res.data.north_east
        };
      });

      /*mapbox*/
      this.defaults = {
        minZoom: 13,
        tileLayer: 'https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?access_token=' + MAPBOX_API_KEY
      };
      /*mapbox*/


  /*		$interval(function() {
        var coords = getRandomCoords(BOUNDS);
        console.log(coords);
  			$scope.markers[0].lat = coords.lat;
        $scope.markers[0].lng = coords.lng;
  		}, 500);*/


      this.getDrivers();
      this.getClients();

      PusherCli.client.subscribe('tako-channel');
      PusherCli.client.bind('new-driver', function(data) {
        console.log(data);

        $scope.$apply(function() {
          _this.driverList.push(data.driver);
          
          _this.markers.push(data.driver);
          _this.addPath(data.driver);
          _this.updateNearest();
        });
      });

      PusherCli.client.bind('driver-location-changed', function(data) {
        console.log(data);

        var updatedDriver = data.driver;
        var driver = $filter('filter')(_this.driverList, {id: updatedDriver.id});

        if(angular.isArray(driver) && driver[0]) {
          $scope.$apply(function() {
            driver[0].lat = updatedDriver.lat;
            driver[0].lng = updatedDriver.lng;

            _this.updatePath(driver[0]);

            _this.updateNearest();
          });
        }


      });
    };

    this.getDrivers = function() {
      // Obtenemos drivers
      driverResource.query(function(res) {
        _this.driverList = res;

        _this.driverList.forEach(function(driver) {
          _this.markers.push(driver);
          _this.addPath(driver);
        });

        _this.updateNearest();


         /* var mockOrigin = getRandomCoords(_this.maxbounds);
          var mockDest = getRandomCoords(_this.maxbounds);
          var query = mockOrigin.lng+','+mockOrigin.lat+';'+mockDest.lng+','+mockDest.lat;

          $http({
            method: 'get',
            url: 'https://api.mapbox.com/directions/v5/mapbox/walking/'+query+'.json',
            params: {
              access_token: MAPBOX_API_KEY,
              steps: true
            }
          }).then(function(res) {
              if(res.data.code === 'Ok') {
                // mock movement

                res.data.routes[0].legs[0].steps.forEach(function(_step) {
                  _step.intersections.forEach(function(_path) {
                    return mockPaths.push({
                      lng: _path.location[0],
                      lat: _path.location[1],
                      duration: (_step.duration / _step.intersections.length)
                    });
                  });
                });
                autoRefresh(0);
                // console.log(mockPaths);
                // mock movement
              }

              console.log(res.data);
            });
*/
        console.log(res);
      });
    };

    this.getClients = function() {
      // Obtenemos clients
      clientResource.query(function(res) {
        _this.clientList = res;
        console.log(res);
      });
    };

    this.saveDriver = function(newDriver) {
      if(!angular.isObject(newDriver)
        || typeof newDriver.name !== 'string') {return;}

      var fd = new FormData();
      fd.append('name', newDriver.name);

      this.savingDriver = true;
      driverResource.save(fd, function(res) {
        delete _this.savingDriver;
        newDriver.name = '';

        // no agregamos hasta que pusher nos notifique
      }, function(err){
        delete _this.savingDriver;

        if (angular.isObject(err.data) && err.status === 422) {
          _this.driverErrors = err.data;
        }
      });
    };


    this.addPath = function(driver) {
      this.paths[driver.id] = {
        weight: 2,
        color: '#00d1b2',
        layer: 'driverTrail',
        latlngs: [{lat: driver.lat, lng: driver.lng}],
      }
    };

    this.updatePath = function(driver) {
      this.paths[driver.id].latlngs.push({lat: driver.lat, lng: driver.lng});
    };

    this.updateNearest = function() {
      _this.driverList.forEach(function(driver) {
        var nearest = getNearest(driver);
        // console.log(nearest);

        if(nearest) {
          _this.paths['nrst'+driver.id] = {
            weight: 2,
            color: '#fff',
            layer: 'nearest',
            latlngs: [{lat: driver.lat, lng: driver.lng}, {lat: nearest.lat, lng: nearest.lng}],
          }
        }
      });
    };

    function getNearest(driver) {
      var nearest = null;
      var minDist = null;

      _this.driverList.forEach(function(_driver) {
        if(_driver.id === driver.id) { return; }

        var dist = getDistance(driver.lat, driver.lng, _driver.lat, _driver.lng);

        if(minDist === null) {
          minDist = dist;
          nearest = _driver;
          return;
        }

        if(dist < minDist) {
          minDist = dist;
          nearest = _driver;
        }
      });

      return nearest;
    }

    function getDistance(lat1,lon1,lat2,lon2) {
      var R = 6371; // Radius of the earth in km
      var dLat = deg2rad(lat2-lat1);  // deg2rad below
      var dLon = deg2rad(lon2-lon1); 
      var a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2)
        ; 
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      var d = R * c; // Distance in km
      return d;
    }

    function deg2rad(deg) {
      return deg * (Math.PI/180)
    }


    function getRandomCoords(bounds) {
      return {
        lat: getRandomFloat(bounds.southWest.lat, bounds.northEast.lat), 
        lng: getRandomFloat(bounds.southWest.lng, bounds.northEast.lng)
      };
    }


		function getRandomFloat(lim1, lim2) {
			return +((Math.random() * (Math.max(lim1, lim2) - Math.min(lim1, lim2)) + Math.min(lim1, lim2)).toFixed(8));
		}

/*
    function autoRefresh(idx) {

      $timeout(function() {
        var coords = mockPaths[idx]; 
        console.log(coords);
        _this.markers[0].lat = coords.lat;
        _this.markers[0].lng = coords.lng;

        _this.paths.mockP.latlngs.push(coords);

        if(mockPaths[idx+1]) {
          return autoRefresh(idx+1);
        }
      }, mockPaths[idx].duration);*/

/*
      for (i = 0; i < mockPaths.length; i++) {
        setTimeout(function (coords)
        {
          $scope.$apply(function() {
            // route.getPath().push(coords);
            _this.markers[0].lat = coords.lat;
            _this.markers[0].lng = coords.lng;

            _this.paths.mockP.latlngs.push(coords);
          });
         
        }, mockPaths[i].duration, mockPaths[i]);
      }
    }*/

    this.init();
	};
});
