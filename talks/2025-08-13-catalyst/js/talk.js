// var canvasNames = [
//       'title-workspace'],
// 
//     editorNames = [
//       'text-editor-widget',
//       'a-frame']

//    window.document.getElementById('a-frame').addEventListener(
//  'mouseleave',
//  (event) => {window.document.getElementById('a-frame').blur()})

// Add keybindings for navigating between slides.
window.addEventListener(
  'keydown',
  (event) => {
    document.body.parentNode.style.cursor = 'none'
//    if (event.key === 'c') {
//      if (document.activeElement === document.body) impress().goto('caffeine')}
    if (event.key === 'o') {
      if (document.activeElement === document.body) impress().goto('overview')}})

// Restore the cursor after it has been hidden by keyboard events.
window.addEventListener(
  'mousemove',
  (event) => {document.body.parentNode.style.cursor = ''})

window.addEventListener(
  'mousedown',
  (event) => {document.body.parentNode.style.cursor = ''})

// canvasNames.forEach((id) => {window.makeCanvasEditable(window.document.getElementById(id))})
// editorNames.forEach((id) => {window.makeEditorEditable(window.document.getElementById(id))})

window.setImpressDuration = (string) => {
  var divs = window.document.getElementById('impress').children[0].children
  
  for (var i = 0; i < divs.length; i++) {
    divs[i].dataset.transitionDuration = string}}

