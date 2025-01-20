const API_KEY = '5cf01592b6f79d30139010ab67152f30'; // Din TMDb API-nyckel
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Get elements
const seriesListContainer = document.getElementById('seriesListContainer');
const watchedSeriesList = document.getElementById('watchedSeriesList');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');

// Load saved watched series
let watchedSeries = JSON.parse(localStorage.getItem('watchedSeries')) || [];

// Fetch and display popular TV shows
async function fetchPopularSeries() {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/tv/popular?api_key=${API_KEY}&language=en-US&page=1`);
    const data = await response.json();
    displaySeries(data.results);
  } catch (error) {
    console.error('Failed to fetch popular series:', error);
  }
}

// Search for TV shows by query
async function searchSeries(query) {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`);
    const data = await response.json();
    displaySeries(data.results); // Show search results
  } catch (error) {
    console.error('Failed to search for series:', error);
  }
}

function displaySeries(seriesList) {
  seriesListContainer.innerHTML = ''; // Clear previous content
  seriesList.forEach((series) => {
    const div = document.createElement('div');
    div.classList.add('series-item'); // Lägg till klassen

    // Kontrollera om serien redan är markerad som Watched
    const isWatched = watchedSeries.some((s) => s.id === series.id);

    div.innerHTML = `
      <img src="${IMAGE_BASE_URL}${series.poster_path}" alt="${series.name}">
      <h3>${series.name}</h3>
      <button class="mark-watched" data-id="${series.id}" style="background-color: ${
      isWatched ? 'green' : '#007BFF'
    };">
        ${isWatched ? 'Watched' : 'Mark as Watched'}
      </button>
    `;

    const button = div.querySelector('.mark-watched');
    button.addEventListener('click', () =>
      toggleWatchStatus(series.id, series.name, series.poster_path, button)
    );

    seriesListContainer.appendChild(div);
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
    button.textContent = 'Mark as Watched';
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

    // Lägg till "Remove"-knappens funktion
    const removeButton = li.querySelector('.remove-button');
    removeButton.addEventListener('click', () => {
      removeWatchedSeries(index); // Kalla på funktionen för att ta bort serien
    });

    watchedSeriesList.appendChild(li);
  });
}

function removeWatchedSeries(index) {
  const removedSeries = watchedSeries[index]; // Hämta serien som tas bort
  watchedSeries.splice(index, 1); // Ta bort serien från listan
  saveWatchedSeries(); // Uppdatera localStorage
  renderWatchedSeries(); // Uppdatera listan

  // Uppdatera motsvarande knapp i "Popular TV Shows"-listan
  const buttons = document.querySelectorAll('.mark-watched');
  buttons.forEach((button) => {
    if (button.dataset.id === String(removedSeries.id)) {
      button.textContent = 'Mark as Watched';
      button.style.backgroundColor = '#007BFF';
    }
  });
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

// Fetch and display popular series on page load
fetchPopularSeries();
renderWatchedSeries();