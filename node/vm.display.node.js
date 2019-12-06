self.module('users.bert.SqueakJS.vm.display.node').requires("users.bert.SqueakJS.vm.display").toRun(function() {
"use strict";

Object.extend(Squeak.Primitives.prototype,
'display', {
	primitiveScreenSize: function() { return false; },
	primitiveScreenDepth: function() { return false; },
	primitiveTestDisplayDepth: function() { return false; },
	primitiveBeDisplay: function(argCount) {
		this.vm.popN(argCount);
		return true;
	},
	primitiveReverseDisplay: function() { return false; },
	primitiveDeferDisplayUpdates: function() { return false; },
	primitiveForceDisplayUpdate: function() { return false; },
	primitiveSetFullScreen: function() { return false; },
	primitiveShowDisplayRect: function() { return false; },
	primitiveBeCursor: function(argCount) {
		this.vm.popN(argCount);
		return true;
	},
});

}); // end of module
