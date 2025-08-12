AFRAME.registerComponent(
  'yrotate',
  {
    init: function () {
      var el = this.el

      function startYRotating(event) {
	window.addEventListener('mousemove', yRotate, false)
	window.addEventListener('mouseup', stopYRotating, false)}

      function yRotate(event) {
	var oldRotation = el.rig.getAttribute('rotation')

	el.rig.setAttribute(
	  'rotation',
	  {
	    x: oldRotation.x,
	    y: oldRotation.y + (event.movementX / 5),
	    z: oldRotation.z})}

      function stopYRotating(event) {
	window.removeEventListener('mousemove', yRotate, false)
	window.removeEventListener('mouseup', stopYRotating, false)}

      el.setAttribute('class', 'squeaky')
      
      el.addEventListener(
	'mouseenter',
	function (event) {if (!mousedown) disableControls('look-controls')})

      el.addEventListener(
	'mousedown',
	startYRotating,
	false)

      el.addEventListener(
	'mouseleave',
	function (event) {enableControls('look-controls')},
	false)}})

