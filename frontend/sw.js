importScripts('/js/idb.js');
importScripts('/js/idb-service.js');
importScripts('/js/dbhelper.js');

const cacheName = 'REST_V1';
const cacheData = [
    './',
    'sw.js',
    './index.html',
    './restaurant.html',
    './js/idb.js',
    './js/dbhelper.js',
    './js/idb-service.js',
    './js/main.js',
    './js/restaurant_info.js',
    './css/styles.css',
    './css/custom.css',
    'imgs/1.jpg',
    'imgs/2.jpg',
    'imgs/3.jpg',
    'imgs/4.jpg',
    'imgs/5.jpg',
    'imgs/6.jpg',
    'imgs/7.jpg',
    'imgs/8.jpg',
    'imgs/9.jpg',
];


// installing the service worker
self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(cacheName)
        .then((cache) => {
            console.log('installing SW')
            console.log(cache.addAll(cacheData))
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

self.addEventListener('fetch', (event) => {
    event.respondWith(caches.match(event.request, {
        ignoreSearch: true,
    }).then((response) => {
        if (response) return response;
        return fetch(event.request);
    }))
});