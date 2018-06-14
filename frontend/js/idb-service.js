/**
 * Indexed DB service handler
 */


class IDBService {
    /**
     * 1. insertRestaurantsToDb()
     * 2. Check for database exists?
     * 3. offline site?: https: //developer.mozilla.org/en-US/docs/Web/API/NavigatorOnLine/Online_and_offline_events
     */
    static get dbPromise() {
        return idb.open('restaurants', 1);
    }

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
        return this.getDBPromise()
            .then((db) => {
                if (!db) return;
                db.transaction('restaurants')
                    .objectStore('restaurants')
                    .getAll();
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
        const dbPromise = idb.open('restaurants', 1, (upgradeDB) => {
            upgradeDB.createObjectStore('restaurants', {
                autoIncrement: true,
                keyPath: 'id',
            });
        })
        dbPromise.then((db) => {
            const tx = db.transaction('restaurants', 'readwrite');
            const store = tx.objectStore('restaurants');
            console.log(store)
            store.get(id)
                .then((restaurant) => {
                    console.log(restaurant)
                    console.log(id)
                    store.put(restaurant);
                    return tx.complete;
                })
        })
    }

    static toggleFavoriteRestIDB(id, bool) {
        IDBService.dbPromise.then((db) => {
            const tx = db.transaction('restaurants', 'readwrite');
            const store = tx.objectStore('restaurants');
            console.log(store)
            console.log(id)
            store.get(id)
                .then((restaurant) => {
                    console.log(restaurant)
                    console.log(id)
                    store.is_favorite = Boolean(bool);
                    console.log(store.is_favorite)
                    store.put(restaurant);
                    console.log(restaurant)
                    return tx.complete;
                })
        })
    }

    static insertUserReviewToDB(form) {
        const dbPromise = idb.open('reviews', 1, (upgradeDB) => {
            upgradeDB.createObjectStore('reviews', {
                autoIncrement: true,
            });
        })
        console.log(form)

        const body = {
            restaurant_id: parseInt(form.id),
            name: form.userName,
            rating: form.rating,
            comments: form.review,
        };
        console.log(body)
        console.log('insert review to DB an online connection')
        return dbPromise.then((db) => {
            const tx = db.transaction('reviews', 'readwrite');
            const store = tx.objectStore('reviews');
            console.log(body)
            store.put(body)
                .then(success => console.log(`Reviews , ${restaurant}, ${success}`));
        })
    }

    static insertOfflineUserReviewToDB(id, body) {
        const dbPromise = idb.open('offline-reviews', 1, (upgradeDB) => {
            upgradeDB.createObjectStore('offline-reviews', {
                keyPath: 'id',
                autoIncrement: true,
            });
        })
        console.log('insert review to DB a user without connection')
        dbPromise.then((db) => {
            const tx = db.transaction('offline-reviews', 'readwrite');
            const store = tx.objectStore('offline-reviews');
            console.log(id)
            console.log(body)
            store.put(body)
                .then(success => console.log(`Reviews , ${restaurant}, ${success}`));
        })
    }

    static getDBReviewsPromise() {
        return idb.open('offline-reviews', 1, (upgradeDB) => {
            upgradeDB.createObjectStore('offline-reviews', {
                keyPath: 'id',
                autoIncrement: true,
            });
        })
    }

    static getAllOfflineReviewsIDB() {
        return this.getDBReviewsPromise()
            .then((db) => {
                if (!db) return;
                return db.transaction('offline-reviews')
                    .objectStore('offline-reviews')
                    .getAll();
            })
    }

    static handleOfflineReviews() {
        return this.getAllOfflineReviewsIDB()
            .then((reviews) => {
                console.log(reviews)
                if (!reviews) return;
                // Posting reviews to the server
                const reviewPromises = [];
                reviews.forEach((review) => {
                    console.log(review)
                    const body = {
                        id: review.id,
                        restaurant_id: review.restaurant_id,
                        name: review.name,
                        comments: review.comments,
                        rating: review.rating,
                    }
                    const myPromise = DBHelper.postReviewUponConnection(body)
                    this.insertUserReviewToDB(body)
                        .then(() => {
                            this.deleteItemFromDatabase(review.id);
                            console.log('Deleted offline after input with id:', review.id)
                        })
                    reviewPromises.push(myPromise);
                })
                return Promise.all(reviewPromises);
            });
    }

    static deleteItemFromDatabase(id) {
        return this.getDBReviewsPromise().then((db) => {
            if (!db) return;
            const tx = db.transaction('offline-reviews', 'readwrite');
            const store = tx.objectStore('offline-reviews');
            store.delete(id);
            return tx.complete;
        })
    }


}