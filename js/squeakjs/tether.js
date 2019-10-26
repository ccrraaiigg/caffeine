// This is a JavaScript implementation of the "Tether" remote
// communication protocol, used by Caffeine when it's running
// as a Web Worker in a browser.
//
// You can post messages to Caffeine with the worker's
// postMessage() function. Caffeine responds with message
// events.

window.caffeine = []

caffeine.exposureHash = () => {return Math.floor(Math.random() * 268435455)}
caffeine.specialVariables = []
caffeine.instructionsBase = 1879048192
caffeine.otherMarkerBase = 1610612737
caffeine.smallIntegerTagBase = 1073741824
caffeine.classTagsBase = 536870912
caffeine.classes = []

caffeine.Portal = class {constructor() {
  this.outgoingMessage = []
  this.outgoingPosition = 0

  this.setIncomingMessage = (message) => {
    this.incomingMessage = message
    this.incomingPosition = 0}
  
  this.send = () => {window.caffeineWorker.postMessage(this.outgoingMessage)}
  
  this.startMessage = () => {
    this.outgoingMessage = []}
  
  this.nextByte = () => {
    this.incomingPosition += 1
    return this.incomingMessage[this.incomingPosition]}
  
  this.nextWord = () => {
    let word = 0,
	shift = 24

    for (let i = this.incomingPosition; i < (this.incomingPosition + 4); i++) {
      word = word + (this.incomingMessage.charCodeAt(i) << shift)
      shift = shift - 8}

    this.incomingPosition += 4
    
    return word}

  this.nextBytePut = (byte) => {
    this.outgoingMessage[this.outgoingPosition] = byte
    this.outgoingPosition += 1}

  this.nextWordPut = (word) => {
    this.nextBytePut((word >> 24) & 255)
    this.nextBytePut((word >> 16) & 255)
    this.nextBytePut((word >> 8) & 255)
    this.nextBytePut(word & 255)}}}

caffeine.OtherMarker = class {constructor(object, tether) {
  this.exposureHash = tether.expose(this)

  this.storeOnTether = (tether) => {
    tether.nextWordPut(this.exposureHash + caffeine.otherMarkerBase)}}}

caffeine.Tether = class {constructor() {
  this.portal = new caffeine.Portal()
  this.exposedObjects = []

  this.handleEventFrom = (tether) => {
    // Perform the next incoming message.

    let parameters = [],
	numberOfParameters,
	receiver,
	exchangeID
    
    this.nextWord()
    this.nextWord()
    this.nextWord()
    numberOfParameters = this.nextWord()

    for (let i = 0; i < numberOfParameters; i++) {
      parameters[i] = this.next()}

    receiver = this.next()
    exchangeID = this.next()

    debugger}

  this.setIncomingMessage = (message) => {this.portal.setIncomingMessage(message)}
  
  this.expose = (object) => {
    let exposureHash = this.exposedObjects[object]

    if (!(exposureHash)) {
      this.exposedObjects[object] = caffeine.exposureHash()
      return this.exposedObjects[object]}
    else {return exposureHash}}
  
  this.nextByte = () => {return this.portal.nextByte()}

  this.nextWord = () => {return this.portal.nextWord()}

  this.nextWordPut = (word) => {
    this.portal.nextWordPut(word)}
  
  this.storeOnTether = (tether) => {
    (new caffeine.OtherMarker(this, this)).storeOnTether(tether)}
  
  this.store = (object) => {
    object.storeOnTether(this)}

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
      if (tag >= caffeine.instructionsBase) {throw 'instruction encountered when object expected'}
      else {
	if (tag >= caffeine.otherMarkerBase) {throw 'Smalltalk object proxies are not supported yet.'}
	else {
	  if (tag >= caffeine.smallIntegerTagBase) {return tag - smallIntegerTagBase}
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

caffeine.RemoteMessageAnswer = class {constructor(tether) {
  this.handleEventFrom = (tether) => {
    let id = tether.next()

    tether.deliver(tether.next(), id)}}}

caffeine.UUID = class {constructor(tether) {
  this.bytes = []

  // I already know the number of bytes to read is 16.
  for (let i = 0; i < 4; i++) {
    tether.nextByte()}
  
  for (let i = 0; i < 16; i++) {
    this.bytes[i] = tether.nextByte()}}}

caffeine.specialVariables[1073741825] = true
caffeine.specialVariables[1073741826] = false
caffeine.specialVariables[1073741827] = null

caffeine.classes[1073741853] = caffeine.RemoteMessageAnswer
caffeine.classes[1073741841] = caffeine.UUID
caffeine.classes[1073741831] = caffeine.Tether

