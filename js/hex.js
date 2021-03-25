function dragElement(element, handle) {
  var deltaX = deltaY = x = y = 0

  handle.onmousedown = dragMouseDown

  function dragMouseDown(event) {
    var dashboard = window.document.getElementById('dashboard')

    element.style.pointerEvents = "none"
    event = event || window.event
    event.preventDefault()

    Array.from(document.querySelectorAll('body *')).map(element => element.style.zIndex = 0)
    element.style.zIndex = 3000

    if (dashboard) {dashboard.style.zIndex = 2000}

    x = event.clientX
    y = event.clientY

    document.onmouseup = closeDragElement
    document.onmousemove = elementDrag}

  function elementDrag(event) {
    event = event || window.event
    event.preventDefault()

    deltaX = x - event.clientX
    deltaY = y - event.clientY
    x = event.clientX
    y = event.clientY

    element.style.top = (element.offsetTop - deltaY) + 'px'
    element.style.left = (element.offsetLeft - deltaX) + 'px'}

  function closeDragElement() {
    element.style.pointerEvents = "all"
    document.onmouseup = null
    document.onmousemove = null
    if (element.onmoveend) {element.onmoveend()}}}


function resizeElement(element) {
  // Create box in bottom-left.
  var resizer = document.createElement('div')

  resizer.id = 'resizeHandle'
  resizer.style.width = '10px'
  resizer.style.height = '10px'
  resizer.style.background = 'red'
  resizer.style.opacity = 0.5
  resizer.style.position = 'absolute'
  resizer.style.right = 0
  resizer.style.bottom = 0
  resizer.style.cursor = 'se-resize'

  // Append child to element.
  element.appendChild(resizer)

  // box function onmousemove
  resizer.addEventListener('mousedown', initResize, false)

  // window functions mousemove & mouseup
  function initResize(event) {
    element.onresizestart(event)
    window.addEventListener('mousemove', resize, false)
    window.addEventListener('mouseup', stopResize, false)}

  // Resize the element.
  function resize(event) {
    element.style.width = (event.clientX - element.offsetLeft) + 'px'
    element.style.height = (event.clientY - element.offsetTop) + 'px'
    element.onresize(event)}

  // On mouseup, remove window functions mousemove & mouseup.
  function stopResize(event) {
    window.removeEventListener('mousemove', resize, false)
    window.removeEventListener('mouseup', stopResize, false)
    element.onresizeend(event)}}


window.onload = function () {
  var summary = document.getElementById('summary'),
      status = document.getElementById('status')

  if (status) {
    var statustext = status.children[0]

    statustext.style.textShadow = '1px 1px 1px #000'
    statustext.style.opacity = 0.5}

  if (summary) {
    var div = document.getElementById('caffeine-div')

    summary.onmousedown = function () {
      div.style.zIndex = 1}

    summary.onmouseover = function () {
      if (div) {div.style.boxShadow = ''}}}
  
  window.setTimeout(
    function () {
      window.scrollTo(0, 0)
      document.body.style.transition = 'all 1000ms'
      document.body.bgColor = ''},
    500)
  
  window.setTimeout(
    function () {
      var dashboard = window.document.getElementById('dashboard'),
	  settingsButton = window.document.getElementById('settings.button'),
	  spinner = window.document.getElementById('progress-spinner')

      if (window.progress) {
	window.progress.style.opacity = 1
	window.thestatus.style.opacity = 1}
      
      if (summary) {summary.style.opacity = 1}
      dashboard.style.opacity = 0.5
      
      settingsButton.onclick = (event) => {
	var div = document.getElementById('caffeine-div')
		      
	if (div.style.opacity == 0) {
	  if ((div.icon) && (div.icon.opacity = 1)) {
	    div.icon.style.opacity = 0}
	    
	  spinner.style.opacity = 1
	  div.style.opacity = 1
	  div.style.pointerEvents = 'all'}
	else {
	  spinner.style.opacity = 0
	  div.style.opacity = 0
	  div.style.pointerEvents = 'none'}}

      if (window.WebMidi) {WebMidi.enable()}},
    1500)

    window.setTimeout(
      function () {
	var movie = window.document.getElementById('movie')

	if (movie) {movie.style.opacity = 1}},
      2000)}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('js/serviceWorker.js')
    .then(function(reg) {
      // registration worked
      console.log('Registration succeeded. Scope is ' + reg.scope)
      reg.addEventListener(
	'push',
	function(event) {
	  debugger
	  console.log('Received a push message', event)
          caches.keys().then(function(keyList) {
	    return Promise.all(keyList.map(function(key) {
	      return caches.delete(key)}))})})
      
      window.onbeforeunload = (function () {
	reg.dispatchEvent(new Event('push'))})})
    .catch(function(error) {
      // registration failed
      console.log('Registration failed with ' + error)})}
else console.log('Service Worker API not available.')

