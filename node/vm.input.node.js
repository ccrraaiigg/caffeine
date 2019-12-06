self.module('users.bert.SqueakJS.vm.input.node').requires("users.bert.SqueakJS.vm.input").toRun(function() {
"use strict";

Object.extend(Squeak.Primitives.prototype,
'input', {
	primitiveMouseButtons: function() { return false; },
        primitiveMousePoint: function() { return false; },
	primitiveKeyboardNext: function() { return false; },
	primitiveKeyboardPeek: function() { return false; },
	primitiveInputSemaphore: function(argCount) {
		this.vm.popN(argCount, this.vm.nilObj);
		return true;
	},
        primitiveInputWord: function() { return false; },
	primitiveGetNextEvent: function() { return false; },
	primitiveBeep: function() { return false; },
	primitiveClipboardText: function() { return false; },
});

}); // end of module
