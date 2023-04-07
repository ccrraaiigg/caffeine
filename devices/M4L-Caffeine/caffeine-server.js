// Relay a websocket-connected host's M4L LiveAPI invocation requests, and their results.

const max = require('max-api')
const http = require('http')
const ws = require('ws')

max.post('websocket server starting\n')

var client,
    server = (
  new ws.Server({server: http.createServer((request, response) => {max.post('websocket server ignoring non-websocket request\n')}).listen(9993)})
    .on(
      'connection',
      (websocket, request) => {
	max.post('client connected\n')
	client = websocket

	client
	  .on(
	    'message',
	    (message) => {
//	      max.post('client says "' + message + '"\n')
	      max.outlet(JSON.parse(message))})
	  .on(
	    'close',
	    (event) => {max.post('client disconnected\n')})}))

max.addHandler(
  'respond',
  (result) => {client.send(result)})

