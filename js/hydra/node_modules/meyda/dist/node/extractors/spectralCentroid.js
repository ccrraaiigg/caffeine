"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _extractorUtilities = require("./extractorUtilities");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _default() {
  if (_typeof(arguments[0].ampSpectrum) !== 'object') {
    throw new TypeError();
  }

  return (0, _extractorUtilities.mu)(1, arguments[0].ampSpectrum);
}

module.exports = exports["default"];