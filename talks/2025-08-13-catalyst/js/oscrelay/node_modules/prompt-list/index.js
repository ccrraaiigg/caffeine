'use strict';

const Radio = require('prompt-radio');
const cyan = require('ansi-cyan');
const dim = require('ansi-dim');

/**
 * List prompt
 */

function List(question, answers, ui) {
  Radio.apply(this, arguments);
  this.listInitialized = false;
  this.question.type = 'list';
  this.on('ask', this.onAsk.bind(this));
  this.on('render', () => {
    if (this.contextHistory.length > 0) this.helpMessage = '';
  });
}

/**
 * Inherit Radio
 */

Radio.extend(List);

/**
 * Render a choice.
 */

List.prototype.onAsk = function() {
  if (this.listInitialized) return;
  this.listInitialized = true;
  this.helpMessage = this.options.helpMessage || dim('(Use arrow keys)');
  this.choices.options.checkbox = false;
  this.choices.options.format = this.renderChoice(this.choices);
};

/**
 * Render a choice.
 */

List.prototype.renderChoice = function(choices) {
  return function(line) {
    return choices.position === choices.index ? cyan(line) : line;
  };
};

/**
 * Render final selected answer when "line" ("enter" keypress)
 * is emitted
 */

List.prototype.renderAnswer = function() {
  return cyan(this.choices.get(this.position, 'value'));
};

/**
 * Get selected list item
 */

List.prototype.getAnswer = function() {
  return this.choices.key(this.position);
};

/**
 * overriding "when" function to avoid setting a value when there
 * is not a default value and the question was not asked
 */

List.prototype.when = function() {
  var that = this;
  return Promise.resolve(Radio.prototype.when.apply(this, arguments))
    .then(function(when) {
      that.position = that.choices.getIndex(that.options.default);
      return when;
    });
};

/**
 * Module exports
 */

module.exports = List;
