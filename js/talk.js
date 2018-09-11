window.addEventListener(
  // This event is made available by the WebCommponents polyfill we're using, to support Safari.
  'WebComponentsReady',
  () => {
    var wireframes = document.querySelector('link[rel="import"]').import,
	workspace = wireframes.getElementsByClassName('workspace')[0],
	workspaceSlideNames = [
	  'parsing-javascript',
	  'speech-recognition',
	  'webmidi',
	  'chrome-debugging-protocol'],
	canvasNames = [
	  'title-workspace',
	  'morphicjs-window',
	  'snowglobe-demo-window',
	  'parsing-javascript-workspace',
	  'speech-recognition-workspace',
	  'webmidi-workspace',
	  'chrome-debugging-protocol-workspace'],
	editorNames = [
	  'text-editor-widget',
	  'a-frame']

    window.document.getElementById('a-frame').addEventListener(
      'mouseleave',
      (event) => {
	window.document.getElementById('a-frame').blur()})

    window.addEventListener(
      'keydown',
      (event) => {
	document.body.parentNode.style.cursor = 'none'
	if (event.key === 'c') {
	  if (document.activeElement === document.body) impress().goto('caffeine')}
	if (event.key === 'o') {
	  if (document.activeElement === document.body) impress().goto('overview')}})

    window.addEventListener(
      'mousemove',
      (event) => {document.body.parentNode.style.cursor = ''})

    window.addEventListener(
      'mousedown',
      (event) => {document.body.parentNode.style.cursor = ''})

    window.document.getElementById('code-browser-wireframe').appendChild(wireframes.getElementsByClassName('classes-browser')[0].cloneNode(true))

    workspaceSlideNames.forEach((id) => {
      var slideWorkspace = workspace.cloneNode(true)

      slideWorkspace.id = id + '-' + slideWorkspace.id
      window.document.getElementById(id).appendChild(slideWorkspace)})

    canvasNames.forEach((id) => {window.makeCanvasEditable(window.document.getElementById(id))})
    editorNames.forEach((id) => {window.makeEditorEditable(window.document.getElementById(id))})

    window.setImpressDuration = (string) => {
      var divs = window.document.getElementById('impress').children[0].children
      
      for (var i = 0; i < divs.length; i++) {
	divs[i].dataset.transitionDuration = string}}})

