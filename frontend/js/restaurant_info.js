let restaurant;
let map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, fetchedRestaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: fetchedRestaurant.latlng,
        scrollwheel: false,
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    console.log(self.restaurant)
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      console.log(restaurant);
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant);
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill fav restaurant
  fillFavRestaurantHTML();
  // fill reviews
  fillReviewsHTML();
  // listen for review click
  reviewEventListener();
}

/**
 * Create restaurant add or remove favorite
 */
fillFavRestaurantHTML = (is_favorite = self.restaurant.is_favorite, id = self.restaurant.id) => {
  const favoriteRes = document.getElementById('user-actions');
  const btn = document.createElement('button');
  btn.setAttribute('id', 'btn-fav');
  favoriteRes.appendChild(btn);

  if (is_favorite === 'false') {
    btn.onclick = () => DBHelper.fetchFavoriteRestaurant(id, false);
    console.log(is_favorite)
    btn.innerHTML = 'Favorize <3';
  } else {
    btn.onclick = () => DBHelper.fetchFavoriteRestaurant(id, true);
    console.log(is_favorite)
    btn.innerHTML = 'Un-favorize </3';
  }
};

reviewEventListener = () => {
  const reviewBtn = document.getElementById('user-actions');
  const btn = document.createElement('button');
  btn.setAttribute('id', 'btn-review');
  reviewBtn.appendChild(btn);
  btn.innerHTML = 'Review?';
  btn.onclick = () => fillCreateReviewField();
};

fillCreateReviewField = (id = self.restaurant.id) => {
  const formContainer = document.getElementById('review-form');

  const createform = document.createElement('form');
  createform.setAttribute('id', 'restoForm');
  createform.setAttribute('onsubmit', `DBHelper.saveOfflineReview(event, this)`);

  const heading = document.createElement('h2');
  heading.innerHTML = 'Restaurant Review Form ';
  createform.appendChild(heading);

  const line = document.createElement('hr');
  createform.appendChild(line);

  const linebreak = document.createElement('br');
  createform.appendChild(linebreak);

  const hiddenRestaurantId = document.createElement('input');
  hiddenRestaurantId.setAttribute('type', 'hidden');
  hiddenRestaurantId.setAttribute('name', 'id');
  hiddenRestaurantId.setAttribute('value', `${id}`);
  createform.appendChild(hiddenRestaurantId);

  const hiddenFlag = document.createElement('input');
  hiddenFlag.setAttribute('type', 'hidden');
  // hiddenFlag.setAttribute('name', 'dflag');
  hiddenFlag.setAttribute('value', 'unsynced');
  createform.appendChild(hiddenFlag);

  const namelabel = document.createElement('label');
  namelabel.innerHTML = 'Name: ';
  createform.appendChild(namelabel);

  const inputelement = document.createElement('input');
  inputelement.setAttribute('type', 'text');
  // inputelement.setAttribute('name', 'dname');
  inputelement.setAttribute('placeholder', 'Please type your name');
  inputelement.setAttribute('aria-label', 'customer name');
  createform.appendChild(inputelement);

  createform.appendChild(linebreak);

  const ratinglabel = document.createElement('label');
  ratinglabel.innerHTML = 'Rating: ';
  createform.appendChild(ratinglabel);

  const ratingelement = document.createElement('input');
  ratingelement.setAttribute('type', 'text');
  // ratingelement.setAttribute('name', 'drating');
  ratingelement.setAttribute('placeholder', 'Rate the restaurant from 1-5');
  // TODO: RegEx ^([1-9]|[12]\d|3[0-6])$ here
  ratingelement.setAttribute('aria-label', 'customer rating');
  createform.appendChild(ratingelement);

  const ratingbreak = document.createElement('br');
  createform.appendChild(ratingbreak);

  const reviewlabel = document.createElement('label');
  reviewlabel.innerHTML = 'Review: ';
  createform.appendChild(reviewlabel);

  const texareaelement = document.createElement('textarea');
  // texareaelement.setAttribute('name', 'dreview');
  texareaelement.setAttribute('placeholder', 'Input your review here');
  texareaelement.setAttribute('aria-label', 'customer review');
  createform.appendChild(texareaelement);

  const reviewbreak = document.createElement('br');
  createform.appendChild(reviewbreak);

  const submitelement = document.createElement('input');
  submitelement.setAttribute('type', 'submit');
  // submitelement.setAttribute('name', 'dsubmit');
  submitelement.setAttribute('value', 'Submit');
  createform.appendChild(submitelement);
  submitelement.onclick = () => DBHelper.cacheOfflineReview(this);
  formContainer.appendChild(createform);
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (const key in operatingHours) {
    if (key) {
      const row = document.createElement('tr');
      const day = document.createElement('td');
      day.innerHTML = key;
      row.appendChild(day);

      const time = document.createElement('td');
      time.innerHTML = operatingHours[key];
      row.appendChild(time);
      hours.appendChild(row);
    }
  }
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach((review) => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
};

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = review.date;
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}