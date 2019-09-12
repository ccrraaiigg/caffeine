"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _extractorUtilities = require("./extractorUtilities");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _default(args) {
  if (_typeof(args.ampSpectrum) !== 'object') {
    throw new TypeError();
  }

  var mu1 = (0, _extractorUtilities.mu)(1, args.ampSpectrum);
  var mu2 = (0, _extractorUtilities.mu)(2, args.ampSpectrum);
  var mu3 = (0, _extractorUtilities.mu)(3, args.ampSpectrum);
  var numerator = 2 * Math.pow(mu1, 3) - 3 * mu1 * mu2 + mu3;
  var denominator = Math.pow(Math.sqrt(mu2 - Math.pow(mu1, 2)), 3);
  return numerator / denominator;
}

module.exports = exports["default"];