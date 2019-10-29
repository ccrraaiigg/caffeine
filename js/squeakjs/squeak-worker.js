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


// Set up an environment for running the SqueakJS VM headlessly in a Web Worker.


//////////////////////////////////////////////////////////////////////////////
// these functions fake the Lively module and class system
// just enough so the loading of vm.js succeeds
//////////////////////////////////////////////////////////////////////////////

(function () {
  self.module = function(dottedPath) {
    if (dottedPath === "") return self
    var path = dottedPath.split("."),
	name = path.pop(),
	parent = module(path.join(".")),
	myself = parent[name]
    
    if (!myself) parent[name] = myself = {
      loaded: false,
      pending: [],
      requires: function(req) {
	return {
          toRun: function(code) {
            function load() {
              code()
              myself.loaded = true
              myself.pending.forEach(function(f){f()})
            }
            if (req && !module(req).loaded) {
              module(req).pending.push(load)
            } else {
              load()
            }
          }
	}
      },
    }
    return myself
  }

  Object.extend = function(obj /* + more args */ ) {
    // skip arg 0, copy properties of other args to obj
    for (var i = 1; i < arguments.length; i++)
      if (typeof arguments[i] == 'object')
	for (var name in arguments[i])
          obj[name] = arguments[i][name]
  }

  Function.prototype.subclass = function(classPath /* + more args */ ) {
    // create subclass
    var subclass = function() {
      if (this.initialize) this.initialize.apply(this, arguments)
      return this
    }
    // set up prototype
    var protoclass = function() { }
    protoclass.prototype = this.prototype
    subclass.prototype = new protoclass()
    // skip arg 0, copy properties of other args to prototype
    for (var i = 1; i < arguments.length; i++)
      Object.extend(subclass.prototype, arguments[i])
    // add class to module
    var modulePath = classPath.split("."),
	className = modulePath.pop()
    module(modulePath.join('.'))[className] = subclass
    return subclass
  }

  //////////////////////////////////////////////////////////////////////////////
  // load vm, plugins, and other libraries
  //////////////////////////////////////////////////////////////////////////////

  var vmDir,
      toLoad
  
  vmDir = 'http://localhost/js/squeakjs/'

  self.importScripts(
    vmDir + "jit.js",
    vmDir + "plugins/FloatArrayPlugin.js",
    vmDir + "plugins/Flow.js",
    vmDir + "plugins/LargeIntegers.js",
    vmDir + "plugins/Matrix2x3Plugin.js",
    vmDir + "plugins/MiscPrimitivePlugin.js",
    //    vmDir + "plugins/SocketPlugin.js",
    //    vmDir + "plugins/SqueakSSL.js",
    vmDir + "plugins/StarSqueakPlugin.js",
    vmDir + "plugins/ZipPlugin.js",
    vmDir + "lib/lz-string.js",
    vmDir + "lib/jszip.js",
    vmDir + "lib/FileSaver.js",
    vmDir + "vm.js")


  module("SqueakJS").requires("users.bert.SqueakJS.vm").toRun(function() {

    // if in private mode set localStorage to a regular dict
    var localStorage = self.localStorage
    try {
      localStorage["squeak-foo:"] = "bar"
      if (localStorage["squeak-foo:"] !== "bar") throw Error()
      delete localStorage["squeak-foo:"]
    } catch(e) {
      localStorage = {}
    }


    //////////////////////////////////////////////////////////////////////////////
    // main loop
    //////////////////////////////////////////////////////////////////////////////

    var loop // holds timeout for main loop

    SqueakJS.runImage = function(buffer, name, options) {
      self.onbeforeunload = function(evt) {
	var msg = SqueakJS.appName + " is still running"
	evt.returnValue = msg
	return msg
      }
      self.clearTimeout(loop)

      self.setTimeout(function readImageAsync() {
	var image = new Squeak.Image(name)
	image.readFromBuffer(buffer, function startRunning() {
	  self.quitFlag = false
          var vm = new Squeak.Interpreter(image, null)
          SqueakJS.vm = vm
          localStorage["squeakImageName"] = name
          function run() {
            try {
              if (self.quitFlag) self.onQuit(vm, null, options)
              else if (!(self.suspend)) {
		vm.interpret(50, function runAgain(ms) {
                  if (ms == "sleep") ms = 200
                  loop = self.setTimeout(run, ms)
		})}
            } catch(error) {
              console.error(error)
	      debugger
	      loop = self.setTimeout(run, 200)
            }
          }
          self.runNow = function() {
            self.clearTimeout(loop)
            run()
          }
          self.runFor = function(milliseconds) {
            var stoptime = Date.now() + milliseconds
            do {
              if (self.quitFlag) return
              self.runNow()
            } while (Date.now() < stoptime)
          }
          run()
	},
			     function readProgress(value) {})
      }, 0)
    }

    function processOptions(options) {
      var search = (location.hash || location.search).slice(1),
          args = search && search.split("&")
      if (args) for (var i = 0; i < args.length; i++) {
	var keyAndVal = args[i].split("="),
            key = keyAndVal[0],
            val = true
	if (keyAndVal.length > 1) {
          val = decodeURIComponent(keyAndVal.slice(1).join("="))
          if (val.match(/^(true|false|null|[0-9"[{].*)$/))
            try { val = JSON.parse(val) } catch(e) {
              if (val[0] === "[") val = val.slice(1,-1).split(",") // handle string arrays
              // if not JSON use string itself
            }
	}
	options[key] = val
      }
      var root = Squeak.splitFilePath(options.root || "/").fullname
      Squeak.dirCreate(root, true)
      if (!/\/$/.test(root)) root += "/"
      options.root = root
      SqueakJS.options = options
    }

    function fetchTemplates(options) {
      if (options.templates) {
	if (options.templates.constructor === Array) {
          var templates = {}
          options.templates.forEach(function(path){ templates[path] = path })
          options.templates = templates
	}
	for (var path in options.templates) {
          var dir = path[0] == "/" ? path : options.root + path,
              url = Squeak.splitUrl(options.templates[path], options.url).full
          Squeak.fetchTemplateDir(dir, url)
	}
      }
    }

    function processFile(file, options, thenDo) {
      Squeak.filePut(options.root + file.name, file.data, function() {
	console.log("Stored " + options.root + file.name)
	if (file.zip) {
          processZip(file, options, thenDo)
	} else {
          thenDo()
	}
      })
    }

    self.showProgress = (ignored) => {}
      
    function processZip(file, options, thenDo) {
      JSZip().loadAsync(file.data).then(function(zip) {
	var todo = []
	zip.forEach(function(filename){
          if (!options.image.name && filename.match(/\.image$/))
            options.image.name = filename
          if (options.forceDownload || !Squeak.fileExists(options.root + filename)) {
            todo.push(filename)
          } else if (options.image.name === filename) {
            // image exists, need to fetch it from storage
            var _thenDo = thenDo
            thenDo = function() {
              Squeak.fileGet(options.root + filename, function(data) {
		options.image.data = data
		return _thenDo()
              }, function onError() {
		Squeak.fileDelete(options.root + file.name)
		return processZip(file, options, _thenDo)
              })
            }
          }
	})
	if (todo.length === 0) return thenDo()
	var done = 0
	todo.forEach(function(filename){
          console.log("Inflating " + file.name + ": " + filename)
          function progress(x) { self.showProgress((x.percent / 100 + done) / todo.length) }
          zip.file(filename).async("arraybuffer", progress).then(function(buffer){
            console.log("Expanded size of " + filename + ": " + buffer.byteLength)
            var unzipped = {}
            if (options.image.name === filename)
              unzipped = options.image
            unzipped.name = filename
            unzipped.data = buffer
            processFile(unzipped, options, function() {
              if (++done === todo.length) thenDo()
            })
          })
	})
      })
    }

    function checkExisting(file, options, ifExists, ifNotExists) {
      if (!Squeak.fileExists(options.root + file.name))
	return ifNotExists()
      if (file.image || file.zip) {
	// if it's the image or a zip, load from file storage
	Squeak.fileGet(options.root + file.name, function(data) {
          file.data = data
          if (file.zip) processZip(file, options, ifExists)
          else ifExists()
	}, function onError() {
          // if error, download it
          Squeak.fileDelete(options.root + file.name)
          return ifNotExists()
	})
      } else {
	// for all other files assume they're okay
	ifExists()
      }
    }

    function downloadFile(file, options, thenDo) {
      console.log("downloading " + file.name + "...")
      var rq = new XMLHttpRequest(),
          proxy = options.proxy || ""
      rq.open('GET', proxy + file.url)
      if (options.ajax) rq.setRequestHeader("X-Requested-With", "XMLHttpRequest")
      rq.responseType = 'arraybuffer'
      rq.onprogress = function(e) {
      }
      rq.onload = function(e) {
	if (this.status == 200) {
          file.data = this.response
          processFile(file, options, thenDo)
	}
	else this.onerror(this.statusText)
      }
      rq.onerror = function(e) {
	if (options.proxy) return alert("Failed to download:\n" + file.url)
	console.warn('Retrying with CORS proxy: ' + file.url)
	var proxy = 'https://crossorigin.me/',
            retry = new XMLHttpRequest()
	retry.open('GET', proxy + file.url)
	if (options.ajax) retry.setRequestHeader("X-Requested-With", "XMLHttpRequest")
	retry.responseType = rq.responseType
	retry.onprogress = rq.onprogress
	retry.onload = rq.onload
	retry.onerror = function() {alert("Failed to download:\n" + file.url)}
	retry.send()
      }
      rq.send()
    }

    function fetchFiles(files, options, thenDo) {
      // check if files exist locally and download if nessecary
      function getNextFile() {
	if (files.length === 0)
          return thenDo()
	var file = files.shift(),
            forceDownload = options.forceDownload || file.forceDownload
	if (forceDownload) downloadFile(file, options, getNextFile)
	else checkExisting(file, options,
			   function ifExists() {
			     getNextFile()
			   },
			   function ifNotExists() {
			     downloadFile(file, options, getNextFile)
			   })
      }
      getNextFile()
    }

    SqueakJS.runSqueak = function(imageUrl, options) {
      // we need to fetch all files first, then run the image
      processOptions(options)
      if (!imageUrl && options.image) imageUrl = options.image
      var baseUrl = options.url || (imageUrl && imageUrl.replace(/[^\/]*$/, "")) || ""
      options.url = baseUrl
      fetchTemplates(options)
      var image = {url: null, name: null, image: true, data: null},
          files = []

      if (imageUrl) {
	var url = Squeak.splitUrl(imageUrl, baseUrl)
	image.url = url.full
	image.name = url.filename
      }
      if (options.files) {
	options.files.forEach(function(f) {
          var url = Squeak.splitUrl(f, baseUrl)
          if (image.name === url.filename) {/* pushed after other files */}
          else if (!image.url && f.match(/\.image$/)) {
            image.name = url.filename
            image.url = url.full
          } else {
            files.push({url: url.full, name: url.filename})
          }
	})
      }

      if (!Squeak.fileExists(options.root + image.name)) {
	// If the image file exists, assume there's no need to check the zips.
	if (options.zip) {
          var zips = typeof options.zip === "string" ? [options.zip] : options.zip
          zips.forEach(function(zip) {
            var url = Squeak.splitUrl(zip, baseUrl)
            files.push({url: url.full, name: url.filename, zip: true})
          })
	}}

      if (image.url) files.push(image)

      if (options.document) {
	var url = Squeak.splitUrl(options.document, baseUrl)
	files.push({url: url.full, name: url.filename, forceDownload: options.forceDownload !== false})
      }
      options.image = image
      fetchFiles(files, options, function thenDo() {
	Squeak.fsck()
	var image = options.image
	if (!image.name) return console.log("could not find an image")
	if (!image.data) {
	  console.log("could not find image " + image.name)
	  document.location.reload()
	  return}
	SqueakJS.appName = options.appName || image.name.replace(/\.image$/, "")
	SqueakJS.runImage(image.data, options.root + image.name, options)
      })
      return self
    }

    SqueakJS.quitSqueak = function() {
      SqueakJS.vm.quitFlag = true
    }

    SqueakJS.onQuit = function(vm, options) {
      self.onbeforeunload = null
      if (options.onQuit) options.onQuit(vm, options)
    }

  }) // end module

  //////////////////////////////////////////////////////////////////////////////
  // browser stuff
  //////////////////////////////////////////////////////////////////////////////

  if (self.applicationCache) {
    applicationCache.addEventListener('updateready', function() {
      // use original appName from options
      var appName = self.SqueakJS && SqueakJS.options && SqueakJS.options.appName || "SqueakJS"
      self.onbeforeunload = null
      self.location.reload()
    })
  }


  // communication with the main thread
  
  self.onmessage = (message) => {
    switch (message.data) {
    case 'start':
      var imageName = 'pod'
      
      SqueakJS.runSqueak(
	imageName + '.image',
	{
	  zip: [
	    'memories/' + imageName + '.zip',
	    'sources/SqueakV46.sources.zip'],
	  swapButtons: true,
	  appName: 'pod',
	  proxy: "http://localhost/",
	  parameters: {fibbly: 'wibbly'}})

      break
    case 'debug':
      debugger
      break}}

})()
