const API_KEY = '558e543e6cc18ea7707d040ea08a0533'; // Din TMDb API-nyckel
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Hämta HTML-element
const watchedSeriesList = document.getElementById('watchedSeriesList');
const searchInput = document.getElementById('searchInput');
const watchedFilterInput = document.getElementById('watchedFilterInput');
const searchResults = document.getElementById('searchResults');
const resultsList = document.getElementById('resultsList');


// Ladda sparade serier från localStorage
let watchedSeries = JSON.parse(localStorage.getItem('watchedSeries')) || [];

// Söka efter TV-serier från TMDb API
async function searchSeries(query) {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`
    );
    const data = await response.json();
    displaySearchResults(data.results);
    showResults(); // Visa resultatsektionen
  } catch (error) {
    console.error('Failed to search for series:', error);
  }
}

function displaySearchResults(seriesList) {
  resultsList.innerHTML = '';
  seriesList.forEach((series) => {
    const isWatched = watchedSeries.some((watched) => watched.id === series.id);
    
    const li = document.createElement('li');
    li.classList.add('searched-item');

    // Lägg till 'watched-button' om serien redan är watched
    const buttonClass = isWatched ? 'toggle-watched-button watched-button' : 'toggle-watched-button';
    const buttonText = isWatched ? 'Watched' : 'Add to Watched';

    li.innerHTML = `
      <img src="${IMAGE_BASE_URL}${series.poster_path}" alt="${series.name}">
      <h3>${series.name}</h3>
      <button class="${buttonClass}">${buttonText}</button>
    `;

    const button = li.querySelector('.toggle-watched-button');
    button.addEventListener('click', () => toggleWatchStatus(series.id, series.name, series.poster_path, button));
    resultsList.appendChild(li);
  });
}

// Hantera att lägga till/ta bort serier från "Watched Series"
function toggleWatchStatus(id, name, posterPath, button) {
  const seriesIndex = watchedSeries.findIndex((series) => series.id === id);

  if (seriesIndex !== -1) {
    watchedSeries.splice(seriesIndex, 1);
    saveWatchedSeries();
    renderWatchedSeries();
    button.textContent = 'Add to Watched';
    button.style.backgroundColor = '#007BFF';
  } else {
    watchedSeries.push({ id, name, poster: `${IMAGE_BASE_URL}${posterPath}` });
    saveWatchedSeries();
    renderWatchedSeries();
    button.textContent = 'Watched';
    button.style.backgroundColor = 'green';
  }
}

function renderWatchedSeries() {
  watchedSeries.sort((a, b) => a.name.localeCompare(b.name));
  watchedSeriesList.innerHTML = '';
  watchedSeries.forEach((series, index) => {
    const li = document.createElement('li');
    li.classList.add('watched-item');
    li.innerHTML = `
      <img src="${series.poster}" alt="${series.name}">
      <h3>${series.name}</h3>
      <button class="remove-button" data-id="${series.id}">Remove</button>
    `;

    const removeButton = li.querySelector('.remove-button');
    removeButton.addEventListener('click', () => {
      removeWatchedSeries(index);
    });

    watchedSeriesList.appendChild(li);
  });
}

// Ta bort serie från watched list
function removeWatchedSeries(index) {
  watchedSeries.splice(index, 1);
  saveWatchedSeries();
  renderWatchedSeries();
}

// Spara watched series till localStorage och sortera
function saveWatchedSeries() {
  watchedSeries.sort((a, b) => a.name.localeCompare(b.name));
  localStorage.setItem('watchedSeries', JSON.stringify(watchedSeries));
}

// Filtrera watched series baserat på inmatad text
function filterWatchedSeries() {
  const query = watchedFilterInput.value.toLowerCase().trim();
  if (query.length === 0) {
    renderWatchedSeries(); // Visa alla serier om sökfältet är tomt
    return;
  }

  const filteredSeries = watchedSeries.filter((series) =>
    series.name.toLowerCase().startsWith(query) // Endast serier som BÖRJAR med söksträngen
  );

  displayFilteredSeries(filteredSeries);
}

function displayFilteredSeries(seriesList) {
  watchedSeriesList.innerHTML = '';
  seriesList.forEach((series, index) => {
    const li = document.createElement('li');
    li.classList.add('watched-item');
    li.innerHTML = `
      <img src="${series.poster}" alt="${series.name}">
      <h3>${series.name}</h3>
      <button class="remove-button" data-id="${series.id}">Remove</button>
    `;

    const removeButton = li.querySelector('.remove-button');
    removeButton.addEventListener('click', () => {
      removeWatchedSeries(index);
    });

    watchedSeriesList.appendChild(li);
  });
}

function showResults() {
  const searchInputRect = searchInput.getBoundingClientRect();
  searchResults.style.top = `${searchInputRect.bottom + 10}px`;
  searchResults.classList.remove('hidden');

  // Döljer "watched series"-listan
  watchedSeriesList.style.display = 'none';
}

function hideResults() {
  searchResults.classList.add('hidden');

  // Visar "watched series"-listan igen
  watchedSeriesList.style.display = 'block';
}

// Lyssna på input-förändringar och sök direkt
searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim();
  if (query.length > 0) {
    searchSeries(query);
  }
});

// Lyssna på input-förändringar och filtrera watched series direkt
watchedFilterInput.addEventListener('input', () => {
  filterWatchedSeries();
});

// Render watched series på sidladdning
renderWatchedSeries();



// Stöd för röststyrd sökning
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.onresult = (event) => {
  const query = event.results[0][0].transcript;
  searchInput.value = query;
  searchSeries(query);
};

searchInput.addEventListener('focus', () => {
  searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

document.addEventListener('click', (event) => {
  if (!searchResults.contains(event.target) && event.target !== searchInput) {
    hideResults();
  }
});

document.body.style.overflow = 'hidden'; // Lås scrollning när sökresultaten visas
document.body.style.overflow = 'auto'; // Tillåt scrollning igen