// fake enough of the HTML5 environment to get squeak.js to load
var window = this,
    document = new Object,
    canvas = new OffscreenCanvas(1400, 870)

window.localStorage = {}

importScripts("../squeakjs/squeak.js")

onmessage = function (event) {
  switch (event.data.instruction) {
  case 'start':
    window.localStorage['squeak:/'] = event.data.storage

    window.SqueakJS.runSqueak(
      'caffeine.image',
      canvas,
      {cursor: false})
    break
  case 'input event':
    var inputEvent = new Event('mousedown')

    inputEvent.properties = event.data.event
    canvas.dispatchEvent(inputEvent)
    break
  case 'mouseenter':
    window.squeakDisplay.vm = window.SqueakJS.vm
    break
  case 'mouseleave':
    if (window.squeakDisplay) squeakDisplay.vm = null}}

