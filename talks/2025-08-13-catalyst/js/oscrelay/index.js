var osc = require('osc'),
    https = require('https'),
    ws = require('ws'),
    fs = require('fs'),
    socketPort,
    hostPrivateKey = '/etc/letsencrypt/live/amsterdam.demo.blackpagedigital.com/privkey.pem',
    hostCertificate = '/etc/letsencrypt/live/amsterdam.demo.blackpagedigital.com/fullchain.pem'

var wss = (
  new ws.Server({
    server: https.createServer(
      {
	key: fs.readFileSync(hostPrivateKey),
  	cert: fs.readFileSync(hostCertificate)},
      (request, response) => {console.log('WebSocket server ingoring non-WebSocket request.')}).listen(8081)}))

wss.on(
  'connection',
  (socket) => {
    console.log('Connected relay.')

    socketPort = new osc.WebSocketPort({
		   socket: socket,
		   metadata: true})
  
    socketPort.on(
      'message',
      (oscMsg) => {console.log('Received OSC message:', oscMsg, '.')})})

var udpPort = (
  new osc.UDPPort({
    localAddress: '0.0.0.0',
    localPort: 57121,
    metadata: true}))

udpPort.on(
  'message',
  (oscMessage, info) => {
    console.log('Received OSC message:', oscMessage)
    if (socketPort) {
      console.log('Relaying OSC message to listener.')
      socketPort.send(oscMessage)}})

udpPort.on(
  'bundle',
   (oscBundle, timeTag, info) => {
      console.log('Received OSC bundle for time tag', timeTag, ':', oscBundle, '.')
     console.log('Remote info is: ', info, '.')})

udpPort.on(
  'ready',
  () => {
    udpPort.send(
      {
        address: '/s_new',
        args: [
          {
            type: 's',
	    value: 'default'},
	  {
	    type: 'i',
	    value: 100}]},
      '127.0.0.1',
      57110)})

udpPort.open()
 
