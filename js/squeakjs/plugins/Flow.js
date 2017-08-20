module("SqueakJS.plugins.Flow").requires("users.bert.SqueakJS.vm").toRun(
  function () {
    "use strict"

    var VM_PROXY_MAJOR = 1,
	VM_PROXY_MINOR = 11,
	interpreterProxy = null,
	moduleName = "Flow v7"

    function numberOfMIDIPorts () {
      navigator.requestMIDIAccess().then(function (access) {
	interpreterProxy.popthenPush(1, access.outputs.size)})}
	
    function setInterpreter(interpreter) {
      interpreterProxy = interpreter
      if ((interpreterProxy.majorVersion() == VM_PROXY_MAJOR) === false) return false
      else return (interpreterProxy.minorVersion() >= VM_PROXY_MINOR)}

    Squeak.registerExternalModule(
      "Flow",
      {
	numberOfMIDIPorts: numberOfMIDIPorts,
	setInterpreter: setInterpreter
      })})

