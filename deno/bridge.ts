import {serve} from "https://deno.land/std/http/mod.ts" 

// Uncomment the following line for production.
try {const tether = await import("https://caffeine.js.org/deno/tether.js")}

// Uncomment the following line for development.
// try {const tether = await import("./tether.js")}
catch(e) {console.log('=== '+e.message)}

import {delay} from "https://deno.land/std/async/mod.ts"

caffeine.worker = (
  new Worker(
    new URL(
      // Uncomment the following line for production.
      "https://caffeine.js.org/deno/squeak-worker.js",

      // Uncomment the following line for development.
//      "./squeak-worker.js",
      import.meta.url).href,
    {type: "module"}))
  
caffeine.worker.onmessage = (message, websocket) => {
  let tethersKey = websocket,
      data = JSON.parse(message.data),
      tether = caffeine.tethers.get(websocket)

  if (!tethersKey) tethersKey = 'worker'
  
  if (!tether) {
    tether = caffeine.tethers.get(tethersKey)
    if (!tether) {
      if (websocket) {
	console.log('tether not registered at connection time?')
	debugger}
      else {
	// for the worker Caffeine session
	tether = new caffeine.Tether()
	caffeine.tethers.set(tethersKey, tether)}}}

  tether.setIncomingMessage(data.payload)
  let tag = tether.peekWord()

  if (tag >= caffeine.otherMarkerBase) {
    // This is the remote tether announcing its exposure hash.
    tether.remoteExposureHash = tag - caffeine.otherMarkerBase
    tether.exposedObjects.set(tether.remoteExposureHash, tether)
    if (tether === caffeine.tethers.get('worker')) tether.push(tether)}
  else {tether.handleEventFrom(tether)}}

async function requestHandler(request: Request) {
  if (request.headers.get("Upgrade") != "WebSocket") {
    return new Response(null, {status: 501})}

  const {socket: websocket, response} = Deno.upgradeWebSocket(request)
  websocket.onmessage = (message) => {caffeine.worker.onmessage(message, websocket)}
  websocket.onclose = () => {console.log('websocket closed')}
  websocket.onerror = (error) => {console.log(error.message)}
  
  websocket.onopen = async function (event) {
    let tether = new caffeine.Tether(websocket),
	workerTether = caffeine.tethers.get('worker')
    
    caffeine.tethers.set(websocket, tether)
    tether.exposedObjects.set(workerTether.remoteExposureHash, workerTether)
    tether.push(workerTether)}
  
  return response}

serve(requestHandler, {port: 8000})

// Wait for squeak-worker to start running.
await delay(1000)

caffeine.worker.postMessage(JSON.stringify({
  action: 'start',
  imageName: 'caffeine',
  appName: 'caffeine',
  // Uncomment the following line for production.
  proxy: 'https://caffeine.js.org/',

  // Uncomment the following line for development. You'll need to
  // check out the Caffeine repository from GitHub, and serve it with
  // a local webserver, so that http://localhost/memories has the
  // memory ZIPs.
//    proxy: 'http://192.168.1.66:8080/',
  proxy: 'http://localhost:8080/',
  parameters: {fibbly: 'wibbly'}}))
