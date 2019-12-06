// Provide public collaboration and history services, from a network
// of relay servers, each of which serves web-browser-based clients
// and has a headless Caffeine worker thread.
//
// Author: Craig Latta <craig@blackpagedigital.com>

require('./tether.js')
const {Worker} = require('worker_threads')
const caffeineWorker = new Worker('./squeak-worker.js')
global.caffeineWorker = caffeineWorker

var hostPrivateKey = '/etc/letsencrypt/live/frankfurt.demo.blackpagedigital.com/privkey.pem',
    hostCertificate = '/etc/letsencrypt/live/frankfurt.demo.blackpagedigital.com/fullchain.pem',
    serverPort = Math.floor(Math.random() * 16383) + 49151,
    clientPort = serverPort + 1,
    uuid = require('uuid/v1'),
    myCredential = uuid(),
    fs = require('fs'),
    path = require('path'),
    ws = require('ws'),
    http = require('http'),
    // https = require('https'),
    crypto = require('crypto'),
    clients = [],
    downstreamRelays = [],
    upstreamRelay = new Object,
    startTime = Date.now()


console.log('Welcome to Naiad, a Caffeine module system. Relay port: ' + serverPort + ', client port: ' + clientPort + '.')

if (process.argv[2]) {
  websocket = new ws('ws://' + process.argv[2])

  websocket
    .on(
      'open',
      () => {
	upstreamRelay.websocket = websocket
	websocket.send(JSON.stringify({action: 'hello'}))})
    .on(
      'error',
      (event) => {debugger})
    .on(
      'message',
      (message) => {
	var payload = JSON.parse(message)

	switch (payload.action) {

	case 'set credential':
	  myCredential = payload.credential
	  upstreamRelay.credential = payload.upstreamCredential
	  break

	default:
	  handleRelayAction(
	    JSON.parse(message),
	    upstreamRelay)}})}


function log(message) {
  console.log((Date.now() - startTime) + ' :: relay ' + myCredential + ' :: ' + message)}


function handleClientAction(action, arguments) {
  switch (action) {

  default:
    debugger
    break}}
    

function notifyAllClients(selector, arguments) {
  var liveClients = []

  log('Notifying all clients with selector "' + selector + '" and arguments: ' + arguments)
  
  clients.map((client) => {
    if (client.websocket.readyState == 3) {
      log('Client ' + client.credential + ' closed.')}
    else {
      liveClients.push(client)

      client.websocket.send(JSON.stringify({
	selector: selector,
	arguments: arguments}))}})

  clients = liveClients}


function sendToRelay(relay, payload) {
  payload.credential = myCredential
  relay.websocket.send(JSON.stringify(payload))}


function notifyAllRelays(payload) {
  var relays = []

  log('Notifying all relays with payload ' + JSON.stringify(payload) + '.')

  if (upstreamRelay.websocket) {
    if (upstreamRelay.websocket.readyState == 3) {
      log('Upstream relay closed!')}
    else {
      if (payload.instigator != upstreamRelay.credential) {relays.push(upstreamRelay)}}}

  downstreamRelays.map((relay) => {
    if (relay.websocket.readyState == 3) {
      log('Relay ' + relay.credential + ' closed.')}
    else {relays.push(relay)}})

  relays.map((relay) => {sendToRelay(relay, payload)})}


function notifyAllPeers(payload) {
  // notify all my clients
  notifyAllClients(payload.selector, payload.arguments)
    
  // notify all my relays, so they can notify their workers and clients
  if (!(payload.instigator)) {payload.instigator = myCredential}
  notifyAllRelays(payload)}


function handleWorkerAction(action, selector, arguments) {
  switch (action) {

  case 'worker started':
    caffeine.tether.push(caffeine.tether)
    break

  default:

    notifyAllPeers({
      action: action,
      selector: selector,
      arguments: arguments})

    break}}


function handleRelayAction(payload, relay) {
  if (payload.instigator != myCredential) {
    notifyAllPeers(payload)}}
  

function ensureDirectory(filePath) {
  var dirname = path.dirname(filePath)
  
  if (fs.existsSync(dirname)) {return true}
  ensureDirectory(dirname)
  fs.mkdirSync(dirname)}


function serveHTTPS(callback, port) {
  return https.createServer(
    {
      key: fs.readFileSync(hostPrivateKey),
      cert: fs.readFileSync(hostCertificate)},
    callback).listen(port)}


function serveHTTP(callback, port) {
  return http.createServer(callback).listen(port)}


function addRelay(websocket) {
  var relay = new Object

  downstreamRelays.push(relay)
  relay.credential = uuid()
  relay.websocket = websocket
  return relay}


function addClient(websocket) {
  var client = new Object

  client.websocket = websocket
  client.credential = uuid()
  clients.push(client)
  return client}


var relayServer = new ws.Server({
  server: serveHTTP(
    (request, response) => {
      log('Relay ' + request.method + ' request received.')

      response.setHeader('Access-Control-Allow-Origin', '*')
      response.setHeader('Access-Control-Allow-Headers', '')},
    serverPort)})

relayServer.on(
  'connection',
  (websocket, request) => {
    websocket
      .on(
	'message',
	(message) => {
	  var relay,
	      payload = JSON.parse(message),
	      credential = payload.credential

	  if (credential) {
	    relay = downstreamRelays.find((each) => {return each.credential == credential})}

	  if (!(relay)) {
	    // Inform the new relay of their credential, and my credential.
	    relay = addRelay(websocket)

	    log('Relay ' + relay.credential + ' connected.')

	    websocket.send(JSON.stringify({
	      action: 'set credential',
	      credential: relay.credential,
	      upstreamCredential: myCredential}))}
	  else {handleRelayAction(payload, relay)}})})

var server = new ws.Server({
  server: serveHTTP(
    (request, response) => {
      log('Client ' + request.method + ' request received.')
    
      response.setHeader('Access-Control-Allow-Origin', '*')
      response.setHeader('Access-Control-Allow-Headers', 'action, filename')

      if (request.method == 'POST') {
	var chunks = [],
	    filename = request.headers['filename']

	ensureDirectory(filename)
	
	request.on(
	  'data',
	  (chunk) => {chunks.push(chunk)})

	request.on(
	  'end',
	  () => {
	    fs.appendFile(
	      filename,
	      Buffer.concat(chunks),
	      () => {
		log('Wrote ' + filename)
		response.end()})})}
      else {
	if (request.method == 'GET') {
	  var filename = request.url.split('/')[1]
	  
	  if (request.headers['action'] == 'list') {
	    var nodes = [],
		dir = 'checkpoints/' + filename
	    
	    log('Listing ' + dir)

	    fs.readdirSync(dir).map((each) => {
	      var subdir = dir + '/' + each;

	      nodes.push({
		timepoint: each,
		serverID: myCredential,
		clientID: filename,
		base: fs.readdirSync(subdir).find((name) => {return name.match(/.*\.image/)}),
		description: fs.readFileSync(subdir + '/description')})})

	    response.write(JSON.stringify(nodes))}
	  else {
	    log('Restoring ' + filename)
	    response.write(fs.readFileSync(filename))}}

	response.end()}},
    clientPort)})

server.on(
  'connection',
  (websocket, request) => {
    console.log('Websocket opened.')

    websocket
      .on(
	'message',
	(message) => {
	  var client,
	      payload = JSON.parse(message),
	      credential = payload.credential

	  if (credential) {
	    client = clients.find((each) => {return each.credential == credential})}

	  if (!(client)) {
	    // Inform the new client of their credential.
	    client = addClient(websocket)
	    log('Client ' + client.credential + ' connected.')
	    websocket.send(JSON.stringify({credential: client.credential}))}
	  else {
	    // handling messages from clients
	    switch (payload.action) {

	    case 'message':
	      var arguments = [],
              innerArguments = []
	      
	      log('Client ' + client.credential + ' sends a Caffeine message with exchange ID ' + payload.id + ', selector "' + payload.selector + '" and arguments: ' + JSON.stringify(payload.arguments) + '.')

	      arguments.push(payload.selector)
	      payload.arguments.map((argument) => {innerArguments.push(argument)})
	      arguments.push(innerArguments)

	      caffeine.tether.sendMessage(
		{
                  'selector': 'performAsSharedTether:withArguments:',
		  'arguments': arguments},
		(result) => {
		  log('Caffeine answers: ' + JSON.stringify(result) + ' for exchange ID ' + payload.id + ' to client ' + client.credential + '.')

		  websocket.send(JSON.stringify({
		    id: payload.id,
		    result: result}))})
	      break

	    default:
	      handleClientAction(payload.action, payload.arguments)}}})})

caffeineWorker
  .on(
    'exit',
    (code) => {
      if (code !== 0) {log('Caffeine worker exited with code ' + code + '.')}})
  .on(
    'message',
    (message) => {
      let data = JSON.parse(message)

      if (data.result) {(caffeine.tether.callbacks[data.exposureHash])(data.result)}
      else {
	if (data.action) {handleWorkerAction(data.action, data.selector, data.arguments)}
	else {
	  if (!(data.payload)) {debugger}
	  else {
	    caffeine.tether.setIncomingMessage(data.payload);
	    let tag = caffeine.tether.nextWord()

	    if (!(global.caffeinePeer)) {global.caffeinePeer = tag}
	    else {
	      let constructor = caffeine.classes[tag]

	      if (!(constructor)) {debugger}
	      else {(new constructor()).handleEventFrom(caffeine.tether)}}}}}})

