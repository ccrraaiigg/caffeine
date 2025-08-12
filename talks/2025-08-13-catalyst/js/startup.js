window.startup = function () {
  var magicWindow,
      iframe = window.top.document.getElementById("caffeine-frame")

  const urlParams = new URLSearchParams(window.top.location.search)
  window.snapshot = "caffeine"

  if (urlParams.has('snapshot'))
    window.snapshot = urlParams.get('snapshot')

  try {magicWindow = window.top.magicWindow}
  catch (exception) {magicWindow = null}

  console.log('starting Caffeine...')

  window.top.document.ontouchend = (event) => {
    var div = window.top.document.getElementById("caffeine-div"),
	canvas = document.getElementById('caffeine-canvas')

    
    if (!window.top.muteButtonOverridden) {
      // Unlock HTML5 Audio - load a data url of short silence and play it
      // This will allow us to play web audio when the Apple iPhone/iPad hardware
      // mute toggle is on.
      
      var silenceDataURL = "data:audio/mp3;base64,//MkxAAHiAICWABElBeKPL/RANb2w+yiT1g/gTok//lP/W/l3h8QO/OCdCqCW2Cw//MkxAQHkAIWUAhEmAQXWUOFW2dxPu//9mr60ElY5sseQ+xxesmHKtZr7bsqqX2L//MkxAgFwAYiQAhEAC2hq22d3///9FTV6tA36JdgBJoOGgc+7qvqej5Zu7/7uI9l//MkxBQHAAYi8AhEAO193vt9KGOq+6qcT7hhfN5FTInmwk8RkqKImTM55pRQHQSq//MkxBsGkgoIAABHhTACIJLf99nVI///yuW1uBqWfEu7CgNPWGpUadBmZ////4sL//MkxCMHMAH9iABEmAsKioqKigsLCwtVTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVV//MkxCkECAUYCAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV",
	  tag = document.createElement("audio"),
	  play = tag.play()


      tag.controls = false
      tag.preload = "auto"
      tag.loop = false
      tag.src = silenceDataURL

      tag.onended = () => {
	window.top.muteButtonOverridden = true
	console.log("iOS/iPadOS hardware mute switch overridden")}

      if (play) {
	play.then(
	  () => {},
	  (reason) => {
	    console.log(
	      "iOS hardware mute switch not overridden, HTML5 audio play failed",
	      reason)})}}
    
    if (iframe) {
      iframe.contentWindow.focus()
      iframe.ontouchend = window.top.document.ontouchend}

    if (div) {
      div.ontouchend = window.top.document.ontouchend
      div.style.zIndex = 1000}}}

document.addEventListener(
  'mousedown',
  function (event) {window.mousedown = true})

document.addEventListener(
  'mouseup',
  function (event) {window.mousedown = false})

window.getCSSRule = function (ruleName) {
  ruleName = ruleName.toLowerCase();
  var result = null;
  var find = Array.prototype.find;

  find.call(document.styleSheets, styleSheet => {
    result = find.call(styleSheet.cssRules, cssRule => {
      return cssRule instanceof CSSStyleRule 
        && cssRule.selectorText.toLowerCase() == ruleName;
    });
    return result != null;
  });
  return result;
}

function makeEditorEditable(editor) {
  var focus = function (event) {
    event.target.focus()
    event.stopPropagation()}

  editor.style.pointerEvents = "all"
  editor.style.transition = "opacity 500ms"

  window.setTimeout(
    function () {
      editor.style.opacity = 1},
    2000)

  editor.addEventListener("mouseenter", focus)
  editor.addEventListener("mousemove", focus)
  editor.addEventListener("mousedown", focus)
  editor.addEventListener(
    "mouseleave",
    function (event) {
      event.target.blur()})

  editor.tabindex = 1}

function makeCanvasEditable(canvas) {
  var focus = function (event) {
    event.target.focus()
    event.stopPropagation()}

  canvas.style.pointerEvents = "all"
  canvas.style.transition = "opacity 500ms"
  canvas.style.background = "no-repeat url('pictures/backgrounds/bootscreen/bootscreen.png')"
  canvas.style.backgroundSize = "auto 100%"
  canvas.style.backgroundPosition = "center center"
  canvas.style.borderRadius = "10px"
  
  window.setTimeout(
    function () {
      canvas.style.opacity = 1},
    1000)

  canvas.addEventListener("mouseenter", focus)
  canvas.addEventListener("mousemove", focus)
  canvas.addEventListener("mousedown", focus)
  canvas.addEventListener(
    "mouseleave",
    function () {
      event.target.blur()})
  
  canvas.tabindex = 1}

window.makeCanvasEditable = makeCanvasEditable
window.makeEditorEditable = makeEditorEditable

function exportFile(a) {
  var path = Squeak.splitFilePath(a.innerText)
  Squeak.fileGet(path.fullname, function(buffer) {
    var blob = new Blob([buffer], {type: 'application/octet-stream'}),
        blobURL = URL.createObjectURL(blob)
    a.setAttribute('href', blobURL)
    a.setAttribute('download', path.basename)
    a.onclick = function(){
      setTimeout(function(){URL.revokeObjectURL(blobURL)}, 0)
      return true
    }
    a.click()
  }, alert)
  return false
}

function showFiles() {
  var imgList = [],
      fileList = [],
      dirs = [''],
      nFiles = nDirs = nBytes = 0
  while (dirs.length > 0) {
    var dir = dirs.pop(),
        entries = Squeak.dirList(dir)
    for (var f in entries) {
      var entry = entries[f],
          path = dir + '/' + f
      if (!dir && !entry[3] && f.match(/\.image$/))
        imgList.push('<li>Run <a href="#image=' + path + '">' + f + '</a></li>')
      if (entry[3]) {
        dirs.push(path)
        nDirs++
      } else {
        nFiles++
        nBytes += entry[4]
        fileList.push('<li><a href="squeak:' + path + '" onclick="return exportFile(this)" target="_blank">' + path + '</a>' +
                      (entry[4] >= 100000 ? ' (' + (entry[4]/1000000).toFixed(1) + ' MB)' 
                       : ' (' + (entry[4]/1000).toFixed(1) + ' KB)') + '</li>')
      }
    }
  }
  function fdir(s) { return s.replace(/<[^>]*>/gi,'').replace(/[^\/]*$/, '') }
  function fsort(a, b) { return fdir(a).localeCompare(fdir(b)) || a.localeCompare(b) }
  if (fileList.length) {
    files.innerHTML = "<ul>" + fileList.sort(fsort).join("") + "</ul>"
    filestats.innerHTML = nFiles + " files in " + nDirs + " directories, " +
      (nBytes/1000000).toFixed(1) + " MBytes total"
  }          
  if (imgList.length) images.innerHTML = "<p>Previously run local images:</p><ul>" + imgList.sort(fsort).join("") + "</ul>"
  else images.innerHTML = "<ul>[Once you have dropped local images to this page they will be listed here.]</ul>"
}

window.top.startCaffeine = function(canvas, imageName, sourcesName, parameters) {
  // if we have a hash image then we just run Squeak with the options provided in the url
  if (location.hash.match(/\.image/)) {
    // runSqueak is defined in squeak.js.
    return Squeak.runSqueak()
  }

  // otherwise we run with given parameters
  var squeakDisplay,
      spinner

  window.canvas = canvas
  spinner = window.top.document.getElementById("progress-spinner")

  squeakDisplay = SqueakJS.runSqueak(
    imageName + ".image",
    canvas,
    {
      zip: [
	"memories/" + imageName + ".zip",
	"sources/" + sourcesName + ".sources.zip"],
      swapButtons: true,
      spinner: spinner,
      appName: parameters.appName,
      parameters: parameters})

  try {window.top.magicWindow.squeakDisplay = squeakDisplay}
  catch (exception) {window.squeakDisplay = squeakDisplay}

  setTimeout(
    () => {
      Squeak.fsck(function(stats) {})},
    0)
  // also, enable drag-and-drop even if no image loaded yet
  // (squeak.js will replace these when an image is running)
  document.body.ondragover = function(evt) {
    evt.preventDefault()
    if (evt.dataTransfer.items[0].kind == "file") {
      evt.dataTransfer.dropEffect = "copy"
      drop.style.borderColor = "#0E0"
    } else {
      evt.dataTransfer.dropEffect = "none"
    }
    return false
  }
  document.body.ondragleave = function(evt) {
    if (window.drop) drop.style.borderColor = ""
  }
  document.body.ondrop = function(evt) {
    evt.preventDefault()
    drop.style.borderColor = "#080"
    var files = [].slice.call(evt.dataTransfer.files),
        todo = files.length,
        imageName = null
    files.forEach(function(f) {
      var reader = new FileReader()
      reader.onload = function () {
        var buffer = this.result
        console.log("Storing " + f.name + " (" + buffer.byteLength + " bytes)")
        if (/.*image$/.test(f.name)) imageName = f.name
        Squeak.filePut(f.name, buffer, function success() {
          if (--todo > 0) return
          drop.style.borderColor = ""
          if (!imageName) showFiles()
          else runSqueak(imageName)
        })
      }
      reader.onerror = function() { alert("Failed to read " + f.name) }
      reader.readAsArrayBuffer(f)
    })
    return false
  }
}

window.downloadFile = function(sUrl) {
  if (window.downloadFile.isChrome || window.downloadFile.isSafari) {
    // Creating new link node.
    var link = document.createElement('a')
    link.href = sUrl
    
    if (link.download !== undefined){
      // Set HTML5 download attribute. This will prevent file from opening if supported.
      var fileName = sUrl.substring(sUrl.lastIndexOf('/') + 1, sUrl.length)
      link.download = fileName
    }
    
    // Dispatching click event.
    if (document.createEvent) {
      var e = document.createEvent('MouseEvents')
      e.initEvent('click' ,true ,true)
      link.dispatchEvent(e)
      return true
    }
  } 
  // Force file download (whether supported by server).
  var query = '?download'
  
  window.open(sUrl + query)
}

window.downloadFile.isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1
window.downloadFile.isSafari = navigator.userAgent.toLowerCase().indexOf('safari') > -1
window.printAllProcesses = () => {console.log(SqueakJS.vm.printAllProcesses())}
