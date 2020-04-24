Caffeine is a livecoding environment for [web browsers](https://developer.mozilla.org/en-US), [Node.js](https://en.wikipedia.org/wiki/Node.js), and [WebAssembly](https://en.wikipedia.org/wiki/WebAssembly). After adding it to a webpage, you can use it to make live persistent changes to that page and other pages running Caffeine, without reloading.

You can interact with Caffeine from JavaScript in several ways:

- as a headless Web Worker, with which you post and receive messages (you are responsible for all DOM manipulation).
- as an IDE in a headful IFrame, with Caffeine able to manipulate the DOM directly.
- on a headless Node server, with which you also exchange messages (over a WebSocket).
- through a headful DevTools panel IDE, using the Chrome Debugging Protocol to manipulate every page your browser is running.

Caffeine's underlying computation engine is [SqueakJS](https://squeak.js.org), an open-source [Smalltalk](https://en.wikipedia.org/wiki/Smalltalk). It features a bi-directional JavaScript bridge, enabling Smalltalk methods to send messages to JavaScript objects, and provide Smalltalk block closures as JavaScript promises or callback functions.

Caffeine has support for [Squeak](http://squeak.org), [Pharo](https://pharo.org), [Cuis](http://cuis-smalltalk.org), 3D VR (via [A-Frame](https://aframe.io) and [OSC](http://opensoundcontrol.org)), zooming 3D presentations (via [impress.js](https://impress.js.org)), [VueJS](https://vuejs.org), [WebMIDI](https://github.com/djipco/webmidi), [Observable](https://observablehq.com), [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API), [DevTools](https://chrome.google.com/webstore/detail/caffeine/jhbbonmkjnodgkammmgfhaljmicpeakb) and many other JS frameworks.

You can read more about the design of Caffeine, and new features, at my blog, [https://thiscontext.com](https://thiscontext.com). Check out the [teaser trailer](https://www.youtube.com/watch?v=8VzXmgAQWjc&t=8s) on YouTube.

[This repository](https://github.com/ccrraaiigg/caffeine) is the content for [the Caffeine website](https://caffeine.js.org), **caffeine.js.org**. It provides these endpoints:

| ------------------------------------------------- | ---------------------------- |
| [/](https://caffeine.js.org/)                     | this page  |
| [/talk](https://caffeine.js.org/talk)             | an [impress](https://impress.js.org)-powered presentation about Caffeine and livecoding |
| [/developer](https://caffeine.js.org/developer)   | a developer-oriented overview of Caffeine, with a tutorial for developing with it |
| [/2d](https://caffeine.js.org/2d)               | Caffeine on a single-page application site |
| [/3d](https://caffeine.js.org/3d)       | an [A-Frame](https://aframe.io)-powered in-world virtual reality livecoding space |
| [/pharo](https://caffeine.js.org/pharo)           | a demo of [Pharo](https://pharo.org) 7 |
| [/cuis](https://caffeine.js.org/cuis)             | a demo of [Cuis](http://cuis-smalltalk.org) |
| [/tabulator](https://caffeine.js.org/tabulator)   | a tabs-management app, with a [VueJS](https://vuejs.org) user interface |
| [/files](https://caffeine.js.org/files)           | a listing of the files Caffeine has stored in your web browser's cache. You can download files from it, and drop new files into it. |

There are [issues](https://github.com/ccrraaiigg/caffeine/issues) and [projects](https://github.com/ccrraaiigg/caffeine/projects) to follow; please do! Current activity is focused on [making Caffeine a productive in-world VR livecoding environment](https://github.com/ccrraaiigg/caffeine/projects/1), and deploying livecoded [VueJS](https://vuejs.org) web apps.


<br>
Craig Latta
<br>
[Black Page Digital](http://blackpagedigital.com)
<br>
Amsterdam :: San Francisco
<br>
[@ccrraaiigg](https://twitter.com/ccrraaiigg)

