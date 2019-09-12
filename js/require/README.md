**Important notice:** Tarp.require is the replacement of [Smoothie](https://github.com/letorbi/tarp.require/tree/smoothie).
It introduces a number of new features and improvements, so it is recommended to use Tarp.require from now on. Please
read [the migration documentation](https://github.com/letorbi/tarp.require/blob/master/doc/migration.md) for further
information.

//\ Tarp.require - a lightweight JavaScript module loader
=========================================================
Tarp.require is a CommonJS and Node.js compatible module loader licensed as open source under the LGPL v3. It aims to be
as lightweight as possible while not missing any features.

*Tarp.require has finally reached a stable state. This means that the version 1.x branch will only receive bugfixes from
now on. An improved version of Tarp.require with new features and breaking changes can be found in the tarp2-branch.*

## Features

* **Compatible** NodeJS 9.2.0 and CommonJS modules 1.1
* **Plain** No dependencies, no need to compile/bundle/etc the modules
* **Asynchronous** Non-blocking loading of module files
* **Modern** Makes use of promises and other features (support for older browsers via polyfills)
* **Lightweight** Just about 180 lines of code (incl. comments), minified version is about 2kB

### Browser compatibility

* Firefox 29+
* Chrome 33+
* Edge 12+
* Safari 7.1+
* iOS Safari 8+
* Android Browser 4.4.4+
* Opera 20+
* Internet Explorer 10+ (with [URL polyfill](https://github.com/lifaon74/url-polyfill) and [ES6 Promise polyfill](https://github.com/lahmatiy/es6-promise-polyfill))

## Installation

The easiest way to install Tarp.require is via NPM:

```
$ npm install --save @tarp/require
```

If you don't want to use NPM you can just clone the repository directly or add it to your git repository as a submodule:

```
$ git submodule add https://github.com/letorbi/tarp.require.git
```

## Usage

Assuming you've installed Tarp.require in the folder *//example.com/node_modules/@tarp/require* and your HTML-document
is located at *//example.com/page/index.html*, you only have to add the following lines to your HTML to load the script
located at *//example.com/page/scripts/main.js* as your main-module:

```
<script src="/node_modules/@tarp/require/require.min.js"></script>
<script>Tarp.require({main: "./scripts/main"});</script>
```

Inside your main-module (and any sub-module, of course) you can use `require()` as you know it from CommonJS/NodeJS.
Assuming you're in the main-module, module-IDs will be resolved to the following paths:

  * `require("someModule")` loads *//example.com/page/node_modules/someModule.js*
  * `require("./someModule")` loads *//example.com/page/scripts/someModule.js*
  * `require("/someModule")` loads *//example.com/someModule.js*

Note that global modules are loaded from *//example.com/page/node_modules* and not from *//example.com/node_modules*.
This is because the default global module path is set to `['./node_modules']` and is derived from the location of the
page that initializes Tarp.require.

## Synchronous and asynchronous loading

Tarp.require supports synchronous and asynchronous loading of modules. If you load Tarp.require like described above and
use only simple require calls you won't have to care about anything: Just write `require("someModule")` and Tarp.require
will try to load the module and all its sub-modules asynchronously.

However, there might be occasions where you have to force Tarp.require to load a module synchronously. This is possible,
but you should try to avoid this, because synchronous requests might block the loading process of your page and are
therefore [marked as obsolete](https://xhr.spec.whatwg.org/#the-open()-method) by now.

Keep also in mind that synchronous loading of a module prevents the pre-loading of its sub-modules. You have to
explicitly load a sub-module asynchronously to re-start the pre-loading. 

### What modules can be pre-loaded?

Right now only plain require-calls are pre-loaded. This means that the ID of the module has to be one simple string. 
Also require-calls with more than one parameter are ignored.

**Example:** If a module has been loaded asynchronously and contains the require calls `require("Submodule1")`,
`require("Submodule2", true)` and `require("Submodule" + "3")` somewhere in its code, only *Submodule1* will be
pre-loaded, since the require-call for *Submodule2* has more than one parameter and the module-ID in the require-call
for *Submodule3* is not one simple string.

### Enforce synchronous or asynchronous loading

Synchronous or asynchronous loading of a module can be enforced by adding a boolean value as a second
parameter to the require-call:

```
// explicit synchronous loading
var someModule = require("someModule", false);
someModule.someFunc();

 // explicit asynchronous loading
require("anotherModule", true).then(function(anotherModule) {
    anotherModule.anotherFunc();
});
```

## Path resolving

Tarp.require mainly resolves URLs in the same way as Node.js does resolve paths. The only difference is that
Tarp.require won't look for a file at other locations if it cannot be found at the resolved URL. This decision has been
made due to the fact that modules are usually loaded from a remote server and sending multiple request for different
locations would be very time-consuming. Tarp.require relies on the server to resolve unknown files instead.

### HTTP redirects

Tarp.require is able to handle temporary (301) and permanent (303) HTTP redirects. A common case where redirects might
be handy is to return the contents of *index.js* or *package.json* if an ID without a filename is requested. The
following NGINX configuration rule will mimic the behavior of NodeJS:

```
location /node_modules {
    if ( -f $request_filename ) {
        break;
    }
    if ( -f "${request_filename}package.json" ) {
        return 301 "${request_uri}package.json";
    }
    if ( -f "${request_filename}index.js" ) {
        return 301 "${request_uri}index.js";
    }
    return 404;
}
```

This will redirect all requests like */node_modules/someModule* to */node_modules/someModule/package.json*, if
*/node_modules/someModule* is a directory and if */node_modules/someModule/package.json* is a file. If that file doesn't
exist, the request will be redirected to */node_modules/path/index.js*. If both files don't exist, a "404 Not Found"
response will be sent.

Note: HTTP redirects won't work in IE11 due to limited support of XMLHttpRequest advanced features.

### NPM packages
//
The loading of a NPM package is the only occasion when Tarp.require might redirect a request on its own. Tarp.require
load a module-ID specified the `main` field of a *package.json* file, if the following checks are true:

 1. The *package.json* file is loaded via a redirect (like explained in the section above)
 2. The response contains a valid JSON object 
 3. The object has a property called `main`
 
If that is the case a second request will be triggered to load the modules specified in `main` and the exports of
that module will be returned. Otherwise simply the content of *package.json* is returned.

### The `module.paths` property

Tarp.require always uses the first item of the global `paths` array to resolve an URL from a global module-ID.  Unlike
Node.js it won't iterate over the whole array. Since the global config is always used, any change to `module.paths`
won't affect the loading of modules.

Tarp.require also supports the `require.resolve.paths()` function that returns an array of paths that have been searched
to resolve the given module-ID.

## Options

### Change the global module path

If your modules are not located at *./node_modules/*, you can tell Tarp.require their location via the `paths` option:

```
Tarp.require({main: "./scripts/main", paths: ["/path/to/node/modules"]});
```

### Override path resolver

If you need a more sophisticated path resolver, you can override the default function that resolves a module-id to the
according URL:

```
Tarp.require({main: "./scripts/main", resolver: function(id, pwd, resolve) { ... }});
```

The parameter `id` is the module-id of the module that shall be loaded, `pwd` is the path of the module `require()` is
called from and `resolve` points to the build-in path-resolver function (you might want to call this).

Keep in mind that a custom path-resolver may break NodeJS or CommonJS compatibility, if not implemented
properly.

### Change the document root path

The document root path is used to resolve relative paths inside the `paths` array. It points to `location.href` by
default. You have to set the document root path explicitly, if you want to use Tarp.require inside a web-worker that has
been loaded from a blob.

```
Tarp.require({main: "./scripts/main", root: "/path/to/page/"});
```

### Using `require()` directly in the HTML-document

It is not recommended to load other modules than the main-module directly from your HTML-document. However, if you
really want to use `require()` directly in the HTML-document, you can add `Tarp.require` to the global scope:

```
Tarp.require({expose: true});
```

Keep in mind that a require-call in the HTML-document will load a module synchronously unless you explicitly load it
asynchronously by adding `true` as a second parameter.

### Load the main-module synchronously

If you really need to load the main-module synchronously, you can do it by loading Tarp.require with the
following options:

``` Tarp.require({main: "./scripts/main", sync: true}); ```

----

Copyright 2013-2018 Torben Haase \<https://pixelsvsbytes.com>
