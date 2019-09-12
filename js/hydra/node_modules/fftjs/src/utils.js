'use strict';

// memoization of the reversal of different lengths.
var memoizedReversal = {};
var memoizedZeroBuffers = {}

let constructComplexArray = function(signal){
  var complexSignal = {};

  complexSignal.real = (signal.real === undefined) ? signal.slice() : signal.real.slice();

  var bufferSize = complexSignal.real.length;

  if(memoizedZeroBuffers[bufferSize] === undefined){
    memoizedZeroBuffers[bufferSize] = Array.apply(null, Array(bufferSize)).map(Number.prototype.valueOf, 0);
  }

  complexSignal.imag = memoizedZeroBuffers[bufferSize].slice();

  return complexSignal;
}

let bitReverseArray = function(N){
  if(memoizedReversal[N] === undefined){
    let maxBinaryLength = (N - 1).toString(2).length; //get the binary length of the largest index.
    let templateBinary = '0'.repeat(maxBinaryLength); //create a template binary of that length.
    let reversed = {};
    for(let n = 0; n < N; n++){
      let currBinary = n.toString(2); //get binary value of current index.

      //prepend zeros from template to current binary. This makes binary values of all indices have the same length.
      currBinary = templateBinary.substr(currBinary.length) + currBinary;

      currBinary = [...currBinary].reverse().join(''); //reverse
      reversed[n] = parseInt(currBinary, 2); //convert to decimal
    }
    memoizedReversal[N] = reversed; //save
  }
  return memoizedReversal[N];
}

// complex multiplication
let multiply = function(a, b){
  return {
          'real': a.real * b.real - a.imag * b.imag,
          'imag': a.real * b.imag + a.imag * b.real
        };
}

// complex addition
let add = function(a, b){
  return {
          'real': a.real + b.real,
          'imag': a.imag + b.imag
        };
}

// complex subtraction
let subtract = function(a, b){
  return {
            'real': a.real - b.real,
            'imag': a.imag - b.imag
        };
}

// euler's identity e^x = cos(x) + sin(x)
let euler = function(kn, N){
  let x = -2 * Math.PI * kn / N;
  return {'real': Math.cos(x), 'imag': Math.sin(x)};
}

// complex conjugate
let conj = function(a){
  a.imag *= -1;
  return a;
}

module.exports={
  bitReverseArray,
  multiply,
  add,
  subtract,
  euler,
  conj,
  constructComplexArray
};
