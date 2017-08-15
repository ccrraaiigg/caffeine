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
      if (this.mouseDown) {
	this.el.movemouse(
	  event.clientX - this.x,
	  event.clientY - this.y)}

      this.x = event.clientX
      this.y = event.clientY}})

