window.onload = function () {
  // When viewing the page by itself, make the UIs draggable, for demo
  // purposes.

  [
    '#classes-browser',
    '#class-categories-menu',
    '#workspace',
    '#popup-menu',
    '#confirm-dialog',
  ]
    .forEach(function (id) {(window.$)(id).draggable()})}

