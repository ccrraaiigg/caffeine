// Provide a bridge for Tether and MCP traffic.

import {serve} from "https://deno.land/std/http/mod.ts"
import {delay} from "https://deno.land/std/async/mod.ts"

// try {const tether = await import("https://caffeine.js.org/deno/tether.js")}
try {const tether = await import("./tether.js")}
catch(e) {console.log('=== '+e.message)}

function response(id, content) {
  return {...{jsonrpc: "2.0", id: id}, ...content}}

function result(id, content) {
  return response(id, {result: content})}

function output(id, content) {
  return response(id, {result: {content: [{type: "text", text: content.text}]}})}

function error(id, content) {
  return response(id, {error: content})}

// One record per session (or per browser tab if you skip sessions):
//   id           – UUID or server-generated session id
//   stream       – ReadableStreamDefaultController
//   lastEventId  – monotonically increasing cursor (optional, for resumes)
const postSessions = new Map();      // key: sessionId → { stream, lastEventId }
const getSessions = new Map();      // key: sessionId → { stream, lastEventId }

function startEventStream(registry, sessionId) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      registry.set(
	sessionId,
	{
	  stream: controller,
	  lastEventId: 0})

      // heartbeat every 20 s to keep proxies from timing out
      try {const hb = setInterval(() => {controller.enqueue(encoder.encode(': \n\n'))}, 20_000)}
      catch (e) {registry.delete(sessionId)}

      controller.onCancel = () => {
        clearInterval(hb)
        registry.delete(sessionId)}}})

  return new Response(
    stream,
    {
      headers: {
	'Content-Type': 'text/event-stream',
	'Cache-Control': 'no-cache',
	Connection: 'keep-alive'}})}

function sendOnStream(registry, sessionId, payload) {
  const entry = registry.get(sessionId)
  if (!entry) return // client disconnected

  entry.lastEventId += 1
  const data =
    `id: ${entry.lastEventId}\n` +
    `data: ${JSON.stringify(payload)}\n\n`

  entry.stream.enqueue(new TextEncoder().encode(data))}

function notifyAll(obj) {
  for (const sid of getSessions.keys()) {sendOnStream(getSessions, sid, obj)}}

caffeine.worker = (
  new Worker(
    new URL(
      // "https://caffeine.js.org/deno/squeak-worker.js",
      "./squeak-worker.js",
      import.meta.url).href,
    {type: "module"}))

caffeine.worker.onmessage = async (message, websocket) => {
  let tethersKey = websocket,
      data = message.data,
      tether = caffeine.tethers.get(websocket)

  if (data.pixels) {
    // pixels from the worker virtual machine
    if (caffeine.tethers.size > 1) {
      var association = Array.from(caffeine.tethers)[1]

      if (association) {
	var target = association[1]

	caffeine.tethers.get('worker').sendMessage(
	  target,
	  'render:originX:originY:extentX:extentY:',
	  [data.pixels, data.rectangle.left, data.rectangle.top, data.rectangle.right, data.rectangle.bottom])}}}
	  
  else {
    if (data.method) {
      // an MCP message from the worker
      console.log("pushing ", data)
      notifyAll(data)}

    else {
      try {data = JSON.parse(data)}
      catch (exception) {debugger}

      if (data.payload) {
	// binary Tether messages
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
	  tether.exposureHash = tag - caffeine.otherMarkerBase
	  tether.expose(tether)
	  if (tether === caffeine.tethers.get('worker')) tether.push(tether)}
	else {tether.handleEventFrom(tether)}}}}}

async function callWorker(req) {
  return new Promise(
    (resolve) => {
      const id = Math.random().toString();

      const handler = (event) => {
	var data

//	console.log(event)
	
	if (!event.data.pixels) {
	  try {data = JSON.parse(event.data)}
	  catch (exception) {debugger}
	  
	  if (data.id === id) {
            caffeine.worker.removeEventListener("message", handler)
            resolve(data.result)}}}

      caffeine.worker.addEventListener("message", handler)

      // This will go to the remote message handler set up in
      // the image, in (HostPlatform class)>>startUp:.
      caffeine.worker.postMessage({id, req})})}

async function handleHttpRpc(msg) {
  const {id, method, params} = msg

  switch (method) {
  case "initialize":
    console.log("MCP: initialize")

    return result(id, {
      protocolVersion: "2025-03-26",
      capabilities: {
	tools: {listChanged: true},
	stream: true,
	sampling: {}},
      serverInfo: {
	name: "deno-mcp-js",
	version: "0.3.0"},
      instructions: "This MCP server has notifications to send. Please request an SSE stream with HTTP GET."})

  case "tools/list": {
    console.log("MCP: tools/list")
    const tools = await callWorker({action: "mcp/tools/list"})
    return result(id, {tools})}

  case "tools/call": {
    console.log("MCP: tools/call with " + params)
    
    const answer = await callWorker({
      action: "mcp/tools/call",
      data: params})

    return output(id, answer)}

  default:
    console.log("MCP: unknown: '" + method + "' with " + params)
    
    return error(
      id,
      -32601,
      `Unknown method: ${method}`)}}
	
serve(
  async (request) => {
    const {pathname} = new URL(request.url)

    if (pathname === "/mcp") {
      if ((request.method === 'GET') && (request.headers.get('accept')?.includes('text/event-stream'))) {
	const sid = request.headers.get('Mcp-Session-Id') || crypto.randomUUID()
	return startEventStream(getSessions, sid)}

      if (request.method === 'POST') {
	//	const acceptSSE = request.headers.get('accept')?.includes('text/event-stream')
	var acceptSSE = 0
	const bodyText = await request.text()
	let msg
	try {msg = JSON.parse(bodyText)} catch { /* 400 logic omitted */ }

	const rpcResult = await handleHttpRpc(msg)

	// A.  simple JSON response
	if (!acceptSSE) {
	  return new Response(
	    JSON.stringify(rpcResult),
	    {
              headers: {
		'Content-Type': 'application/json'}})}

	// B.  upgrade this response to SSE (or reuse existing)
	const sid = request.headers.get('Mcp-Session-Id') || crypto.randomUUID()
	const open = postSessions.get(sid)

	if (!open) {
	  const resp = startEventStream(postSessions, sid)

	  // queue result so the stream headers reach the client first
	  queueMicrotask(() => sendOnStream(postSessions, sid, rpcResult))
	  return resp}

	else {
	  sendOnStream(postSessions, sid, rpcResult)

	  // body is empty – we already answered via SSE
	  return new Response(null, {status: 202})}}

      return new Response('Not Found', {status: 404})}

    else if (request.headers.get("Upgrade") == "websocket") {
      const {socket: websocket, response} = Deno.upgradeWebSocket(request)
      websocket.onmessage = (message) => {caffeine.worker.onmessage(message, websocket)}
      websocket.onclose = () => {console.log('Tether websocket closed')}
      websocket.onerror = (error) => {console.log(error.message)}
      
      websocket.onopen = async (event) => {
	let tether = new caffeine.Tether(websocket),
	    workerTether = caffeine.tethers.get('worker')
	
	caffeine.tethers.set(websocket, tether)
	tether.expose(workerTether)
	tether.push(workerTether)}
      
      console.log('connected Tether websocket')
      return response}
    
    else {
      return new Response(
	"Not Found",
	{status: 404})}},
  
  {port: 10000})

// Wait for squeak-worker to start running.
await delay(1000)

caffeine.worker.postMessage(JSON.stringify({
  action: 'start',
  imageName: 'caffeine',
  appName: 'caffeine',

  // Webserver for providing object memory and sources ZIPs
  // proxy: 'https://caffeine.js.org/',
  proxy: 'http://192.168.1.92:8080/',

  parameters: {fibbly: 'wibbly'}}))
