'use strict';

// memoization of the reversal of different lengths.

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var memoizedReversal = {};
var memoizedZeroBuffers = {};

var constructComplexArray = function constructComplexArray(signal) {
  var complexSignal = {};

  complexSignal.real = signal.real === undefined ? signal.slice() : signal.real.slice();

  var bufferSize = complexSignal.real.length;

  if (memoizedZeroBuffers[bufferSize] === undefined) {
    memoizedZeroBuffers[bufferSize] = Array.apply(null, Array(bufferSize)).map(Number.prototype.valueOf, 0);
  }

  complexSignal.imag = memoizedZeroBuffers[bufferSize].slice();

  return complexSignal;
};

var bitReverseArray = function bitReverseArray(N) {
  if (memoizedReversal[N] === undefined) {
    var maxBinaryLength = (N - 1).toString(2).length; //get the binary length of the largest index.
    var templateBinary = '0'.repeat(maxBinaryLength); //create a template binary of that length.
    var reversed = {};
    for (var n = 0; n < N; n++) {
      var currBinary = n.toString(2); //get binary value of current index.

      //prepend zeros from template to current binary. This makes binary values of all indices have the same length.
      currBinary = templateBinary.substr(currBinary.length) + currBinary;

      currBinary = [].concat(_toConsumableArray(currBinary)).reverse().join(''); //reverse
      reversed[n] = parseInt(currBinary, 2); //convert to decimal
    }
    memoizedReversal[N] = reversed; //save
  }
  return memoizedReversal[N];
};

// complex multiplication
var multiply = function multiply(a, b) {
  return {
    'real': a.real * b.real - a.imag * b.imag,
    'imag': a.real * b.imag + a.imag * b.real
  };
};

// complex addition
var add = function add(a, b) {
  return {
    'real': a.real + b.real,
    'imag': a.imag + b.imag
  };
};

// complex subtraction
var subtract = function subtract(a, b) {
  return {
    'real': a.real - b.real,
    'imag': a.imag - b.imag
  };
};

// euler's identity e^x = cos(x) + sin(x)
var euler = function euler(kn, N) {
  var x = -2 * Math.PI * kn / N;
  return { 'real': Math.cos(x), 'imag': Math.sin(x) };
};

// complex conjugate
var conj = function conj(a) {
  a.imag *= -1;
  return a;
};

module.exports = {
  bitReverseArray: bitReverseArray,
  multiply: multiply,
  add: add,
  subtract: subtract,
  euler: euler,
  conj: conj,
  constructComplexArray: constructComplexArray
};