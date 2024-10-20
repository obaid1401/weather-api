const apiKey = '99a0134ecf4beec9ed40a38802d48e7e'; 
const forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=YOUR_CITY_NAME&appid=${apiKey}&units=metric`;

let forecastData = [];
let currentPage = 1;
const entriesPerPage = 10;

document.getElementById('fetchForecastBtn').addEventListener('click', () => {
    const city = document.getElementById('cityInput').value;
    fetchForecastData(city);
});

async function fetchForecastData(city) {
    try {
        const response = await fetch(forecastApiUrl.replace('YOUR_CITY_NAME', city));
        if (!response.ok) {
            throw new Error('Forecast data not found');
        }
        const data = await response.json();
        forecastData = data.list; 
        currentPage = 1; 
        displayForecast();
    } catch (error) {
        console.error('Error fetching forecast data:', error);
        alert('Error fetching forecast data. Please try again.');
    }
}

function displayForecast() {
    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    const paginatedData = forecastData.slice(start, end);
    
    const forecastBody = document.getElementById('forecastBody');
    forecastBody.innerHTML = ''; 

    paginatedData.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        const temperature = item.main.temp;
        const description = item.weather[0].description;
        const humidity = item.main.humidity;
        const windSpeed = item.wind.speed;

        const row = `<tr>
            <td>${date}</td>
            <td>${temperature.toFixed(1)}</td>
            <td>${description}</td>
            <td>${humidity}</td>
            <td>${windSpeed}</td>
        </tr>`;
        forecastBody.innerHTML += row;
    });

    updatePagination();
}

function updatePagination() {
    document.getElementById('pageInfo').innerText = `Page ${currentPage} of ${Math.ceil(forecastData.length / entriesPerPage)}`;

    document.getElementById('prevPageBtn').style.display = currentPage === 1 ? 'none' : 'inline';
    document.getElementById('nextPageBtn').style.display = currentPage * entriesPerPage >= forecastData.length ? 'none' : 'inline';
}

document.getElementById('prevPageBtn').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        displayForecast();
    }
});

document.getElementById('nextPageBtn').addEventListener('click', () => {
    if (currentPage * entriesPerPage < forecastData.length) {
        currentPage++;
        displayForecast();
    }
});


document.getElementById('sortAscBtn').addEventListener('click', () => {
    forecastData.sort((a, b) => a.main.temp - b.main.temp);
    displayForecast();
});


document.getElementById('sortDescBtn').addEventListener('click', () => {
    forecastData.sort((a, b) => b.main.temp - a.main.temp);
    displayForecast();
});


document.getElementById('filterRainBtn').addEventListener('click', () => {
    const rainyDays = forecastData.filter(item => item.weather[0].description.includes('rain'));
    if (rainyDays.length > 0) {
        forecastData = rainyDays;
        currentPage = 1;
        displayForecast();
    } else {
        const forecastBody = document.getElementById('forecastBody');
        forecastBody.innerHTML = '<tr><td colspan="5">None</td></tr>'; 
    }
});


document.getElementById('highestTempBtn').addEventListener('click', () => {
    const highestTempEntry = forecastData.reduce((prev, current) => (prev.main.temp > current.main.temp) ? prev : current);
    
   
    const forecastBody = document.getElementById('forecastBody');
    forecastBody.innerHTML = '';

    const date = new Date(highestTempEntry.dt * 1000).toLocaleDateString();
    const temperature = highestTempEntry.main.temp;
    const description = highestTempEntry.weather[0].description;
    const humidity = highestTempEntry.main.humidity;
    const windSpeed = highestTempEntry.wind.speed;

    const row = `<tr>
        <td>${date}</td>
        <td>${temperature.toFixed(1)}</td>
        <td>${description}</td>
        <td>${humidity}</td>
        <td>${windSpeed}</td>
    </tr>`;
    
    forecastBody.innerHTML += row;
});
