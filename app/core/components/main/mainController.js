define([
	'mainModule',
	// 'core/directives/mapDash/mapDash',
  'core/resources/driverResource',
  'core/resources/clientResource',
  'core/services/PusherCli',
  // 'core/factory/Driver'
], function(mainModule) {
	'use strict';

	mainModule.controller('mainController', mainController);

	function mainController($scope, $q, $timeout, $interval, $http, $filter,
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
          },
          clientTrail: {
            name: 'Huella de cliente',
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
      };
      /*mapbox*/

      this.getDrivers();
      this.getClients();

      PusherCli.client.subscribe('tako-channel');
      PusherCli.client.bind('new-driver', function(data) {
        $scope.$apply(_this.onNewDriver(data.driver));
      });
      PusherCli.client.bind('new-client', function(data) {
        $scope.$apply(_this.onNewClient(data.client));
      });

      PusherCli.client.bind('driver-location-changed', function(data) {
        $scope.$apply(_this.onDriverLocationChanged(data));
      }); 
      PusherCli.client.bind('client-location-changed', function(data) {
        $scope.$apply(_this.onClientLocationChanged(data));
      });
    };

    this.getDrivers = function() {
      // Obtenemos drivers
      driverResource.query(function(res) {
        _this.driverList = res;

        _this.driverList.forEach(function(driver) {
          _this.drawDriver(driver);
        });

        _this.updateNearest();
      });
    };

    this.getClients = function() {
      // Obtenemos clients
      clientResource.query(function(res) {
        _this.clientList = res;

        _this.clientList.forEach(function(client) {
          _this.drawClient(client);
        });

        _this.updateNearest();
      });
    };

    this.saveDriver = function(newDriver) {
      if(!angular.isObject(newDriver)
        || typeof newDriver.name !== 'string') {return;}

      var fd = new FormData();
      fd.append('name', newDriver.name);

      this.driverErrors = {};

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

    this.saveClient = function(newClient) {
      if(!angular.isObject(newClient)
        || typeof newClient.name !== 'string') {return;}

      var fd = new FormData();
      fd.append('name', newClient.name);

      this.clientErrors = {};

      this.savingClient = true;
      clientResource.save(fd, function(res) {
        delete _this.savingClient;
        newClient.name = '';

        // no agregamos hasta que pusher nos notifique
      }, function(err){
        delete _this.savingClient;

        if (angular.isObject(err.data) && err.status === 422) {
          _this.clientErrors = err.data;
        }
      });
    };

    this.drawDriver = function(driver) {
      var driverIcon = {
        type: 'awesomeMarker',
        icon: 'taxi',
        markerColor: 'green'
      };

      _this.markers.push(angular.extend(driver, {
        icon: driverIcon,
        message: driver.name
      }));
      _this.addPath(driver);
    };

    this.onNewDriver = function(driver) {
      _this.driverList.push(driver);
      _this.drawDriver(driver);

      _this.updateNearest();
    };

    this.drawClient = function(client) {
      var clientIcon = {
        type: 'awesomeMarker',
        icon: 'male',
        markerColor: 'purple'
      };

      _this.markers.push(angular.extend(client, {
        icon: clientIcon,
        message: client.name,
        // draggable: true
      }));
      _this.addPath(client);
    };

    this.onNewClient = function(client) {
      _this.clientList.push(client);
      _this.drawClient(client);

      _this.updateNearest();
    };


    this.onDriverLocationChanged = function(data) {
      console.log(data);

      var updatedDriver = data.driver;
      var driver = $filter('filter')(_this.driverList, {id: updatedDriver.id});

      if(angular.isArray(driver) && driver[0]) {
        driver[0].lat = updatedDriver.lat;
        driver[0].lng = updatedDriver.lng;

        _this.updatePath(driver[0]);

        _this.updateNearest();
      }
    };

    this.onClientLocationChanged = function(data) {
      console.log(data);
      var updatedClient = data.client;
      var client = $filter('filter')(_this.clientList, {id: updatedClient.id});

      if(angular.isArray(client) && client[0]) {
        client[0].lat = updatedClient.lat;
        client[0].lng = updatedClient.lng;

        _this.updatePath(client[0]);

        _this.updateNearest();
      }
    };


    this.addPath = function(user) {
      var layer = user.role === 'DRIVER'
        ? 'driverTrail'
        : 'clientTrail';

      var color = user.role === 'DRIVER'
        ? '#00d1b2'
        : '#9977ff';

      this.paths[user.id] = {
        weight: 2,
        color: color,
        layer: layer,
        latlngs: [{lat: user.lat, lng: user.lng}],
      }
    };

    this.updatePath = function(user) {
      this.paths[user.id].latlngs.push({lat: user.lat, lng: user.lng});
    };

    this.updateNearest = function() {
      _this.driverList.forEach(function(driver) {
        delete driver.nearest;

        getNearest(driver)
        .then(function(nearest) {
          driver.nearest = nearest;

          return getDirections(driver, nearest);
        })
        .then(function(direction) {

          driver.distanceToNearest = direction.distance;
          driver.durationToNearest = direction.duration;

          _this.paths['nrst'+driver.id] = {
            weight: 2,
            color: '#ccc',
            layer: 'nearest',
            latlngs: direction.paths,
            message: 'Cliente mas cercano de ' + driver.name
          }
        });
      });
    };

    function getNearest(driver) {
      return $q(function(resolve, reject) {
        var nearest = null;
        var minDist = null;

        _this.clientList.forEach(function(_client) {
          var dist = getDistance(driver.lat, driver.lng, _client.lat, _client.lng);

          if(minDist === null) {
            minDist = dist;
            nearest = _client;
            return;
          }

          if(dist < minDist) {
            minDist = dist;
            nearest = _client;
          }
        });

        if(nearest === null) {
          return reject();
        }

        return resolve(nearest);
      });
    };

    function getDirections(origin, destination) {
      return $q(function(resolve, reject) {
        var query = origin.lng+','+origin.lat+';'+destination.lng+','+destination.lat;

        $http({
          method: 'get',
          url: 'https://api.mapbox.com/directions/v5/mapbox/walking/'+query+'.json',
          params: {
            access_token: MAPBOX_API_KEY,
            steps: true
          },
        })
        .then(function(res) {
          if(angular.isObject(res.data)
            && res.data.code === 'Ok' 
            && res.data.routes
            && res.data.routes[0]) {

            var route = res.data.routes[0];
            // la ruta tambien devuelve:
            // .distance en metros
            // .duration en segundos

            var paths = [];

            route.legs[0].steps.forEach(function(_step) {
              _step.intersections.forEach(function(_path) {
                return paths.push({
                  lng: _path.location[0],
                  lat: _path.location[1],
                });
              });
            });
            // console.log(paths);

            return resolve({
              duration: route.duration,
              distance: route.distance,
              paths: paths
            });
          }

          return reject();
        });
      });
    };


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
