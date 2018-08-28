window.addEventListener(
  'WebComponentsReady',
  () => {
    var wireframes = document.querySelector('link[rel="import"]').import,
	workspace = wireframes.getElementById('workspace'),
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

    document.getElementById('a-frame').addEventListener(
      'mouseleave',
      (event) => {
	document.getElementById('a-frame').blur()})

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

    document.getElementById('code-browser-wireframe').appendChild(wireframes.getElementById('classes-browser').cloneNode(true))

    workspaceSlideNames.forEach((id) => {
      var slideWorkspace = workspace.cloneNode(true)

      slideWorkspace.id = id + '-' + slideWorkspace.id
      document.getElementById(id).appendChild(slideWorkspace)})

    canvasNames.forEach((id) => {window.makeCanvasEditable(document.getElementById(id))})
    editorNames.forEach((id) => {window.makeEditorEditable(document.getElementById(id))})

    window.setImpressDuration = (string) => {
      var divs = document.getElementById('impress').children[0].children
      
      for (var i = 0; i < divs.length; i++) {
	divs[i].dataset.transitionDuration = string}}})

