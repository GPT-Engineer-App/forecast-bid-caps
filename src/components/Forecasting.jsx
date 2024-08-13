import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Forecasting = ({ data, onForecastComplete }) => {
  const [forecast, setForecast] = useState(null);

  useEffect(() => {
    if (data) {
      // Calculate average CPA excluding null values
      const validCPAs = data.filter(item => item.CPA !== null);
      const avgCPA = validCPAs.length > 0
        ? validCPAs.reduce((sum, item) => sum + item.CPA, 0) / validCPAs.length
        : 0;

      // Simulate forecasting based on the uploaded data
      const simulatedForecast = data.map((item, index) => ({
        day: index + 1,
        actualCPA: item.CPA !== null ? item.CPA : null,
        forecastedCPA: item.CPA !== null
          ? item.CPA * (1 + Math.random() * 0.2 - 0.1) // Random variation for existing CPAs
          : avgCPA * (1 + Math.random() * 0.2 - 0.1), // Use average CPA for null values
        LTV: item.LTV ? parseFloat(item.LTV) : null,
      }));
      setForecast(simulatedForecast);
    }
  }, [data]);

  const handleCompleteForecast = () => {
    onForecastComplete(forecast);
  };

  if (!forecast) {
    return <div>Loading forecast...</div>;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">CPA and LTV Forecast</h3>
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
