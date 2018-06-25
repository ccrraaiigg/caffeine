this.addEventListener(
  'fetch',
  function(event) {
    event.respondWith(
      caches.match(event.request).then(function(resp) {
	// Answer from the service worker cache, if present...
	return resp || fetch(event.request).then(function(response) {
	  // ...or answer from the network, and cache the response.
          return caches.open('caffeine_cache').then(function(cache) {
            cache.put(event.request, response.clone())
            return response})})}))})

