function setOptions (strings) {
  var self = this

  while (self.children.length > 0) {
    var child = self.firstChild
    
    self.removeChild(child)}

  (
    strings.map(function (string) {
      var option = document.createElement('option')

      option.value = string
      option.innerHTML = string

      return option})
  )
    .forEach(function (element) {self.appendChild(element)})}

window.onload = function () {
  // When viewing the page by itself, make the UIs draggable, for demo
  // purposes.

  $('#classes-browser').draggable()
  $('#workspace').draggable()

  // Provide a way to set listbox elements with minimal JS bridge
  // traffic.

  $('#class-categories')[0].setOptions = setOptions
  $('#classes')[0].setOptions = setOptions
  $('#method-categories')[0].setOptions = setOptions
  $('#methods')[0].setOptions = setOptions}
