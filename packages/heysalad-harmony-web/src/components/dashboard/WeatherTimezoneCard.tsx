import { useEffect, useState } from 'react';
import { MapPin, Cloud, CloudRain, Sun, CloudSnow, Wind, Loader2 } from 'lucide-react';

interface CityWeather {
  city: string;
  timezone: string;
  time: string;
  temperature?: number;
  condition?: string;
  icon?: string;
  humidity?: number;
}

interface WeatherTimezoneCardProps {
  apiKey?: string;
  cities?: Array<{ name: string; timezone: string; lat?: number; lon?: number }>;
}

const DEFAULT_CITIES = [
  { name: 'London', timezone: 'Europe/London', lat: 51.5074, lon: -0.1278 }, // HQ
  { name: 'New York', timezone: 'America/New_York', lat: 40.7128, lon: -74.0060 },
  { name: 'Berlin', timezone: 'Europe/Berlin', lat: 52.5200, lon: 13.4050 },
];

const getWeatherIcon = (condition?: string) => {
  if (!condition) return Cloud;

  const lowerCondition = condition.toLowerCase();
  if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle')) return CloudRain;
  if (lowerCondition.includes('snow')) return CloudSnow;
  if (lowerCondition.includes('clear') || lowerCondition.includes('sun')) return Sun;
  if (lowerCondition.includes('wind')) return Wind;
  return Cloud;
};

export const WeatherTimezoneCard = ({
  apiKey,
  cities = DEFAULT_CITIES
}: WeatherTimezoneCardProps) => {
  const [cityData, setCityData] = useState<CityWeather[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        setError(null);

        const weatherPromises = cities.map(async (city) => {
          // Get current time for timezone
          const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: city.timezone,
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          });
          const time = formatter.format(new Date());

          // Try to fetch weather data if API key and coordinates provided
          if (apiKey && city.lat && city.lon) {
            try {
              const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${apiKey}&units=metric`,
                { cache: 'force-cache' }
              );

              if (response.ok) {
                const data = await response.json();
                return {
                  city: city.name,
                  timezone: city.timezone,
                  time,
                  temperature: Math.round(data.main.temp),
                  condition: data.weather[0].main,
                  humidity: data.main.humidity,
                };
              }
            } catch (err) {
              console.warn(`Weather fetch failed for ${city.name}, using time-only`, err);
            }
          }

          // Fallback: just show time
          return {
            city: city.name,
            timezone: city.timezone,
            time,
          };
        });

        const results = await Promise.all(weatherPromises);
        setCityData(results);
      } catch (err) {
        console.error('Failed to fetch weather/timezone data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();

    // Refresh every 5 minutes
    const interval = setInterval(fetchWeatherData, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [apiKey, cities]);

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-gray-900">Global Operations</h3>
        </div>
        <p className="text-sm text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-6">
        <MapPin className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-gray-900">Global Operations</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cityData.map((data, index) => {
          const WeatherIcon = getWeatherIcon(data.condition);
          const isHQ = index === 0; // London is HQ

          return (
            <div
              key={data.city}
              className={`p-4 rounded-lg border transition-all ${
                isHQ
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">
                      {data.city}
                    </p>
                    {isHQ && (
                      <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full font-medium">
                        HQ
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {data.time}
                  </p>
                </div>
                <div className="bg-primary/10 p-2 rounded-lg">
                  <WeatherIcon className="w-5 h-5 text-primary" />
                </div>
              </div>

              {data.temperature !== undefined && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{data.condition}</span>
                  <span className="font-semibold text-gray-900">
                    {data.temperature}°C
                  </span>
                </div>
              )}

              {!data.temperature && (
                <p className="text-xs text-gray-500">
                  {data.timezone.replace('_', ' ')}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {!apiKey && (
        <p className="text-xs text-gray-500 mt-4">
          💡 Add OpenWeatherMap API key for weather data
        </p>
      )}
    </div>
  );
};

export default WeatherTimezoneCard;
