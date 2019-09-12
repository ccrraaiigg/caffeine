'use strict';

let utils = require('./utils');

// real to complex fft
let fft = function(signal){

  let complexSignal = {};

  if(signal.real === undefined || signal.imag === undefined){
    complexSignal = utils.constructComplexArray(signal);
  }
  else {
    complexSignal.real = signal.real.slice();
    complexSignal.imag = signal.imag.slice();
  }

  const N = complexSignal.real.length;
  const logN = Math.log2(N);

  if(Math.round(logN) != logN) throw new Error('Input size must be a power of 2.');

  if(complexSignal.real.length != complexSignal.imag.length){
    throw new Error('Real and imaginary components must have the same length.');
  }

  const bitReversedIndices = utils.bitReverseArray(N);

  // sort array
  let ordered = {
    'real': [],
    'imag': []
  };

  for(let i = 0; i < N; i++){
    ordered.real[bitReversedIndices[i]] = complexSignal.real[i];
    ordered.imag[bitReversedIndices[i]] = complexSignal.imag[i];
  }

  for(let i = 0; i < N; i++){
    complexSignal.real[i] = ordered.real[i];
    complexSignal.imag[i] = ordered.imag[i];
  }
  // iterate over the number of stages
  for(let n = 1; n <= logN; n++){
    let currN = Math.pow(2, n);

    // find twiddle factors
    for(let k = 0; k < currN / 2; k++){
      let twiddle = utils.euler(k, currN);

      // on each block of FT, implement the butterfly diagram
      for(let m = 0; m < N / currN; m++){
        let currEvenIndex = (currN * m) + k;
        let currOddIndex = (currN * m) + k + (currN / 2);

        let currEvenIndexSample = {
                          'real': complexSignal.real[currEvenIndex],
                          'imag': complexSignal.imag[currEvenIndex]
                        }
        let currOddIndexSample = {
                          'real': complexSignal.real[currOddIndex],
                          'imag': complexSignal.imag[currOddIndex]
                        }

        let odd = utils.multiply(twiddle, currOddIndexSample);

        let subtractionResult = utils.subtract(currEvenIndexSample, odd);
        complexSignal.real[currOddIndex] = subtractionResult.real;
        complexSignal.imag[currOddIndex] = subtractionResult.imag;

        let additionResult = utils.add(odd, currEvenIndexSample);
        complexSignal.real[currEvenIndex] = additionResult.real;
        complexSignal.imag[currEvenIndex] = additionResult.imag;
      }
    }
  }

  return complexSignal;
}

// complex to real ifft
let ifft = function(signal){

  if(signal.real === undefined || signal.imag === undefined){
    throw new Error("IFFT only accepts a complex input.")
  }

  const N = signal.real.length;

  var complexSignal = {
    'real': [],
    'imag': []
  };

  //take complex conjugate in order to be able to use the regular FFT for IFFT
  for(let i = 0; i < N; i++){
    let currentSample = {
      'real': signal.real[i],
      'imag': signal.imag[i]
    };

    let conjugateSample = utils.conj(currentSample);
    complexSignal.real[i] = conjugateSample.real;
    complexSignal.imag[i] = conjugateSample.imag;
  }

  //compute
  let X = fft(complexSignal);

  //normalize
  complexSignal.real = X.real.map((val) => {
    return val / N;
  });

  complexSignal.imag = X.imag.map((val) => {
    return val / N;
  });

  return complexSignal;
}


module.exports = {
  fft: fft,
  ifft: ifft
};
