window.onload = function () {
  var embeddedSqueak = window.document.getElementById("embeddedSqueak"),
      summary = window.document.getElementById("summary")

  embeddedSqueak.onmouseenter = function () {
    window.document.getElementById("Caffeine").contentWindow.focus()
    this.style.zIndex = 1000
    this.style.boxShadow = "1px 1px 7px #999, 2px 2px 8px #999, 3px 3px 9px #999"}

  embeddedSqueak.onmouseleave = function () {
    window.focus()
    this.style.boxShadow = ""}
  
  summary.onmousedown = function () {
    embeddedSqueak.style.zIndex = 1}

  summary.onmouseover = function () {
    embeddedSqueak.style.boxShadow = ""}

  window.setTimeout(
    function () {window.document.getElementById("backgroundPicture").style.opacity = 1},
    200)

  window.setTimeout(
    function () {
      window.progress.style.opacity = 1
      window.document.body.background = "pictures/backgrounds/6.jpg"
      window.document.body.style.backgroundSize = "cover"
      window.document.getElementById("backgroundPicture").remove()},
    1000)

  window.setTimeout(
    function () {window.thestatus.style.opacity = 1},
    1000)

  window.setTimeout(
    function () {window.document.getElementById("banner").style.opacity = 1},
    1000)

  window.setTimeout(
    function () {window.document.getElementById("summary").style.opacity = 1},
    1500)}

