// A bridge for Tether and MCP traffic.

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
    var payload = content

    if (typeof(payload) === 'object') payload = JSON.stringify(payload)
    
    return response(
	id,
	{
	    result: {
		content: [{
		    type: "text",
		    text: payload}],
		isError: false}})}

function error(id, content) {
    return response(id, {error: content})}

// One record per session:
// 
// - id: UUID or server-generated session id
// - stream: ReadableStreamDefaultController
// - lastEventId: monotonically increasing cursor (optional, for resumes)

const postSessions = new Map() // key: sessionId → { stream, lastEventId }
const getSessions = new Map()
const mcpServers = new Map() // key: endpoint -> tether
const FAILURE = -1337

function objectFromTetherEncodedJSON(bytes) {
    return JSON.parse(String.fromCharCode(...bytes.slice(8)))}

function keyAtValue(map, value) {
    for (let [key, val] of map) {
	if (val === value) {return key}}

    return undefined}
				     
function startEventStream(registry, sessionId) {
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
	start(controller) {
	    registry.set(
		sessionId,
		{
		    stream: controller,
		    lastEventId: 0})

	    // heartbeat every 20s to keep proxies from timing out
	    const hb = setInterval(() => {
		try {controller.enqueue(encoder.encode(': \n\n'))}
		catch (e) {registry.delete(sessionId)}}, 20_000)

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

		target.sendMessage(
		    target,
		    'render:originX:originY:extentX:extentY:',
		    [data.pixels,
		     data.rectangle.left,
		     data.rectangle.top,
		     data.rectangle.right,
		     data.rectangle.bottom])}}}
    
    else {
	try {data = JSON.parse(data)}
	catch (exception) {debugger}

	if (data.payload) {
	    // binary Tether objects
	    if (!tethersKey) tethersKey = 'worker'
	    
	    if (!tether) {
		// A headless system announces itself on startup,
		// causing the creation of the worker tether.
		//
		// Headful systems wait for the bridge to announce the
		// worker tether.

		tether = caffeine.tethers.get(tethersKey)

		if (!tether) {
		    // the worker tether (websocket tethers get created when
		    // the HTTP connection is made)
		    tether = new caffeine.Tether()
		    caffeine.tethers.set(tethersKey, tether)}}

	    tether.setIncomingMessage(data.payload)
	    let tag = tether.peekWord()

	    if (tag == caffeine.tags.get('stringTag')) {
		data = tether.next().string
		console.log('pushed from tether ' + tether.exposureHash + ': ' + data)
		data = JSON.parse(data)

		if (data.mcp) {
		    if (data.mcp.providing) {
			// The tethered system is now providing MCP service.
			mcpServers.set(data.mcp.endpoint, tether)
			console.log('tether ' + tether.exposureHash + ' is now providing MCP service at ' + data.mcp.endpoint)
		    }}

		else if (data.heartbeat) {
		    console.log('ack!')
		    websocket.send('ack!')}

		else {
		    // an MCP message initiated by a server, as opposed to
		    // being in response to a client AI model
		    console.log("pushing ", data)

		    // clumsy way of responding to a sole active HTTP
		    // client... This will have to be fixed in order
		    // to support multiple concurrent MCP servers.
		    notifyAll(data)}}

	    else if (tag >= caffeine.otherMarkerBase) {
		// The tether is announcing its exposure hash.
		tether.exposureHash = tag - caffeine.otherMarkerBase
		tether.expose(tether)
		if (tethersKey == 'worker') tether.push(tether)}
	    else {
		// message-send
		tether.handleEventFrom(tether)}}
	else {
	    // ignore
	}}}

async function forwardRequest(tether, request) {
    return tether.sendMessage(
	tether,
	'serviceExternalMessage:',
	[JSON.stringify(request)])}

async function handleHttpRpc(endpoint, msg) {
    const {id, method, params} = msg
    var tether = mcpServers.get(endpoint)
    
    console.log('MCP: received "' + method + '"')
    
    switch (method) {
    case "initialize":
	console.log("MCP: performing initialize")

	return result(id, {
	    protocolVersion: "2025-03-26",
	    capabilities: {
		tools: {listChanged: true},
		resources: {
		    subscribe: true,
		    listChanged: true},
		stream: true,
		sampling: {}},
	    serverInfo: {
		name: "deno-mcp-js",
		version: "0.3.0"},
	    instructions: "This MCP server has notifications to send. Please request an SSE stream with HTTP GET."})

    case "resources/list": {
	console.log("MCP: id " + id + ": performing resources/list")
	var resources = await forwardRequest(tether, {endpoint: endpoint, action: "resources/list"})
	return result(id, objectFromTetherEncodedJSON(resources))}

    case "resources/read": {
	console.log("MCP: id " + id + ": performing resources/read with " + JSON.stringify(params))
	
	const answer = await forwardRequest(tether, {
	    endpoint: endpoint,
	    action: "resources/read",
	    data: params})

	return result(id, objectFromTetherEncodedJSON(answer))}

    case "resources/subscribe": {
	console.log("MCP: id " + id + ": performing resources/subscribe with " + JSON.stringify(params))
	
	const answer = await forwardRequest(tether, {
	    endpoint: endpoint,
	    action: "resources/subscribe",
	    data: params})

	    return output(id, objectFromTetherEncodedJSON(answer))}
	
    case "tools/list": {
	console.log("MCP: id " + id + ": performing tools/list")
	var tools = await forwardRequest(tether, {endpoint: endpoint, action: "tools/list"})
	return result(id, objectFromTetherEncodedJSON(tools))}

    case "tools/call": {
	console.log("MCP: id " + id + ": performing tools/call with " + JSON.stringify(params))
	
	const answer = await forwardRequest(tether, {
	    endpoint: endpoint,
	    action: "tools/call",
	    data: params})

	return output(id, objectFromTetherEncodedJSON(answer))}

    default:
	console.log("MCP: id " + id + ": unknown method: '" + method+ "'")
	if (params) console.log("  with params: " + JSON.stringify(params))
	return FAILURE}}

serve(
    async (request) => {
	var endpoint = new URL(request.url).pathname

	if (mcpServers.get(endpoint)) {
	    if ((request.method === 'GET') && (request.headers.get('accept')?.includes('text/event-stream'))) {
		const sid = request.headers.get('Mcp-Session-Id') || crypto.randomUUID()
		return startEventStream(getSessions, sid)}

	    if (request.method === 'POST') {
		// const acceptSSE = request.headers.get('accept')?.includes('text/event-stream')
		var acceptSSE = 0
		const bodyText = await request.text()
		let msg
		try {msg = JSON.parse(bodyText)}
		catch {
		    // todo: 400 logic
		}

		const rpcResult = await handleHttpRpc(endpoint, msg)

		// simple JSON response
		if (!acceptSSE) {
		    if (rpcResult === FAILURE) {
			console.log('returning 202 response with empty body')
			return new Response(null, {status: 202})}
		    else {
			var stringy = JSON.stringify(rpcResult)
			console.log('responding with "' + stringy + '"')
			
			return new Response(
			    JSON.stringify(rpcResult),
			    {
				headers: {
				    'Content-Type': 'application/json'}})}}

		// Upgrade this response to SSE (or reuse existing).
		const sid = request.headers.get('Mcp-Session-Id') || crypto.randomUUID()
		const open = postSessions.get(sid)

		if (!open) {
		    const resp = startEventStream(postSessions, sid)

		    // Queue result so the stream headers reach the client first.
		    queueMicrotask(() => sendOnStream(postSessions, sid, rpcResult))
		    return resp}

		else {
		    sendOnStream(postSessions, sid, rpcResult)

		    // Body is empty – we already answered via SSE.
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
	    return new Response("Not Found", {status: 404})}},

    // Tailscale Funnel exposure is possible on ports 443, 8443, and 10000.
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
