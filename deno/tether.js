// This is the JavaScript implementation of Caffeine's "Tether" remote
// communication protocol, used when running Caffeine as a Web Worker
// in a browser.
//
// You can post messages to Caffeine with the worker's
// postMessage() function. Caffeine responds with message
// events.
//
// Each side speaking the protocol uses a special "tether" object to
// coordinate communication. You can send messages containing simple
// JSON objects that specify a method in the other side's tether
// object to invoke, or containing a more complex format which lets
// you send messages to any object on the other side.
//
// The browser is the first side to speak, by exposing its tether
// object to Caffeine. Caffeine responds by exposing its local
// counterpart tether to the browser. Expose your tether by
// evaluating:
//
// caffeine.tether.push(caffeine.tether)
//
// You can send messages to Caffeine's tether object like so:
//
// ***
//
// browserTether.sendMessage(
//   workerTether,
//   'echo:',
//   [3])
//
// ***
// 
// Caffeine responds with messages sent via postMessage(). See
// /js/squeakjs/tether/handler.js for the handler to use for them.

globalThis.caffeine = []

caffeine.specialVariables = new Map()
caffeine.instructionsBase = 1879048192
caffeine.otherMarkerBase = 1610612737
caffeine.smallIntegerTagBase = 1073741824
caffeine.classTagsBase = 536870912
caffeine.classes = new Map()
caffeine.tags = new Map()

caffeine.tags.set('trueTag', 536870913)
caffeine.tags.set('falseTag', 536870914)
caffeine.tags.set('nilTag', 536870915)
caffeine.tags.set('stringTag', 536870917)
caffeine.tags.set('symbolTag', 536870916)
caffeine.tags.set('arrayTag', 536870920)
caffeine.tags.set('byteArrayTag', 536870939)
caffeine.tags.set('tetherTag', 536870919)
caffeine.tags.set('uuidTag', 536870929)
caffeine.tags.set('answerTag', 536870941)

caffeine.specialVariables.set(caffeine.tags.get('trueTag'), true)
caffeine.specialVariables.set(caffeine.tags.get('falseTag'), false)
caffeine.specialVariables.set(caffeine.tags.get('nilTag'), null)

caffeine.tethers = new Map()

async function runCommand(command) {
    const process = Deno.run({
	cmd: ['bash'],
	stdout: 'piped',
	stdin: 'piped'}),

	  encoder = new TextEncoder(),
	  decoder = new TextDecoder()

    await process.stdin.write(encoder.encode(command))
    await process.stdin.close()
    const output = await process.output()
    process.close()
    console.log(decoder.decode(output))}

const equals = (a, b) => a instanceof caffeine.UUID && b instanceof caffeine.UUID && a.equals(b)

caffeine.Portal = class {constructor(websocket) {
    this.websocket = websocket
    
    this.initializeOutgoingMessage = () => {
	this.outgoingMessage = []
	this.outgoingPosition = 0}

    this.setOutgoingMessage = (message) => {
	this.outgoingMessage = message
	this.outgoingPosition = message.length - 1}
    
    this.setIncomingMessage = (message) => {
	this.incomingMessage = message
	this.incomingPosition = 0}
    
    this.send = () => {
	if (this.websocket) websocket.send(new Uint8Array(this.outgoingMessage))
	else caffeine.worker.postMessage(this.outgoingMessage)

	this.initializeOutgoingMessage()}
    
    this.startMessage = () => {this.initializeOutgoingMessage}
    
    this.nextByte = () => {
	return this.incomingMessage[this.incomingPosition++]}

    this.nextCharacter = () => {
	return String.fromCharCode(this.nextByte())}
    
    this.peekWord = () => {
	let word = 0,
	    shift = 24

	for (let i = this.incomingPosition; i < (this.incomingPosition + 4); i++) {
	    try {word = word + (this.incomingMessage[i] << shift)}
	    catch (exception) {debugger}
	    
	    shift -= 8}

	return word}

    this.nextWord = () => {
	let word = this.peekWord()
	this.incomingPosition += 4
	
	return word}

    this.nextBytePut = (byte) => {this.outgoingMessage[this.outgoingPosition++] = byte}

    this.nextWordPut = (word) => {
	this.nextBytePut(word >> 24)
	this.nextBytePut((word >> 16) & 255)
	this.nextBytePut((word >> 8) & 255)
	this.nextBytePut(word & 255)}

    this.initializeOutgoingMessage()}}

caffeine.OtherMarker = class {constructor(object, tether) {
    this.object = object
    this.exposureHash = ((Array.from(caffeine.tethers).filter(
	([key, value]) => {
	    if (value == object) {return true}
	    else return false}))[0][1]).exposureHash

    this.storeOnTether = (tether) => {
	tether.nextWordPut(this.exposureHash + caffeine.otherMarkerBase)}}}

caffeine.Tether = class {constructor(websocket) {
    this.portal = new caffeine.Portal(websocket)
    this.exposedObjects = new Map()
    this.outgoingMessages = new Map()

    this.worker = () => {
	return caffeine.tethers.get('worker')}

    this.handleEventFrom = async function (fromTether) {
	// Relay the next incoming message, answer, or exception marker.

	let toTether,
	    tag = fromTether.nextWord(),
	    exchangeID = fromTether.next()
	
	if (tag == caffeine.tags.get('tetherTag')) {
	    // message

	    var receiverExposureHash = fromTether.nextWord(),
		selector = '',
		matches

	    // Skip MessageTag and SymbolTag.
	    fromTether.nextWord()
	    fromTether.nextWord()

	    let size = fromTether.nextWord()
	    
	    for (var i = 0; i < size; i++) {
		selector += String.fromCodePoint(fromTether.nextByte())}
	    
	    matches = Array.from(caffeine.tethers).filter(
		([key, value]) => {
		    if (value.exposureHash == receiverExposureHash) return true
		    else return false})

	    if (matches.length == 0) {
		if (fromTether == this.worker())
		    toTether = (Array.from(caffeine.tethers))[1][1]
		else
		    toTether = this.worker()}
	    else toTether = matches[0][1]

	    if (toTether == this.worker()) {
		switch (selector) {
		case 'waitForHeartbeatFrom:':
		    // During this debugging phase, discard these sends.
		    break

		case 'terminateWorker':
		    console.log('terminating upon request')
		    debugger
		    caffeine.worker.terminate()
		    Deno.exit()
		    break

		case 'evaluate:':
		    // Skip ArrayTag, the size of the array, and StringTag.
		    fromTether.nextWord()
		    fromTether.nextWord()
		    fromTether.nextWord()

		    let length = fromTether.nextWord(),
			source = '',
			result = ''
		    
		    for (i = 0; i < length; i++) source += fromTether.nextCharacter()

		    try {result = JSON.stringify(eval(source))}
		    catch (error) {
			console.log('Ignoring error when using eval() with worker-submitted code.')
			debugger
			result = 'error: ' + error.toString()}

		    if (result == '{}') result = JSON.stringify('')
		    
		    toTether.portal.initializeOutgoingMessage()
		    toTether.portal.nextWordPut(caffeine.tags.get('answerTag'))
		    exchangeID.storeOnTether(toTether)
		    toTether.portal.nextWordPut(caffeine.tags.get('stringTag'))
		    toTether.portal.nextWordPut(result.length)

		    for (i = 0; i < result.length; i++) toTether.portal.nextBytePut(result.codePointAt(i))
		    fromTether.outgoingMessages.set(exchangeID, selector)
		    fromTether.portal.send()
		    return

		default:
		    break}}

	    console.log('tether ' + fromTether.exposureHash + ' sends ' + selector + ' to tether ' + toTether.exposureHash)
	    fromTether.outgoingMessages.set(exchangeID, selector)}

	else {
	    // answer or exception marker
	    var hit = 0,
		answer
	    
	    caffeine.tethers.values().forEach(tether => {
		tether.outgoingMessages.keys().forEach(key => {
		    if (key.equals(exchangeID)) {
			hit = 1
			
			// resolve the promise
			toTether = tether
			const func = tether.outgoingMessages.get(key)
			answer = fromTether.portal.incomingMessage.slice(28)
			if (typeof(func) == "function") func(answer)
			tether.outgoingMessages.delete(key)}})})

	    if (!hit) throw new Error("received unexpected remote message answer")
	    if ((!fromTether) || (!toTether)) debugger
	    console.log('tether ' + fromTether.exposureHash + ' answers ' + answer + ' to tether ' + toTether.exposureHash)}

	toTether.portal.setOutgoingMessage(fromTether.portal.incomingMessage)
	toTether.portal.send()}
    
    this.setIncomingMessage = (message) => {this.portal.setIncomingMessage(message)}
    
    this.nextByte = () => {return this.portal.nextByte()}

    this.nextCharacter = () => {return this.portal.nextCharacter()}

    this.nextBytePut = (byte) => {this.portal.nextBytePut(byte)}
    
    this.peekWord = () => {return this.portal.peekWord()}

    this.nextWord = () => {return this.portal.nextWord()}

    this.nextWordPut = (word) => {
	this.portal.nextWordPut(word)}
    
    this.storeOnTether = (sendingTether) => {
	if ((this === sendingTether) && (this !== caffeine.tethers.get('worker'))) sendingTether.nextWordPut(this.exposureHash)
	else (new caffeine.OtherMarker(this, sendingTether)).storeOnTether(sendingTether)}

    this.storeArray = (array) => {
	this.nextWordPut(caffeine.tags.get('arrayTag'))
	this.nextWordPut(array.length)
	array.forEach(each => {this.store(each)})}
    
    this.storeByteArray = (array) => {
	this.nextWordPut(caffeine.tags.get('byteArrayTag'))
	this.nextWordPut(array.length)
	this.nextBytesPut(array)}
    
    this.storeSymbol = (symbol) => {
	this.nextWordPut(caffeine.tags.get('symbolTag'))
	this.nextWordPut(symbol.length)
	this.nextBytesPut([...symbol].map(c => c.codePointAt(0)))}
    
    this.store = (object) => {
	if (typeof(object) == "number") {
	    this.nextWordPut(object + caffeine.smallIntegerTagBase)}

	else if (typeof(object) == "string") {
	    this.nextWordPut(caffeine.tags.get('stringTag'))
	    this.nextWordPut(object.length)
	    this.nextBytesPut([...object].map(c => c.codePointAt(0)))}

	else if (object.constructor === Uint8Array) {this.storeByteArray(object)}
	else if (object.constructor === caffeine.Tether) {object.storeOnTether(this)}
	else if (object.constructor === caffeine.UUID) {object.storeOnTether(this)}
	else {this.storeArray(object)}}

    this.send = (block) => {
	this.portal.startMessage()
	block()
	this.portal.send()}

    this.nextBytesPut = (array) => {
	array.forEach(each => {this.nextBytePut(each)})}
    
    this.sendMessage = (receiver, selector, args) => {
	return new Promise((resolve, reject) => {
	    var uuid = new caffeine.UUID()

	    this.outgoingMessages.set(uuid, resolve)

	    this.send(() => {
		this.nextBytesPut([32, 0, 0, 7])                     // a message-send
		this.store(uuid)                                     // message-send UUID
		this.store(receiver)                                 // receiver
		this.nextBytesPut([32, 0, 0, 33])                    // a Message
		this.storeSymbol(selector)                           // selector
		this.storeArray(args)})})}                           // arguments

    this.push = (object) => {
	this.send(() => {this.store(object)})}

    this.expose = (object) => {
	this.exposedObjects.set(object.exposureHash, object)}
    
    this.next = () => {
	let tag = this.portal.nextWord(),
	    object

	object = caffeine.specialVariables[tag]

	if (object) {return object}
	else {
	    if (tag >= caffeine.instructionsBase) {
		console.log('instruction encountered when object expected')}
	    else {
		if (tag >= caffeine.otherMarkerBase) {
		    return this.exposedObjects.get(tag - caffeine.otherMarkerBase)}
		else {
		    if (tag >= caffeine.smallIntegerTagBase) {return tag - caffeine.smallIntegerTagBase}
		    else {
			if (tag >= caffeine.classTagsBase) {
			    let theClass = caffeine.classes.get(tag)
			    if (!(theClass)) {
				console.log('class not found')
				debugger}
			    else {return new theClass(this)}}
			else {
			    console.log('Exposing JavaScript objects remotely is not supported yet.')
			    debugger}}}}}}}}

caffeine.UUID = class {constructor (tether) {
    this.bytes = crypto.getRandomValues(new Uint8Array(16))

    this.readFromTether = (tether) => {
	// Skip size word; we know the size is 16 bytes.
	for (let i = 0; i < 4; i++) {tether.nextByte()}
	
	for (let i = 0; i < 16; i++) {
	    this.bytes[i] = tether.nextByte()}}

    this.storeOnTether = (tether) => {
	tether.nextWordPut(caffeine.tags.get('uuidTag'))
	tether.nextWordPut(16)

	for (let i = 0; i < 16; i++) {
	    tether.nextBytePut(this.bytes[i])}}

    this.equals = (id) => {
	for (let i = 0; i < 16; i++) {
	    if (this.bytes[i] != id.bytes[i]) return false}
	
	return true}
    
    if (tether) {this.readFromTether(tether)}}}

caffeine.String = class {constructor (tether) {
    this.readFromTether = (tether) => {
	var size = 0

	for (let i = 24; i >= 0; i -= 8) {size += (tether.nextByte() << i)}
	this.string = new Uint8Array(size)
	for (let i = 0; i < size; i++) {this.string[i] = tether.nextByte()}
	this.string = String.fromCharCode(...this.string)}

    if (tether) {this.readFromTether(tether)}}}

caffeine.classes.set(caffeine.tags.get('tetherTag'), caffeine.Tether)
caffeine.classes.set(caffeine.tags.get('uuidTag'), caffeine.UUID)
caffeine.classes.set(caffeine.tags.get('stringTag'), caffeine.String)
