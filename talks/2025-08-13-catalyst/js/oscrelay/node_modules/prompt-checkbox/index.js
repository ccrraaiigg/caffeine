'use strict';

var debug = require('debug')('prompt-checkbox');
var Prompt = require('prompt-base');
var cyan = require('ansi-cyan');

/**
 * Checkbox prompt
 */

function Checkbox() {
  debug('initializing from <%s>', __filename);
  Prompt.apply(this, arguments);
  this.errorMessage = null;
  this.infoMessage = this.options.infoMessage || '(Press '
    + cyan('<space>')
    + ' to toggle)';
}

/**
 * Inherit prompt-base
 */

Prompt.extend(Checkbox);

/**
 * Render all prompt choices to the terminal
 */

Checkbox.prototype.renderOutput = function() {
  this.choices.options.filterList = true;
  return this.choices.render(this.position, this.question.options);
};

/**
 * Render only the selected choices to the terminal
 */

Checkbox.prototype.renderAnswer = function() {
  var keys = this.choices.checked.map(function(choice) {
    return typeof choice === 'string' ? choice : choice.value;
  });
  return cyan(keys.join(', '));
};

/**
 * Module exports
 */

module.exports = Checkbox;
