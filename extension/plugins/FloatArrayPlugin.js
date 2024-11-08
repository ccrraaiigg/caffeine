/* Smalltalk from Squeak4.5 with VMMaker 4.13.6 translated as JS source on 3 November 2014 1:52:20 pm */
/* Automatically generated by
	JSPluginCodeGenerator VMMakerJS-bf.15 uuid: fd4e10f2-3773-4e80-8bb5-c4b471a014e5
   from
	FloatArrayPlugin VMMaker-bf.353 uuid: 8ae25e7e-8d2c-451e-8277-598b30e9c002
 */

window.module("users.bert.SqueakJS.plugins.FloatArrayPlugin").requires("users.bert.SqueakJS.vm").toRun(function() {
"use strict";

var VM_PROXY_MAJOR = 1;
var VM_PROXY_MINOR = 11;

/*** Functions ***/
function CLASSOF(obj) { return typeof obj === "number" ? interpreterProxy.classSmallInteger() : obj.sqClass }
function SIZEOF(obj) { return obj.pointers ? obj.pointers.length : obj.words ? obj.words.length : obj.bytes ? obj.bytes.length : 0 }
function BYTESIZEOF(obj) { return obj.bytes ? obj.bytes.length : obj.words ? obj.words.length * 4 : 0 }
function DIV(a, b) { return Math.floor(a / b) | 0; }   // integer division
function MOD(a, b) { return a - DIV(a, b) * b | 0; }   // signed modulus
function SHL(a, b) { return b > 31 ? 0 : a << b; }     // fix JS shift
function SHR(a, b) { return b > 31 ? 0 : a >>> b; }    // fix JS shift
function SHIFT(a, b) { return b < 0 ? (b < -31 ? 0 : a >>> (0-b) ) : (b > 31 ? 0 : a << b); }

/*** Variables ***/
var interpreterProxy = null;
var moduleName = "FloatArrayPlugin 3 November 2014 (e)";



/*	Note: This is hardcoded so it can be run from Squeak.
	The module name is used for validating a module *after*
	it is loaded to check if it does really contain the module
	we're thinking it contains. This is important! */

function getModuleName() {
	return moduleName;
}

function halt() {
	;
}


/*	Primitive. Add the receiver and the argument, both FloatArrays and store the result into the receiver. */

function primitiveAddFloatArray() {
	var arg;
	var argPtr;
	var i;
	var length;
	var rcvr;
	var rcvrPtr;

	arg = interpreterProxy.stackObjectValue(0);
	rcvr = interpreterProxy.stackObjectValue(1);
	if (interpreterProxy.failed()) {
		return null;
	}
	interpreterProxy.success(interpreterProxy.isWords(arg));
	interpreterProxy.success(interpreterProxy.isWords(rcvr));
	if (interpreterProxy.failed()) {
		return null;
	}
	length = SIZEOF(arg);
	interpreterProxy.success(length === SIZEOF(rcvr));
	if (interpreterProxy.failed()) {
		return null;
	}
	rcvrPtr = rcvr.wordsAsFloat32Array();
	argPtr = arg.wordsAsFloat32Array();
	for (i = 0; i <= (length - 1); i++) {
		rcvrPtr[i] = (rcvrPtr[i] + argPtr[i]);
	}
	interpreterProxy.pop(1);
}


/*	Primitive. Add the argument, a scalar value to the receiver, a FloatArray */

function primitiveAddScalar() {
	var i;
	var length;
	var rcvr;
	var rcvrPtr;
	var value;

	value = interpreterProxy.stackFloatValue(0);
	rcvr = interpreterProxy.stackObjectValue(1);
	if (interpreterProxy.failed()) {
		return null;
	}
	interpreterProxy.success(interpreterProxy.isWords(rcvr));
	if (interpreterProxy.failed()) {
		return null;
	}
	length = SIZEOF(rcvr);
	rcvrPtr = rcvr.wordsAsFloat32Array();
	for (i = 0; i <= (length - 1); i++) {
		rcvrPtr[i] = (rcvrPtr[i] + value);
	}
	interpreterProxy.pop(1);
}

function primitiveAt() {
	var floatPtr;
	var floatValue;
	var index;
	var rcvr;

	index = interpreterProxy.stackIntegerValue(0);
	rcvr = interpreterProxy.stackObjectValue(1);
	if (interpreterProxy.failed()) {
		return null;
	}
	interpreterProxy.success(interpreterProxy.isWords(rcvr));
	interpreterProxy.success((index > 0) && (index <= SIZEOF(rcvr)));
	if (interpreterProxy.failed()) {
		return null;
	}
	floatPtr = rcvr.wordsAsFloat32Array();
	floatValue = floatPtr[index - 1];
	interpreterProxy.pop(2);
	interpreterProxy.pushFloat(floatValue);
}

function primitiveAtPut() {
	var floatPtr;
	var floatValue;
	var index;
	var rcvr;
	var value;

	value = interpreterProxy.stackValue(0);
	if (typeof value === "number") {
		floatValue = value;
	} else {
		floatValue = interpreterProxy.floatValueOf(value);
	}
	index = interpreterProxy.stackIntegerValue(1);
	rcvr = interpreterProxy.stackObjectValue(2);
	if (interpreterProxy.failed()) {
		return null;
	}
	interpreterProxy.success(interpreterProxy.isWords(rcvr));
	interpreterProxy.success((index > 0) && (index <= SIZEOF(rcvr)));
	if (interpreterProxy.failed()) {
		return null;
	}
	floatPtr = rcvr.wordsAsFloat32Array();
	floatPtr[index - 1] = floatValue;
	if (!interpreterProxy.failed()) {
		interpreterProxy.popthenPush(3, value);
	}
}


/*	Primitive. Add the receiver and the argument, both FloatArrays and store the result into the receiver. */

function primitiveDivFloatArray() {
	var arg;
	var argPtr;
	var i;
	var length;
	var rcvr;
	var rcvrPtr;

	arg = interpreterProxy.stackObjectValue(0);
	rcvr = interpreterProxy.stackObjectValue(1);
	if (interpreterProxy.failed()) {
		return null;
	}
	interpreterProxy.success(interpreterProxy.isWords(arg));
	interpreterProxy.success(interpreterProxy.isWords(rcvr));
	if (interpreterProxy.failed()) {
		return null;
	}
	length = SIZEOF(arg);
	interpreterProxy.success(length === SIZEOF(rcvr));
	if (interpreterProxy.failed()) {
		return null;
	}
	rcvrPtr = rcvr.wordsAsFloat32Array();

	/* Check if any of the argument's values is zero */

	argPtr = arg.wordsAsFloat32Array();
	for (i = 0; i <= (length - 1); i++) {
		if (argPtr[i] === 0) {
			return interpreterProxy.primitiveFail();
		}
	}
	for (i = 0; i <= (length - 1); i++) {
		rcvrPtr[i] = (rcvrPtr[i] / argPtr[i]);
	}
	interpreterProxy.pop(1);
}


/*	Primitive. Add the argument, a scalar value to the receiver, a FloatArray */

function primitiveDivScalar() {
	var i;
	var inverse;
	var length;
	var rcvr;
	var rcvrPtr;
	var value;

	value = interpreterProxy.stackFloatValue(0);
	rcvr = interpreterProxy.stackObjectValue(1);
	if (interpreterProxy.failed()) {
		return null;
	}
	if (value === 0.0) {
		return interpreterProxy.primitiveFail();
	}
	interpreterProxy.success(interpreterProxy.isWords(rcvr));
	if (interpreterProxy.failed()) {
		return null;
	}
	length = SIZEOF(rcvr);
	rcvrPtr = rcvr.wordsAsFloat32Array();
	inverse = 1.0 / value;
	for (i = 0; i <= (length - 1); i++) {
		rcvrPtr[i] = (rcvrPtr[i] * inverse);
	}
	interpreterProxy.pop(1);
}


/*	Primitive. Compute the dot product of the receiver and the argument.
	The dot product is defined as the sum of the products of the individual elements. */

function primitiveDotProduct() {
	var arg;
	var argPtr;
	var i;
	var length;
	var rcvr;
	var rcvrPtr;
	var result;

	arg = interpreterProxy.stackObjectValue(0);
	rcvr = interpreterProxy.stackObjectValue(1);
	if (interpreterProxy.failed()) {
		return null;
	}
	interpreterProxy.success(interpreterProxy.isWords(arg));
	interpreterProxy.success(interpreterProxy.isWords(rcvr));
	if (interpreterProxy.failed()) {
		return null;
	}
	length = SIZEOF(arg);
	interpreterProxy.success(length === SIZEOF(rcvr));
	if (interpreterProxy.failed()) {
		return null;
	}
	rcvrPtr = rcvr.wordsAsFloat32Array();
	argPtr = arg.wordsAsFloat32Array();
	result = 0.0;
	for (i = 0; i <= (length - 1); i++) {
		result += rcvrPtr[i] * argPtr[i];
	}
	interpreterProxy.pop(2);
	interpreterProxy.pushFloat(result);
}

function primitiveEqual() {
	var arg;
	var argPtr;
	var i;
	var length;
	var rcvr;
	var rcvrPtr;

	arg = interpreterProxy.stackObjectValue(0);
	rcvr = interpreterProxy.stackObjectValue(1);
	if (interpreterProxy.failed()) {
		return null;
	}
	interpreterProxy.success(interpreterProxy.isWords(arg));
	interpreterProxy.success(interpreterProxy.isWords(rcvr));
	if (interpreterProxy.failed()) {
		return null;
	}
	interpreterProxy.pop(2);
	length = SIZEOF(arg);
	if (length !== SIZEOF(rcvr)) {
		return interpreterProxy.pushBool(false);
	}
	rcvrPtr = rcvr.wordsAsFloat32Array();
	argPtr = arg.wordsAsFloat32Array();
	for (i = 0; i <= (length - 1); i++) {
		if (rcvrPtr[i] !== argPtr[i]) {
			return interpreterProxy.pushBool(false);
		}
	}
	return interpreterProxy.pushBool(true);
}

function primitiveHashArray() {
	var i;
	var length;
	var rcvr;
	var rcvrPtr;
	var result;

	rcvr = interpreterProxy.stackObjectValue(0);
	if (interpreterProxy.failed()) {
		return null;
	}
	interpreterProxy.success(interpreterProxy.isWords(rcvr));
	if (interpreterProxy.failed()) {
		return null;
	}
	length = SIZEOF(rcvr);
	rcvrPtr = rcvr.wordsAsInt32Array();
	result = 0;
	for (i = 0; i <= (length - 1); i++) {
		result += rcvrPtr[i];
	}
	interpreterProxy.pop(1);
	return interpreterProxy.pushInteger(result & 536870911);
}


/*	Primitive. Compute the length of the argument (sqrt of sum of component squares). */

function primitiveLength() {
	var i;
	var length;
	var rcvr;
	var rcvrPtr;
	var result;

	rcvr = interpreterProxy.stackObjectValue(0);
	if (interpreterProxy.failed()) {
		return null;
	}
	interpreterProxy.success(interpreterProxy.isWords(rcvr));
	if (interpreterProxy.failed()) {
		return null;
	}
	length = SIZEOF(rcvr);
	interpreterProxy.success(true);
	rcvrPtr = rcvr.wordsAsFloat32Array();
	result = 0.0;
	for (i = 0; i <= (length - 1); i++) {
		result += rcvrPtr[i] * rcvrPtr[i];
	}
	result = Math.sqrt(result);
	interpreterProxy.popthenPush(1, interpreterProxy.floatObjectOf(result));
}


/*	Primitive. Add the receiver and the argument, both FloatArrays and store the result into the receiver. */

function primitiveMulFloatArray() {
	var arg;
	var argPtr;
	var i;
	var length;
	var rcvr;
	var rcvrPtr;

	arg = interpreterProxy.stackObjectValue(0);
	rcvr = interpreterProxy.stackObjectValue(1);
	if (interpreterProxy.failed()) {
		return null;
	}
	interpreterProxy.success(interpreterProxy.isWords(arg));
	interpreterProxy.success(interpreterProxy.isWords(rcvr));
	if (interpreterProxy.failed()) {
		return null;
	}
	length = SIZEOF(arg);
	interpreterProxy.success(length === SIZEOF(rcvr));
	if (interpreterProxy.failed()) {
		return null;
	}
	rcvrPtr = rcvr.wordsAsFloat32Array();
	argPtr = arg.wordsAsFloat32Array();
	for (i = 0; i <= (length - 1); i++) {
		rcvrPtr[i] = (rcvrPtr[i] * argPtr[i]);
	}
	interpreterProxy.pop(1);
}


/*	Primitive. Add the argument, a scalar value to the receiver, a FloatArray */

function primitiveMulScalar() {
	var i;
	var length;
	var rcvr;
	var rcvrPtr;
	var value;

	value = interpreterProxy.stackFloatValue(0);
	rcvr = interpreterProxy.stackObjectValue(1);
	if (interpreterProxy.failed()) {
		return null;
	}
	interpreterProxy.success(interpreterProxy.isWords(rcvr));
	if (interpreterProxy.failed()) {
		return null;
	}
	length = SIZEOF(rcvr);
	rcvrPtr = rcvr.wordsAsFloat32Array();
	for (i = 0; i <= (length - 1); i++) {
		rcvrPtr[i] = (rcvrPtr[i] * value);
	}
	interpreterProxy.pop(1);
}


/*	Primitive. Normalize the argument (A FloatArray) in place. */

function primitiveNormalize() {
	var i;
	var len;
	var length;
	var rcvr;
	var rcvrPtr;

	rcvr = interpreterProxy.stackObjectValue(0);
	if (interpreterProxy.failed()) {
		return null;
	}
	interpreterProxy.success(interpreterProxy.isWords(rcvr));
	if (interpreterProxy.failed()) {
		return null;
	}
	length = SIZEOF(rcvr);
	interpreterProxy.success(true);
	rcvrPtr = rcvr.wordsAsFloat32Array();
	len = 0.0;
	for (i = 0; i <= (length - 1); i++) {
		len += rcvrPtr[i] * rcvrPtr[i];
	}
	interpreterProxy.success(len > 0.0);
	if (interpreterProxy.failed()) {
		return null;
	}
	len = Math.sqrt(len);
	for (i = 0; i <= (length - 1); i++) {
		rcvrPtr[i] = (rcvrPtr[i] / len);
	}
}


/*	Primitive. Add the receiver and the argument, both FloatArrays and store the result into the receiver. */

function primitiveSubFloatArray() {
	var arg;
	var argPtr;
	var i;
	var length;
	var rcvr;
	var rcvrPtr;

	arg = interpreterProxy.stackObjectValue(0);
	rcvr = interpreterProxy.stackObjectValue(1);
	if (interpreterProxy.failed()) {
		return null;
	}
	interpreterProxy.success(interpreterProxy.isWords(arg));
	interpreterProxy.success(interpreterProxy.isWords(rcvr));
	if (interpreterProxy.failed()) {
		return null;
	}
	length = SIZEOF(arg);
	interpreterProxy.success(length === SIZEOF(rcvr));
	if (interpreterProxy.failed()) {
		return null;
	}
	rcvrPtr = rcvr.wordsAsFloat32Array();
	argPtr = arg.wordsAsFloat32Array();
	for (i = 0; i <= (length - 1); i++) {
		rcvrPtr[i] = (rcvrPtr[i] - argPtr[i]);
	}
	interpreterProxy.pop(1);
}


/*	Primitive. Add the argument, a scalar value to the receiver, a FloatArray */

function primitiveSubScalar() {
	var i;
	var length;
	var rcvr;
	var rcvrPtr;
	var value;

	value = interpreterProxy.stackFloatValue(0);
	rcvr = interpreterProxy.stackObjectValue(1);
	if (interpreterProxy.failed()) {
		return null;
	}
	interpreterProxy.success(interpreterProxy.isWords(rcvr));
	if (interpreterProxy.failed()) {
		return null;
	}
	length = SIZEOF(rcvr);
	rcvrPtr = rcvr.wordsAsFloat32Array();
	for (i = 0; i <= (length - 1); i++) {
		rcvrPtr[i] = (rcvrPtr[i] - value);
	}
	interpreterProxy.pop(1);
}


/*	Primitive. Find the sum of each float in the receiver, a FloatArray, and stash the result into the argument Float. */

function primitiveSum() {
	var i;
	var length;
	var rcvr;
	var rcvrPtr;
	var sum;

	rcvr = interpreterProxy.stackObjectValue(0);
	if (interpreterProxy.failed()) {
		return null;
	}
	interpreterProxy.success(interpreterProxy.isWords(rcvr));
	if (interpreterProxy.failed()) {
		return null;
	}
	length = SIZEOF(rcvr);
	rcvrPtr = rcvr.wordsAsFloat32Array();
	sum = 0.0;
	for (i = 0; i <= (length - 1); i++) {
		sum += rcvrPtr[i];
	}
	interpreterProxy.popthenPush(1, interpreterProxy.floatObjectOf(sum));
}


/*	Note: This is coded so that is can be run from Squeak. */

function setInterpreter(anInterpreter) {
	var ok;

	interpreterProxy = anInterpreter;
	ok = interpreterProxy.majorVersion() == VM_PROXY_MAJOR;
	if (ok === false) {
		return false;
	}
	ok = interpreterProxy.minorVersion() >= VM_PROXY_MINOR;
	return ok;
}


window.Squeak.registerExternalModule("FloatArrayPlugin", {
	primitiveMulFloatArray: primitiveMulFloatArray,
	primitiveEqual: primitiveEqual,
	primitiveAtPut: primitiveAtPut,
	primitiveAt: primitiveAt,
	primitiveNormalize: primitiveNormalize,
	primitiveSubFloatArray: primitiveSubFloatArray,
	primitiveDivFloatArray: primitiveDivFloatArray,
	primitiveAddScalar: primitiveAddScalar,
	primitiveDotProduct: primitiveDotProduct,
	primitiveSubScalar: primitiveSubScalar,
	setInterpreter: setInterpreter,
	primitiveSum: primitiveSum,
	getModuleName: getModuleName,
	primitiveHashArray: primitiveHashArray,
	primitiveMulScalar: primitiveMulScalar,
	primitiveLength: primitiveLength,
	primitiveAddFloatArray: primitiveAddFloatArray,
	primitiveDivScalar: primitiveDivScalar,
});

}); // end of module
