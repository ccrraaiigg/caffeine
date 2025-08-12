scene.renderingNormally = true

window.animatePositionAndRotation = (element, position, rotation) => {
  AFRAME.ANIME({
    targets: [element.object3D.position],
    x: position.x,
    y: position.y,
    z: position.z,
    easing: 'easeInOutSine',
    duration: 500})

  AFRAME.ANIME({
    targets: [element.object3D.rotation],
    x: rotation.x,
    y: rotation.y,
    z: rotation.z,
    easing: 'easeInOutSine',
    duration: 500})}

window.mobilecheck = function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|quest|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;};

function slowRender () {
  var delta

  if (this.clock) {
    delta = this.clock.getDelta() * 1000
    this.time = this.clock.elapsedTime * 1000

    if (window.aSession) {window.aSession.step(this.time)}
    if (this.isPlaying) {this.tick(this.time, delta)}

    scene.slowRenderTimeout = setTimeout(
      (function () {
	scene.renderer.setAnimationLoop(this.render)
	scene.renderer.render(this.object3D, this.camera, this.renderTarget)
      
	if (this.isPlaying) {this.tock(this.time, delta)}}).bind(this),
      1000)}}

function normalRender () {
  var delta

  if (this.clock) {
    delta = this.clock.getDelta() * 1000
    this.time = this.clock.elapsedTime * 1000

    if (this.isPlaying) {this.tick(this.time, delta)}

    scene.renderer.setAnimationLoop(this.render)
    scene.renderer.render(this.object3D, this.camera, this.renderTarget)
  
    if (this.isPlaying) {this.tock(this.time, delta)}}}

scene.now = Date.now()

function spikeRendering () {
  var timeout

  if (scene.slowRenderOnsetTimeout) {
    clearTimeout(scene.slowRenderOnsetTimeout)
    scene.slowRenderOnsetTimeout = null}

  if (!scene.renderingNormally) {
//    console.log((Date.now() - scene.now) + ': rendering normally')
    scene.now = Date.now()
    
    if (scene.slowRenderTimeout) {
      clearTimeout(scene.slowRenderTimeout)
      scene.slowRenderTimeout = null}

    cancelAnimationFrame(scene.animationFrameID)
    scene.renderer.setAnimationLoop(null)
    scene.render = normalRender.bind(scene)

    scene.renderingNormally = true
    scene.render()
//    if (display.unfreeze) {
//      display.unfreeze()
//      display.unfreeze = null}
  }

  // Code formatting can take a while, but it usually doesn't.
  if (scene.typing) timeout = 500
  else {
    if (scene.hasAnimations) timeout = 10000
    else {
      if (scene.goinghome) timeout = 1000
      else {
	// Raising windows can take a while.
	if (mousedown) timeout = 500
	else timeout = 500}}}

  scene.typing = false
  
  if (!(mobilecheck())) {
    scene.slowRenderOnsetTimeout = setTimeout(
      function () {
	// Set the frame rate to 1 per second.
//	console.log((Date.now() - scene.now) + ': rendering slowly')
	scene.now = Date.now()
	cancelAnimationFrame(scene.animationFrameID)
	scene.renderer.setAnimationLoop(null)
	scene.render = slowRender.bind(scene)
	scene.renderingNormally = false
	scene.render()
//	if (!display.unfreeze) display.unfreeze = SqueakJS.vm.freeze()
	},
      timeout)}}

scene.spikeRendering = spikeRendering

function focusMe (event) {
  event.target.focus()
  event.stopPropagation()}

function controlsEnabled (string) {
  return document.getElementById('camera').getAttribute(string).enabled}

function disableControls (string) {
  document.getElementById('camera').setAttribute(string, {enabled: false})}

function enableControls (string) {
  document.getElementById('camera').setAttribute(string, {enabled: true})}

function vectorFrom(object) {
  return new THREE.Vector3(
    object.x,
    object.y,
    object.z)}

function centerOf(entity) {
  return vectorFrom(entity.getAttribute('position'))}

function rotationOf(entity) {
  return vectorFrom(entity.getAttribute('rotation'))}

function rotate(geometry, rotation) {
  var degreesToRadians = Math.PI / 180
  
  geometry
    .rotateX(rotation.x * degreesToRadians)
    .rotateY(rotation.y * degreesToRadians)
    .rotateZ(rotation.z * degreesToRadians)}

function untranslate(geometry, point) {
  geometry.translate(
    0 - point.x,
    0 - point.y,
    0 - point.z)}

function unrotate(geometry, rotation) {
  rotate(
    geometry,
    vectorFrom(
      0 - rotation.x,
      0 - rotation.y,
      0 - rotation.z))}

function forwardProjectedMouseEvents(camera, plane, canvas) {
  var dispatch = function (planarEvent) {
    var canvasEvent,
	cameraPoint = centerOf(camera),
	cameraRotation = rotationOf(camera),
	intersection,
	intersectionPoint,
	selectedPoint,
	translatedSelectedPoint,
	planeCenter = plane.object3D.getWorldPosition(new THREE.Vector3()),
	planeRotation = rotationOf(plane),
	simplePlane = new THREE.PlaneGeometry(),
	planeInCameraFrame = new THREE.PlaneGeometry(),
	origin = new THREE.Vector3(0, 0, 0),
	planeInCameraFrameVertices,
	simplePlaneVertices,
	originIndex,
	upperRightIndex,
	lowerLeftIndex,
	planeOrigin,
	upperRight,
	lowerLeft,
	translatedUpperRight,
	planarWidth,
	planarHeight,
	widthFactor,
	heightFactor,
	selectionDistance

//    console.log('dispatching...')
    
    if (planarEvent.detail && planarEvent.detail.raycasted && globalThis.display) {
      if (display.ignoreraycasting) {
	debugger
	return}
      else {
	canvasEvent = new CustomEvent (
	  planarEvent.type,
	  {
	    detail: {
	      button: 0,
	      buttons: display.triggerdown ? 1 : 0}})}}
    else {
      canvasEvent = new MouseEvent(
	planarEvent.type,
	{
	  screenX: planarEvent.screenX,
	  screenY: planarEvent.screenY,
	  clientX: planarEvent.clientX,
	  clientY: planarEvent.clientY,
	  ctrlKey: planarEvent.ctrlKey,
	  shiftKey: planarEvent.shiftKey,
	  altKey: planarEvent.altKey,
	  metaKey: planarEvent.metaKey,
	  button: planarEvent.button,
	  buttons: planarEvent.buttons,
	  relatedTarget: planarEvent.relatedTarget,
	  region: planarEvent.region
	})}

    if (planarEvent.detail && planarEvent.detail.intersection) intersection = planarEvent.detail.intersection
    else intersection = scene.components['raycaster'].getIntersection(plane)

    if (!intersection) return
    
    intersectionPoint = intersection.point
    simplePlane.copy(plane.components.geometry.geometry)
    planeInCameraFrame.copy(plane.components.geometry.geometry)
    selectedPoint = vectorFrom(intersectionPoint),
    translatedSelectedPoint = vectorFrom(intersectionPoint),
    
    // We'll grab the origin point from simplePlane, after we figure out its vertex index.
    THREE.BufferGeometryUtils.mergeVertices(planeInCameraFrame)
    THREE.BufferGeometryUtils.mergeVertices(simplePlane)
    
    rotate(simplePlane, planeRotation)
    rotate(planeInCameraFrame, planeRotation)

    simplePlane.translate(planeCenter.x, planeCenter.y, planeCenter.z)
    planeInCameraFrame.translate(planeCenter.x, planeCenter.y, planeCenter.z)
    
    untranslate(planeInCameraFrame, cameraPoint)
    unrotate(planeInCameraFrame, cameraPoint)
    planeInCameraFrameVertices = planeInCameraFrame.getAttribute('position')

    // Choose the leftmost point from the camera's point of view.
    originIndex = 0
    upperRightIndex = 1
    lowerLeftIndex = 2

    simplePlaneVertices = simplePlane.getAttribute('position')

    planeOrigin = new THREE.Vector3(
      simplePlaneVertices.getX(originIndex),
      simplePlaneVertices.getY(originIndex),
      simplePlaneVertices.getZ(originIndex))

    upperRight = new THREE.Vector3(
      simplePlaneVertices.getX(upperRightIndex),
      simplePlaneVertices.getY(upperRightIndex),
      simplePlaneVertices.getZ(upperRightIndex))

    lowerLeft = new THREE.Vector3(
      simplePlaneVertices.getX(lowerLeftIndex),
      simplePlaneVertices.getY(lowerLeftIndex),
      simplePlaneVertices.getZ(lowerLeftIndex))

    planarWidth = planeOrigin.distanceTo(upperRight)
    planarHeight = planeOrigin.distanceTo(lowerLeft)

    translatedUpperRight = new THREE.Vector3(
      upperRight.x,
      upperRight.y,
      upperRight.z)

    translatedUpperRight.sub(planeOrigin)
    translatedSelectedPoint.sub(planeOrigin)
    theta = translatedUpperRight.angleTo(translatedSelectedPoint)
    
    widthFactor = canvas.width / planarWidth,
    heightFactor = canvas.height / planarHeight,
    selectionDistance = selectedPoint.distanceTo(planeOrigin)
    
    canvasEvent.projected = true
    canvasEvent.projectedX = Math.floor((selectionDistance * Math.cos(theta)) * widthFactor)
    canvasEvent.projectedY = Math.floor((selectionDistance * Math.sin(theta)) * heightFactor)
    canvas.lastProjectedEvent = canvasEvent

    if ((planarEvent.type == 'mousedown') && ((canvasEvent.projectedX > canvas.width) || (canvasEvent.projectedY > canvas.height))) {}
    
    canvas.dispatchEvent(canvasEvent)}

  plane.dispatch = dispatch

  document.addEventListener(
    'wheel',
    function (event) {
      if (!display.vm && !canvas.otherCanvasActive) {
	if (event.deltaY > 0) {
	  camera.components['wasd-controls'].keys['KeyS'] = true
	  setTimeout(() => {delete camera.components['wasd-controls'].keys['KeyS']}, 20)}
	else {
	  camera.components['wasd-controls'].keys['KeyW'] = true
	  setTimeout(() => {delete camera.components['wasd-controls'].keys['KeyW']}, 20)}}},
    {passive: false})
    
  document.addEventListener(
    'superkeyboardchange',
    function (incomingEvent) {
      var key = incomingEvent.detail.value,
	  keyCode,
	  outgoingEvent

      incomingEvent.preventDefault()
      incomingEvent.stopPropagation()
      
      switch (key) {
      case 'Backspace':
	keyCode = 8
	break
      case 'Space':
	keyCode = 32
	break
      default:
	break}

      outgoingEvent = new KeyboardEvent(
        'keydown',
        {key: key,
	 keyCode: keyCode,
	 metaKey: incomingEvent.detail.meta,
	 ctrlKey: incomingEvent.detail.control,
	 shiftKey: incomingEvent.detail.shift})

      display.vm = SqueakJS.vm
      plane.focus()

      document.dispatchEvent(outgoingEvent)})

  document.getElementById('right-hand').addEventListener(
    'triggerdown',
    (event) => {display.triggerdown = true})

  document.getElementById('right-hand').addEventListener(
    'triggerup',
    (event) => {display.triggerdown = false})

  // Move around in XZ in response to the right-hand thumbstick.
  document.getElementById('right-hand').addEventListener(
    'thumbstickmoved',
    (event) => {
      var cameraRig = document.getElementById('cameraRig'),
	  oldPosition = cameraRig.getAttribute('position'),
	  cameraRotation = document.getElementById('camera').getAttribute('rotation'),
	  rotationY = (cameraRotation.y + 90 + cameraRig.getAttribute('rotation').y) * Math.PI / 180
			
      cameraRig.setAttribute(
	'position',
	{
	  x: oldPosition.x - (Math.cos(rotationY) * event.detail.y),
	  y: oldPosition.y - (Math.sin(cameraRotation.x * Math.PI / 180) * event.detail.y),
	  z: oldPosition.z + (Math.sin(rotationY) * event.detail.y)})})

  // Move around in Z/yaw in response to the left-hand thumbstick.
/*  document.getElementById('left-hand').addEventListener(
    'thumbstickmoved',
    (event) => {
      var cameraRig = document.getElementById('cameraRig'),
	  oldPosition = cameraRig.getAttribute('position'),
	  oldRotation = cameraRig.getAttribute('rotation')
			
      cameraRig.setAttribute(
	'position',
	{
	  x: oldPosition.x,
	  y: oldPosition.y - event.detail.y,
	  z: oldPosition.z})
						
      cameraRig.setAttribute(
	'rotation',
	{
	  x: oldRotation.x,
	  y: oldRotation.y - event.detail.x,
	  z: oldRotation.z})})
*/
  
  plane.addEventListener(
    'fusing',
    dispatch)

  plane.addEventListener(
    'mouseenter',
    function(event) {
      if (!mousedown) {
	if (plane.expensive) plane.play()
	if (globalThis.display) display.vm = SqueakJS.vm
	disableControls('look-controls')
	disableControls('wasd-controls')
	
	getCSSRule('canvas.a-canvas.a-mouse-cursor-hover:hover').style.cssText = "cursor: normal;"
	getCSSRule('.a-canvas.a-grab-cursor:hover').style.cssText = "cursor: normal;"
	plane.focus()
	dispatch(event)}})
  
  plane.addEventListener(
    'hovered',
    dispatch)

  plane.addEventListener(
    'contextmenu',
    function (event) {
      var unfreeze,
	  mousedown,
	  mouseup,
	  done = false

      spikeRendering()

      event.stopPropagation()
      event.preventDefault()
      
      if (display.unfreeze) {
	unfreeze = display.unfreeze
	display.unfreeze = null}

      mousedown = new MouseEvent('mousedown', event)
      mouseup = new MouseEvent('mouseup', event)

      try {unfreeze()}
      catch (error) {
	dispatch(mousedown)
	setTimeout(() => {dispatch(mouseup)}, 100)
	done = true}
	  
      if (!done) {dispatch(event)}})

  plane.addEventListener(
    'mousedown',
    function (event) {
      display.triggerdown = display.ignoreraycasting = false
//      display.ignoreraycasting = true
//      setTimeout(() => {display.ignoreraycasting = false}, 100)
      spikeRendering()

      if (display.unfreeze) {
	var unfreeze = display.unfreeze,
	    mouseup

        display.unfreeze = null
	mouseup = new MouseEvent('mouseup', event)

	try {unfreeze()}
	catch (error) {
	  if (!(document.getElementById('scene').is('vr-mode')) && display.vm) disableControls('look-controls')
	  dispatch(event)
	  setTimeout(
	    () => {
	      dispatch(mouseup)
	      display.ignoreraycasting = false},
	    100)}}
	  
      if (!(document.getElementById('scene').is('vr-mode')) && display.vm) disableControls('look-controls')
      dispatch(event)})

  document.addEventListener(
    'mousemove',
    function (event) {
      document.body.style.cursor = ''
      spikeRendering()
      dispatch(event)})

  plane.addEventListener(
    'mouseup',
    function (event) {
      display.triggerdown = display.ignoreraycasting = false
      getCSSRule('canvas.a-canvas.a-mouse-cursor-hover:hover').style.cssText = "cursor: normal;"
      getCSSRule('.a-canvas.a-grab-cursor:hover').style.cssText = "cursor: normal;"
      plane.focus()
      dispatch(event)})

  plane.addEventListener(
    'keydown',
    function (event) {
      plane.focus()
      spikeRendering()
      canvas.dispatchEvent(event)})
  
  plane.addEventListener(
    'keyup',
    function (event) {
      plane.focus()
      canvas.dispatchEvent(event)})

  plane.addEventListener(
    'mouseleave',
    function (event) {
      if (!document.querySelector('a-scene').is('vr-mode')) {
	if (plane.expensive) plane.pause()
	enableControls('look-controls')
	enableControls('wasd-controls')

	getCSSRule('canvas.a-canvas.a-mouse-cursor-hover:hover').style.cssText = 'cursor: grab; cursor: -moz-grab; cursor: -webkit-grab;'
	getCSSRule('.a-canvas.a-grab-cursor:hover').style.cssText = 'cursor: grab; cursor: -moz-grab; cursor: -webkit-grab;'
	camera.getAttribute('wasd-controls').fly = true

	// Trick squeak.js into not queueing keyboard events.
	canvas.otherCanvasActive = false
	if (display) display.vm = null

	if (!display.unfreeze && morphs.length == 0) {
	  // Pause the Squeak virtual machine, to maximize the 3D animation frame rate.
	  // display.unfreeze = SqueakJS.vm.freeze()
	}}})}

document.addEventListener(
  'keydown',
  function (event) {
    scene.typing = true
    spikeRendering()
    if ((event.which === 88) && !display.vm && !canvas.otherCanvasActive) document.getElementById('home').click()})

var canvas = document.getElementById('caffeine-canvas'),
    context = canvas.getContext('2d'),
    wind = document.getElementById('wind'),
    home = document.getElementById('home'),
    camera = document.getElementById('camera'),
    listeners

camera.getAttribute('wasd-controls').fly = true
window.mousedown = false

context.fillStyle = 'black'
context.fillRect(0, 0, 1400, 870)

setTimeout(
  () => {
    spikeRendering()

    forwardProjectedMouseEvents(
      document.getElementById('camera'),
      document.getElementById('squeak-plane'),
      canvas)},
  3000)

camera.addEventListener(
  'gohome',
  (event) => {
    scene.goinghome = true
    camera.removeAttribute('look-controls')

    AFRAME.ANIME({
      targets: [camera.object3D.position],
      easing: 'easeInOutSine',
      duration: 800,
      x: 0,
      y: 10,
      z: -1.5})

    AFRAME.ANIME({
      targets: [camera.object3D.rotation],
      easing: 'easeInOutSine',
      duration: 800,
      x: 0,
      y: 0,
      z: 0})

    setTimeout(
      () => {
	camera.setAttribute('look-controls', '')
	scene.goinghome = false
//	display.vm = null
      },
      1000)})

home.onclick = (event) => {
  var lookControls = camera.components['look-controls']

  scene.goinghome = true
  spikeRendering()

//  lookControls.pitchObject.rotation.x = 0
//  lookControls.yawObject.rotation.y = 0

  home.blur()
  
  setTimeout(
    function() {scene.goinghome = false},
    1000)
  
  camera.dispatchEvent(new Event('gohome'))}
  
// iOS didn't do keyup events properly.
// document.body.addEventListener(
//   "keydown",
//   f => {
//     document.body.addEventListener(
//       "keyup",
//       function keyUp(e) {
// 	document.body.removeEventListener(
// 	  "keyup",
// 	  keyUp,
// 	  false) // Memory clean-up
// 	setTimeout(
// 	  function () {
// 	    var event = document.createEvent("Events")
// 	    
// 	    event.initEvent('keyup', true, true)
// 	    event.which = f.which 
// 	    event.keyCode = f.which
// 	    document.body.dispatchEvent(event)},
// 	  200)},
//      false)},
//   false)

// var oscPort = new osc.WebSocketPort({
//  url: "wss://mobile.demo.blackpagedigital.com:8081",
//  metadata: true})
// 
// oscPort.on(
//   "message",
//   function (oscMsg) {
//     scene.dispatchEvent(new CustomEvent(
//       "oscEvent", 
//       {detail: oscMsg}))})
// 
// oscPort.open()

