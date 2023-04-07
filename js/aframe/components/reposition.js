AFRAME.registerComponent(
  'reposition',
  {
    init: function () {
      var el = this.el

      function startRepositioning(event) {
	window.addEventListener('mousemove', reposition, false)
	window.addEventListener('mouseup', stopRepositioning, false)}

      function reposition(event) {
	// Move along the x or z axis, depending on the y-rotation of the camera.

	var oldRigPosition = el.rig.getAttribute('position'),
	    newRigPosition = new THREE.Vector3(),
	    positionDelta = new THREE.Vector3(),
	    factor = 0.01,
	    alignedOnZ = Math.abs((Math.cos((camera.getAttribute('rotation').y + 90) * (Math.PI * 2 / 360)))) < Math.cos(Math.PI / 4)

	if (alignedOnZ) {
	  if (camera.getAttribute('position').z > oldRigPosition.z)
	    newRigPosition.x = oldRigPosition.x + (factor * event.movementX)
	  else
	    newRigPosition.x = oldRigPosition.x - (factor * event.movementX)

	  if (event.shiftKey) {
	    newRigPosition.y = oldRigPosition.y - (factor * event.movementY)
	    newRigPosition.z = oldRigPosition.z}
	  else {
	    newRigPosition.y = oldRigPosition.y
	    newRigPosition.z = oldRigPosition.z + (factor * event.movementY)}}
	else {
	  // aligned on X
	  if (camera.getAttribute('position').x > oldRigPosition.x)
	    newRigPosition.z = oldRigPosition.z - (factor * event.movementX)
	  else
	    newRigPosition.z = oldRigPosition.z + (factor * event.movementX)

	  if (event.shiftKey) {
	    newRigPosition.y = oldRigPosition.y - (factor * event.movementY)
	    newRigPosition.x = oldRigPosition.x}
	  else {
	    newRigPosition.y = oldRigPosition.y
	    newRigPosition.x = oldRigPosition.x + (factor * event.movementY)}}

	positionDelta.x = newRigPosition.x - oldRigPosition.x
	positionDelta.y = newRigPosition.y - oldRigPosition.y
	positionDelta.z = newRigPosition.z - oldRigPosition.z

	el.rig.setAttribute(
	  'position',
	  {
	    x: oldRigPosition.x + positionDelta.x,
	    y: oldRigPosition.y + positionDelta.y,
	    z: oldRigPosition.z + positionDelta.z})}

      function stopRepositioning(event) {
	window.removeEventListener('mousemove', reposition, false)
	window.removeEventListener('mouseup', stopRepositioning, false)}

      el.setAttribute('class', 'squeaky')
      
      el.addEventListener(
	'mouseenter',
	function (event) {if (!mousedown) disableControls('look-controls')})

      el.addEventListener(
	'mousedown',
	startRepositioning,
	false)

      el.addEventListener(
	'mouseleave',
	function (event) {enableControls('look-controls')},
	false)}})

