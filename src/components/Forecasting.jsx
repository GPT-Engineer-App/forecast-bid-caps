import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';

const Forecasting = ({ data, onForecastComplete }) => {
  const [forecast, setForecast] = useState(null);
  const [forecastDays, setForecastDays] = useState(30);

  useEffect(() => {
    if (data) {
      runForecast();
    }
  }, [data, forecastDays]);

  const runForecast = () => {
    const lastCPA = data[data.length - 1]?.CPA || 0;
    const formattedForecast = Array.from({ length: parseInt(forecastDays) }, (_, index) => ({
      day: index + 1,
      actualCPA: index < data.length ? data[index].CPA : null,
      forecastedCPA: lastCPA + (index * 0.01 * lastCPA), // Simple linear increase
      LTV: index < data.length ? data[index].LTV : null,
    }));

    setForecast(formattedForecast);
  };

  const handleCompleteForecast = () => {
    onForecastComplete(forecast);
  };

  if (!forecast) {
    return <div>Loading forecast...</div>;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">CPA and LTV Forecast</h3>
      <div>
        <Label htmlFor="forecast-days">Forecast Days</Label>
        <Input
          id="forecast-days"
          type="number"
          value={forecastDays}
          onChange={(e) => setForecastDays(e.target.value)}
        />
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={forecast}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="actualCPA" stroke="#8884d8" name="Actual CPA" />
          <Line type="monotone" dataKey="forecastedCPA" stroke="#82ca9d" name="Forecasted CPA" />
          {forecast.some(item => item.LTV !== null) && (
            <Line type="monotone" dataKey="LTV" stroke="#ffc658" name="LTV" />
          )}
        </LineChart>
      </ResponsiveContainer>
      <Button onClick={handleCompleteForecast}>Complete Forecast</Button>
    </div>
  );
};

export default Forecasting;
