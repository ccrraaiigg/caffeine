/*
 * Copyright (c) 2013-2016 Bert Freudenberg
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

"use strict";
var magicWindow = window,
    isMagic;

while ((magicWindow != window.top) && (magicWindow.document.head.id != "magic")) {
  magicWindow = magicWindow.parent;}

try {isMagic = (magicWindow.document.head.id == "magic")}
catch (exception) {
  magicWindow = null;
  isMagic = false}

if (isMagic) {
  window.top.magicWindow = magicWindow;
  var progress = magicWindow.document.createElement('div');
  var thestatus = magicWindow.document.createElement('div');
  progress.id = 'progress';
  progress.style.position = 'absolute';
  progress.style.top = '0px';
  progress.style.left = '0px';
  progress.style.height = '5px';
  progress.style.width = '5%';
  progress.style.backgroundColor = 'rgb(255, 0, 0)';
  progress.style.transition = 'opacity 500ms';
  progress.style.opacity = 0;

  magicWindow.progress = progress;
  if (magicWindow.document.body) magicWindow.document.body.appendChild(progress);

  thestatus.id = 'status';
  thestatus.style.position = 'absolute';
  thestatus.style.top = '9px';
  thestatus.style.left = '4px';
  thestatus.style.transition = 'opacity 500ms';
  thestatus.style.opacity = 0;
  thestatus.style.color = 'black';
  thestatus.style.backgroundColor = 'rgb(255, 255, 255, 0.6)';
  thestatus.style.borderRadius = '5px';
  thestatus.style.padding = '5px';
  thestatus.innerHTML = "<i>starting virtual machine...</i>";
  magicWindow.thestatus = thestatus;

  if (magicWindow.document.body) magicWindow.document.body.appendChild(thestatus);}


//////////////////////////////////////////////////////////////////////////////
// these functions fake the Lively module and class system
// just enough so the loading of vm.js succeeds
//////////////////////////////////////////////////////////////////////////////

window.module = function(dottedPath) {
  if (dottedPath === "") return window;
  var path = dottedPath.split("."),
      name = path.pop(),
      parent = module(path.join(".")),
      self = parent[name];
  if (!self) parent[name] = self = {
    loaded: false,
    pending: [],
    requires: function(req) {
      return {
        toRun: function(code) {
          function load() {
            code();
            self.loaded = true;
            self.pending.forEach(function(f){f();});
          }
          if (req && !module(req).loaded) {
            module(req).pending.push(load);
          } else {
            load();
          }
        }
      };
    },
  };
  return self;
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
  module(modulePath.join('.'))[className] = subclass;
  return subclass;
};

//////////////////////////////////////////////////////////////////////////////
// load vm, plugins, and other libraries
//////////////////////////////////////////////////////////////////////////////

// WebAssembly.instantiateStreaming(
//   fetch("/wasm/foo.wasm"), {}).then((wasm) => {debugger;});

(function(){
  var scripts = document.getElementsByTagName("script"),
      squeakjs = scripts[scripts.length - 1],
      vmDir = document.location.toString().split("#")[0];

  vmDir = vmDir.substring(0, vmDir.lastIndexOf('/')) + '/js/squeakjs/';

  if (squeakjs.src.match(/squeak\.min\.js$/)) return;


  [   "vm.js",
      "jit.js",
      "plugins/ADPCMCodecPlugin.js",
      "plugins/B2DPlugin.js",
      "plugins/BitBltPlugin.js",
      "plugins/FFTPlugin.js",
      "plugins/FloatArrayPlugin.js",
      "plugins/Flow.js",
      "plugins/GeniePlugin.js",
      "plugins/JPEGReaderPlugin.js",
      "plugins/KedamaPlugin.js",
      "plugins/KedamaPlugin2.js",
      "plugins/Klatt.js",
      "plugins/LargeIntegers.js",
      "plugins/Matrix2x3Plugin.js",
      "plugins/MiscPrimitivePlugin.js",
      "plugins/ScratchPlugin.js",
      "plugins/SocketPlugin.js",
      "plugins/SpeechPlugin.js",
      "plugins/SqueakSSL.js",
      "plugins/SoundGenerationPlugin.js",
      "plugins/StarSqueakPlugin.js",
      "plugins/ZipPlugin.js",
      "lib/lz-string.js",
      "lib/jszip.js",
      "lib/FileSaver.js"
  ].forEach(function(filename) {
    var script = document.createElement('script');
    script.setAttribute("type","text/javascript");
    script.setAttribute("src", vmDir + filename);
    document.getElementsByTagName("head")[0].appendChild(script);
  });
})();

module("SqueakJS").requires("users.bert.SqueakJS.vm").toRun(function() {

  // if in private mode set localStorage to a regular dict
  var localStorage = window.localStorage;
  try {
    localStorage["squeak-foo:"] = "bar";
    if (localStorage["squeak-foo:"] !== "bar") throw Error();
    delete localStorage["squeak-foo:"];
  } catch(e) {
    localStorage = {};
  }

  //////////////////////////////////////////////////////////////////////////////
  // display & event setup
  //////////////////////////////////////////////////////////////////////////////

  function setupFullscreen(display, canvas, options) {
    // Fullscreen can only be enabled in an event handler. So we check the
    // fullscreen flag on every mouse down/up and keyboard event.
    var box = canvas.parentElement,
        fullscreenEvent = "fullscreenchange",
        fullscreenElement = "fullscreenElement",
        fullscreenEnabled = "fullscreenEnabled";

    if (!box.requestFullscreen) {
      [    // Fullscreen support is still very browser-dependent
        {req: box.webkitRequestFullscreen, exit: document.webkitExitFullscreen,
         evt: "webkitfullscreenchange", elem: "webkitFullscreenElement", enable: "webkitFullscreenEnabled"},
        {req: box.mozRequestFullScreen, exit: document.mozCancelFullScreen,
         evt: "mozfullscreenchange", elem: "mozFullScreenElement", enable: "mozFullScreenEnabled"},
        {req: box.msRequestFullscreen, exit: document.msExitFullscreen,
         evt: "MSFullscreenChange", elem: "msFullscreenElement", enable: "msFullscreenEnabled"},
      ].forEach(function(browser) {
        if (browser.req) {
          box.requestFullscreen = browser.req;
          document.exitFullscreen = browser.exit;
          fullscreenEvent = browser.evt;
          fullscreenElement = browser.elem;
          fullscreenEnabled = browser.enable;
        }
      });
    }

    // If the user canceled fullscreen, turn off the fullscreen flag so
    // we don't try to enable it again in the next event
    function fullscreenChange(fullscreen) {
      display.fullscreen = fullscreen;
      box.style.background = fullscreen ? 'black' : '';
      if (options.header) options.header.style.display = fullscreen ? 'none' : '';
      if (options.footer) options.footer.style.display = fullscreen ? 'none' : '';
      if (options.fullscreenCheckbox) options.fullscreenCheckbox.checked = fullscreen;
      setTimeout(window.onresize, 0);
    }

    var checkFullscreen;

    if (box.requestFullscreen) {
      document.addEventListener(fullscreenEvent, function(){fullscreenChange(box == document[fullscreenElement]);});
      checkFullscreen = function() {
        if (document[fullscreenEnabled] && (box == document[fullscreenElement]) != display.fullscreen) {
          if (display.fullscreen) box.requestFullscreen();
          else document.exitFullscreen();
        }
      };
    } else {
      var isFullscreen = false;
      checkFullscreen = function() {
        if ((options.header || options.footer) && isFullscreen != display.fullscreen) {
          isFullscreen = display.fullscreen;
          fullscreenChange(isFullscreen);
        }
      };
    }

    if (options.fullscreenCheckbox) options.fullscreenCheckbox.onclick = function() {
      display.fullscreen = options.fullscreenCheckbox.checked;
      checkFullscreen();
    };

    return checkFullscreen;
  }

  function setupSwapButtons(options) {
    if (options.swapCheckbox) {
      var imageName = localStorage["squeakImageName"] || "default",
          settings = JSON.parse(localStorage["squeakSettings:" + imageName] || "{}");
      if ("swapButtons" in settings) options.swapButtons = settings.swapButtons;
      options.swapCheckbox.checked = options.swapButtons;
      options.swapCheckbox.onclick = function() {
        options.swapButtons = options.swapCheckbox.checked;
        settings["swapButtons"] = options.swapButtons;
        localStorage["squeakSettings:" + imageName] = JSON.stringify(settings);
      };
    }
  }

  function recordModifiers(evt, display) {
    var shiftPressed,
	modifiers,
        ctrlPressed = evt.ctrlKey && !evt.altKey,
        cmdPressed = evt.metaKey || (evt.altKey && !evt.ctrlKey)

    if (evt.shiftKey) {shiftPressed = evt.shiftKey}
    else {
      if (window.canvas) {shiftPressed = window.canvas.shiftKey}
      else {shiftPressed = false}}
    
    modifiers =
      (shiftPressed ? Squeak.Keyboard_Shift : 0) +
      (ctrlPressed ? Squeak.Keyboard_Ctrl : 0) +
      (cmdPressed ? Squeak.Keyboard_Cmd : 0);
    display.buttons = (display.buttons & ~Squeak.Keyboard_All) | modifiers;
    return modifiers;
  }

  var canUseMouseOffset = navigator.userAgent.match("AppleWebKit/");

  function updateMousePos(evt, canvas, display) {
    var x, y;

    if (evt.projected) {
      x = evt.projectedX;
      y = evt.projectedY;}
    else {
      var evtX, evtY;
      
      evtX = canUseMouseOffset ? evt.offsetX : evt.layerX,
      evtY = canUseMouseOffset ? evt.offsetY : evt.layerY;
      
      if (display.cursorCanvas) {
	display.cursorCanvas.style.left = (evtX + canvas.offsetLeft + display.cursorOffsetX) + "px";
	display.cursorCanvas.style.top = (evtY + canvas.offsetTop + display.cursorOffsetY) + "px";
      }
      var x = (evtX * canvas.width / canvas.offsetWidth) | 0,
          y = (evtY * canvas.height / canvas.offsetHeight) | 0;}
    // clamp to display size
    display.mouseX = Math.max(0, Math.min(display.width, x));
    display.mouseY = Math.max(0, Math.min(display.height, y));
  }

  function recordMouseEvent(what, evt, canvas, display, eventQueue, options) {
    updateMousePos(evt, canvas, display);
    if (!display.vm) return;
    var buttons = display.buttons & Squeak.Mouse_All;
    switch (what) {
    case 'mousedown':
      switch (evt.button || 0) {
      case 0: buttons = Squeak.Mouse_Red; break;      // left
      case 1: buttons = Squeak.Mouse_Yellow; break;   // middle
      case 2: buttons = Squeak.Mouse_Blue; break;     // right
      }
      if (options.swapButtons)
        if (buttons == Squeak.Mouse_Yellow) buttons = Squeak.Mouse_Blue;
      else if (buttons == Squeak.Mouse_Blue) buttons = Squeak.Mouse_Yellow;
      break;
    case 'mousemove':
      break; // nothing more to do
    case 'mouseup':
      buttons = 0;
      break;
    }
    display.buttons = buttons | recordModifiers(evt, display) | display.controllerButtons;
    if (eventQueue) {
      eventQueue.push([
        Squeak.EventTypeMouse,
        evt.timeStamp,  // converted to Squeak time in makeSqueakEvent()
        display.mouseX,
        display.mouseY,
        display.buttons & Squeak.Mouse_All,
        display.buttons >> 3,
	display.activeElementID
      ]);
      if (display.signalInputEvent)
        display.signalInputEvent();
    }
    display.idle = 0;
    if (what == 'mouseup') {
      if (display.runFor) display.runFor(100); // maybe we catch the fullscreen flag change
    } else {
      if (display.runNow) display.runNow();   // don't wait for timeout to run
    }
  }

  window.recordMouseEvent = recordMouseEvent;
  
  function recordKeyboardEvent(key, timestamp, display, eventQueue) {
    if (!display.vm) return;
    var code = (display.buttons >> 3) << 8 | key;
    if (code === display.vm.interruptKeycode) {
      display.vm.interruptPending = true;
    } else if (eventQueue) {
      eventQueue.push([
        Squeak.EventTypeKeyboard,
        timestamp,  // converted to Squeak time in makeSqueakEvent()
        key, // MacRoman
        Squeak.EventKeyChar,
        display.buttons >> 3,
        key,  // Unicode
      ]);
      if (display.signalInputEvent)
        display.signalInputEvent();
    } else {
      // no event queue, queue keys the old-fashioned way
      display.keys.push(code);
    }
    display.idle = 0;
    if (display.runNow) display.runNow(); // don't wait for timeout to run
  }

  function recordDragDropEvent(type, evt, canvas, display, eventQueue) {
    if (!display.vm || !eventQueue) return;
    updateMousePos(evt, canvas, display);
    eventQueue.push([
      Squeak.EventTypeDragDropFiles,
      evt.timeStamp,  // converted to Squeak time in makeSqueakEvent()
      type,
      display.mouseX,
      display.mouseY,
      display.buttons >> 3,
      display.droppedFiles.length,
    ]);
    if (display.signalInputEvent)
      display.signalInputEvent();
  }

  function fakeCmdOrCtrlKey(key, timestamp, display, eventQueue) {
    // set both Cmd and Ctrl bit, because we don't know what the image wants
    display.buttons &= ~Squeak.Keyboard_All;  // remove all modifiers
    display.buttons |= Squeak.Keyboard_Cmd | Squeak.Keyboard_Ctrl;
    display.keys = []; //  flush other keys
    recordKeyboardEvent(key, timestamp, display, eventQueue);
  }

  function makeSqueakEvent(evt, sqEvtBuf, sqTimeOffset) {
    sqEvtBuf[0] = evt[0];
    sqEvtBuf[1] = (evt[1] - sqTimeOffset) & Squeak.MillisecondClockMask;
    for (var i = 2; i < evt.length; i++)
      sqEvtBuf[i] = evt[i];
    sqEvtBuf[8] = window.display.activeElementID;
  }

  function createSqueakDisplay(canvas, options) {
    options = options || {};
    if (options.fullscreen) {
      document.body.style.margin = 0;
      document.body.style.backgroundColor = 'black';
      document.ontouchmove = function(evt) { evt.preventDefault(); };
      if (options.header) options.header.style.display = 'none';
      if (options.footer) options.footer.style.display = 'none';
    }

    var display = {
      headless: false,
      context: canvas.getContext("2d"),
      fullscreen: false,
      width: 0,   // if 0, VM uses canvas.width
      height: 0,  // if 0, VM uses canvas.height
      mouseX: 0,
      mouseY: 0,
      buttons: 0,
      keys: [],
      clipboardString: '',
      clipboardStringChanged: false,
      cursorCanvas: options.cursor !== false && document.createElement("canvas"),
      cursorOffsetX: 0,
      cursorOffsetY: 0,
      droppedFiles: [],
      signalInputEvent: null, // function set by VM
      // additional functions added below
    };
    setupSwapButtons(options);
    if (options.pixelated) {
      canvas.classList.add("pixelated");
      display.cursorCanvas && display.cursorCanvas.classList.add("pixelated");
    }

    display.eventQueue = null;
    display.options = options;
    display.reset = function() {
      display.eventQueue = null;
      display.signalInputEvent = null;
      display.lastTick = 0;
      display.getNextEvent = function(firstEvtBuf, firstOffset) {
        // might be called from VM to get queued event
        display.eventQueue = []; // create queue on first call
        display.eventQueue.push = function(evt) {
          display.eventQueue.offset = Date.now() - evt[1]; // get epoch from first event
          delete display.eventQueue.push;                  // use original push from now on
          display.eventQueue.push(evt);
        };
        display.getNextEvent = function(evtBuf, timeOffset) {
          var evt = display.eventQueue.shift();
          if (evt) makeSqueakEvent(evt, evtBuf, timeOffset - display.eventQueue.offset);
          else evtBuf[0] = Squeak.EventTypeNone;
        };
        display.getNextEvent(firstEvtBuf, firstOffset);
      };
    };
    display.reset();

    var checkFullscreen = setupFullscreen(display, canvas, options);
    window.checkFullscreen = checkFullscreen;
    
    display.fullscreenRequest = function(fullscreen, thenDo) {
      // called from primitive to change fullscreen mode
      if (display.fullscreen != fullscreen) {
        display.fullscreen = fullscreen;
        display.resizeTodo = thenDo;    // called after resizing
        display.resizeTodoTimeout = setTimeout(display.resizeDone, 1000);
        checkFullscreen();
      } else thenDo();
    };
    display.resizeDone = function() {
      clearTimeout(display.resizeTodoTimeout);
      var todo = display.resizeTodo;
      if (todo) {
        display.resizeTodo = null;
        todo();
      }
    };
    display.clear = function() {
      canvas.width = canvas.width;
    };
    display.showBanner = function(msg, style) {
      style = style || {};
      var ctx = display.context;
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = style.color || "#F90";
      ctx.font = style.font || "bold 48px sans-serif";
      if (!style.font && ctx.measureText(msg).width > canvas.width)
        ctx.font = "bold 24px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      if (isMagic) {
	if (magicWindow.theStatus) {
	  magicWindow.thestatus.innerHTML = "<i>" + msg + "</i>";
	}}
      ctx.fillText(msg, canvas.width / 2, canvas.height / 2);
    };
    display.showProgress = function(value, style) {
      var realValue = Math.max(value, 0.05);
      if (realValue < 0.8) {
	if (progress) {
	  progress.style.width = (realValue * 100) + '%';}}
      
      style = style || {};
      var ctx = display.context,
          w = (canvas.width / 3) | 0,
          h = 24,
          x = canvas.width * 0.5 - w / 2,
          y = canvas.height * 0.5 + 2 * h;
      ctx.fillStyle = style.background || "#000";
      ctx.fillRect(x, y, w, h);
      ctx.lineWidth = 2;
      ctx.strokeStyle = style.color || "#F90";
      ctx.strokeRect(x, y, w, h);
      ctx.fillStyle = style.color || "#F90";
      ctx.fillRect(x, y, w * realValue, h);
    };
    display.executeClipboardPaste = function(text, timestamp) {
      if (!display.vm) return true;
      try {
        display.clipboardString = text;
        // simulate paste event for Squeak
        fakeCmdOrCtrlKey('v'.charCodeAt(0), timestamp, display, display.eventQueue);
      } catch(err) {
        console.error("paste error " + err);
      }
    };
    display.executeClipboardCopy = function(key, timestamp) {
      if (!display.vm) return true;
      // simulate copy event for Squeak so it places its text in clipboard
      display.clipboardStringChanged = false;
      fakeCmdOrCtrlKey((key || 'c').charCodeAt(0), timestamp, display, display.eventQueue);
      var start = Date.now();
      // now interpret until Squeak has copied to the clipboard
      while (!display.clipboardStringChanged && Date.now() - start < 500)
        display.vm.interpret(20);
      if (!display.clipboardStringChanged) return;
      // got it, now copy to the system clipboard
      try {
        return display.clipboardString;
      } catch(err) {
        console.error("copy error " + err);
      }
    };

    display.nextElementID = display.activeElementID = 1;
    canvas.elementID = display.nextElementID;
    display.nextElementID++;

    canvas.onmousedown = function(evt) {
      checkFullscreen();
      recordMouseEvent('mousedown', evt, canvas, display, display.eventQueue, options);
      evt.preventDefault();
      return false;
    };
    canvas.onmouseup = function(evt) {
      recordMouseEvent('mouseup', evt, canvas, display, display.eventQueue, options);
      checkFullscreen();
      evt.preventDefault();
    };
    canvas.onmousemove = function(evt) {
      if (!(evt.target.elementID)) debugger;
      evt.target.focus();
      display.activeElementID = evt.target.elementID;
      if (window.currentCursor) {
	if (currentCursor === normalCursor) document.body.style.cursor = ''};
      recordMouseEvent('mousemove', evt, canvas, display, display.eventQueue, options);
      evt.preventDefault();
    };
    canvas.oncontextmenu = function() {
      return false;
    };
    
    // touch event handling
    var touch = {
      state: 'idle',
      button: 0,
      x: 0,
      y: 0,
      dist: 0,
      down: {},
    };
    window.top.touch = touch;

    var recognizer = document.getElementById('text-recognizer');
    if (recognizer) {
      recognizer.setAttribute('autocomplete', 'on');
      recognizer.setAttribute('autocorrect', 'on');
      recognizer.setAttribute('autocapitalize', 'on');
      recognizer.setAttribute('spellcheck', 'on');

      document.ontouchstart = (event) => {
	if (event.touches[0].touchType != 'stylus') {
	  recognizer.style.zIndex = -10;
	  canvas.contentEditable = false;}}}
    
    function touchToMouse(evt) {
      var type = null;
      
      if (evt.touches.length) {
        // average all touch positions
	type = evt.touches[0].touchType;
        touch.x = touch.y = 0;
        for (var i = 0; i < evt.touches.length; i++) {
          touch.x += evt.touches[i].pageX / evt.touches.length;
          touch.y += evt.touches[i].pageY / evt.touches.length;
        }
      }
      return {
        timeStamp: evt.timeStamp,
        button: touch.button,
        offsetX: touch.x - canvas.offsetLeft,
        offsetY: touch.y - canvas.offsetTop,
	type: type,
      };
    }
    function dd(ax, ay, bx, by) {var x = ax - bx, y = ay - by; return Math.sqrt(x*x + y*y);}
    function dist(a, b) {return dd(a.pageX, a.pageY, b.pageX, b.pageY);}
    function dent(n, l, t, u) { return n < l ? n + t - l : n > u ? n + t - u : t; }
    function adjustDisplay(l, t, w, h) {
      var cursorCanvas = display.cursorCanvas,
          scale = w / canvas.width;
      canvas.style.left = (l|0) + "px";
      canvas.style.top = (t|0) + "px";
      canvas.style.width = (w|0) + "px";
      canvas.style.height = (h|0) + "px";
      if (cursorCanvas) {
        cursorCanvas.style.left = (l + display.cursorOffsetX + display.mouseX * scale|0) + "px";
        cursorCanvas.style.top = (t + display.cursorOffsetY + display.mouseY * scale|0) + "px";
        cursorCanvas.style.width = (cursorCanvas.width * scale|0) + "px";
        cursorCanvas.style.height = (cursorCanvas.height * scale|0) + "px";
      }
      if (!options.pixelated) {
        if (scale >= 3) {
          canvas.classList.add("pixelated");
          cursorCanvas && cursorCanvas.classList.add("pixelated");
        } else {
          canvas.classList.remove("pixelated");
          cursorCanvas && display.cursorCanvas.classList.remove("pixelated");
        }
      }
      return scale;
    }
    // zooming/panning with two fingers
    var maxZoom = 5;
    function zoomStart(evt) {
      touch.dist = dist(evt.touches[0], evt.touches[1]);
      touch.down.x = touch.x;
      touch.down.y = touch.y;
      touch.down.dist = touch.dist;
      touch.down.left = canvas.offsetLeft;
      touch.down.top = canvas.offsetTop;
      touch.down.width = canvas.offsetWidth;
      touch.down.height = canvas.offsetHeight;
      // store original canvas bounds
      if (!touch.orig) touch.orig = {
        left: touch.down.left,
        top: touch.down.top,
        right: touch.down.left + touch.down.width,
        bottom: touch.down.top + touch.down.height,
        width: touch.down.width,
        height: touch.down.height,
      };
    }
    function zoomMove(evt) {
      if (evt.touches.length < 2) return;
      touch.dist = dist(evt.touches[0], evt.touches[1]);
      var minScale = touch.orig.width / touch.down.width,
          //nowScale = dent(touch.dist / touch.down.dist, 0.8, 1, 1.5),
          nowScale = touch.dist / touch.down.dist,
          scale = Math.min(Math.max(nowScale, minScale * 0.95), minScale * maxZoom),
          w = touch.down.width * scale,
          h = touch.orig.height * w / touch.orig.width,
          l = touch.down.left - (touch.down.x - touch.down.left) * (scale - 1) + (touch.x - touch.down.x),
          t = touch.down.top - (touch.down.y - touch.down.top) * (scale - 1) + (touch.y - touch.down.y);
      // allow to rubber-band by 20px for feedback
      l = Math.max(Math.min(l, touch.orig.left + 20), touch.orig.right - w - 20);
      t = Math.max(Math.min(t, touch.orig.top + 20), touch.orig.bottom - h - 20);
      adjustDisplay(l, t, w, h);
    }
    function zoomEnd(evt) {
      var l = canvas.offsetLeft,
          t = canvas.offsetTop,
          w = canvas.offsetWidth,
          h = canvas.offsetHeight;
      w = Math.min(Math.max(w, touch.orig.width), touch.orig.width * maxZoom);
      h = touch.orig.height * w / touch.orig.width;
      l = Math.max(Math.min(l, touch.orig.left), touch.orig.right - w);
      t = Math.max(Math.min(t, touch.orig.top), touch.orig.bottom - h);
      var scale = adjustDisplay(l, t, w, h);
      if ((scale - display.initialScale) < 0.0001) {
        touch.orig = null;
        window.onresize();
      }
    }
    // State machine to distinguish between 1st/2nd mouse button and zoom/pan:
    // * if moved, or no 2nd finger within 100ms of 1st down, start mousing
    // * if fingers moved significantly within 200ms of 2nd down, start zooming
    // * if touch ended within this time, generate click (down+up) from one finger,
    //   enter recognizer mode from two fingers.
    // * otherwise, start mousing with button 2.
    // When mousing, always generate a move event before down event so that
    // mouseover eventhandlers in image work better.
    canvas.ontouchstart = function(evt) {
      evt.preventDefault();
      var e = touchToMouse(evt);
      for (var i = 0; i < evt.changedTouches.length; i++) {
        switch (touch.state) {
        case 'idle':
          touch.state = 'got1stFinger';
          touch.first = e;
	  
          setTimeout(function(){
            if (touch.state !== 'got1stFinger') return;
            touch.state = 'mousing';
            touch.button = e.button = 0;
            recordMouseEvent('mousemove', e, canvas, display, display.eventQueue, options);
            recordMouseEvent('mousedown', e, canvas, display, display.eventQueue, options);
          }, 100);
          break;
        case 'got1stFinger':
          touch.state = 'got2ndFinger';
          zoomStart(evt);
          setTimeout(function(){
            if (touch.state !== 'got2ndFinger') return;
            var didMove = Math.abs(touch.down.dist - touch.dist) > 10 ||
                dd(touch.down.x, touch.down.y, touch.x, touch.y) > 10;
            if (didMove) {
              touch.state = 'zooming';
            } else {
	      touch.state = 'mousing';
	      touch.button = e.button = 2;
	      recordMouseEvent('mousemove', e, canvas, display, display.eventQueue, options);
	      recordMouseEvent('mousedown', e, canvas, display, display.eventQueue, options);
            }
          }, 200);
          break;
        }
      }
    };
    canvas.ontouchmove = function(evt) {
      evt.preventDefault();
      var e = touchToMouse(evt);
      switch (touch.state) {
      case 'got1stFinger':
        touch.state = 'mousing';
        touch.button = e.button = 0;
        recordMouseEvent('mousemove', e, canvas, display, display.eventQueue, options);
        recordMouseEvent('mousedown', e, canvas, display, display.eventQueue, options);
        break;
      case 'mousing':
        recordMouseEvent('mousemove', e, canvas, display, display.eventQueue, options);
        return;
      case 'got2ndFinger':
        if (evt.touches.length > 1)
          touch.dist = dist(evt.touches[0], evt.touches[1]);
        return;
      case 'zooming':
        zoomMove(evt);
        return;
      }
    };
    canvas.ontouchend = function(evt) {
      evt.preventDefault();
      checkFullscreen();
      var e = touchToMouse(evt);
      for (var i = 0; i < evt.changedTouches.length; i++) {
        switch (touch.state) {
	case 'scribbling':
	  touch.state = 'idle';
	  return;
        case 'mousing':
          if (evt.touches.length > 0) break;
          touch.state = 'idle';
          recordMouseEvent('mouseup', e, canvas, display, display.eventQueue, options);
          return;
        case 'got1stFinger':
          touch.state = 'idle';
          touch.button = e.button = 0;
          recordMouseEvent('mousemove', e, canvas, display, display.eventQueue, options);
          recordMouseEvent('mousedown', e, canvas, display, display.eventQueue, options);
          recordMouseEvent('mouseup', e, canvas, display, display.eventQueue, options);
          return;
        case 'got2ndFinger':
  	  // Enable scribbling, by raising the recognizer input
  	  // element above the Caffeine canvas. Caffeine has already
  	  // set the dimensions of the element to match the active
  	  // Smalltalk-rendered text field.
	  touch.state = 'scribbling';
	  recognizer.style.zIndex = 10;

	  // This invokes the onscreen stylus controls?
	  canvas.contentEditable = true;

	  // Do this from Caffeine when activating the field... and is
	  // it all still necessary?
	  canvas.setAttribute('autocomplete', 'on');
          canvas.setAttribute('autocorrect', 'on');
          canvas.setAttribute('autocapitalize', 'on');
          canvas.setAttribute('spellcheck', 'on');

	  recognizer.focus();
          break;
        case 'zooming':
          if (evt.touches.length > 0) break;
          touch.state = 'idle';
          zoomEnd(evt);
          return;
        }
      }
    };
    canvas.ontouchcancel = function(evt) {
      canvas.ontouchend(evt);
    };
    // cursorCanvas shows Squeak cursor
    if (display.cursorCanvas) {
      var absolute = window.getComputedStyle(canvas).position === "absolute";
      display.cursorCanvas.id = "cursorCanvas";
      display.cursorCanvas.style.display = "block";
      display.cursorCanvas.style.position = absolute ? "absolute": "fixed";
      display.cursorCanvas.style.cursor = "none";
      display.cursorCanvas.style.background = "transparent";
      display.cursorCanvas.style.pointerEvents = "none";
      display.cursorCanvas.style.visibility = 'hidden';
      canvas.parentElement.appendChild(display.cursorCanvas);
    }

    // wheel stuff
    document.addEventListener(
      "wheel",
      function(event) {
	if (!display.vm) return true;

	event.preventDefault();
	event.stopPropagation();

	recordModifiers({ctrlKey: true, metaKey: true}, display);

	if (event.wheelDeltaY) {
	  if (event.wheelDeltaY < 0) recordKeyboardEvent(31, event.timeStamp, display, display.eventQueue);
	  else recordKeyboardEvent(30, event.timeStamp, display, display.eventQueue);}},
      {passive: false});
    
    // keyboard stuff
    document.onkeypress = function(evt) {
      /* 
	 if (canvas.otherCanvasActive) {
	 evt.preventDefault();
	 evt.stopPropagation();
	 return true;}

	 if (!display.vm) return true;
	 // check for ctrl-x/c/v/r
	 if (/[CXVR]/.test(String.fromCharCode(evt.charCode + 64)))
         return true;  // let browser handle cut/copy/paste/reload
	 recordModifiers(evt, display);
	 recordKeyboardEvent(evt.charCode, evt.timeStamp, display, eventQueue);
	 evt.preventDefault();
	 evt.stopPropagation();
      */
    };
    document.onkeydown = function(evt) {
      if (top.squeakDisplay && top.squeakDisplay.vm) document.body.style.cursor = 'none';
      checkFullscreen();
      if (canvas.otherCanvasActive) {
	return true;}
      if (!display.vm) {
	return true;}
      if (evt.shiftKey) canvas.shiftKey = true;
      recordModifiers(evt, display);
      var squeakCode = ({
        8: 8,   // Backspace
        9: 9,   // Tab
        13: 13, // Return
        27: 27, // Escape
        32: 32, // Space
        33: 11, // PageUp
        34: 12, // PageDown
        35: 4,  // End
        36: 1,  // Home
        37: 28, // Left
        38: 30, // Up
        39: 29, // Right
        40: 31, // Down
        45: 5,  // Insert
        46: 127, // Delete
      })[evt.keyCode];
      if (squeakCode) { // special key pressed
        recordKeyboardEvent(squeakCode, evt.timeStamp, display, display.eventQueue);
	evt.stopPropagation();
        return evt.preventDefault();
      }
      var key = evt.key; // only supported in FireFox, others have keyIdentifier
      if (!key && evt.keyIdentifier && evt.keyIdentifier.slice(0,2) == 'U+')
        key = String.fromCharCode(parseInt(evt.keyIdentifier.slice(2), 16));

      var code = key.charCodeAt(0);

      if (key && key.length == 1) {
	if (evt.metaKey || evt.altKey || evt.ctrlKey) {
          if (/[RCXV]/i.test(key))
            return true;  // let browser handle paste and reload exclusively
	  //          if (/[CX]/i.test(key)) {
	  //	    recordKeyboardEvent(code, evt.timeStamp, display, eventQueue);
	  //            return true;  // let browser handle cut and copy
	  //	  }
          if (/[A-Z]/.test(key) && !evt.shiftKey) code += 32;  // make lower-case
	}
      }

      if ((key != 'Control') && (key != 'Shift') && (key != 'Meta') && (key != 'Alt') && (key != 'CapsLock')) {
	recordKeyboardEvent(code, evt.timeStamp, display, display.eventQueue);
	evt.stopPropagation();
	return evt.preventDefault();}
    };
    document.onkeyup = function(evt) {
      if (canvas.otherCanvasActive) {
	return true;}

      if (!display.vm) return true;
      canvas.shiftKey = false;
      recordModifiers(evt, display);
    };
    document.oncopy = function(evt, key) {
      var text = display.executeClipboardCopy(key, evt.timeStamp);
      if (typeof text === 'string') {
        evt.clipboardData.setData("Text", text);
      }
      evt.preventDefault();
    };
    document.oncut = function(evt) {
      if (!display.vm) return true;
      document.oncopy(evt, 'x');
    };
    document.onpaste = function(evt) {
      var text = evt.clipboardData.getData('Text');
      display.executeClipboardPaste(text, evt.timeStamp);
      evt.preventDefault();
    };

    // do not use addEventListener, we want to replace any previous drop handler
    function dragEventHasFiles(evt) {
      for (var i = 0; i < evt.dataTransfer.types.length; i++)
        if (evt.dataTransfer.types[i] == 'Files') return true;
      return false;
    }
    document.ondragover = function(evt) {
      evt.preventDefault();
      if (!dragEventHasFiles(evt)) {
        evt.dataTransfer.dropEffect = 'none';
      } else {
        evt.dataTransfer.dropEffect = 'copy';
        recordDragDropEvent(Squeak.EventDragMove, evt, canvas, display, display.eventQueue);
      }
    };
    document.ondragenter = function(evt) {
      if (!dragEventHasFiles(evt)) return;
      recordDragDropEvent(Squeak.EventDragEnter, evt, canvas, display, display.eventQueue);
    };
    document.ondragleave = function(evt) {
      if (!dragEventHasFiles(evt)) return;
      recordDragDropEvent(Squeak.EventDragLeave, evt, canvas, display, display.eventQueue);
    };
    document.ondrop = function(evt) {
      evt.preventDefault();
      if (!dragEventHasFiles(evt)) return false;
      var files = [].slice.call(evt.dataTransfer.files),
          loaded = [],
          image, imageName = null;
      display.droppedFiles = [];
      files.forEach(function(f) {
        display.droppedFiles.push(f.name);
        var reader = new FileReader();
        reader.onload = function () {
          var buffer = this.result;
          Squeak.filePut(f.name, buffer);
          loaded.push(f.name);
          if (!image && /.*image$/.test(f.name) && (!display.vm || confirm("Run " + f.name + " now?\n(cancel to use as file)"))) {
            image = buffer;
            imageName = f.name;
          }
          if (loaded.length == files.length) {
            if (image) {
              SqueakJS.appName = imageName.slice(0, -6);
              SqueakJS.runImage(image, imageName, display, options);
            } else {
              recordDragDropEvent(Squeak.EventDragDrop, evt, canvas, display, display.eventQueue);
            }
          }
        };
        reader.readAsArrayBuffer(f);
      });
      return false;
    };

    window.onresize = function() {
      if (touch.orig) return; // manually resized
      // call resizeDone only if window size didn't change for 300ms
      var debounceWidth = window.innerWidth,
          debounceHeight = window.innerHeight;
      setTimeout(function() {
        if (debounceWidth == window.innerWidth && debounceHeight == window.innerHeight)
          display.resizeDone();
      }, 300);
      // if no fancy layout, don't bother
      if ((!options.header || !options.footer) && !options.fullscreen) {
        display.width = canvas.width;
        display.height = canvas.height;
        return;
      }
      // CSS won't let us do what we want so we will layout the canvas ourselves.
      var fullscreen = options.fullscreen || display.fullscreen,
          x = 0,
          y = fullscreen ? 0 : options.header.offsetTop + options.header.offsetHeight,
          w = window.innerWidth,
          h = fullscreen ? window.innerHeight : Math.max(100, options.footer.offsetTop - y),
          paddingX = 0, // padding outside canvas
          paddingY = 0;
      // above are the default values for laying out the canvas
      if (!options.fixedWidth) { // set canvas resolution
        if (!options.minWidth) options.minWidth = 700;
        if (!options.minHeight) options.minHeight = 700;
        var scaleW = w < options.minWidth ? options.minWidth / w : 1,
            scaleH = h < options.minHeight ? options.minHeight / h : 1,
            scale = Math.max(scaleW, scaleH);
        display.width = Math.floor(w * scale);
        display.height = Math.floor(h * scale);
        display.initialScale = w / display.width;
      } else { // fixed resolution and aspect ratio
        display.width = options.fixedWidth;
        display.height = options.fixedHeight;
        var wantRatio = display.width / display.height,
            haveRatio = w / h;
        if (haveRatio > wantRatio) {
          paddingX = w - Math.floor(h * wantRatio);
        } else {
          paddingY = h - Math.floor(w / wantRatio);
        }
        display.initialScale = (w - paddingX) / display.width;
      }
      // set size and position
      canvas.style.left = (x + Math.floor(paddingX / 2)) + "px";
      canvas.style.top = (y + Math.floor(paddingY / 2)) + "px";
      canvas.style.width = (w - paddingX) + "px";
      canvas.style.height = (h - paddingY) + "px";
      // set resolution
      if (canvas.width != display.width || canvas.height != display.height) {
        var preserveScreen = options.fixedWidth || !display.resizeTodo, // preserve unless changing fullscreen
            imgData = preserveScreen && display.context.getImageData(0, 0, canvas.width, canvas.height);
        canvas.width = display.width;
        canvas.height = display.height;
        if (imgData) display.context.putImageData(imgData, 0, 0);
      }
      // set cursor scale
      if (display.cursorCanvas && options.fixedWidth) {
        var cursorCanvas = display.cursorCanvas,
            scale = canvas.offsetWidth / canvas.width;
        cursorCanvas.style.width = (cursorCanvas.width * scale) + "px";
        cursorCanvas.style.height = (cursorCanvas.height * scale) + "px";
      }
    };
    window.onresize();
    return display;
  }

  function setupSpinner(vm, options) {
    var spinner = options.spinner;
    if (!spinner) {
      return null;}
    spinner.onmousedown = function(evt) {
      if (confirm(SqueakJS.appName + " is busy. Interrupt?"))
        vm.interruptPending = true;
    };
    return spinner.style;
  }

  var spinnerAngle = 0,
      becameBusy = 0;
  function updateSpinner(spinner, idleMS, vm, display) {
    var busy = idleMS === 0,
        animating = vm.lastTick - display.lastTick < 500;
    if (!busy || animating) {
      spinner.display = "none";
      becameBusy = 0;
    } else {
      if (becameBusy === 0) {
        becameBusy = vm.lastTick;
      } else if (vm.lastTick - becameBusy > 1000) {
        spinner.display = "block";
        spinnerAngle = (spinnerAngle + 30) % 360;
        spinner.webkitTransform = spinner.transform = "rotate(" + spinnerAngle + "deg)";
      }
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // main loop
  //////////////////////////////////////////////////////////////////////////////

  var loop; // holds timeout for main loop

  SqueakJS.runImage = function(buffer, name, display, options) {
    window.onbeforeunload = function(evt) {
      var msg = SqueakJS.appName + " is still running";
      evt.returnValue = msg;
      return msg;
    };
    window.clearTimeout(loop);
    display.reset();
    display.clear();
    display.showBanner("loading app '" + SqueakJS.appName + "'...");
    display.showProgress(0);
    var self = this

    window.setTimeout(function readImageAsync() {
      var image = new Squeak.Image(name);
      image.window = window;
      image.readFromBuffer(
	buffer,
	function startRunning() {
          display.quitFlag = false;
          var vm = new Squeak.Interpreter(image, display);
          SqueakJS.vm = vm;
	  vm.currentInterpretOne = vm.interpretOne;
          localStorage["squeakImageName"] = name;
          setupSwapButtons(options);
          display.clear();
	  // The linear-memory version of the hybrid WASM/JS VM wants this.
	  // vm.image.alignOops();
          display.showBanner("starting app '" + SqueakJS.appName + "'...");
          var spinner = setupSpinner(vm, options);

	  function run() {
	    try {
	      if (display.quitFlag) self.onQuit(vm, display, options);
	      else if (!(display.suspend)) {
		vm.interpret(50, function runAgain(ms) {
		  if (ms == "sleep") ms = 200;
		  if (spinner) updateSpinner(spinner, ms, vm, display);
		  if (loop) window.clearTimeout(loop);
		  loop = window.setTimeout(run, ms);
		})};
	    } catch(error) {
	      console.error(error);
	      // alert(error);
	      debugger
	      loop = window.setTimeout(run, 200);
	    }
	  }

	  display.runNow = function() {
	    window.clearTimeout(loop);
	    run();
	  };

	  display.runFor = function(milliseconds) {
	    var stoptime = Date.now() + milliseconds;
	    do {
	      if (display.quitFlag) return;
	      display.runNow();
	    } while (Date.now() < stoptime);
	  };

	  WebAssembly.instantiateStreaming(
	    fetch("wasm/gc.wasm")).then((wasm) => {
	      vm.testGC = function () {
//		debugger
		return wasm.instance.exports.test()}})
	      
/*	  WebAssembly.instantiateStreaming(
	    fetch("/wasm/interpreter.wasm"),
	    {wasm: {memory: vm.image.memory}}).then((wasm) => {
	      vm.image.minimal = (name == '/minimal2.image')
	      vm.image.youngObjectsTable = 100000000;
	      vm.image.youngObjectsSegment = vm.image.youngObjectsTable + 50000
	      vm.image.dirtyTableAddress = vm.image.youngObjectsSegment + 1000000;
	      vm.image.wasmStarted2 = false;
	      vm.imageName = name;
	      vm.interpretOneWASM = wasm.instance.exports.interpretOne;

	      run()})*/
	  run()
	},
	function readProgress(value) {display.showProgress(value)})},
		      0)
  };

  function processOptions(options) {
    var search = (location.hash || location.search).slice(1),
	args = search && search.split("&");
    if (args) for (var i = 0; i < args.length; i++) {
      var keyAndVal = args[i].split("="),
	  key = keyAndVal[0],
	  val = true;
      if (keyAndVal.length > 1) {
	val = decodeURIComponent(keyAndVal.slice(1).join("="));
	if (val.match(/^(true|false|null|[0-9"[{].*)$/))
	  try { val = JSON.parse(val); } catch(e) {
	    if (val[0] === "[") val = val.slice(1,-1).split(","); // handle string arrays
	    // if not JSON use string itself
	  }
      }
      options[key] = val;
    }
    var root = Squeak.splitFilePath(options.root || "/").fullname;
    Squeak.dirCreate(root, true);
    if (!/\/$/.test(root)) root += "/";
    options.root = root;
    SqueakJS.options = options;
  }

  function fetchTemplates(options) {
    if (options.templates) {
      if (options.templates.constructor === Array) {
	var templates = {};
	options.templates.forEach(function(path){ templates[path] = path; });
	options.templates = templates;
      }
      for (var path in options.templates) {
	var dir = path[0] == "/" ? path : options.root + path,
	    url = Squeak.splitUrl(options.templates[path], options.url).full;
	Squeak.fetchTemplateDir(dir, url);
      }
    }
  }

  function processFile(file, display, options, thenDo) {
    Squeak.filePut(options.root + file.name, file.data, function() {
      console.log("Stored " + options.root + file.name);
      if (file.zip) {
	processZip(file, display, options, thenDo);
      } else {
	thenDo();
      }
    });
  }

  function processZip(file, display, options, thenDo) {
    JSZip().loadAsync(file.data).then(function(zip) {
      var todo = [];
      zip.forEach(function(filename){
	if (!options.image.name && filename.match(/\.image$/))
	  options.image.name = filename;
	if (options.forceDownload || !Squeak.fileExists(options.root + filename)) {
	  todo.push(filename);
	} else if (options.image.name === filename) {
	  // image exists, need to fetch it from storage
	  var _thenDo = thenDo;
	  thenDo = function() {
	    Squeak.fileGet(options.root + filename, function(data) {
	      options.image.data = data;
	      return _thenDo();
	    }, function onError() {
	      Squeak.fileDelete(options.root + file.name);
	      return processZip(file, display, options, _thenDo);
	    });
	  }
	}
      });
      if (todo.length === 0) return thenDo();
      var done = 0;
      display.showBanner("unzipping " + file.name);
      display.showProgress(0);
      todo.forEach(function(filename){
	console.log("Inflating " + file.name + ": " + filename);
	function progress(x) { display.showProgress((x.percent / 100 + done) / todo.length); }
	zip.file(filename).async("arraybuffer", progress).then(function(buffer){
	  console.log("Expanded size of " + filename + ": " + buffer.byteLength);
	  var unzipped = {};
	  if (options.image.name === filename)
	    unzipped = options.image;
	  unzipped.name = filename;
	  unzipped.data = buffer;
	  processFile(unzipped, display, options, function() {
	    if (++done === todo.length) thenDo();
	  });
	});
      });
    });
  }

  function checkExisting(file, display, options, ifExists, ifNotExists) {
    if (!Squeak.fileExists(options.root + file.name))
      return ifNotExists();
    if (file.image || file.zip) {
      // if it's the image or a zip, load from file storage
      Squeak.fileGet(options.root + file.name, function(data) {
	file.data = data;
	if (file.zip) processZip(file, display, options, ifExists);
	else ifExists();
      }, function onError() {
	// if error, download it
	Squeak.fileDelete(options.root + file.name);
	return ifNotExists();
      });
    } else {
      // for all other files assume they're okay
      ifExists();
    }
  }

  function downloadFile(file, display, options, thenDo) {
    display.showBanner("downloading " + file.name + "...");
    var rq = new XMLHttpRequest(),
	proxy = options.proxy || "";
    rq.open('GET', proxy + file.url);
    if (options.ajax) rq.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    rq.responseType = 'arraybuffer';
    rq.onprogress = function(e) {
      if (e.lengthComputable) display.showProgress(e.loaded / e.total);
    };
    rq.onload = function(e) {
      if (this.status == 200) {
	file.data = this.response;
	processFile(file, display, options, thenDo);
      }
      else this.onerror(this.statusText);
    };
    rq.onerror = function(e) {
      if (options.proxy) return alert("Failed to download:\n" + file.url);
      console.warn('Retrying with CORS proxy: ' + file.url);
      var proxy = 'https://crossorigin.me/',
	  retry = new XMLHttpRequest();
      retry.open('GET', proxy + file.url);
      if (options.ajax) retry.setRequestHeader("X-Requested-With", "XMLHttpRequest");
      retry.responseType = rq.responseType;
      retry.onprogress = rq.onprogress;
      retry.onload = rq.onload;
      retry.onerror = function() {alert("Failed to download:\n" + file.url)};
      retry.send();
    };
    rq.send();
  }

  function fetchFiles(files, display, options, thenDo) {
    // check if files exist locally and download if necessary
    function getNextFile() {
      if (files.length === 0)
	return thenDo();
      var file = files.shift(),
	  forceDownload = options.forceDownload || file.forceDownload;
      if (forceDownload) downloadFile(file, display, options, getNextFile);
      else checkExisting(file, display, options,
			 function ifExists() {
			   getNextFile();
			 },
			 function ifNotExists() {
			   downloadFile(file, display, options, getNextFile);
			 });
    }
    getNextFile();
  }

  SqueakJS.runSqueak = function(imageUrl, canvas, options) {
    // we need to fetch all files first, then run the image
    processOptions(options);
    if (!imageUrl && options.image) imageUrl = options.image;
    var baseUrl = options.url || (imageUrl && imageUrl.replace(/[^\/]*$/, "")) || "";
    options.url = baseUrl;
    fetchTemplates(options);
    var display = createSqueakDisplay(canvas, options),
	image = {url: null, name: null, image: true, data: null},
	files = [];
    display.argv = options.argv;
    if (imageUrl) {
      var url = Squeak.splitUrl(imageUrl, baseUrl);
      image.url = url.full;
      image.name = url.filename;
    }
    if (options.files) {
      options.files.forEach(function(f) {
	var url = Squeak.splitUrl(f, baseUrl);
	if (image.name === url.filename) {/* pushed after other files */}
	else if (!image.url && f.match(/\.image$/)) {
	  image.name = url.filename;
	  image.url = url.full;
	} else {
	  files.push({url: url.full, name: url.filename});
	}
      });
    }

    if (!Squeak.fileExists(options.root + image.name)) {
      // If the image file exists, assume there's no need to check the zips.
      if (options.zip) {
	var zips = typeof options.zip === "string" ? [options.zip] : options.zip;
	zips.forEach(function(zip) {
	  var url = Squeak.splitUrl(zip, baseUrl);
	  files.push({url: url.full, name: url.filename, zip: true});
	});
      }}

    if (image.url) files.push(image);

    if (options.document) {
      var url = Squeak.splitUrl(options.document, baseUrl);
      files.push({url: url.full, name: url.filename, forceDownload: options.forceDownload !== false});
      display.documentName = options.root + url.filename;
    }
    options.image = image;
    fetchFiles(files, display, options, function thenDo() {
      Squeak.fsck();
      var image = options.image;
      if (!image.name) return console.log("could not find an image");
      if (!image.data) {
	console.log("could not find image " + image.name);
	document.location.reload();
	return}
      SqueakJS.appName = options.appName || image.name.replace(/\.image$/, "");
      SqueakJS.runImage(image.data, options.root + image.name, display, options);
    });
    return display;
  };

  SqueakJS.quitSqueak = function() {
    SqueakJS.vm.quitFlag = true;
  };

  SqueakJS.onQuit = function(vm, display, options) {
    window.onbeforeunload = null;
    display.vm = null;
    if (options.spinner) options.spinner.style.display = "none";
    if (options.onQuit) options.onQuit(vm, display, options);
    else display.showBanner(SqueakJS.appName + " stopped.");
  };

}); // end module

//////////////////////////////////////////////////////////////////////////////
// browser stuff
//////////////////////////////////////////////////////////////////////////////

if (window.applicationCache) {
  applicationCache.addEventListener('updateready', function() {
    // use original appName from options
    var appName = window.SqueakJS && SqueakJS.options && SqueakJS.options.appName || "SqueakJS";
    if (confirm(appName + ' has been updated. Restart now?')) {
      window.onbeforeunload = null;
      window.location.reload();
    }
  });
}
