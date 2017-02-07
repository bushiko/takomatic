# Takomatic
> tako = 蛸 = pulpo

Interfaz gráfica realizada con Angular.js, Require.js, Mapbox, Pusher y Bulma.io

## Dependencias

  - [Node.js](https://nodejs.org/)
  - [npm](https://www.npmjs.com/)

## Puesta en marcha

Instalar bower de manera global
```sh
npm install -g bower
```
Instalar dependencias y correr el servidor, por default correrá en el puerto 3000 
```sh
$ cd takomatic
$ npm install
$ bower install
$ npm start
```

## Configuración

Si por algún motivo, se desea cambiar la url en donde se encuentra el api, en el archivo app/core/mainModule.js se encuentra una constante con la definición
```sh
mainModule.constant('API_URL', 'http://localhost:8000');
```

En este mismo archivo se encuentra la definición de la llave de Mapbox
```sh
mainModule.constant('MAPBOX_API_KEY', 'pk.eyJ1IjoiYnVzaGlrbyIsImEiOiJjaXlxNWQ5b2QwMDA0MzNqeWF0cnJpZjZjIn0.E285dGJXFW58Qm6q-GdmIg');
```

Finalmente la configuración de Pusher se encuentra en app/core/services/PusherCli.js
```sh
var pusher = new Pusher('1b42b37e2ae014e4b9ac');
```
