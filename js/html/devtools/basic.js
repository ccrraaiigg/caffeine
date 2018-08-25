window.onload = () => {
  // When viewing the page by itself, make the UIs draggable, for demo
  // purposes.

  [
    '#classes-browser',
    '#class-categories-menu',
    '#workspace',
    '#inspector',
    '#popup-menu',
    '#confirm-dialog'
  ]
    .forEach((id) => {(window.$)(id).draggable()})}
