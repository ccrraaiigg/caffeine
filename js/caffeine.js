function dragElement(element, handle) {
  var deltaX = deltaY = x = y = 0

  handle.onmousedown = dragMouseDown

  function dragMouseDown(event) {
    var dashboard = window.document.getElementById('dashboard')

    element.style.pointerEvents = "none"
    event = event || window.event
    event.preventDefault()

    Array.from(document.querySelectorAll('body *')).map(element => element.style.zIndex = 0)
    if (dashboard) dashboard.style.zIndex = 2000

    this.style.zIndex = 1

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
    document.onmousemove = null}}


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
  var embeddedSqueak = document.getElementById('embeddedSqueak'),
//      summary = document.getElementById('summary'),
      statustext = document.getElementById('status').children[0]

  statustext.style.textShadow = '1px 1px 1px #000'
  statustext.style.opacity = 0.5

  embeddedSqueak.onmouseenter = function () {
    this.style.zIndex = 1000
    document.getElementById('Caffeine').contentWindow.focus()
    this.style.boxShadow = '1px 1px 7px #999, 2px 2px 8px #999, 3px 3px 9px #999'}

  embeddedSqueak.onmouseleave = function () {
    window.focus()
    this.style.boxShadow = ''}
    
/*
  summary.onmousedown = function () {
    embeddedSqueak.style.zIndex = 1}

  summary.onmouseover = function () {
    embeddedSqueak.style.boxShadow = ''}
*/
  
  window.setTimeout(
    function () {
      window.scrollTo(0, 0)
      document.body.style.transition = 'all 1000ms'
      document.body.bgColor = ''},
    500)
  
  window.setTimeout(
    function () {
      window.document.getElementById('banner').style.opacity = 1},
    1000)
  
  window.setTimeout(
    function () {
      var dashboard = window.document.getElementById('dashboard'),
	  settingsButton = window.document.getElementById('settings.button'),
	  spinner = window.document.getElementById('sqSpinner')

      window.progress.style.opacity = 1
      window.thestatus.style.opacity = 1
//      window.document.getElementById('summary').style.opacity = 1
      dashboard.style.opacity = 0.5
      
      settingsButton.onclick = (event) => {
	var squeak = window.document.getElementById('embeddedSqueak')

	if (squeak.style.opacity == 0) {
	  spinner.style.opacity = 1
	  squeak.style.opacity = 1
	  squeak.style.pointerEvents = 'all'}
	else {
	  spinner.style.opacity = 0
	  squeak.style.opacity = 0
	  squeak.style.pointerEvents = 'none'}}

      WebMidi.enable()},
    1500)

  window.setTimeout(
    function () {
      window.document.getElementById('movie').style.opacity = 1},
    2000)}
