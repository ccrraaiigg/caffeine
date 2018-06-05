AFRAME.registerComponent(
  'mousemove', {
    schema: {speed: {default: 1}},

    init: function() {
      this.mouseDown = false
      this.x = this.y = 0

      document.addEventListener(
	'mousedown',
	this.OnDocumentMouseDown.bind(this))

      document.addEventListener(
	'mouseup',
	this.OnDocumentMouseUp.bind(this))

      document.addEventListener(
	'mousemove',
	this.OnDocumentMouseMove.bind(this))},

    OnDocumentMouseDown: function(event) {
      this.mouseDown = true
      this.x = event.clientX
      this.y = event.clientY},

    OnDocumentMouseUp: function () {
      this.mouseDown = false},

    OnDocumentMouseMove: function(event) {
      // This differential technique loses accuracy over distance,
      // apparently linearly. The correction factors vary with camera
      // position and viewport size. The factors used here are for the
      // home position in fullscreen on a 16x9 Retina laptop.
      this.el.movemouse(
	Math.round(((event.clientX - this.x) * 1)),
	Math.round(((event.clientY - this.y) * 1.03)))

      this.x = event.clientX
      this.y = event.clientY}})

