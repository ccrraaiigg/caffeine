module("SqueakJS.plugins.Flow").requires("users.bert.SqueakJS.vm").toRun(
  function () {
    "use strict"

    var VM_PROXY_MAJOR = 1,
	VM_PROXY_MINOR = 11,
	interpreterProxy = null,
	moduleName = "Flow v7"

    function setInterpreter(interpreter) {
      interpreterProxy = interpreter
      self.interpreter = interpreter

      if ((interpreterProxy.majorVersion() == VM_PROXY_MAJOR) === false) return false
      else return (interpreterProxy.minorVersion() >= VM_PROXY_MINOR)}


    // MIDI (via WebMidi.js)

    function numberOfMIDIPorts () {
      if (top.WebMidi) {
	interpreterProxy.popthenPush(
	  1,
	  (top.WebMidi.inputs.length + top.WebMidi.outputs.length))}
      else {
	interpreterProxy.popthenPush(1, 0)}}

    function nameOfMIDIPortAt () {
      var portIndex = interpreterProxy.stackIntegerValue(0),
	  numberOfInterfaces = top.WebMidi.inputs.length

      if (portIndex < numberOfInterfaces) {
	// input
	interpreterProxy.popthenPush(
	  2,
	  interpreterProxy.vm.Squeak.Primitives.prototype.makeStString.apply(
	    interpreterProxy,
	    ["in: " + top.WebMidi.inputs[portIndex].name]))}
      else {
	// output
	interpreterProxy.popthenPush(
	  2,
	  interpreterProxy.vm.Squeak.Primitives.prototype.makeStString.apply(
	    interpreterProxy,
	    ["out: " + top.WebMidi.outputs[portIndex - numberOfInterfaces].name]))}}

    function newMIDIPortHandleInto () {
      // With WebMidi.js, no handles are necessary.
    }
      
    function outputPortIndexInputPortIndex () {
      var receiver = interpreterProxy.stackObjectValue(2),
	  jsProxyClass = interpreterProxy.vm.image.specialObjectsArray.pointers[Squeak.splOb_JSProxyClass]
      
      interpreterProxy.storePointerofObjectwithValue(
	7,
	receiver,
	SqueakJS.vm.primHandler.makeStObject(
	  top.WebMidi.inputs[interpreterProxy.stackIntegerValue(0)],
	  jsProxyClass))

      interpreterProxy.storePointerofObjectwithValue(
	8,
	receiver,
	SqueakJS.vm.primHandler.makeStObject(
	  top.WebMidi.outputs[interpreterProxy.stackIntegerValue(1) - top.WebMidi.inputs.length],
	  jsProxyClass))

      interpreterProxy.pop(2)}
    
    
    // read from Blobs, for sending binary WebSocket frames

    function setBytesFrom () {
      var byteArray = interpreterProxy.stackValue(1),
	  result = interpreterProxy.stackValue(0).jsObject

      byteArray.bytes = new Uint8Array(result)

      interpreterProxy.pop(1)}
    

    // Ensure that a websocket's "open" event handler is set before
    // the event occurs, by creating the websocket and setting the
    // handler in the same JS context (JS is single-threaded).

    function urlonOpenonErroronMessageonClose () {
      var websocket = new WebSocket(interpreterProxy.stackValue(4).bytesAsString())

      websocket.onopen = interpreterProxy.vm.primHandler.js_fromStBlock(interpreterProxy.stackValue(3))
      websocket.onerror = interpreterProxy.vm.primHandler.js_fromStBlock(interpreterProxy.stackValue(2))
      websocket.onmessage = interpreterProxy.vm.primHandler.js_fromStBlock(interpreterProxy.stackValue(1))
      websocket.onclose = interpreterProxy.vm.primHandler.js_fromStBlock(interpreterProxy.stackValue(0))

      interpreterProxy.stackValue(5).jsObject = websocket
      interpreterProxy.pop(5)}

    
    // Naiad support

    function isMethodFused () {
      interpreterProxy.pushBool(interpreterProxy.stackValue(0).fused)}

    function defuseMethod () {
      interpreterProxy.stackValue(0).fused = false}
    
    function fuseMethod () {
      interpreterProxy.stackValue(0).fused = true}

    function setSpecialObjectsArray () {
      interpreterProxy.vm.image.specialObjectsArray = interpreterProxy.stackValue(0)
      interpreterProxy.pop(1)}

    function performSelector () {
      var performSelector = interpreterProxy.stackValue(0).performSelector

      if (!performSelector) {
	interpreterProxy.primitiveFail()}
      else {
	interpreterProxy.popthenPush(
	  1,
	  performSelector)}}

      
    Squeak.registerExternalModule(
      "Flow",
      {
	setInterpreter: setInterpreter,
	numberOfMIDIPorts: numberOfMIDIPorts,
	nameOfMIDIPortAt: nameOfMIDIPortAt,
	newMIDIPortHandleInto: newMIDIPortHandleInto,
	outputPortIndexInputPortIndex: outputPortIndexInputPortIndex,
	setBytesFrom: setBytesFrom,
	urlonOpenonErroronMessageonClose: urlonOpenonErroronMessageonClose,
	isMethodFused: isMethodFused,
	fuseMethod: fuseMethod,
	defuseMethod: defuseMethod,
	setSpecialObjectsArray: setSpecialObjectsArray,
	performSelector: performSelector
      })})

