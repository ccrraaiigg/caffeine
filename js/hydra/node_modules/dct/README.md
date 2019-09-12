# node-dct
Node.js implementation of the Discrete Cosine Transform (version 2 for now).

# Introduction

The discrete cosine transform (DCT) is used widely for signal compression due to its power compaction properties as opposed to the discrete fourier transform.

For a signal of length `N` the DCT function returns a vector of coefficients of length `N`, each coefficient representing how closely the signal maps to that cosine function.

The first coefficient represents a flat function. As a result, if the input is all the same value the first coefficient is going to be a non-zero value while all other coefficients should be close to zero.

Various versions of the DCT exist, each one having special properties. For its widespread use this implementation uses the DCT-II with a scaling factor of 2.

# Example

    var dct = require('dct'),
        signal = [1,1,1,1,1];

    var coef = dct(signal);

    console.log(coef); // [12, 0, 0, 0, 0]

# License 

The MIT License (MIT)

Copyright (c) 2015 Vail Systems

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
