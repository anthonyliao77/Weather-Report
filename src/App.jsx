import React, { useState, useEffect } from 'react';
import './App.css';


// --- Services ---
const api_key = import.meta.env.VITE_API_KEY;
const API_BASE = 'https://api.openweathermap.org/data/2.5/';

const fetchWeather = async (city) => {
  const response = await fetch(`${API_BASE}weather?q=${city}&appid=${api_key}&units=metric`);
  if (!response.ok) {
    throw new Error('Weather data not found');
  }
  const data = await response.json();
  return data;
};

// Popular cities data
const POPULAR_CITIES = [
  { name: 'New York', country: 'US' },
  { name: 'London', country: 'UK' },
  { name: 'Tokyo', country: 'JP' },
  { name: 'Paris', country: 'FR' },
  { name: 'Dubai', country: 'AE' },
  { name: 'Sydney', country: 'AU' },
  { name: 'Mumbai', country: 'IN' },
  { name: 'Barcelona', country: 'ES' },
  { name: 'Gothenburg', country: 'SE' }
];

// --- Components ---

const SearchBar = ({ onSearch, isSearching }) => {
  const [city, setCity] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (city.trim()) {
      onSearch(city);
      setCity('');
    }
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSearch} className="search-bar">
        <div className="search-input-wrapper">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Search for any city..."
            className="search-input"
            disabled={isSearching}
          />
          <button type="submit" className="search-button" disabled={isSearching}>
            {isSearching ? '⏳' : '🔍'}
          </button>
        </div>
      </form>
    </div>
  );
};

const PopularCities = ({ onCityClick, citiesWeather, isLoading }) => {
  return (
    <div className="popular-cities">
      <h3>International Time Zones</h3>
      <div className="cities-grid">
        {POPULAR_CITIES.map((city) => {
          const weather = citiesWeather[city.name];
          return (
            <div
              key={city.name}
              className="city-card"
              data-city={city.name}
              onClick={() => onCityClick(city.name)}
            >
              <div className="city-header">
                <span className="city-name">{city.name}</span>
              </div>
              {weather && !isLoading ? (
                <div className="city-weather">
                  <img
                    src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}.png`}
                    alt={weather.weather[0].description}
                    className="mini-weather-icon"
                  />
                  <span className="city-temp">{Math.round(weather.main.temp)}°C</span>
                </div>
              ) : (
                <div className="city-weather">
                  <span className="loading-dot">***</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const WeatherDisplay = ({ data }) => {
  const { name, main, weather, wind, sys } = data;
  const iconUrl = `http://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;
  
  const getBackgroundGradient = (weatherMain) => {
    switch (weatherMain.toLowerCase()) {
      case 'clear':
        return 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)';
      case 'clouds':
        return 'linear-gradient(135deg, #636e72 0%, #2d3436 100%)';
      case 'rain':
        return 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)';
      case 'snow':
        return 'linear-gradient(135deg, #ddd 0%, #74b9ff 100%)';
      default:
        return 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)';
    }
  };

  return (
    <div 
      className="weather-display"
      style={{ background: getBackgroundGradient(weather[0].main) }}
    >
      <div className="weather-header">
        <h2>{name}, {sys.country}</h2>
        <div className="weather-main">
          <img src={iconUrl} alt={weather[0].description} className="weather-icon" />
          <div className="temperature">
            <span className="temp-main">{Math.round(main.temp)}°</span>
            <span className="temp-unit">C</span>
          </div>
        </div>
        <p className="weather-description">{weather[0].description}</p>
      </div>
      
      <div className="weather-details">
        <div className="detail-item">
          <span className="detail-label">Feels like</span>
          <span className="detail-value">{Math.round(main.feels_like)}°C</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Humidity</span>
          <span className="detail-value">{main.humidity}%</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Wind Speed</span>
          <span className="detail-value">{wind.speed} m/s</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Pressure</span>
          <span className="detail-value">{main.pressure} hPa</span>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component --- 

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [citiesWeather, setCitiesWeather] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [citiesLoading, setCitiesLoading] = useState(true);

  // Load popular cities weather on component mount
  useEffect(() => {
    const loadPopularCities = async () => {
      setCitiesLoading(true);
      const citiesData = {};
      
      for (const city of POPULAR_CITIES) {
        try {
          const data = await fetchWeather(city.name);
          citiesData[city.name] = data;
        } catch (err) {
          console.error(`Failed to load weather for ${city.name}`);
        }
      }
      
      setCitiesWeather(citiesData);
      setCitiesLoading(false);
    };

    loadPopularCities();
  }, []);

  const handleSearch = async (city) => {
    setLoading(true);
    setError(null);
    setWeatherData(null);
    
    try {
      const data = await fetchWeather(city);
      setWeatherData(data);
    } catch (err) {
      setError('City not found. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCityClick = async (cityName) => {
    if (citiesWeather[cityName]) {
      setWeatherData(citiesWeather[cityName]);
    } else {
      handleSearch(cityName);
    }
  };

  return (
    <div className="app">
      <div className="app-header">
        <h1 className="app-title">
          <span className="weather-emoji">⛅</span>
          Weather Report
        </h1>
        <p className="app-subtitle">Discover weather around the world!</p>
      </div>

      <SearchBar onSearch={handleSearch} isSearching={loading} />

      {loading && (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading weather data...</p>
        </div>
      )}

      {error && <div className="error">{error}</div>}

      {weatherData ? (
        <WeatherDisplay data={weatherData} />
      ) : (
        <PopularCities 
          onCityClick={handleCityClick} 
          citiesWeather={citiesWeather}
          isLoading={citiesLoading}
        />
      )}

      {weatherData && (
        <button 
          className="back-button"
          onClick={() => setWeatherData(null)}
        >
          ← Back to Popular Cities
        </button>
      )}
    </div>
  );
}

export default App;
