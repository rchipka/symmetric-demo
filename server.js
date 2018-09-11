'use strict';

var fs         = require('fs'),
    esprima    = require('esprima'),
    bodyParser = require('body-parser'),
    express    = require('express'),
    symmetric  = require('../symmetric'),
    browserify = require('browserify'),
    server     = express(),
    script     = fs.readFileSync('./app/index.js').toString(),
    app        = esprima.parseScript(script);

browserify()
    .add('./client.js')
    .bundle()
    .pipe(fs.createWriteStream('./client.min.js'));

const io = require('socket.io')(3032);

io.on('connection', function (c) {
  console.log('got connection');

  c.emit('ast', app);

  c.on('state', function (s) {
    io.sockets.emit('state', s);
  });

  c.on('ast', function (c) {
    console.log('got AST', c);
    // io.sockets.emit('ast', c);
  });
});

server.use(express.static('./'));
server.use(bodyParser.json({limit: '50mb'}));
server.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true,
  parameterLimit: 50000
}));

server.get('/app', function (req, res) {
  res.send(app);
});

var entries = [];

server.post('/state', function (req, res) {
  var state, sent = false;

  console.log('------------ New Request ------------');

  res.set('Content-Type', 'application/json');

  if (req.body.state) {
    state = JSON.parse(req.body.state);
  }

  var client = new symmetric(function (state) {
    if (sent) {
      return;
    }

    res.send(JSON.stringify(state));
    sent = true;
  });
  
  if (state.prev) {
    state.prev = JSON.parse(state.prev);
    console.log('\nGOT PREV STATE');
    symmetric.State.log(state.prev);
    console.log('\n');
    client.merge(state.prev, client.local);
    delete state.prev;
  }

  console.log('entries', entries);


  client.sync(state);

  // console.log('\nLOCAL');
  // symmetric.State.log(client.state.local);
  // console.log('\n');

  // // console.log(state);
  // client.state.sync(state);
  // // console.log(JSON.stringify(app));

  client.eval({
    console: console,
    entries: entries,
    setInterval: function (callback) {
      callback();
    }
  }, app);
});

server.listen(3030, function () {
  console.log('listening');
});