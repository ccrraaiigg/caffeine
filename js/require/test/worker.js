"use strict";

importScripts("../require.js");
Tarp.require({ expose: true });

var mod = require("module1");

self.addEventListener("message", function() {
  self.postMessage(mod.greet());
}, false);
