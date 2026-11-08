/* global data */
/* exported data */
const $allImages = document.querySelector('.images');
const $topNavFavorites = document.querySelector('.favorites-link');
const $topNavFacts = document.querySelector('.facts-link');
const $topNavImages = document.querySelector('.images-link');
const $bottomNavImages = document.querySelector('.bottom-nav-item.img');
const $bottomNavFacts = document.querySelector('.bottom-nav-item.fact');
const $bottomNavFavorites = document.querySelector('.bottom-nav-item.fave');
const $factsSection = document.querySelector('.facts');
const topImg = document.querySelector('.top-nav-item.img');
const topFav = document.querySelector('.top-nav-item.fave');
const topFact = document.querySelector('.top-nav-item.fact');
const bottomImg = document.querySelector('.bottom-nav-item.img');
const bottomFav = document.querySelector('.bottom-nav-item.fave');
const bottomFact = document.querySelector('.bottom-nav-item.fact');
const $loadingScreen = document.querySelector('.loading-screen');
let imageValues = [];
let factValues = [];
let currentView = 'all';
let currentPage = 0;
let isFetching = false;

async function fetchImages() {
  if (isFetching) return;
  isFetching = true;
  try {
    $loadingScreen.classList.remove('hidden');
    const response = await fetch(
      `https://api.thecatapi.com/v1/images/search?limit=10&page=${currentPage}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const newImages = await response.json();
    imageValues = [...imageValues, ...newImages];
    currentPage++;
    renderImages();
  } catch (error) {
    console.error('Error fetching images:', error);
  } finally {
    $loadingScreen.classList.add('hidden');
    isFetching = false;
  }
}

function renderImages() {
  const imagesToRender =
    currentView === 'favorites' ? data.favorites : imageValues;

  const alreadyRendered = $allImages.querySelectorAll('.frame').length;
  const newImages = imagesToRender.slice(alreadyRendered);

  // remove old sentinel before appending
  const oldSentinel = document.getElementById('scroll-sentinel');
  if (oldSentinel) oldSentinel.remove();

  newImages.forEach(imageValue => {
    const commentObj = data.comments.find(
      comment => comment.imageId === imageValue.id
    );
    const isFavorite = data.favorites.some(fav => fav.id === imageValue.id);
    const commentHTML = commentObj ? `<p>${commentObj.textValue}</p>` : '';
    const favoriteClass = isFavorite
      ? 'fas fa-heart fave-heart'
      : 'far fa-heart outline-heart';

    const frame = document.createElement('div');
    frame.className = 'frame';
    frame.innerHTML = `
      <div class="image-container" data-id="${imageValue.id}">
        <img src="${imageValue.url}" alt="Cat photo">
        <div class="card-actions">
          ${commentHTML ? `<div class="comment-display"><span class="comment-text">${commentObj.textValue}</span><button class="delete-comment" aria-label="Delete comment">✕</button></div>` : ''}
          <div class="comment-bar">
            <i class="${favoriteClass}" aria-label="Favorite"></i>
            <form name="comment">
              <input type="text" placeholder="Add a comment..." value="${commentObj ? commentObj.textValue : ''}">
              <button type="submit" aria-label="Save comment" class="submit-comment hidden"><i class="fas fa-circle-arrow-up"></i></button>
            </form>
          </div>
        </div>
      </div>
    `;

    const imageContainer = frame.querySelector('.image-container');
    imageContainer.querySelector('.fa-heart').addEventListener('click', handleFavoriteImage);
    imageContainer.querySelector('form').addEventListener('submit', handleSaveComment);
    const deleteBtn = imageContainer.querySelector('.delete-comment');
    if (deleteBtn) deleteBtn.addEventListener('click', handleDeleteComment);
    const input = imageContainer.querySelector('input');
    const submitBtn = imageContainer.querySelector('.submit-comment');
    input.addEventListener('input', () => {
      submitBtn.classList.toggle('hidden', input.value.trim() === '');
    });

    $allImages.appendChild(frame);
  });

  // add sentinel for infinite scroll (only in 'all' view)
  if (currentView !== 'favorites') {
    const sentinel = document.createElement('div');
    sentinel.id = 'scroll-sentinel';
    $allImages.appendChild(sentinel);
    scrollObserver.observe(sentinel);
  }
}
const scrollObserver = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting && currentView === 'all') {
    fetchImages();
  }
}, { rootMargin: '200px' });

function handleSaveComment(event) {
  event.preventDefault();
  const input = event.target.querySelector('input');
  const textValue = input.value.trim();
  if (!textValue) return;

  const imageId = event.target.closest('.image-container').getAttribute('data-id');

  const existingIndex = data.comments.findIndex(c => c.imageId === imageId);
  if (existingIndex !== -1) {
    data.comments[existingIndex].textValue = textValue;
  } else {
    data.comments.push({ textValue, imageId });
  }

  const cardActions = event.target.closest('.card-actions');
  let commentDisplay = cardActions.querySelector('.comment-display');
  if (!commentDisplay) {
    commentDisplay = document.createElement('div');
    commentDisplay.className = 'comment-display';
    cardActions.insertBefore(commentDisplay, cardActions.querySelector('.comment-bar'));
    commentDisplay.addEventListener('click', e => {
      if (e.target.classList.contains('delete-comment')) handleDeleteComment(e);
    });
  }
  commentDisplay.innerHTML = `<span class="comment-text">${textValue}</span><button class="delete-comment" aria-label="Delete comment">✕</button>`;

  cardActions.querySelector('.comment-bar input').value = '';
  cardActions.querySelector('.submit-comment').classList.add('hidden');
}

function handleDeleteComment(event) {
  const imageId = event.target.closest('.image-container').getAttribute('data-id');
  const commentIndex = data.comments.findIndex(c => c.imageId === imageId);
  if (commentIndex !== -1) data.comments.splice(commentIndex, 1);

  const commentDisplay = event.target.closest('.comment-display');
  if (commentDisplay) commentDisplay.remove();
}

function handleFavoriteImage(event) {
  const imageId = event.target.closest('.image-container').getAttribute('data-id');
  const image = imageValues.find(img => img.id === imageId);
  if (!image) return;

  const isFav = data.favorites.some(fav => fav.id === imageId);
  if (isFav) {
    data.favorites = data.favorites.filter(fav => fav.id !== imageId);
    event.target.className = 'far fa-heart outline-heart';
  } else {
    data.favorites.push(image);
    event.target.className = 'fas fa-heart fave-heart';
  }
}

function viewFavorites(event) {
  currentView = 'favorites';
  imageValues = [...data.favorites];
  $allImages.innerHTML = '';
  $allImages.className = 'images';
  $factsSection.className = 'facts hidden';
  topImg.className = 'top-nav-item img';
  bottomImg.className = 'bottom-nav-item img';
  topFact.className = 'top-nav-item fact';
  bottomFact.className = 'bottom-nav-item fact';
  topFav.className = 'active top-nav-item fave';
  bottomFav.className = 'active bottom-nav-item fave';
  renderImages();
}

function viewFacts(event) {
  $allImages.className = 'images hidden';
  $factsSection.className = 'facts';
  topFact.className = 'active top-nav-item fact';
  bottomFact.className = 'active bottom-nav-item fact';
  topImg.className = 'top-nav-item img';
  bottomImg.className = 'bottom-nav-item img';
  topFav.className = 'top-nav-item fave';
  bottomFav.className = 'bottom-nav-item fave';
}

function viewImages(event) {
  currentView = 'all';
  imageValues = [];
  currentPage = 0;
  $allImages.innerHTML = '';
  $allImages.className = 'images';
  $factsSection.className = 'facts hidden';
  topImg.className = 'active top-nav-item img';
  bottomImg.className = 'active bottom-nav-item img';
  topFact.className = 'top-nav-item fact';
  bottomFact.className = 'bottom-nav-item fact';
  topFav.className = 'top-nav-item fave';
  bottomFav.className = 'bottom-nav-item fave';
  fetchImages();
}

async function fetchFacts() {
  try {
    const response = await fetch('https://catfact.ninja/facts?limit=20');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json = await response.json();
    factValues = json.data;
    renderFacts();
  } catch (error) {
    console.error('Error fetching facts:', error);
  }
}
fetchImages();
fetchFacts();

function renderFacts() {
  const factsHTML = factValues.map(fact => `
    <div class="fact-card">
      <i class="fas fa-paw fact-icon"></i>
      <p class="fact-text">${fact.fact}</p>
    </div>
  `).join('');

  $factsSection.innerHTML = '<h1>Cat Facts</h1><div class="facts-feed">' + factsHTML + '</div>';
}

$topNavFavorites.addEventListener('click', viewFavorites);
$topNavImages.addEventListener('click', viewImages);
$topNavFacts.addEventListener('click', viewFacts);
$bottomNavImages.addEventListener('click', viewImages);
$bottomNavFacts.addEventListener('click', viewFacts);
$bottomNavFavorites.addEventListener('click', viewFavorites);
