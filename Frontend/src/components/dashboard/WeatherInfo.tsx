import { Thermometer, Wind, Cloud, Droplets, Sun } from "lucide-react";

const WeatherInfo = () => {
  // In a real app, this would fetch weather data from an API
  const weatherData = {
    temperature: 24,
    condition: "Sunny",
    highTemp: 26,
    lowTemp: 19,
    windSpeed: 2.5,
    humidity: 65,
    location: "Farm Region"
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Main weather display */}
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center">
          <Sun className="h-8 w-8 text-yellow-500" />
        </div>
        <div>
          <div className="text-4xl font-bold">{weatherData.temperature}°C</div>
          <div className="text-muted-foreground">{weatherData.condition}</div>
        </div>
      </div>

      {/* Weather details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
        <div className="flex items-center gap-2">
          <Thermometer className="h-5 w-5 text-red-500" />
          <div>
            <div className="text-sm text-muted-foreground">High</div>
            <div className="font-medium">{weatherData.highTemp}°C</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Thermometer className="h-5 w-5 text-blue-500" />
          <div>
            <div className="text-sm text-muted-foreground">Low</div>
            <div className="font-medium">{weatherData.lowTemp}°C</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Wind className="h-5 w-5 text-gray-500" />
          <div>
            <div className="text-sm text-muted-foreground">Wind</div>
            <div className="font-medium">{weatherData.windSpeed} m/s</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Droplets className="h-5 w-5 text-blue-500" />
          <div>
            <div className="text-sm text-muted-foreground">Humidity</div>
            <div className="font-medium">{weatherData.humidity}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherInfo;