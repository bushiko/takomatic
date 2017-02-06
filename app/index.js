require.config({
  paths: {
    'angular': '../bower_components/angular/angular.min',
    'angularAMD': '../bower_components/angularAMD/angularAMD.min',
    'ui-router': '../bower_components/angular-ui-router/release/angular-ui-router.min',
    'text': '../bower_components/requirejs-text/text',
    'json': '../bower_components/requirejs-plugins/src/json',
    'angular-resource': '../bower_components/angular-resource/angular-resource.min',
    'pusher': '../bower_components/pusher-js/dist/web/pusher',
    'ui-leaflet': '../bower_components/ui-leaflet/dist/ui-leaflet.min',
    'leaflet': '../bower_components/leaflet/dist/leaflet',
    'leaflet-awesome-markers': '../bower_components/Leaflet.awesome-markers/dist/leaflet.awesome-markers.min',
    'angular-simple-logger': '../bower_components/angular-simple-logger/dist/angular-simple-logger.min',
    'mainModule': 'core/mainModule'
  },
  shim: {
    'angular': {
      exports: 'angular'
    },
    'angularAMD': ['angular'],
    'ui-router': ['angular'],
    'angular-resource': ['angular'],
    'ui-leaflet': ['angular', 'leaflet', 'angular-simple-logger', 'leaflet-awesome-markers'],
    'angular-simple-logger': ['angular'],
    'leaflet-awesome-markers': ['leaflet'],
  },
  deps: ['mainModule']
});
