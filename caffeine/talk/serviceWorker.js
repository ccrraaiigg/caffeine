this.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(resp) {
      return resp || fetch(event.request).then(function(response) {
        return caches.open('caffeine_cache').then(function(cache) {
          cache.put(event.request, response.clone())
          return response})})}))})

