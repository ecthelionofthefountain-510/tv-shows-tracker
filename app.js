const API_KEY = '5cf01592b6f79d30139010ab67152f30'; // Din TMDb API-nyckel
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Hämta HTML-element
const watchedSeriesList = document.getElementById('watchedSeriesList');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const watchedFilterInput = document.getElementById('watchedFilterInput');
const watchedFilterButton = document.getElementById('watchedFilterButton');

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
  } catch (error) {
    console.error('Failed to search for series:', error);
  }
}

// Visa sökresultat
function displaySearchResults(seriesList) {
  watchedSeriesList.innerHTML = ''; // Rensa listan
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

// Visa listan över watched series i bokstavsordning
function renderWatchedSeries() {
  watchedSeries.sort((a, b) => a.name.localeCompare(b.name));
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

// Visa filtrerade watched series
function displayFilteredSeries(seriesList) {
  watchedSeriesList.innerHTML = ''; // Töm listan
  seriesList.forEach((series, index) => {
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