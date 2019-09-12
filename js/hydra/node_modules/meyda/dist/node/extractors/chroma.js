"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _default(args) {
  if (_typeof(args.ampSpectrum) !== 'object') {
    throw new TypeError('Valid ampSpectrum is required to generate chroma');
  }

  if (_typeof(args.chromaFilterBank) !== 'object') {
    throw new TypeError('Valid chromaFilterBank is required to generate chroma');
  }

  var chromagram = args.chromaFilterBank.map(function (row, i) {
    return args.ampSpectrum.reduce(function (acc, v, j) {
      return acc + v * row[j];
    }, 0);
  });
  var maxVal = Math.max.apply(Math, _toConsumableArray(chromagram));
  return maxVal ? chromagram.map(function (v) {
    return v / maxVal;
  }) : chromagram;
}

module.exports = exports["default"];