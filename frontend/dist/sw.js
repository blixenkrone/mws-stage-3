importScripts('/js/idb.js');
importScripts('/js/dbhelper.js');

const cacheName = 'REST_V1';
const cacheData = [
    './',
    'sw.js',
    './index.html',
    './restaurant.html',
    './js/restaurant_info.js',
    './js/**.js',
    './css/styles.css',
    './css/custom.css',
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
    'imgs/10.jpg',
    'imgs/**.jpg',
    './data/restaurants.json',
];


// installing the service worker
self.addEventListener('install', (event) => {
    console.log('installing SW')
    event.waitUntil(caches.open(cacheName)
        .then((cache) => {
            return cache.addAll(cacheData)
        })
        .catch(err => console.log(err)))
});

// activating the service worker
self.addEventListener('activate', (event) => {
    console.log('Service Worker Activating...');
    event.waitUntil(caches.keys()
        .then((cacheVersions) => {
            return Promise.all(cacheVersions.filter((cacheVersion) => {
                return cacheVersion.startsWith('REST_') && cacheVersion !== cacheName;
            }).map((cacheVersion) => {
                return caches.delete(cacheVersion);
            }))
        }));
});



/**
 if (thiscacheVersion !== cacheVersion) {
     console.log('Removing the old cache');
     caches.delete(thiscacheVersion);
 }
 */
self.addEventListener('fetch', (event) => {
    // console.log(`method: ${event.request.method} and url:  ${event.request.url}`);
    return event.respondWith(caches.match(event.request, {
            ignoreSearch: true,
        })
        .then((match) => {
            if (match) return match;
            return fetch(event.request)
                .then((response) => {
                    const responseClone = response.clone();
                    return caches.open(cacheName)
                        .then((cache) => {
                            if (event.request.method === 'GET') {
                                cache.put(event.request, responseClone)
                            }
                        })
                        .catch(err => console.log(err))
                })
        })
        .catch(err => console.log(err)));
});