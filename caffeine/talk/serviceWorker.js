this.addEventListener(
  'install',
  function(event) {
    event.waitUntil(
      caches.open('cache').then(function(cache) {
	console.log('service worker installed')
	
	return cache.addAll([
	  '/talk/aframe.html',
	  '/talk/js/aframe/aframe.min.js',
	  'https://rawgit.com/feiss/aframe-environment-component/master/dist/aframe-environment-component.min.js',
	  '/talk/css/squeakjs.css',
	  '/talk/js/mousemove.js',
	  '/talk/js/squeakjs/squeak.js',
	  '/talk/js/webUtilities.js',
	  '/talk/js/aframeUtils.js',
	  '/talk/pictures/backgrounds/bootscreen1024x512.jpeg',
	  '/talk/pictures/home.png',
	  '/talk/sounds/wind.mp3',
	  '/talk/js/squeakjs/vm.js',
	  '/talk/js/squeakjs/jit.js',
	  '/talk/js/squeakjs/plugins/ADPCMCodecPlugin.js',
	  '/talk/js/squeakjs/plugins/B2DPlugin.js',
	  '/talk/js/squeakjs/plugins/BitBltPlugin.js',
	  '/talk/js/squeakjs/plugins/FFTPlugin.js',
	  '/talk/js/squeakjs/plugins/FloatArrayPlugin.js',
	  '/talk/js/squeakjs/plugins/GeniePlugin.js',
	  '/talk/js/squeakjs/plugins/JPEGReaderPlugin.js',
	  '/talk/js/squeakjs/plugins/KedamaPlugin.js',
	  '/talk/js/squeakjs/plugins/KedamaPlugin2.js',
	  '/talk/js/squeakjs/plugins/Klatt.js',
	  '/talk/js/squeakjs/plugins/LargeIntegers.js',
	  '/talk/js/squeakjs/plugins/Matrix2x3Plugin.js',
	  '/talk/js/squeakjs/plugins/MiscPrimitivePlugin.js',
	  '/talk/js/squeakjs/plugins/ScratchPlugin.js',
	  '/talk/js/squeakjs/plugins/SocketPlugin.js',
	  '/talk/js/squeakjs/plugins/SpeechPlugin.js',
	  '/talk/js/squeakjs/plugins/SqueakSSL.js',
	  '/talk/js/squeakjs/plugins/SoundGenerationPlugin.js',
	  '/talk/js/squeakjs/plugins/StarSqueakPlugin.js',
	  '/talk/js/squeakjs/plugins/ZipPlugin.js'
	])}))})

this.addEventListener(
  'fetch',
  function(event) {
    event.respondWith(
      caches.match(event.request))})

