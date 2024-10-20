const apiKey = '99a0134ecf4beec9ed40a38802d48e7e';
const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=YOUR_CITY_NAME&appid=${apiKey}&units=metric`;
const forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=YOUR_CITY_NAME&appid=${apiKey}&units=metric`;

let tempChart; 
let doughnutChart; 
let lineChart; 

async function fetchWeatherData(city) {
    try {
        const response = await fetch(apiUrl.replace('YOUR_CITY_NAME', city));
        if (!response.ok) {
            throw new Error('Weather data not found');
        }
        const data = await response.json();
        displayWeatherData(data);
        fetchForecastData(city); 
    } catch (error) {
        console.error('Error fetching weather data:', error);
        document.querySelector('.weather-info').innerHTML = '<p>Error fetching weather data</p>';
    }
}



async function fetchForecastData(city) {
    try {
        const response = await fetch(forecastApiUrl.replace('YOUR_CITY_NAME', city));
        if (!response.ok) {
            throw new Error('Forecast data not found');
        }
        const data = await response.json();
        displayForecastChart(data);
        displayDoughnutChart(data); 
        displayLineChart(data);
    } catch (error) {
        console.error('Error fetching forecast data:', error);
        document.querySelector('.weather-info').innerHTML = '<p>Error fetching forecast data</p>';
    }
}

function displayLineChart(data) {
    const labels = [];
    const temperatures = [];

    
    data.list.forEach((item, index) => {
        if (index % 8 === 0) { 
            const date = new Date(item.dt * 1000);
            labels.push(date.toLocaleDateString('en-US'));
            temperatures.push(item.main.temp);
        }
    });

    
    if (lineChart) {
        lineChart.destroy();
    }

    const ctx = document.getElementById('lineChart').getContext('2d');
    lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: temperatures,
                backgroundColor: '#ccc',
                borderColor: 'rgba(75, 192, 192, 1)', 
                borderWidth: 2,
                fill: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    },
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function (tooltipItem) {
                            return `${tooltipItem.dataset.label}: ${tooltipItem.raw}°C`;
                        }
                    }
                }
            }
        }
    });
}

function displayWeatherData(data) {
    const cityNameElement = document.querySelector('.City-name');
    const temperatureElement = document.querySelector('.City-temp');
    const descriptionElement = document.querySelector('.City-desc');
    const humidityElement = document.querySelector('.City-humidity');
    const windSpeedElement = document.querySelector('.City-wind');

    const temperature = data.main.temp;
    const weatherDescription = data.weather[0].description;
    const cityName = data.name;
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;

    cityNameElement.innerHTML = `<h2>Weather in ${cityName}</h2>`;
    temperatureElement.innerHTML = `Temperature: ${temperature}°C`;
    descriptionElement.innerHTML = `Description: ${weatherDescription}`;
    humidityElement.innerHTML = `Humidity: ${humidity}%`;
    windSpeedElement.innerHTML = `Wind Speed: ${windSpeed} m/s`;
    updateBackground(weatherDescription);
}

function updateBackground(description) {
    const weatherInfoDiv = document.querySelector('.weather-info'); 
    let backgroundImage;
    let backgroundColor = "#ffffff"; 

   
    if (description.includes("clear")) {
        
        backgroundColor = "#87CEEB";
    } else if (description.includes("clouds")) {
       
        backgroundColor = "#B0C4DE"; 
    } else if (description.includes("rain")) {
       
        backgroundColor = "#A9A9A9";
    } else if (description.includes("snow")) {
        
        backgroundColor = "#F0F8FF"; 
    } else {
       
        backgroundColor = "#00bfff"; 
    }

   
    weatherInfoDiv.style.backgroundImage = backgroundImage;
    weatherInfoDiv.style.backgroundColor = backgroundColor; 
    weatherInfoDiv.style.backgroundSize = "cover"; 
    weatherInfoDiv.style.backgroundPosition = "center"; 
}


function displayForecastChart(data) {
    const labels = [];
    const temperatures = [];

    
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        labels.push(day);
        temperatures.push(item.main.temp);
    });

    const uniqueLabels = [...new Set(labels)];
    const uniqueTemperatures = uniqueLabels.map(label => {
        return temperatures[labels.indexOf(label)];
    });

    if (tempChart) {
        tempChart.destroy();
    }

    const ctx = document.getElementById('tempChart').getContext('2d');
    tempChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: uniqueLabels,
            datasets: [{
                label: 'Temperature (°C)',
                data: uniqueTemperatures,
                backgroundColor: 'rgba(128, 0, 128, 0.6)',
                borderColor: 'rgba(128, 0, 128, 1)',
                borderWidth: 1,
            }]
        },
        options: {
            animation: {
                onComplete: () => {
                    if (!tempChart || !tempChart.ctx) {
                        console.error('Chart instance or context is undefined');
                        return;
                    }

                    const chartCtx = tempChart.ctx;
                    chartCtx.display = 'flex';
                    chartCtx.flexDirection = 'column';
                    chartCtx.textAlign = 'center';
                    chartCtx.fillStyle = 'black';

                    tempChart.data.datasets.forEach((dataset, i) => {
                        const meta = tempChart.getDatasetMeta(i);
                        meta.data.forEach((bar, index) => {
                            const value = dataset.data[index];
                            chartCtx.fillText(value, bar.x, bar.y - 5);
                        });
                    });
                }
            }
        }
    });
}

function displayDoughnutChart(data) {
    const weatherConditions = {};

    data.list.forEach(item => {
        const condition = item.weather[0].main;
        if (weatherConditions[condition]) {
            weatherConditions[condition]++;
        } else {
            weatherConditions[condition] = 1;
        }
    });

    const labels = Object.keys(weatherConditions);
    const values = Object.values(weatherConditions);

    if (doughnutChart) {
        doughnutChart.destroy();
    }

    const ctx = document.getElementById('doughnutChart').getContext('2d');
    doughnutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: ['rgba(255, 205, 86, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)'],
                borderColor: ['rgba(255, 205, 86, 1)', 'rgba(54, 162, 235, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'right',
                },
                tooltip: {
                    callbacks: {
                        label: function (tooltipItem) {
                            const total = tooltipItem.dataset.data.reduce((acc, value) => acc + value, 0);
                            const percentage = ((tooltipItem.raw / total) * 100).toFixed(2);
                            return `${tooltipItem.label}: ${percentage}%`;
                        }
                    }
                }
            }
        }
    });
}


document.addEventListener('DOMContentLoaded', () => {
    fetchWeatherData('Abbottabad'); 
});


document.querySelector('.btn').addEventListener('click', () => {
    const searchBar = document.querySelector('.search-bar');
    const city = searchBar.value.trim();
    if (city) {
        fetchWeatherData(city);
    } else {
        alert('Please enter a city name!');
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const chatbotBtn = document.getElementById("chatbot-btn");
    const chatbot = document.getElementById("chatbot");

    chatbotBtn.addEventListener("click", () => {
        
        if (chatbot.style.display === "none" || chatbot.style.display === "") {
            chatbot.style.display = "block"; 
        } else {
            chatbot.style.display = "none"; 
        }
    });
});


document.getElementById('sendChatBtn').addEventListener('click', () => {
    const chatInput = document.getElementById('chatInput');
    const userMessage = chatInput.value.trim();

    if (userMessage) {
        displayMessage(userMessage, 'user');
        chatInput.value = ''; 

        
        processUserMessage(userMessage);
    }
});

function displayMessage(message, sender) {
    const messagesContainer = document.getElementById('chatbotMessages');
    const messageElement = document.createElement('div');
    messageElement.className = sender === 'user' ? 'user-message' : 'bot-message';
    messageElement.textContent = message;
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight; 
}

function processUserMessage(message) {
    
    const lowerCaseMessage = message.toLowerCase();

    if (lowerCaseMessage.includes('weather')) {
        displayMessage("I can tell you the weather! Please enter the city name.", 'bot');
    } else if (lowerCaseMessage.includes('help')) {
        displayMessage("You can ask me about the weather or enter a city name to get weather data.", 'bot');
    } else {
        displayMessage("I'm sorry, I didn't understand that. Please try again.", 'bot');
    }
}
