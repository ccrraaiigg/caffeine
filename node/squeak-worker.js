var fs = require("fs");
var process = require("process");
var path = require("path");

const {parentPort} = require('worker_threads');
global.postMessage = parentPort.postMessage;

require('child_process').execSync('unzip -o ../memories/pod.zip')

var fullName = './pod.image'
var root = path.dirname(fullName) + path.sep
var imageName = path.basename(fullName, ".image")

// Create global 'self' resembling the global scope in the browser DOM
Object.assign(global, {
  // Add browser element 'self' for platform consistency
  self: new Proxy({}, {
    get: function(obj, prop) {
      return global[prop];
    },
    set: function(obj, prop, value) {
      global[prop] = value;
      return true;
    }
  })
});

self.parentPort = parentPort;

// Extend the new global scope with a few browser/DOM classes and methods
Object.assign(self, {
  localStorage: {},
  WebSocket: require("./node/WebSocket"),
  sha1: require("./lib/sha1"),
  btoa: function(string) {
    return Buffer.from(string, 'ascii').toString('base64');
  },
  atob: function(string) {
    return Buffer.from(string, 'base64').toString('ascii');
  }
});


//////////////////////////////////////////////////////////////////////////////
// these functions fake the Lively module and class system
// just enough so the loading of vm.js succeeds
//////////////////////////////////////////////////////////////////////////////

// The 3 functions below are copied from squeak.js with slight adjustment to prevent name clash with Node's module identifier
self.module = function(dottedPath) {
  if (dottedPath === "") return self;
  var path = dottedPath.split("."),
      name = path.pop(),
      parent = self.module(path.join(".")),
      thisModule = parent[name];
  if (!thisModule) parent[name] = thisModule = {
    loaded: false,
    pending: [],
    requires: function(req) {
      return {
        toRun: function(code) {
          function load() {
            code();
            thisModule.loaded = true;
            thisModule.pending.forEach(function(f){f();});
          }
          if (req && !self.module(req).loaded) {
            self.module(req).pending.push(load);
          } else {
            load();
          }
        }
      };
    },
  };
  return thisModule;
};

Object.extend = function(obj /* + more args */ ) {
  // skip arg 0, copy properties of other args to obj
  for (var i = 1; i < arguments.length; i++)
    if (typeof arguments[i] == 'object')
      for (var name in arguments[i])
        obj[name] = arguments[i][name];
};

Function.prototype.subclass = function(classPath /* + more args */ ) {
  // create subclass
  var subclass = function() {
    if (this.initialize) this.initialize.apply(this, arguments);
    return this;
  };
  // set up prototype
  var protoclass = function() { };
  protoclass.prototype = this.prototype;
  subclass.prototype = new protoclass();
  // skip arg 0, copy properties of other args to prototype
  for (var i = 1; i < arguments.length; i++)
    Object.extend(subclass.prototype, arguments[i]);
  // add class to module
  var modulePath = classPath.split("."),
      className = modulePath.pop();
  self.module(modulePath.join('.'))[className] = subclass;
  return subclass;
};

// Load VM and the internal plugins
require("./vm");
require("./jit");
require("./vm.display");
require("./vm.display.node");
require("./vm.input");
require("./vm.input.node");
require("./vm.plugins");
require("./vm.plugins.file");
require("./vm.plugins.file.node");
require("./vm.plugins.javascript.js");

// Set the appropriate VM and platform values
Object.extend(Squeak, {
  vmPath: process.cwd() + path.sep,
  platformSubtype: "node",
  osVersion: "node " + process.version,
  windowSystem: "none",
});

// Extend the Squeak primitives with ability to load modules dynamically
Object.extend(Squeak.Primitives.prototype, {
  loadModuleDynamically: function(modName) {
    try {
      require("./plugins/" + modName);

      // Modules register themselves, should be available now
      return Squeak.externalModules[modName];
    } catch(e) {
      console.error("Plugin " + modName + " could not be loaded");
    }
    return undefined;
  }
});

// Read raw image
fs.readFile(root + imageName + ".image", function(error, data) {
  if(error) {
    console.error("Failed to read image", error);
    return;
  }

  // Create Squeak image from raw data
  var image = new Squeak.Image(root + imageName);
  image.readFromBuffer(data.buffer, function startRunning() {

    // Create fake display and create interpreter
    var display = { vmOptions: [ "-vm-display-null", "-nodisplay" ] };
    var vm = new Squeak.Interpreter(image, display);
    global.display = display;
    function run() {
      try {
	vm.interpret(50, function runAgain(ms) {
	  // Ignore display.quitFlag for now
	  // Some Smalltalk images quit when no display is found.
	  // Maybe listen for quit after a number of seconds have passed?
	  setTimeout(run, ms === "sleep" ? 200 : ms);
	});
      } catch(e) {
	console.error("Failure during Squeak run: ", e);
      }
    }

    // Start the interpreter
    run();
  });
});
