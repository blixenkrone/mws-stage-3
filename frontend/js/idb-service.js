/**
 * Indexed DB service handler
 */


class IDBService {
    /**
     * 1. insertRestaurantsToDb()
     * 2. Check for database exists?
     * 3. offline site?: https: //developer.mozilla.org/en-US/docs/Web/API/NavigatorOnLine/Online_and_offline_events
     */

    static getDBPromise() {
        // If db exists or create one
        return idb.open('restaurants', 1, (upgradeDB) => {
            upgradeDB.createObjectStore('restaurants', {
                keyPath: 'id',
                autoIncrement: true,
            });
        })
    }

    static getAllIDBData() {
        return this.getDBPromise().then((db) => {
            const tx = db.transaction('restaurants');
            const store = tx.objectStore('restaurants');
            return store.getAll()
        })
    }

    static insertRestaurantsToDB(restaurants) {
        this.getDBPromise().then((db) => {
            console.log('inserting to idb');
            const tx = db.transaction('restaurants', 'readwrite');
            const store = tx.objectStore('restaurants');
            restaurants.forEach((restaurant) => {
                store.get(restaurant.id)
                    .then((indexRestaurant) => {
                        if (JSON.stringify(restaurant) !== JSON.stringify(indexRestaurant)) {
                            store.put(restaurant)
                                .then(success => console.log(`Worked IDB updated restaurant: , ${restaurant}, ${success}`));
                        }
                    })
            })
        })
    }

    static instertSpecificRestaurantToDB(id) {
        this.getDBPromise().then((db) => {
            const tx = db.transaction('restaurants', 'readwrite');
            const store = tx.objectStore('restaurants');
            console.log(store)
            store.get(id)
                .then((restaurant) => {
                    if (restaurant) {
                        console.log(restaurant)
                        console.log(id)
                        store.put(restaurant);
                        return tx.complete;
                    }
                })
        })
    }

    static insertUserReviewToDB(id, body) {
        const dbPromise = idb.open('reviews', 1, (upgradeDB) => {
            upgradeDB.createObjectStore('reviews', {
                keyPath: 'id',
                autoIncrement: true,
            });
        })

        console.log('insert review to DB with connection')
        dbPromise.then((db) => {
            const tx = db.transaction('reviews', 'readwrite');
            const store = tx.objectStore('reviews');
            console.log(id)
            store.get(id)
                .then((restaurant) => {
                    console.log(restaurant)
                    if (restaurant) {
                        store.put(body)
                        console.log(restaurant)
                        console.log(store)
                        return tx.complete;
                    }
                })
        })
    }
}