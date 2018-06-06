/**
 * Indexed DB service handler
 */


class IDBService {
    /**
     * 1. insertRestaurantsToDb()
     * 2. Check for database exists?
     * 3. offline site?: https: //developer.mozilla.org/en-US/docs/Web/API/NavigatorOnLine/Online_and_offline_events
     */

    static insertRestaurantsToDB(restaurants) {
        // If db exists or create one
        console.log('inserting to idb');
        console.log(restaurants);

        const dbPromise = idb.open('restaurants', 1, (upgradeDB) => {
            const restaurantStore = upgradeDB.createObjectStore('restaurants', {
                keyPath: 'id',
            });
        });

        dbPromise.then((db) => {
            const tx = db.transaction('restaurants', 'readwrite');
            const store = tx.objectStore('restaurants');
            restaurants.forEach((restaurant) => {
                store.get(restaurant.id).then((indexRestaurant) => {
                    if (JSON.stringify(restaurant) !== JSON.stringify(indexRestaurant)) {
                        store.put(restaurant)
                            .then(success => console.log(`Worked IDB updated restaurant: , ${restaurant}, ${success}`));
                    }
                });
            });
        });
    }

    static insertFavoriteResToDB(id, bool) {
        const dbPromise = idb.open('restaurants', 1, (upgradeDB) => {
            const restaurantStore = upgradeDB.createObjectStore('restaurants', {
                keyPath: 'id',
                autoIncrement: true,
            });
        });

        dbPromise.then((db) => {
            const tx = db.transaction('restaurants', 'readwrite');
            const store = tx.objectStore('restaurants');
            console.log(store)
            store.get(id)
                .then((val) => {
                    console.log(val)
                    console.log(id)
                    store.put(val);
                    return tx.complete;
                })
        })
    }
}