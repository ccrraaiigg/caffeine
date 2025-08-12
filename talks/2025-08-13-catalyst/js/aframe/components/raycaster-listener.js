AFRAME.registerComponent(
  'raycaster-listener',
  {
    init: function () {
      // Use events to figure out what raycaster is listening so we don't have to
      // hardcode the raycaster.

      this.el.addEventListener(
	'raycaster-intersected',
	evt => {this.raycaster = evt.detail.el})

      this.el.addEventListener(
	'raycaster-intersected-cleared',
	evt => {this.raycaster = null})},

    tick: function () {
      if (!this.raycaster || !(document.getElementById('scene').is('vr-mode'))) {return}  // Not intersecting.

      let intersection = this.raycaster.components.raycaster.getIntersection(this.el)
      if (!intersection) {return}

      if (this.el.dispatch) {
	this.el.dispatch(
	  new CustomEvent(
	    'mousemove',
	    {detail: {
	      raycasted: true,
	      intersection: intersection}}))}}})

// <a-entity id="raycaster" raycaster></a-entity>
// <a-entity geometry material raycaster-listen></a-entity>
