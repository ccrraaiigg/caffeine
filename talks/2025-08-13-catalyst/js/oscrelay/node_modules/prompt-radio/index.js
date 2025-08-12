'use strict';

var debug = require('debug')('prompt-radio');
var Checkbox = require('prompt-checkbox');

/**
 * Radio prompt
 */

function Radio(/*question, answers, rl*/) {
  debug('initializing from <%s>', __filename);
  Checkbox.apply(this, arguments);
  this.question.type = 'radio';

  this.action('i', function(pos) {
    return pos;
  });

  this.action('a', function(pos) {
    return pos;
  });

  this.action('number', function(pos, key) {
    return enable(this, pos, key);
  });

  this.action('space', function(pos) {
    return enable(this, pos);
  });

  function enable(actions, pos, key) {
    pos = actions.position(pos, key) + (key ? -1 : 0);
    actions.choices.uncheck();
    actions.choices.check(pos);
    return pos;
  }
}

/**
 * Inherit Checkbox prompt
 */

Checkbox.extend(Radio);

/**
 * Get selected choice
 */

Radio.prototype.getAnswer = function(input) {
  if (Array.isArray(this.options.default)) {
    throw new TypeError('expected options.default to be a string or number');
  }
  return Checkbox.prototype.getAnswer.call(this, arguments)[0];
};

/**
 * Module exports
 */

module.exports = Radio;
