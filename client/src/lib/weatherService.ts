import { useState, useEffect } from 'react';

// Weather data interface
export interface WeatherData {
  temperature: number;
  description: string;
  icon: string;
  location: string;
  loading: boolean;
  error: string | null;
}

// Default location coordinates (can be customized per deployment)
const DEFAULT_LAT = -31.9523; // Perth, Australia
const DEFAULT_LON = 115.8613;

// Function to fetch weather data from OpenWeather API
export async function fetchWeatherData(lat = DEFAULT_LAT, lon = DEFAULT_LON): Promise<WeatherData> {
  try {
    const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }
    
    const data = await response.json();
    return {
      temperature: Math.round(data.main.temp),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      location: data.name,
      loading: false,
      error: null
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return {
      temperature: 0,
      description: '',
      icon: '',
      location: '',
      loading: false,
      error: 'Failed to load weather data'
    };
  }
}

// React hook to use weather data
export function useWeather() {
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 0,
    description: '',
    icon: '',
    location: '',
    loading: true,
    error: null
  });

  useEffect(() => {
    const getWeather = async () => {
      try {
        const data = await fetchWeatherData();
        setWeather(data);
      } catch (error) {
        setWeather(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load weather data'
        }));
      }
    };

    getWeather();
    
    // Refresh weather data every 30 minutes
    const intervalId = setInterval(getWeather, 30 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  return weather;
}