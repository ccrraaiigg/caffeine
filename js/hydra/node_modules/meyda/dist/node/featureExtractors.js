"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "rms", {
  enumerable: true,
  get: function get() {
    return _rms.default;
  }
});
Object.defineProperty(exports, "energy", {
  enumerable: true,
  get: function get() {
    return _energy.default;
  }
});
Object.defineProperty(exports, "spectralSlope", {
  enumerable: true,
  get: function get() {
    return _spectralSlope.default;
  }
});
Object.defineProperty(exports, "spectralCentroid", {
  enumerable: true,
  get: function get() {
    return _spectralCentroid.default;
  }
});
Object.defineProperty(exports, "spectralRolloff", {
  enumerable: true,
  get: function get() {
    return _spectralRolloff.default;
  }
});
Object.defineProperty(exports, "spectralFlatness", {
  enumerable: true,
  get: function get() {
    return _spectralFlatness.default;
  }
});
Object.defineProperty(exports, "spectralSpread", {
  enumerable: true,
  get: function get() {
    return _spectralSpread.default;
  }
});
Object.defineProperty(exports, "spectralSkewness", {
  enumerable: true,
  get: function get() {
    return _spectralSkewness.default;
  }
});
Object.defineProperty(exports, "spectralKurtosis", {
  enumerable: true,
  get: function get() {
    return _spectralKurtosis.default;
  }
});
Object.defineProperty(exports, "zcr", {
  enumerable: true,
  get: function get() {
    return _zcr.default;
  }
});
Object.defineProperty(exports, "loudness", {
  enumerable: true,
  get: function get() {
    return _loudness.default;
  }
});
Object.defineProperty(exports, "perceptualSpread", {
  enumerable: true,
  get: function get() {
    return _perceptualSpread.default;
  }
});
Object.defineProperty(exports, "perceptualSharpness", {
  enumerable: true,
  get: function get() {
    return _perceptualSharpness.default;
  }
});
Object.defineProperty(exports, "mfcc", {
  enumerable: true,
  get: function get() {
    return _mfcc.default;
  }
});
Object.defineProperty(exports, "chroma", {
  enumerable: true,
  get: function get() {
    return _chroma.default;
  }
});
Object.defineProperty(exports, "powerSpectrum", {
  enumerable: true,
  get: function get() {
    return _powerSpectrum.default;
  }
});
Object.defineProperty(exports, "spectralFlux", {
  enumerable: true,
  get: function get() {
    return _spectralFlux.default;
  }
});
exports.amplitudeSpectrum = exports.complexSpectrum = exports.buffer = void 0;

var _rms = _interopRequireDefault(require("./extractors/rms"));

var _energy = _interopRequireDefault(require("./extractors/energy"));

var _spectralSlope = _interopRequireDefault(require("./extractors/spectralSlope"));

var _spectralCentroid = _interopRequireDefault(require("./extractors/spectralCentroid"));

var _spectralRolloff = _interopRequireDefault(require("./extractors/spectralRolloff"));

var _spectralFlatness = _interopRequireDefault(require("./extractors/spectralFlatness"));

var _spectralSpread = _interopRequireDefault(require("./extractors/spectralSpread"));

var _spectralSkewness = _interopRequireDefault(require("./extractors/spectralSkewness"));

var _spectralKurtosis = _interopRequireDefault(require("./extractors/spectralKurtosis"));

var _zcr = _interopRequireDefault(require("./extractors/zcr"));

var _loudness = _interopRequireDefault(require("./extractors/loudness"));

var _perceptualSpread = _interopRequireDefault(require("./extractors/perceptualSpread"));

var _perceptualSharpness = _interopRequireDefault(require("./extractors/perceptualSharpness"));

var _mfcc = _interopRequireDefault(require("./extractors/mfcc"));

var _chroma = _interopRequireDefault(require("./extractors/chroma"));

var _powerSpectrum = _interopRequireDefault(require("./extractors/powerSpectrum"));

var _spectralFlux = _interopRequireDefault(require("./extractors/spectralFlux"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var buffer = function buffer(args) {
  return args.signal;
};

exports.buffer = buffer;

var complexSpectrum = function complexSpectrum(args) {
  return args.complexSpectrum;
};

exports.complexSpectrum = complexSpectrum;

var amplitudeSpectrum = function amplitudeSpectrum(args) {
  return args.ampSpectrum;
};

exports.amplitudeSpectrum = amplitudeSpectrum;