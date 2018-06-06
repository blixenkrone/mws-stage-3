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
        const dbPromise = idb.open('restaurants', 1, (upgradeDB) => {
            const restaurantStore = upgradeDB.createObjectStore('restaurants', {
                keyPath: 'id',
                autoIncrement: true,
            });
        })
        return dbPromise;
    }

    static insertRestaurantsToDB(restaurants) {
        console.log('inserting to idb');
        console.log(restaurants);
        this.getDBPromise().then((db) => {
            const tx = db.transaction('restaurants', 'readwrite');
            const store = tx.objectStore('restaurants');
            restaurants.forEach((restaurant) => {
                store.get(restaurant.id)
                    .then((indexRestaurant) => {
                        if (JSON.stringify(restaurant) !== JSON.stringify(indexRestaurant)) {
                            store.put(restaurant)
                                .then(success => console.log(`Worked IDB updated restaurant: , ${restaurant}, ${success}`));
                        }
                    });
            });
        });
    }

    static instertSpecificRestaurantToDB(id, bool) {
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
        id = parseInt(id);
        this.getDBPromise().then((db) => {
            const tx = db.transaction('restaurants', 'readwrite');
            const store = tx.objectStore('restaurants');
            let reviewVal = store.get(id)
                .then((data) => {
                    if (data) {
                        data.reviews.push(body)
                        console.log(body)
                        console.log(data)
                        console.log(id)
                        store.put(data, id);
                        return tx.complete;
                    }
                })
        })
    }
}