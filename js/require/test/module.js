"use strict";

var fromstr = "from";

exports.greetstr = "hello world";

exports.greet = function() {
  return exports.greetstr+" "+fromstr+" "+module.id+"!";
};
