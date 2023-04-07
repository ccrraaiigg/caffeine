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
// caffeine.tether.sendMessage(
//   {
//     'selector': 'echo:',
//     'arguments': [3]},
// 
//   (result) => {console.log(result)})
//
// ***
// 
// Caffeine responds with messages sent via postMessage(). See
// /js/squeakjs/tether/handler.js for the handler to use for them.

import {existsSync} from 'https://deno.land/std/fs/mod.ts'
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

caffeine.Portal = class {constructor(websocket) {
  this.websocket = websocket
  
  this.initializeOutgoingMessage = () => {
    this.outgoingMessage = []
    this.outgoingPosition = 0}

  this.setOutgoingMessage = (message) => {
    this.outgoingMessage = message}
  
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
      word = word + (this.incomingMessage[i] << shift)
      shift -= 8}

    return word}

  this.nextWord = () => {
    let word = this.peekWord()
    this.incomingPosition += 4
    
    return word}

  this.nextBytePut = (byte) => {this.outgoingMessage[this.outgoingPosition++] = byte}

  this.nextWordPut = (word) => {
    this.nextBytePut((word >> 24) & 255)
    this.nextBytePut((word >> 16) & 255)
    this.nextBytePut((word >> 8) & 255)
    this.nextBytePut(word & 255)}

  this.initializeOutgoingMessage()}}

caffeine.OtherMarker = class {constructor(object, tether) {
  this.object = object
  this.exposureHash = ((Array.from(caffeine.tethers).filter(
    ([key, value]) => {
      if (value == object) {return true}
      else return false}))[0][1]).remoteExposureHash

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
	nextWord = fromTether.nextWord(),
	exchangeID = fromTether.next(),
	receiverExposureHash = fromTether.nextWord(),
	selector = '',
	matches

    if (nextWord == caffeine.tags.get('tetherTag')) {
      // message

      // Skip MessageTag and SymbolTag.
      fromTether.nextWord()
      fromTether.nextWord()

      let size = fromTether.nextWord()
      
      for (var i = 0; i < size; i++) {
	selector += String.fromCodePoint(fromTether.nextByte())}
    
      matches = Array.from(caffeine.tethers).filter(
	([key, value]) => {
	  if (value.remoteExposureHash == receiverExposureHash) {return true}
	  else return false})

      if (matches.length == 0) {
	if (fromTether == caffeine.tethers.get('worker'))
	  toTether = (Array.from(caffeine.tethers))[1][1]
	else
	  toTether = caffeine.tethers.get('worker')}
      else toTether = matches[0][1]

      if (toTether == caffeine.tethers.get('worker')) {
	switch (selector) {

	case 'terminateWorker':
	  caffeine.worker.terminate()
	  Deno.exit()
	  break

	case 'waitForHeartbeat':
	  console.log('Bridge got heartbeat, responding...')
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
	  fromTether.outgoingMessages.set(JSON.stringify(exchangeID))
	  toTether.portal.send()
	  return

	default:
	  console.log('unhandled incoming remote message')
	  debugger
	  return}}
      
      fromTether.outgoingMessages.set(JSON.stringify(exchangeID))}
    else {
      // answer or exception marker
      toTether = (Array.from(caffeine.tethers).filter(
	([key, value]) => {
	  if (value.outgoingMessages.has(JSON.stringify(exchangeID))) {return true}
	  else return false}))[0][1]

      toTether.outgoingMessages.delete(exchangeID)}

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
    (new caffeine.OtherMarker(this, sendingTether)).storeOnTether(sendingTether)}
  
  this.store = (object) => {
    if (typeof(object) == "number") {
      this.nextWordPut(object + caffeine.smallIntegerTagBase)}
    else if (typeof(object) == "string") {
      this.nextWordPut(caffeine.tags.get('stringTag'))
      this.nextWordPut(object.length)
      for (let i = 0; i < object.length; i++) {this.nextBytePut(object.codePointAt(i))}}
    else {object.storeOnTether(this)}}

  this.send = (block) => {
    this.portal.startMessage()
    block()
    this.portal.send()}
  
  this.push = (object) => {
    this.send(() => {this.store(object)})}
  
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

caffeine.UUID = class {constructor(tether) {
  this.bytes = []

  // I already know the number of bytes to read is 16.
  for (let i = 0; i < 4; i++) {
    tether.nextByte()}
  
  for (let i = 0; i < 16; i++) {
    this.bytes[i] = tether.nextByte()}

  this.storeOnTether = (tether) => {
    tether.nextWordPut(caffeine.tags.get('uuidTag'))
    tether.nextWordPut(16)

    for (let i = 0; i < 16; i++) {
      tether.nextBytePut(this.bytes[i])}}}}

caffeine.classes.set(caffeine.tags.get('tetherTag'), caffeine.Tether)
caffeine.classes.set(caffeine.tags.get('uuidTag'), caffeine.UUID)

