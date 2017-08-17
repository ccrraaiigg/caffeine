function slowRender () {
  var effect = this.effect
  var delta = this.clock.getDelta() * 1000
  this.time = this.clock.elapsedTime * 1000

  if (this.isPlaying) {this.tick(this.time, delta)}

  setTimeout(
    (function () {
      this.animationFrameID = effect.requestAnimationFrame(this.render)
      effect.render(this.object3D, this.camera, this.renderTarget)
	  
      if (this.isPlaying) {this.tock(this.time, delta)}

      this.effect.submitFrame()}).bind(this),
    1000)}

function normalRender () {
  var effect = this.effect
  var delta = this.clock.getDelta() * 1000
  this.time = this.clock.elapsedTime * 1000

  if (this.isPlaying) {this.tick(this.time, delta)}

  this.animationFrameID = effect.requestAnimationFrame(this.render)
  effect.render(this.object3D, this.camera, this.renderTarget)
	  
  if (this.isPlaying) {this.tock(this.time, delta)}

  this.effect.submitFrame()}

function focusMe (event) {
    event.target.focus()
    event.stopPropagation()}

function disableControls (string) {
  document.getElementById('camera').components[string].data.enabled = false}

function enableControls (string) {
  document.getElementById('camera').components[string].data.enabled = true}

function vectorFrom(object) {
  return new THREE.Vector3(
    object.x,
    object.y,
    object.z)}
  
function centerOf(entity) {
  return vectorFrom(entity.components.position.data)}

function rotationOf(entity) {
  return vectorFrom(entity.components.rotation.data)}

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
      
//  console.log(planarEvent.type + ' ' + canvasEvent.projectedX + ' ' + canvasEvent.projectedY)
    canvas.dispatchEvent(canvasEvent)}

  window.mousedown = false
  
  document.addEventListener(
    'mousedown',
    function (event) {window.mousedown = true})

  document.addEventListener(
    'mouseup',
    function (event) {window.mousedown = false})

  document.addEventListener(
    'mousemove',
    function (event) {
      // Set the frame rate to normal.
      if (scene.timeout) clearTimeout(scene.timeout)
      scene.render = normalRender.bind(scene)

      if (scene.editingCode) {
	scene.timeout = setTimeout(
	  function () {
	    // Set the frame rate to 1 per second.
	    scene.render = slowRender.bind(scene)},
	  2000)}})

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

      // Set the frame rate to 1 per second.
      scene.render = slowRender.bind(scene)
	
      disableControls('wasd-controls')
      if (!mousedown) {
	getCSSRule('.a-canvas.a-grab-cursor:hover').style.cssText = "cursor: normal;"
	getCSSRule('.a-canvas.a-grab-cursor:active, .a-grabbing').style.cssText = "cursor: normal;"
	disableControls('look-controls')
	plane.focus()
	dispatch(event)}})

  plane.addEventListener(
    'hovered',
    dispatch)

  plane.addEventListener(
    'mousedown',
    dispatch)

  plane.addEventListener(
    'mouseup',
    function (event) {
      getCSSRule('.a-canvas.a-grab-cursor:hover').style.cssText = "cursor: normal;"
      getCSSRule('.a-canvas.a-grab-cursor:active, .a-grabbing').style.cssText = "cursor: normal;"
      disableControls('look-controls')
      plane.focus()
      dispatch(event)})

  plane.addEventListener(
    'mouseleave',
    function (event) {
      scene.editingCode = false

      // Set the frame rate to normal.
      if (scene.timeout) clearTimeout(scene.timeout)
      scene.render = normalRender.bind(scene)

      // Trick squeak.js into not queueing keyboard events.
      if (squeakDisplay) {
	window.squeakVM = squeakDisplay.vm
	squeakDisplay.vm = null}
      
      enableControls('wasd-controls')

      getCSSRule('.a-canvas.a-grab-cursor:hover').style.cssText = 'cursor: grab; cursor: -moz-grab; cursor: -webkit-grab;'
      getCSSRule('.a-canvas.a-grab-cursor:active, .a-grabbing').style.cssText = 'cursor: grabbing; cursor: -moz-grabbing; cursor: -webkit-grabbing;'
      enableControls('look-controls')
      dispatch(event)})}

window.forwardProjectedMouseEvents = forwardProjectedMouseEvents
