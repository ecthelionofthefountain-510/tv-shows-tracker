const API_KEY = '5cf01592b6f79d30139010ab67152f30'; // Ersätt med din TMDb API-nyckel
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Get elements
const seriesInput = document.getElementById('seriesInput');
const addSeriesButton = document.getElementById('addSeriesButton');
const seriesList = document.getElementById('seriesList');

// Load saved series
let series = JSON.parse(localStorage.getItem('series')) || [];

function renderSeries() {
  seriesList.innerHTML = '';
  series.forEach((item, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div style="display: flex; align-items: center;">
        ${item.poster ? `<img src="${item.poster}" alt="${item.name}" style="width: 50px; height: 75px; margin-right: 10px; border-radius: 5px;">` : ''}
        <h3>${item.name}</h3>
      </div>
    `;

    const toggleButton = document.createElement('button');
    toggleButton.textContent = item.seen ? 'Unmark' : 'Mark as Seen';
    toggleButton.style.backgroundColor = item.seen ? '#ec00e1' : 'black'; // Ändrar färg baserat på "seen"-status
    toggleButton.style.color = 'white';
    toggleButton.addEventListener('click', () => {
      toggleSeen(index); // Uppdatera "seen"-status
    });

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => deleteSeries(index));

    li.appendChild(toggleButton);
    li.appendChild(deleteButton);
    seriesList.appendChild(li);
  });
}

// Add a new series with TMDb thumbnail
async function addSeries() {
  const seriesName = seriesInput.value.trim();
  if (seriesName) {
    const poster = await fetchPoster(seriesName);
    series.push({ name: seriesName, seen: false, poster });
    seriesInput.value = '';
    saveSeries();
    renderSeries();
  }
}

// Fetch poster from TMDb
async function fetchPoster(seriesName) {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(seriesName)}&language=en-US`);
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const posterPath = data.results[0].poster_path; // Get the first result's poster
      return posterPath ? `${IMAGE_BASE_URL}${posterPath}` : null;
    }
  } catch (error) {
    console.error('Failed to fetch poster:', error);
  }
  return null; // Return null if no poster is found
}

// Toggle seen status
function toggleSeen(index) {
  series[index].seen = !series[index].seen;
  saveSeries();
  renderSeries();
}

// Delete a series
function deleteSeries(index) {
  series.splice(index, 1);
  saveSeries();
  renderSeries();
}

// Save series to localStorage
function saveSeries() {
  localStorage.setItem('series', JSON.stringify(series));
}

// Event listeners
addSeriesButton.addEventListener('click', addSeries);
seriesInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addSeries();
});

// Initial render
renderSeries();