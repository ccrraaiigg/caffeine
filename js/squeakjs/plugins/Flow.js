module("SqueakJS.plugins.Flow").requires("users.bert.SqueakJS.vm").toRun(
  function () {
    "use strict"

    var VM_PROXY_MAJOR = 1,
	VM_PROXY_MINOR = 11,
	interpreterProxy = null,
	moduleName = "Flow v7"

    function numberOfMIDIPorts () {
      interpreterProxy.pop(1)
      interpreterProxy.pushInteger(access.outputs.size)}
	
    function setInterpreter(interpreter) {
      interpreterProxy = interpreter
      if ((interpreterProxy.majorVersion() == VM_PROXY_MAJOR) === false) return false
      else return (interpreterProxy.minorVersion() >= VM_PROXY_MINOR)}

    navigator.requestMIDIAccess().then(function (access) {
      window.caffeineMIDIAccess = access})

    Squeak.registerExternalModule(
      "Flow",
      {
	numberOfMIDIPorts: numberOfMIDIPorts,
	setInterpreter: setInterpreter
      })})

