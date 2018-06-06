const cacheVersion = 'v1';
const cacheData = [
    './',
    'sw.js',
    './index.html',
    './restaurant.html',
    './data/restaurants.json',
    './css/styles.css',
    './js/**.js',
    'imgs/**.jpg',
    './restaurant.html?id=1',
    './restaurant.html?id=2',
    './restaurant.html?id=3',
    './restaurant.html?id=4',
    './restaurant.html?id=5',
    './restaurant.html?id=6',
    './restaurant.html?id=7',
    './restaurant.html?id=8',
    './restaurant.html?id=9',
    './restaurant.html?id=10',
];


// installing the service worker
self.addEventListener('install', (event) => {
    console.log('Service Worker Installed');
    event.waitUntil(caches.open(cacheVersion)
        .then((cache) => {
            return cache.addAll(cacheData);
        })
        .catch(err => console.log(err)))
});

// activating the service worker
self.addEventListener('activate', (event) => {
    console.log('Service Worker Activated');
    event.waitUntil(caches.keys()
        .then((cacheVersions) => {
            // looping through everything in the cache
            return Promise.all(cacheVersions.map((thiscacheVersion) => {
                if (thiscacheVersion !== cacheVersion) {
                    console.log('Removing the old cache');

                    return caches.delete(thiscacheVersion);
                }
            }))
        }));
});

self.addEventListener('fetch', (event) => {
    event.respondWith(caches.match(event.request)
        .then((response) => {
            if (response && response !== undefined) return response;
            return fetch(event.request)
                .then((response) => {
                    const responseClone = response.clone();
                    caches.open(cacheVersion)
                        .then((cache) => {
                            if (event.request !== 'POST') {
                                cache.put(event.request, responseClone)
                            }
                        })
                    return response;
                })
        })
        .catch(err => console.log(err)));
});