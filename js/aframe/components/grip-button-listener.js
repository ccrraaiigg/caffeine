AFRAME.registerComponent(
  'grip-button-listener', {
    init: function () {
      this.el.addEventListener(
	'gripdown',
	(event) => {display.controllerButtons = display.buttons | Squeak.Keyboard_Shift})

      this.el.addEventListener(
	'gripup',
	(event) => {display.controllerButtons = display.buttons & ~Squeak.Keyboard_Shift})}})



