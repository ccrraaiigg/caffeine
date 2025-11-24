Caffeine is a livecoding environment for [web
browsers](https://developer.mozilla.org/en-US),
[Deno](https://deno.land), and
[WebAssembly](https://en.wikipedia.org/wiki/WebAssembly). After adding
it to a webpage, you can use it to make live persistent changes to
that page and other pages running Caffeine, without reloading.

You can interact with Caffeine from JavaScript in several ways:

- as a headless Web Worker, with which you post and receive messages (you are responsible for all DOM manipulation).
- as an IDE in a headful IFrame, with Caffeine able to manipulate the DOM directly.
- on a headless Deno server, with which you also exchange messages (over a WebSocket).
- through a headful DevTools panel IDE, using the Chrome Debugging Protocol to manipulate every page your browser is running.

Caffeine's underlying computation engine is
[SqueakJS](https://squeak.js.org), an open-source
[Smalltalk](https://en.wikipedia.org/wiki/Smalltalk), assisted by
dynamically-generated
[WebAssembly](https://wikiwand.com/en/Webassembly). It features a
bi-directional JavaScript bridge, enabling Smalltalk methods to send
messages to JavaScript objects, and provide Smalltalk block closures
as JavaScript promises or callback functions. Caffeine includes the
[Epigram](https://thiscontext.com/2022/06/28/epigram-reifying-grammar-production-rules-for-clearer-parsing-compiling-and-searching)
parser and compiler framework, with which I have written compilers for
Smalltalk, SVG, Protocol Buffers, and WebAssembly.

Caffeine has support for [Squeak](http://squeak.org),
[Pharo](https://pharo.org), [Cuis](http://cuis-smalltalk.org), 3D VR
(via [A-Frame](https://aframe.io) and
[OSC](http://opensoundcontrol.org)), zooming 3D presentations (via
[impress.js](https://impress.js.org)), [VueJS](https://vuejs.org),
[WebMIDI](https://github.com/djipco/webmidi),
[Observable](https://observablehq.com), [Web
Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API),
[DevTools](https://chrome.google.com/webstore/detail/caffeine/jhbbonmkjnodgkammmgfhaljmicpeakb)
and many other JS frameworks.

You can read more about the design of Caffeine, and new features, at
my blog, [https://thiscontext.com](https://thiscontext.com). Check out
the [teaser trailer](https://www.youtube.com/watch?v=8VzXmgAQWjc&t=8s)
on YouTube.

[This repository](https://github.com/ccrraaiigg/caffeine) is the
content for [the Caffeine website](https://caffeine.js.org),
**caffeine.js.org**. It provides these endpoints:

| ------------------------------------------------- | ---------------------------- |  
| [/](https://caffeine.js.org/)                     | this page  |  
| [/spa](https://caffeine.js.org/spa)                 | Caffeine on a single-page-application site |  
| [/worldly](https://caffeine.js.org/worldly)                 | Worldly, an [A-Frame](https://aframe.io)-powered in-world virtual reality livecoding space |  
| [/minimal](https://caffeine.js.org/minimal)             | a minimal object memory |
| [/talks/2018-08-25-demos-teaser](https://caffeine.js.org/talks/2018-08-25-demos-teaser)             | an [impress](https://impress.js.org)-powered presentation about Caffeine and livecoding |  
| [/talks/2023-02-22-wasm](https://caffeine.js.org/talks/2023-02-22-wasm)             | an [impress](https://impress.js.org)-powered presentation about Caffeine and WebAssembly ([video](https://vimeo.com/858207177)) |  
| [/developer](https://caffeine.js.org/developer)   | a developer-oriented overview of Caffeine, with a tutorial for developing with it |  
| [/beatshifting](https://caffeine.js.org/beatshifting) | Beatshifting :: Play Music in Sync and Out of Phase |  
| [/pharo](https://caffeine.js.org/pharo)           | a demo of [Pharo](https://pharo.org) 7 |  
| [/cuis](https://caffeine.js.org/cuis)             | a demo of [Cuis](http://cuis-smalltalk.org) |  
| [/tabulator](https://caffeine.js.org/tabulator)   | a tabs-management app, with a [VueJS](https://vuejs.org) user interface |  
| [/files](https://caffeine.js.org/files)           | a listing of the files Caffeine has stored in your web browser's cache. You can download files from it, and drop new files into it. |  

There are [issues](https://github.com/ccrraaiigg/caffeine/issues) and
[projects](https://github.com/ccrraaiigg/caffeine/projects) to follow;
please do! Current activity is focused on [making Caffeine a
productive in-world VR livecoding
environment](https://github.com/ccrraaiigg/caffeine/projects/1),
deploying livecoded
[WebComponent](https://wikiwand.com/en/WebComponents)-based webapps,
and developing LLM-based livecoding collaborators.

<br>
Craig Latta
<br>
[Black Page Digital](http://blackpagedigital.com)
<br>
Amsterdam :: San Francisco
<br>
[@ccrraaiigg@mastodon.social](https://mastodon.social/ccrraaiigg)

