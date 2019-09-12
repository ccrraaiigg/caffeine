# fftjs
fftjs is a compact Fast Fourier Transform (FFT) and Inverse Fast Fourier Transform (IFFT) library for JavaScript.
It implements the [Cooley-Tukey](https://en.wikipedia.org/wiki/Cooley%E2%80%93Tukey_FFT_algorithm) radix-2 Decimation In Time (DIT) algorithm.


## How to install

This package is available on `npm`.

`npm install --save fftjs`

## How to use

The input can be either an array:
```javascript
// must be a power of 2.
let signal = [0.13, -0.45, ....];
```

Or an object consisting of a field named real
```javascript
let signal = {
              'real': [0.13, -0.45, ....]
             };
```

Then, you can compute the FFT like so:

```javascript
const fftjs = require('fftjs');

let phasors = fftjs.fft(signal);

console.log("phasors: " + phasors);

/*
  phasors: {
              real: [...],
              imag: [...]
            };
*/
```

`phasors` now contains the complex values in the ferquency domain representation of the signal!

We can also reconstruct our original time-domain signal from the complex phasors.

```javascript
let reconstructedSignal = jsfft.ifft(phasors);

console.log("reconstructed signal: " + reconstructedSignal);
  
/*
  reconstruted signal: [0.13, -0.45, ....];

  reconstructedSignal should be identical to original signal (with very slight rounding errors caused by JavaScript)
*/
```
