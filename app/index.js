require.config({
  paths: {
    'angular': '../bower_components/angular/angular.min',
    'angularAMD': '../bower_components/angularAMD/angularAMD.min',
    'ui-router': '../bower_components/angular-ui-router/release/angular-ui-router.min',
    'google-maps': 'https://maps.google.com/maps/api/js?key=AIzaSyDIlyw3fC4QRIJaxf8O4_Usybp-30Onh8I&libraries=places',
    'text': '../bower_components/requirejs-text/text',
    'ng-map': '../bower_components/ngmap/build/scripts/ng-map.min',
    'angular-resource': '../bower_components/angular-resource/angular-resource.min',
    'pusher': '../bower_components/pusher-js/dist/web/pusher',
    'mainModule': 'core/mainModule'
  },
  shim: {
    'angular': {
      exports: 'angular'
    },
    'angularAMD': ['angular'],
    'ui-router': ['angular'],
    'ng-map': ['angular'],
    'angular-resource': ['angular'],
  },
  deps: ['mainModule']
});
