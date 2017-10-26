// It's not strictly necessary to write a Flow primitives plugin for
// SqueakJS, since we can do everything we need to do from Smalltalk
// over the JS bridge. It's an interesting exercise, though. It's
// slightly less awkward to implement the code here, and there's
// probably some performance benefit, too (no fiddling about with
// proxies and the message-not-understood code path).

module("SqueakJS.plugins.Flow").requires("users.bert.SqueakJS.vm").toRun(
  function () {
    "use strict"

    var VM_PROXY_MAJOR = 1,
	VM_PROXY_MINOR = 11,
	interpreterProxy = null,
	moduleName = "Flow v7"

    navigator.requestMIDIAccess().then(function (access) {
      window.caffeineMIDIAccess = access})

    function setInterpreter(interpreter) {
      interpreterProxy = interpreter
      if ((interpreterProxy.majorVersion() == VM_PROXY_MAJOR) === false) return false
      else return (interpreterProxy.minorVersion() >= VM_PROXY_MINOR)}

    // MIDI
    
    function numberOfMIDIPorts () {
      interpreterProxy.pop(1)
      interpreterProxy.pushInteger(window.caffeineMIDIAccess.inputs.size + window.caffeineMIDIAccess.outputs.size)}

    function nameOfMIDIPortAt () {
      // Enumerate inputs, then outputs, to emulate macOS.
      var requestedIndex = interpreterProxy.stackValue(0),
	  inputs = window.caffeineMIDIAccess.inputs,
	  outputs = window.caffeineMIDIAccess.outputs

      if (requestedIndex >= inputs.size + outputs.size) return interpreterProxy.primitiveFail()
      else {
	var inputValues = inputs.values(),
	    outputValues = outputs.values(),
	    port,
	    selectedValues,
	    index

	if (requestedIndex < inputs.size) {
	  selectedValues = inputValues
	  index = 0
	  port = inputValues.next()}
	else {
	  selectedValues = outputValues
	  index = inputs.size
	  port = outputValues.next()}
	
	while (index < requestedIndex) {
	  port = values.next()
	  index = index + 1}

	interpreterProxy.popthenPush(
	  2,
	  interpreterProxy.vm.Squeak.Primitives.prototype.makeStString.apply(
	    interpreterProxy,
	    [port.value.name]))}}
    
    function newMIDIPortHandleInto () {
      // The web browser's JS engine manages all MIDI port
      // handles. Smalltalk knows to find the Web MIDI API access
      // object as a window property.
    }

    function enableMIDIPortAtAnd () {
      // Sending data to a Web MIDIOutput automatically opens
      // it. Unless we're going to share the output with other JS
      // code, we don't need to do anything for it when enabling a
      // Smalltalk MIDIPort. For a Web MIDIInput, we need to listen
      // for events. We can do this from Smalltalk, without a
      // primitive.
      interpreterProxy.primitiveFail()
    }

    function MIDIClockValue () {
      // Web MIDI uses DOM time, not the host OS MIDI time. Events
      // timestamped from SqueakJS can't be scheduled properly after
      // resuming the system on another host.
      interpreterProxy.popthenPush(
	1,
	interpreterProxy.vm.Squeak.Primitives.prototype.makeLargeIfNeeded.apply(
	  interpreterProxy,
	  [Math.floor(performance.now())]))}

    function scheduleMIDIMessagesInQuantityOn () {
      var outputs = window.caffeineMIDIAccess.outputs.values(),
	  index = window.caffeineMIDIAccess.inputs.size,
	  port = outputs.next(),
	  requestedIndex = interpreterProxy.stackValue(0),
	  words = interpreterProxy.stackValue(2).words,
	  numberOfWords = words.length,
	  wordIndex = 0,
	  data
	
      while (index < requestedIndex) {
	port = outputs.next()
	index = index + 1}

      port = port.value
      
      while (wordIndex < numberOfWords) {
	data = words[wordIndex]
	port.send(
	  [
	    data & 0xFF,
	    (data >> 8) & 0xFF,
	    data >> 16],
	  words[wordIndex + 1])
	wordIndex = wordIndex + 2}

      interpreterProxy.pop(3)}

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

    
    Squeak.registerExternalModule(
      "Flow",
      {
        setInterpreter: setInterpreter,
        numberOfMIDIPorts: numberOfMIDIPorts,
        nameOfMIDIPortAt: nameOfMIDIPortAt,
        newMIDIPortHandleInto: newMIDIPortHandleInto,
	enableMIDIPortAtAnd: enableMIDIPortAtAnd,
	MIDIClockValue: MIDIClockValue,
	scheduleMIDIMessagesInQuantityOn: scheduleMIDIMessagesInQuantityOn,
	htmlSelectElementSetOptions: htmlSelectElementSetOptions
      })})

