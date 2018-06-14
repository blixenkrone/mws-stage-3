/**
 * Common database helper functions.
 */
class DBHelper {
  /** ‡
   * TODO: Create toggleFavorite func
   * TODO: Create a body to post to indexDB if offline
   * */

  static get DATABASE_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}`;
  }
  static get RESTAURANT_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    console.log(`Fetching restaurants as ${DBHelper.RESTAURANT_URL}`);

    fetch(DBHelper.RESTAURANT_URL, {
        method: 'GET',
      })
      .then(restaurants => restaurants.json())
      .then((restaurants) => {
        IDBService.insertRestaurantsToDB(restaurants);
        if (restaurants) {
          callback(null, restaurants);
        }
      })
      .catch((err) => {
        console.log(err);
        // Fetch from indexdb incase network is not available
        DBHelper.fetchRestaurantsFromClient(callback);
      })
  }

  /**
   * Fetch a restaurant by its ID.
   */

  static fetchRestaurantById(id, callback) {
    console.log(`Fetching restaurants as ${DBHelper.RESTAURANT_URL}`);
    fetch(`${DBHelper.RESTAURANT_URL}/${id}`, {
        method: 'GET',
      })
      .then(response => response.json())
      .then((restaurant) => {
        if (restaurant) {
          callback(null, restaurant);
          console.log(restaurant)
          this.fetchRestaurantReviews(id, restaurant);
        }
      })
      .catch((err) => {
        console.log(err);
        // Fetch from indexdb incase network is not available
        DBHelper.fetchRestaurantsByIdFromClient(id)
          .then(restaurant => callback(null, restaurant));
      });
  }

  static fetchRestaurantReviews(id, restaurant) {
    parseInt(id)
    fetch(`http://localhost:1337/reviews/?restaurant_id=${id}`)
      .then(res => res.json())
      .then((restaurantReviews) => {
        IDBService.getDBPromise().then((db) => {
          const tx = db.transaction('restaurants', 'readwrite');
          const store = tx.objectStore('restaurants');
          const item = restaurant;
          item.reviews = restaurantReviews;
          store.put(item);
          return tx.complete;
        })
      })
  }

  // Fetch it from client if offline;

  static fetchRestaurantsFromClient(callback) {
    console.log('fetching from local IDB!');
    if (!('indexedDB' in window)) {
      console.log('no db');
      return null;
    }
    IDBService.getAllIDBData()
      .then((restaurants) => {
        if (restaurants) {
          console.log('indexDB returned this data:');
          console.log(restaurants);
          callback(null, restaurants);
          console.log('fetched from local IDB done');
        }
      });
  }

  static fetchFavoriteRestaurant(id, bool) {
    let isfavorite = !!bool;
    isfavorite = bool ? false : true;
    console.log(isfavorite)
    return fetch(`${DBHelper.RESTAURANT_URL}/${id}/?is_favorite=${isfavorite}`, {
        method: 'POST',
      })
      .then(res => res.json())
      .then(res => IDBService.instertSpecificRestaurantToDB(res.id))
      .then(console.log(`post fav. restaurant: ${id} - ${isfavorite}`))
      .then(location.reload())
      .catch(err => console.log(err))
  }

  static cacheOfflineReview(event, form) {
    event.preventDefault();
    const body = {
      restaurant_id: parseInt(form.id.value),
      name: form.userName.value,
      rating: form.rating.value,
      comments: form.review.value,
    };
    console.log(body)
    IDBService.insertOfflineUserReviewToDB(body.restaurant_id, body);
  }

  static postReview(event, form) {
    console.log(form)
    const id = parseInt(form.id.value);
    if (event) {
      event.preventDefault();
    }
    const body = {
      restaurant_id: id,
      name: form.userName.value,
      rating: form.rating.value,
      comments: form.review.value,
    };
    console.log(body);
    console.log(id);

    fetch(`${DBHelper.DATABASE_URL}/reviews`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(res => res.json())
      .then(response => console.log('Success', response))
      .catch(err => console.log(err))
  }

  static postReviewUponConnection(body) {
    const id = parseInt(body.id);
    console.log(body);
    console.log(id);

    return fetch(`${DBHelper.DATABASE_URL}/reviews`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(res => res.json())
      .then(response => console.log('Offline posted! ', response))
      .catch(err => console.log(err))
  }


  static fetchRestaurantsByIdFromClient(id) {
    console.log('fetching from local IDB!');
    if (!('indexedDB' in window)) {
      console.log('no db');
      return null;
    }
    const dbPromise = idb.open('restaurants', 1, (upgradeDB) => {
      const restaurantStore = upgradeDB.createObjectStore('restaurants', {
        keyPath: 'id',
        autoIncrement: true,
      });
    });

    dbPromise.then((db) => {
        const tx = db.transaction('restaurants');
        const store = tx.objectStore('restaurants').get(id);
        return store.getAll();
      })
      .then((restaurant) => {
        if (restaurant) {
          console.log('indexDB returned this data from an ID:');
          console.log(restaurant);
          callback(null, restaurant);
          console.log('fetched from local IDB done');
        }
      });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type === cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood === neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants;
        if (cuisine !== 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood !== 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/imgs/${restaurant.photograph}.jpg`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map,
      animation: google.maps.Animation.DROP,
    });
    return marker;
  }
}