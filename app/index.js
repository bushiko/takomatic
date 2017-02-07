require.config({
  paths: {
    'angular': '../bower_components/angular/angular.min',
    'angularAMD': '../bower_components/angularAMD/angularAMD.min',
    'ui-router': '../bower_components/angular-ui-router/release/angular-ui-router.min',
    'text': '../bower_components/requirejs-text/text',
    'angular-resource': '../bower_components/angular-resource/angular-resource.min',
    'pusher': '../bower_components/pusher-js/dist/web/pusher',
    'ui-leaflet': '../bower_components/ui-leaflet/dist/ui-leaflet.min',
    'leaflet': '../bower_components/leaflet/dist/leaflet',
    'leaflet-awesome-markers': '../bower_components/Leaflet.awesome-markers/dist/leaflet.awesome-markers.min',
    'angular-simple-logger': '../bower_components/angular-simple-logger/dist/angular-simple-logger.min',
    'angular-moment': '../bower_components/angular-moment/angular-moment',
    'moment': '../bower_components/moment/min/moment.min',
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
    'angular-moment': ['angular', 'moment']
  },
  deps: ['mainModule']
});
