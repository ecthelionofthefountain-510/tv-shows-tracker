const API_KEY = '5cf01592b6f79d30139010ab67152f30'; // Din TMDb API-nyckel
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Get elements
const watchedSeriesList = document.getElementById('watchedSeriesList');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');

// Load saved watched series
let watchedSeries = JSON.parse(localStorage.getItem('watchedSeries')) || [];

// Search for TV shows by query
async function searchSeries(query) {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`);
    const data = await response.json();
    displaySearchResults(data.results); // Show search results
  } catch (error) {
    console.error('Failed to search for series:', error);
  }
}

function displaySearchResults(seriesList) {
  watchedSeriesList.innerHTML = ''; // Clear watched series
  seriesList.forEach((series) => {
    const li = document.createElement('li');
    li.classList.add('watched-item');
    li.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
        <div style="display: flex; align-items: center;">
          <img src="${IMAGE_BASE_URL}${series.poster_path}" alt="${series.name}" style="width: 50px; height: 75px; margin-right: 10px; border-radius: 5px;">
          <h3>${series.name}</h3>
        </div>
        <button class="mark-watched" data-id="${series.id}" style="padding: 5px 10px; background-color: #007BFF; color: white; border: none; border-radius: 5px; cursor: pointer;">Add to Watched</button>
      </div>
    `;

    const button = li.querySelector('.mark-watched');
    button.addEventListener('click', () =>
      toggleWatchStatus(series.id, series.name, series.poster_path, button)
    );

    watchedSeriesList.appendChild(li);
  });
}

function toggleWatchStatus(id, name, posterPath, button) {
  const seriesIndex = watchedSeries.findIndex((series) => series.id === id);

  if (seriesIndex !== -1) {
    // Serien finns i listan: Ta bort den
    watchedSeries.splice(seriesIndex, 1);
    saveWatchedSeries();
    renderWatchedSeries();

    // Uppdatera knappen
    button.textContent = 'Add to Watched';
    button.style.backgroundColor = '#007BFF';
  } else {
    // Serien finns inte i listan: Lägg till den
    watchedSeries.push({ id, name, poster: `${IMAGE_BASE_URL}${posterPath}` });
    saveWatchedSeries();
    renderWatchedSeries();

    // Uppdatera knappen
    button.textContent = 'Watched';
    button.style.backgroundColor = 'green';
  }
}

function renderWatchedSeries() {
  watchedSeriesList.innerHTML = ''; // Töm listan först
  watchedSeries.forEach((series, index) => {
    const li = document.createElement('li');
    li.classList.add('watched-item');
    li.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
        <div style="display: flex; align-items: center;">
          <img src="${series.poster}" alt="${series.name}" style="width: 50px; height: 75px; margin-right: 10px; border-radius: 5px;">
          <h3>${series.name}</h3>
        </div>
        <button class="remove-button" data-id="${series.id}" style="padding: 5px 10px; background-color: red; color: white; border: none; border-radius: 5px; cursor: pointer;">Remove</button>
      </div>
    `;

    const removeButton = li.querySelector('.remove-button');
    removeButton.addEventListener('click', () => {
      removeWatchedSeries(index);
    });

    watchedSeriesList.appendChild(li);
  });
}

function removeWatchedSeries(index) {
  watchedSeries.splice(index, 1);
  saveWatchedSeries();
  renderWatchedSeries();
}

function saveWatchedSeries() {
  localStorage.setItem('watchedSeries', JSON.stringify(watchedSeries));
}

// Event listeners
searchButton.addEventListener('click', () => {
  const query = searchInput.value.trim();
  if (query) {
    searchSeries(query); // Perform search
  }
});

// Render watched series on page load
renderWatchedSeries();