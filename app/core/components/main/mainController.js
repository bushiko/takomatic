define([
	'mainModule',
	// 'core/directives/mapDash/mapDash',
  'core/resources/driverResource',
  'core/resources/clientResource',
  'core/services/PusherCli',
  'moment',
  // 'core/factory/Driver'
], function(mainModule) {
	'use strict';

	mainModule.controller('mainController', mainController);

	function mainController($scope, $q, $timeout, $interval, $http, $filter,
    driverResource, clientResource, PusherCli, MAPBOX_API_KEY, API_URL, moment) {
		var _this = this;

    var mockPaths = [];


    this.init = function() {
      this.driverList = [];
      this.clientList = [];

      this.maxbounds = {};
      this.markers = [];
      this.paths = {};

      this.simulationStatus = 0;

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

      $http.get(API_URL+'/settings').then(function(res) {
        _this.maxbounds = {
          southWest: {lat:0, lng: 0},
          northEast: {lat: 0, lng: 0}
        };

        res.data.forEach(function(setting) {
          switch(setting.key) {
            case 'SOUTH_WEST_BOUND_LAT':
              _this.maxbounds.southWest.lat = +setting.value;
              break;
            case 'SOUTH_WEST_BOUND_LNG':
              _this.maxbounds.southWest.lng = +setting.value;
              break;
            case 'NORTH_EAST_BOUND_LAT':
              _this.maxbounds.northEast.lat = +setting.value;
              break;
            case 'NORTH_EAST_BOUND_LNG':
              _this.maxbounds.northEast.lng = +setting.value;
              break;
            case 'SIMULATION_STATUS':
              _this.simulationStatus = +setting.value;
              break;
          }
        });
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

      PusherCli.client.bind('deleted-driver', function(data) {
        $scope.$apply(_this.onDriverDeleted(data.driverId));
      });
      PusherCli.client.bind('deleted-client', function(data) {
        $scope.$apply(_this.onClientDeleted(data.clientId));
      });   

      PusherCli.client.bind('simulation-status-changed', function(data) {
        $scope.$apply(function() {
          _this.simulationStatus = data.status;
        });
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

    this.deleteDriver = function(driver) {
      if(driver.isDeleting) { return; }

      driver.isDeleting = true;
      driverResource.delete({driver_id: driver.id}, function(res) {
        delete driver.deleteClient; 
      }, function(err) {
        delete driver.deleteClient;
      });
    };

    this.onDriverDeleted = function(driverId) {
      var driver = $filter('filter')(_this.driverList, {id: driverId});

      if(angular.isArray(driver) && driver[0]) {
        _this.undraw(driver[0]);
        var idx = _this.driverList.indexOf(driver[0]);
        _this.driverList.splice(idx, 1);
      }
    };
    
    this.onClientDeleted = function(clientId) {
      var client = $filter('filter')(_this.clientList, {id: clientId});

      if(angular.isArray(client) && client[0]) {
        _this.undraw(client[0]);
        var idx = _this.clientList.indexOf(client[0]);
        _this.clientList.splice(idx, 1);
      }
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

    this.deleteClient = function(client) {
      if(client.isDeleting) { return; }

      client.isDeleting = true;
      clientResource.delete({client_id: client.id}, function(res) {
        delete client.deleteClient;
      }, function(err) {
        delete client.deleteClient;
      });
    };

    this.drawDriver = function(driver) {
      var driverIcon = {
        type: 'awesomeMarker',
        icon: 'taxi',
        markerColor: 'green'
      };

      _this.markers.push(angular.extend(driver, {
        id: driver.id,
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

     this.onNewClient = function(client) {
      _this.clientList.push(client);
      _this.drawClient(client);

      _this.updateNearest();
    };

    this.drawClient = function(client) {
      var clientIcon = {
        type: 'awesomeMarker',
        icon: 'male',
        markerColor: 'purple'
      };

      _this.markers.push(angular.extend(client, {
        id: client.id,
        icon: clientIcon,
        message: client.name,
        // draggable: true
      }));
      _this.addPath(client);
    };

    this.undraw = function(user) {
      var marker = $filter('filter')(_this.markers, {id: user.id});
      if(marker && marker[0]) {
        var idx = _this.markers.indexOf(marker[0]);
        _this.markers.splice(idx, 1);
      }

      delete this.paths[user.id];

      // borrar la ruta del mas cercano
      var regexStr = 'nrst(\\d+)_'+user.id;
      var rgx = new RegExp(regexStr);
      var regexStr2 = 'nrst'+user.id+'_(\\d+)';
      var rgx2 = new RegExp(regexStr2);

      for(var key in _this.paths) {
        if(rgx.test(key) || rgx2.test(key)) {
          delete this.paths[key];
        }
      }
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
          // ya que esto se ejecuta asincrono
          // hay que revisar que driver y driver.nearest
          // existan
          var idxDriver = _this.driverList.indexOf(driver);
          var idxClient = _this.clientList.indexOf(driver.nearest);
          if(idxDriver === -1 || idxClient === -1) {
            return;
          }


          driver.distanceToNearest = direction.distance;
          driver.durationToNearest = moment.duration(direction.duration, 'seconds').humanize();

          _this.paths['nrst'+driver.id+'_'+driver.nearest.id] = {
            weight: 2,
            color: '#ccc',
            layer: 'nearest',
            latlngs: direction.paths,
            message: 'Cliente mas cercano de ' + driver.name
          };
        });
      });
    };

    this.startSimulation = function() {
      $http.get(API_URL + '/simulation/start');
    };

    this.stopSimulation = function() {
      $http.get(API_URL + '/simulation/stop');
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
