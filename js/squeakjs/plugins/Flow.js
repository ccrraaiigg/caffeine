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

      top.WebMidi.writePacketsTo = (packets, output) => {
	var index
	
	for (index = 0; index < packets.length; index = index + 4) {
	  output.send(
	    packets[index],
	    [packets[index + 1],
	     packets[index + 2]],
	    packets[index + 3])}}
      
      if ((interpreterProxy.majorVersion() == VM_PROXY_MAJOR) === false) return false
      else return (interpreterProxy.minorVersion() >= VM_PROXY_MINOR)}


    // MIDI (via WebMidi.js)

    function numberOfMIDIPorts () {
      interpreterProxy.popthenPush(
	1,
	(top.WebMidi.inputs.length + top.WebMidi.outputs.length))}

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
      // No handles are necessary with WebMidi.js.
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
    
    
    // HTML UI support

    function htmlSelectElementSetOptions () {
      var self = (interpreterProxy.stackValue(1)).pointers[0].jsObject,
	  strings = interpreterProxy.vm.primHandler.loadedModules.JavaScriptPlugin.primitiveFromStObject(interpreterProxy.stackValue(0))

      while (self.children.length > 0) {
	var child = self.firstChild
	
	self.removeChild(child)}

      (
	strings.map(function (string) {
	  var option = document.createElement('option')

	  option.value = string
	  option.innerHTML = string

	  return option})
      )
	.forEach(function (element) {self.appendChild(element)})

      interpreterProxy.pop(1)}

    // read from Blobs, for sending binary WebSocket frames

    function setBytesFrom () {
      var byteArray = interpreterProxy.stackValue(1),
	  result = interpreterProxy.stackValue(0).jsObject

      byteArray.bytes = new Uint8Array(result)

      interpreterProxy.pop(1)}
    
    // VisualWorks support

    function decompressVisualWorksBitmapFromByteArray () {
      var words = interpreterProxy.stackValue(1).words,
	  bytes = interpreterProxy.stackValue(0).bytes,
	  numberOfBytes = bytes.length,
	  bytesPosition = 0,
	  wordIndex = 0,
	  word

      while (bytesPosition < numberOfBytes) {
	word = (bytes[bytesPosition++] << 24) + bytes[bytesPosition++]

	if (bytesPosition < numberOfBytes) {
	  word = word + (bytes[bytesPosition++] << 8) + (bytes[bytesPosition++] << 16)}

	words[wordIndex++] = word}

      interpreterProxy.pop(1)}

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
	htmlSelectElementSetOptions: htmlSelectElementSetOptions,
	decompressVisualWorksBitmapFromByteArray: decompressVisualWorksBitmapFromByteArray,
	setBytesFrom: setBytesFrom,
	isMethodFused: isMethodFused,
	fuseMethod: fuseMethod,
	defuseMethod: defuseMethod,
	setSpecialObjectsArray: setSpecialObjectsArray,
	performSelector: performSelector
      })})

