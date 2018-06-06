var osc = require('osc'),
    http = require('http'),
    WebSocket = require('ws'),
    express = require('express'),
    socketPort

// Create an Express server app
// and serve up a directory of static files.
var app = express(),
    server = app.listen(8081)

app.use('/', express.static(__dirname + '/static'))

// Listen for Web Socket requests.
var wss = new WebSocket.Server({
  server: server
})

// Listen for Web Socket connections.
wss.on('connection', function (socket) {
  socketPort = new osc.WebSocketPort({
    socket: socket,
    metadata: true
  })
  
  socketPort.on('message', function (oscMsg) {
    console.log('An OSC Message was received!', oscMsg)
  })
})

// Create an osc.js UDP Port listening on port 57121.
var udpPort = new osc.UDPPort({
  localAddress: '0.0.0.0',
  localPort: 57121,
  metadata: true
})

// Listen for incoming OSC messages.
udpPort.on(
  'message',
  function (oscMessage, info) {
    console.log('An OSC message just arrived', ':', oscMessage)
    if (socketPort) {
      console.log('Relaying OSC message to listener')
      socketPort.send(oscMessage)}})


// Listen for incoming OSC bundles.
udpPort.on('bundle', function (oscBundle, timeTag, info) {
    console.log('An OSC bundle just arrived for time tag', timeTag, ':', oscBundle)
    console.log('Remote info is: ', info)
})

// Open the socket.
udpPort.open()
 
 
// When the port is read, send an OSC message to, say, SuperCollider
udpPort.on('ready', function () {
    udpPort.send({
        address: '/s_new',
        args: [
            {
                type: 's',
                value: 'default'
            },
            {
                type: 'i',
                value: 100
            }
        ]
    }, '127.0.0.1', 57110)
})
