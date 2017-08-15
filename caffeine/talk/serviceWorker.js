this.addEventListener(
  'install',
  function(event) {
    event.waitUntil(
      caches.open('cache').then(function(cache) {
	console.log('service worker installed')
	
	return cache.addAll([
	  '/github/talk/aframe.html',
	  '/github/talk/js/aframe/aframe.min.js',
	  'https://rawgit.com/feiss/aframe-environment-component/master/dist/aframe-environment-component.min.js',
	  '/github/talk/css/squeakjs.css',
	  '/github/talk/js/mousemove.js',
	  '/github/talk/js/squeakjs/squeak.js',
	  '/github/talk/js/webUtilities.js',
	  '/github/talk/js/aframeUtils.js',
	  '/github/talk/pictures/backgrounds/bootscreen1024x512.jpeg',
	  '/github/talk/pictures/home.png',
	  '/github/talk/sounds/wind.mp3',
	  '/github/talk/js/squeakjs/vm.js',
	  '/github/talk/js/squeakjs/jit.js',
	  '/github/talk/js/squeakjs/plugins/ADPCMCodecPlugin.js',
	  '/github/talk/js/squeakjs/plugins/B2DPlugin.js',
	  '/github/talk/js/squeakjs/plugins/BitBltPlugin.js',
	  '/github/talk/js/squeakjs/plugins/FFTPlugin.js',
	  '/github/talk/js/squeakjs/plugins/FloatArrayPlugin.js',
	  '/github/talk/js/squeakjs/plugins/GeniePlugin.js',
	  '/github/talk/js/squeakjs/plugins/JPEGReaderPlugin.js',
	  '/github/talk/js/squeakjs/plugins/KedamaPlugin.js',
	  '/github/talk/js/squeakjs/plugins/KedamaPlugin2.js',
	  '/github/talk/js/squeakjs/plugins/Klatt.js',
	  '/github/talk/js/squeakjs/plugins/LargeIntegers.js',
	  '/github/talk/js/squeakjs/plugins/Matrix2x3Plugin.js',
	  '/github/talk/js/squeakjs/plugins/MiscPrimitivePlugin.js',
	  '/github/talk/js/squeakjs/plugins/ScratchPlugin.js',
	  '/github/talk/js/squeakjs/plugins/SocketPlugin.js',
	  '/github/talk/js/squeakjs/plugins/SpeechPlugin.js',
	  '/github/talk/js/squeakjs/plugins/SqueakSSL.js',
	  '/github/talk/js/squeakjs/plugins/SoundGenerationPlugin.js',
	  '/github/talk/js/squeakjs/plugins/StarSqueakPlugin.js',
	  '/github/talk/js/squeakjs/plugins/ZipPlugin.js'
	])}))})

