scene.renderingNormally = true

function slowRender () {
  var effect = this.effect,
      delta

  if (this.clock) {
    delta = this.clock.getDelta() * 1000
    this.time = this.clock.elapsedTime * 1000

    if (this.isPlaying) {this.tick(this.time, delta)}

    scene.slowRenderTimeout = setTimeout(
      (function () {
	this.animationFrameID = effect.requestAnimationFrame(this.render)
	effect.render(this.object3D, this.camera, this.renderTarget)
      
	if (this.isPlaying) {this.tock(this.time, delta)}

	this.effect.submitFrame()}).bind(this),
      1000)}}

function normalRender () {
  var effect = this.effect,
      delta

  if (this.clock) {
    delta = this.clock.getDelta() * 1000
    this.time = this.clock.elapsedTime * 1000

    if (this.isPlaying) {this.tick(this.time, delta)}

    this.animationFrameID = effect.requestAnimationFrame(this.render)
    effect.render(this.object3D, this.camera, this.renderTarget)
  
    if (this.isPlaying) {this.tock(this.time, delta)}

    this.effect.submitFrame()}}

function spikeRendering () {
  var timeout

  if (scene.slowRenderOnsetTimeout) {
    clearTimeout(scene.slowRenderOnsetTimeout)
    scene.slowRenderOnsetTimeout = null}

  if (!scene.renderingNormally) {
//    console.log('rendering normally')
    if (scene.slowRenderTimeout) clearTimeout(scene.slowRenderTimeout)
    cancelAnimationFrame(scene.animationFrameID)
    scene.render = normalRender.bind(scene)
    scene.render()
    scene.renderingNormally = true}

  if (scene.editingCode) timeout = 50
  else {
    if (scene.hasAnimations) timeout = 10000
    else {
      if (scene.goingHome) timeout = 1000
      else timeout = 50}}
  
  scene.slowRenderOnsetTimeout = setTimeout(
    function () {
      // Set the frame rate to 1 per second.
//      console.log('rendering slowly')
      cancelAnimationFrame(scene.animationFrameID)
      scene.render = normalRender.bind(scene)
      scene.render()
      scene.renderingNormally = true},
    timeout)}

function focusMe (event) {
  event.target.focus()
  event.stopPropagation()}

function controlsEnabled (string) {
  return document.getElementById('camera').getAttribute(string).enabled}

function disableControls (string) {
  document.getElementById('camera').getAttribute(string).enabled = false}

function enableControls (string) {
  document.getElementById('camera').getAttribute(string).enabled = true}

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
  
  geometry.rotateX(rotation.x * degreesToRadians).rotateY(rotation.y * degreesToRadians).rotateZ(rotation.z * degreesToRadians)}

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
    if ((!planarEvent.detail) || (!planarEvent.detail.intersection)) return
    var canvasEvent = new MouseEvent(planarEvent.type),
	cameraPoint = centerOf(camera),
	cameraRotation = rotationOf(camera),
	selectedPoint = vectorFrom(planarEvent.detail.intersection.point),
	translatedSelectedPoint = vectorFrom(planarEvent.detail.intersection.point),
	planeCenter = centerOf(plane),
	planeRotation = rotationOf(plane),
	simplePlane = new THREE.PlaneGeometry().fromBufferGeometry(plane.components.geometry.geometry),
	planeInCameraFrame = new THREE.PlaneGeometry().fromBufferGeometry(plane.components.geometry.geometry),
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

    // We'll grab the origin point from simplePlane, after we figure out its vertex index.
    simplePlane.mergeVertices()
    planeInCameraFrame.mergeVertices()
    
    rotate(simplePlane, planeRotation)
    rotate(planeInCameraFrame, planeRotation)

    simplePlane.translate(planeCenter.x, planeCenter.y, planeCenter.z)
    planeInCameraFrame.translate(planeCenter.x, planeCenter.y, planeCenter.z)
    
    untranslate(planeInCameraFrame, cameraPoint)
    unrotate(planeInCameraFrame, cameraPoint)
    planeInCameraFrameVertices = planeInCameraFrame.vertices

    // Choose the leftmost point from the camera's point of view.
    if (planeInCameraFrameVertices[1].x < planeInCameraFrameVertices[3].x) {
      originIndex = 1
      upperRightIndex = 3
      lowerLeftIndex = 2}
    else {
      originIndex = 3
      upperRightIndex = 1
      lowerLeftIndex = 4}

    simplePlaneVertices = simplePlane.vertices
    planeOrigin = simplePlaneVertices[originIndex]
    upperRight = simplePlaneVertices[upperRightIndex]
    lowerLeft = simplePlaneVertices[lowerLeftIndex]
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
    
//    console.log(planarEvent.type + ' ' + canvasEvent.projectedX + ' ' + canvasEvent.projectedY)
    canvas.dispatchEvent(canvasEvent)}

  window.mousedown = false

  document.addEventListener(
    'keydown',
    function (event) {spikeRendering()})

  plane.movemouse = function (x, y) {
    var canvas = document.getElementById('squeak'),
	lastProjectedEvent = canvas.lastProjectedEvent

    if (lastProjectedEvent) {
      lastProjectedEvent.projectedX = lastProjectedEvent.projectedX + x
      lastProjectedEvent.projectedY = lastProjectedEvent.projectedY + y
      canvas.dispatchEvent(lastProjectedEvent)}}
  
  plane.addEventListener(
    'fusing',
    dispatch)

  plane.addEventListener(
    'mouseenter',
    function (event) {
      scene.editingCode = true
      if (window.squeakVM) squeakDisplay.vm = window.squeakVM

      disableControls('wasd-controls')

      if (!mousedown) {
	getCSSRule('.a-canvas.a-grab-cursor:hover').style.cssText = "cursor: normal;"
	getCSSRule('.a-canvas.a-grab-cursor:active, .a-grabbing').style.cssText = "cursor: normal;"
	plane.focus()
	dispatch(event)}})

  plane.addEventListener(
    'hovered',
    dispatch)

  plane.addEventListener(
    'mousedown',
    function (event) {
      if (!(document.getElementById('scene').is('vr-mode'))) disableControls('look-controls')
      dispatch(event)})
  
  document.addEventListener(
    'mousemove',
    function (event) {spikeRendering()})

  plane.addEventListener(
    'mouseup',
    function (event) {
      getCSSRule('.a-canvas.a-grab-cursor:hover').style.cssText = "cursor: normal;"
      getCSSRule('.a-canvas.a-grab-cursor:active, .a-grabbing').style.cssText = "cursor: normal;"
      plane.focus()
      dispatch(event)})

  plane.addEventListener(
    'mouseleave',
    function (event) {
      enableControls('look-controls')
      enableControls('wasd-controls')

      getCSSRule('.a-canvas.a-grab-cursor:hover').style.cssText = 'cursor: grab; cursor: -moz-grab; cursor: -webkit-grab;'
      getCSSRule('.a-canvas.a-grab-cursor:active, .a-grabbing').style.cssText = 'cursor: grabbing; cursor: -moz-grabbing; cursor: -webkit-grabbing;'

      // Trick squeak.js into not queueing keyboard events.
      if (window.squeakDisplay) {
	window.squeakVM = squeakDisplay.vm
	squeakDisplay.vm = null}

      scene.editingCode = false})}

var canvas = document.getElementById('squeak'),
    context = canvas.getContext('2d'),
    wind = document.getElementById('wind'),
    home = document.getElementById('home'),
    camera = document.getElementById('camera'),
    listeners

camera.getAttribute('wasd-controls').fly = true

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('serviceWorker.js')
    .then(function(reg) {
      // registration worked
      console.log('Registration succeeded. Scope is ' + reg.scope)})
    .catch(function(error) {
      // registration failed
      console.log('Registration failed with ' + error)})}
else console.log('Service Worker API not available.')

context.fillStyle = 'black'
context.fillRect(0, 0, 1400, 870)

forwardProjectedMouseEvents(
  document.getElementById('camera'),
  document.getElementById('squeak-plane'),
  canvas)

spikeRendering()

home.onclick = function (event) {
  var positionAnimation = document.createElement('a-animation'),
      rotationAnimation = document.createElement('a-animation')

  scene.goingHome = true
  spikeRendering()
  
  positionAnimation.setAttribute('attribute', 'position')
  positionAnimation.setAttribute('to', '0 5 -2.5')
  rotationAnimation.setAttribute('attribute', 'rotation')
  rotationAnimation.setAttribute('to', '0 0 0')

  camera.appendChild(positionAnimation)
  camera.appendChild(rotationAnimation)

  home.blur()
  
  window.setTimeout(
    function() {
      positionAnimation.remove()
      rotationAnimation.remove()
      scene.goingHome = false},
    1000)}

var oscPort = new osc.WebSocketPort({
  url: "ws://192.168.178.54:8081",
  metadata: true
})

oscPort.open()

oscPort.on(
  "message",
  function (oscMsg) {
    scene.dispatchEvent(new CustomEvent(
      "oscEvent", 
      {detail: oscMsg}))})
