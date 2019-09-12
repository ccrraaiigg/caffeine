//
// This file is part of //\ Tarp.
//
// Copyright (C) 2013-2018 Torben Haase <https://pixelsvsbytes.com>
//
// Tarp is free software: you can redistribute it and/or modify it under the
// terms of the GNU Lesser General Public License as published by the Free
// Software Foundation, either version 3 of the License, or (at your option) any
// later version.
//
// Tarp is distributed in the hope that it will be useful, but WITHOUT ANY
// WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
// A PARTICULAR PURPOSE.  See the GNU Lesser General Public License for more
// details.You should have received a copy of the GNU Lesser General Public
// License along with Tarp.  If not, see <http://www.gnu.org/licenses/>.
//
////////////////////////////////////////////////////////////////////////////////

// NOTE The load parameter points to the function, which prepares the
//      environment for each module and runs its code. Scroll down to the end of
//      the file to see the function definition.
(self.Tarp = self.Tarp || {}).require = function(config) {
  "use strict";

  function resolve(id, pwd) {
    var matches = id.match(/^((\.)?.*\/|)(.[^.]*|)(\..*|)$/);
    return (new URL(
      matches[1] + matches[3] + (matches[3] && (matches[4] || ".js")),
      pwd
    )).href;
  }

  function load(id, pwd, asyn) {
    var matches, href, cached, request;
    // NOTE resolve href from id.
    href = config.resolve(id, pwd, resolve);
    // NOTE create cache item if required.
    cached = cache[href] = cache[href] || {
      e: undefined, // error
      m: undefined, // module
      p: undefined, // promise
      r: undefined, // request
      s: undefined, // source
      t: undefined, // type
      u: href, // url
    };
    if (!cached.p) {
      cached.p = new Promise(function(res, rej) {
        request = cached.r = new XMLHttpRequest();
        request.onload = request.onerror = function() {
          var tmp, done, source, pattern, match, loading = 0, pwd2;
            // `request` might have been changed by line 54.
          if (request = cached.r) {
            cached.r = null;
            if ((request.status > 99) && ((href = request.responseURL || href) != cached.u)) {
              if (cache[href]) {
                cached = cache[cached.u] = cache[href];
                cached.p.then(res, rej);
                // NOTE Replace pending request of actual module with the already completed request and abort the
                //      pending request.
                if (cached.r) {
                  tmp = cached.r;
                  cached.r = request;
                  tmp.abort();
                  tmp.onload();
                }
                return;
              }
              else {
                cached.u = href;
                cache[href] = cached;
              }
            }
            if ((request.status > 99) && (request.status < 400)) {
              cached.s = source = request.responseText;
              cached.t = request.getResponseHeader("Content-Type");
              done = function() { if (--loading < 0) res(cached); };
              // NOTE Pre-load submodules if the request is asynchronous (request.$ is true).
              if (request.$) {
                // Remove comments from the source
                source = source.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '');
                // TODO Write a real parser that returns all modules that are preloadable.
                pattern = /require\s*(?:\.\s*resolve\s*(?:\.\s*paths\s*)?)?\(\s*(?:"((?:[^"\\]|\\.)+)"|'((?:[^'\\]|\\.)+)')\s*\)/g;
                while((match = pattern.exec(source)) !== null) {
                  // NOTE Only add modules to the loading-queue that are still pending.
                  pwd2 = (new URL((match[1]||match[2])[0] == "." ? href : config.paths[0], config.root)).href;
                  if ((tmp = load(match[1]||match[2], pwd2, true)).r) {
                    loading++;
                    tmp.p.then(done, done);
                  }
                }
              }
              done();
            }
            else {
              rej(cached.e = new Error(href + " " + request.status));
            }
          }
        };
      });
    }
    // NOTE `request` is only defined if the module is requested for the first time.
    if (request = request || (!asyn && cached.r)) {
      try {
        request.abort();
        request.$ = asyn;
        // NOTE IE requires a true boolean value as third param.
        request.open("GET", href, !!asyn);
        request.send();
      }
      catch (e) {
        request.onerror();
      }
    }
    if (cached.e)
      throw cached.e;
    return cached;
  }

  function evaluate(cached, parent) {
    var module;
    if (!cached.m) {
      module = cached.m = {
        children: new Array(),
        exports: Object.create(null),
        filename: cached.u,
        id: cached.u,
        loaded: false,
        parent: parent,
        paths: config.paths.slice(),
        require: undefined,
        uri: cached.u
      },
      module.require = factory(module);
      parent && parent.children.push(module);
      if (cached.t == "application/json")
        module.exports = JSON.parse(cached.s);
      else
        (new Function(
          "exports,require,module,__filename,__dirname",
          cached.s + "\n//# sourceURL=" + module.uri
        ))(module.exports, module.require, module, module.uri, module.uri.match(/.*\//)[0]);
      module.loaded = true;
    }
    return cached.m;
  }

  function factory(parent) {
    function requireEngine(mode, id, asyn) {
      function afterLoad(cached) {
        var regex = /package\.json$/;
        if (regex.test(cached.u) && !regex.test(id)) {
          parent = evaluate(cached, parent);
          return typeof parent.exports.main == "string" ?
            requireEngine(mode, parent.exports.main, asyn):
            parent.exports;
        }
        else if (mode == 1)
          return cached.u;
        else if (mode == 2)
          return [pwd.match(/.*\//)[0]];
        else
          return evaluate(cached, parent).exports;
      }

      var pwd = (new URL(id[0] == "." ? (parent ? parent.uri : config.root) : config.paths[0], config.root)).href;
      return asyn ?
        new Promise(function(res, rej) { load(id, pwd, asyn).p.then(afterLoad).then(res, rej); }):
        afterLoad(load(id, pwd, asyn));
    }

    var require = requireEngine.bind(undefined, 0);
    require.resolve = requireEngine.bind(require, 1);
    require.resolve.paths = requireEngine.bind(require.resolve, 2);
    return require;
  }

  var cache, configg, require;

  // NOTE Web-worker will use the origin, since location.href is not available.
  cache = Object.create(null);
  config = config || new Object();
  config.paths = config.paths || ["./node_modules/"];
  config.resolve = config.resolve || resolve;
  config.root = config.root || location.href;
  require = factory(null);
  if (config.expose)
    self.require = require;
  if (config.main)
    return require(config.main, !config.sync);
};
