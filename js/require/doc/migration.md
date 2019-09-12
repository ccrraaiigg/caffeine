# Migration from Smoothie to Tarp.require

## What is happening?

Smoothie is obsolete and will be replaced by Tarp.require on **January 31 2018**. Tarp.require is a vastly improved
version of Smoothie, so I recommend to use this one once the switch has been done.

From that day on the *master* branch will be synced with the *tarp* branch. The *smoothie* branch will continue to
exist, but won't be updated anymore.

Also the name of the repository will change from *letorbi/smoothie* to *letorbi/tarp.require*. Requests to
*https://github.com/letorbi/smoothie.git* will be redirected, but it is recommended to update the remote URL of your
repo:

```
git remote set-url origin https://github.com/letorbi/tarp.require.git
```

## When shall I stick with Smoothie?

The only reason to keep using Smoothie is, if you are using one of its features that are not supported by Tarp.require
anymore. Here are the unsupported features with some typical code that indentifies their use:

  * **Path prefixes:** `require("0:module1")`
  * **Module-ID arrays:** `require(["module1", "module2"])`
  * **Preloaded modules:** `Smoothie.requirePreloaded: { module1: function() { /* module code */ } }`
  * **Compiler hooks:** `Smoothie.requireCompiler = function() { /* compiler code */ }` 
  * **Module bundles:** `module['module1'] = function() { /* module code */ }`

## How can I keep using Smoothie?

If you are using one of the features mentioned above, is is probably the easiest way for you to just keep using Smoothie
instead of Tarp.require for now. In that case you can switch from the *master* branch of this repository to the already
existing *smoothie* branch.

The *smoothie* branch will always contain the latest version of Smoothie, but won't receive any updates anymore.
Therefore it is recommended to switch to Tarp.require as soon as possible.

## How do I switch from Smoothie to Tarp.require?

If you just use Smoothie's implementation of `require()`, switching is pretty easy:

  * Pull the *master* branch on February 1 2018
  * Remove the line `<script src="smoothie/standalone/require.min.js">`
  * Replace it with `<script src="smoothie/require.min.js">`
  * Add the line `<script>var require = Tarp.require;</script>`

If you're using Smoothie's boot-loader in your project, switching is a bit different, but still easy:

  * Pull the *master* branch on February 1 2018
  * Remove the line `<script src="smoothie/smoothie.min.js">`
  * Replace it with `<script src="smoothie/require.min.js">`
  * Add the line `<script src="smoothie/utils/boot.js">`

### How do I fix the default path?

Tarp.require is using *./node_modules/* instead of *./* as its default path. This might cause trouble, if your
require-calls resolve from the default path, which is usally the case if you are making calls like `require(module1)`
(instead of `require(/module1)` or `require(./module1)`).

You have two options to fix this problem:

  1. Move modules from *./module1.js* to *./node_modules/module1.js*
  2. Replace calls like `require('module1')` with `require('./module1')`

### How do I convert asynchronous require-calls?

Asynchronous module-loading is still available in Tarp.require (and even mightier), but the calls look a bit different:

  * **Smoothie:** `require('module', callbackFunc);`
  * **Tarp.require:** `require('module', true).then(callbackFunc)`

Tarp.require is using [Promise](https://developer.mozilla.org/docs/Web/JavaScript/Guide/Using_promises)
to handle asynchronous execution, as you can see from the `.then()` call.

### How to support older browsers?

Tarp.require uses modern features of JavaScript, namely Promises and the [URL interface](https://developer.mozilla.org/en-US/docs/Web/API/URL).
You have to load some small polyfills to have these features available in older browsers.

Please refer to the *Browser support* section in the Tarp.require readme for further advice.
