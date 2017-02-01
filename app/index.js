require.config({
  paths: {
    'angular': '../bower_components/angular/angular.min',
    'angularAMD': '../bower_components/angularAMD/angularAMD.min',
    'ui-router': '../bower_components/angular-ui-router/release/angular-ui-router.min',
    'mainModule': 'core/mainModule'
  },
  shim: {
    'angular': {
      exports: 'angular'
    },
    'angularAMD': ['angular'],
    'ui-router': ['angular'],
  },
  deps: ['mainModule']
});
