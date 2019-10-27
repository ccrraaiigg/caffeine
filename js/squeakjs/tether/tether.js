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
// You can send messages Caffeine's tether object like so:
//
// caffeine.tether.sendMessage(
//   {
//     'selector': 'echo:',
//     'arguments': [3]},
//   (result) => {console.log(result)})
//
// Caffeine responds with messages sent via postMessage(). See
// /js/squeakjs/tether/handler.js for the handler to use for them.

window.caffeine = []

caffeine.exposureHash = () => {return Math.floor(Math.random() * 268435455)}
caffeine.specialVariables = []
caffeine.instructionsBase = 1879048192
caffeine.otherMarkerBase = 1610612737
caffeine.smallIntegerTagBase = 1073741824
caffeine.classTagsBase = 536870912
caffeine.classes = []

caffeine.Portal = class {constructor() {
  this.initializeOutgoingMessage = () => {
    this.outgoingMessage = []
    this.outgoingPosition = 0}

  this.setIncomingMessage = (message) => {
    this.incomingMessage = message
    this.incomingPosition = 0}
  
  this.send = () => {
    window.caffeineWorker.postMessage(this.outgoingMessage)
    this.initializeOutgoingMessage()}
  
  this.startMessage = () => {this.initializeOutgoingMessage}
  
  this.nextByte = () => {
    return this.incomingMessage.charCodeAt(this.incomingPosition++)}
  
  this.nextWord = () => {
    let word = 0,
	shift = 24

    for (let i = this.incomingPosition; i < (this.incomingPosition + 4); i++) {
      word = word + (this.incomingMessage.charCodeAt(i) << shift)
      shift = shift - 8}

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
  this.exposureHash = tether.expose(this)

  this.storeOnTether = (tether) => {
    tether.nextWordPut(this.exposureHash + caffeine.otherMarkerBase)}}}

caffeine.Tether = class {constructor() {
  this.portal = new caffeine.Portal()
  this.exposedObjects = []
  this.callbacks = []

  this.sendMessage = (parameters, then) => {
    this.send(() => {
      let exposureHash = caffeine.exposureHash(),
	  stringified = JSON.stringify(parameters)
      
      this.nextWordPut(1337)
      this.nextWordPut(exposureHash)
      this.nextWordPut(stringified.length)

      this.callbacks[exposureHash] = then

      for (let i = 0; i < stringified.length; i++) {
	this.nextBytePut(stringified.charCodeAt(i))}})}
  
  this.ping = () => {
    return 1337}
  
  this.handleEventFrom = (tether) => {
    // Perform the next incoming message.

    let parameters = [],
	numberOfElements,
	selector = [],
	receiver,
	exchangeID

    // We know the next class tag is for Message.
    tether.nextWord()

    // We know the next class tag is for Selector.
    tether.nextWord()
    numberOfElements = tether.nextWord()

    for (let i = 0; i < numberOfElements; i++) {
      selector[i] = tether.nextByte()}

    selector = String.fromCharCode.apply(null, selector)
    
    // We know the next class tag is for Array.
    tether.nextWord()
    numberOfElements = tether.nextWord()

    for (let i = 0; i < numberOfElements; i++) {
      parameters[i] = tether.next()}

    receiver = caffeine.tether.exposedObjects[tether.nextWord()]
    if (receiver.constructor == caffeine.OtherMarker) {
      receiver = receiver.object}
    
    exchangeID = tether.next()

    tether.push(new caffeine.RemoteMessageAnswer(
      (receiver[selector])(),
      exchangeID))}

  this.setIncomingMessage = (message) => {this.portal.setIncomingMessage(message)}
  
  this.expose = (object) => {
    let exposureHash = this.exposedObjects[object]

    if (!(exposureHash)) {
      exposureHash = caffeine.exposureHash()
      this.exposedObjects[exposureHash] = object}
    return exposureHash}
  
  this.nextByte = () => {return this.portal.nextByte()}

  this.nextBytePut = (byte) => {this.portal.nextBytePut(byte)}
    
  this.nextWord = () => {return this.portal.nextWord()}

  this.nextWordPut = (word) => {
    this.portal.nextWordPut(word)}
  
  this.storeOnTether = (tether) => {(new caffeine.OtherMarker(this, this)).storeOnTether(tether)}
  
  this.store = (object) => {
    if (typeof(object) == "number") {
      this.nextWordPut(object + caffeine.smallIntegerTagBase)}
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
	debugger
	throw 'instruction encountered when object expected'}
      else {
	if (tag >= caffeine.otherMarkerBase) {
	  debugger
	  throw 'Smalltalk object proxies are not supported yet.'}
	else {
	  if (tag >= caffeine.smallIntegerTagBase) {return tag - caffeine.smallIntegerTagBase}
	  else {
	    if (tag >= caffeine.classTagsBase) {
	      let theClass = caffeine.classes[tag]
	      if (!(theClass)) {debugger}
	      else {return new (caffeine.classes[tag])(this)}}
	    else {
	      debugger
	      throw 'Exposing JavaScript objects remotely is not supported yet.'}}}}}}

  this.deliver = (result, id) => {console.log('Received ' + result + ' from Caffeine.')}}}

caffeine.tether = new caffeine.Tether()

caffeine.RemoteMessageAnswer = class {constructor(result, exchangeID) {
  this.result = result
  this.exchangeID = exchangeID


  this.storeOnTether = (tether) => {
    tether.nextWordPut(536870941)
    tether.store(exchangeID)
    tether.store(result)}
    
  this.handleEventFrom = (tether) => {
    let id = tether.next()

    tether.deliver(tether.next(), id)}}}

caffeine.UUID = class {constructor(tether) {
  this.bytes = []

  // I already know the number of bytes to read is 16.
  for (let i = 0; i < 4; i++) {
    tether.nextByte()}
  
  for (let i = 0; i < 16; i++) {
    this.bytes[i] = tether.nextByte()}

  this.storeOnTether = (tether) => {
    tether.nextWordPut(536870929)
    tether.nextWordPut(16)

    for (let i = 0; i < 16; i++) {
      tether.nextBytePut(this.bytes[i])}}}}

caffeine.specialVariables[536870913] = true
caffeine.specialVariables[536870914] = false
caffeine.specialVariables[536870915] = null

caffeine.classes[536870941] = caffeine.RemoteMessageAnswer
caffeine.classes[536870929] = caffeine.UUID
caffeine.classes[536870919] = caffeine.Tether

caffeine.tether.expose(caffeine.tether)
