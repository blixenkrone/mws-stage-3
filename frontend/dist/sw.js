importScripts('/js/idb.js');
importScripts('/js/dbhelper.js');

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
    event.waitUntil(caches.open(cacheVersion)
        .then(cache => cache.addAll(cacheData))
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
    // console.log(`method: ${event.request.method} and url:  ${event.request.url}`);
    return event.respondWith(caches.match(event.request)
        .then((match) => {
            if (match && match !== undefined) return match;
            return fetch(event.request)
                .then((response) => {
                    const responseClone = response.clone();
                    return caches.open(cacheVersion)
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