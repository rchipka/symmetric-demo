'use strict';

window.$ = require('jquery');

var io = require('socket.io-client'),
    socket = io.connect('http://localhost:3032');

socket.on('connect', function () {
  console.log('connected');
});

var Symmetric = require('symmetric'),
    client = new Symmetric(function (localState) {
      // console.log('syncing', JSON.stringify(localState));
      socket.emit('state', localState);

      $.ajax('/state', {
        method: 'post',
        data: {
          state: JSON.stringify(localState)
        },
        success: function (remoteState) {
          client.local.prev = JSON.stringify(remoteState);

          client.sync(remoteState);
        },
        error: function () {
          client.sync({});
        }
      });
    });

$.ajax('/app', {
  success: function (data) {
    client.eval(window, data);
  }
});