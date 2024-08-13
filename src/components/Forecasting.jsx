import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Slider } from "@/components/ui/slider";

const Forecasting = ({ data, onForecastComplete }) => {
  const [forecast, setForecast] = useState(null);
  const [forecastDays, setForecastDays] = useState(30);
  const [growthRate, setGrowthRate] = useState(1);

  useEffect(() => {
    if (data) {
      runForecast();
    }
  }, [data, forecastDays, growthRate]);

  const runForecast = () => {
    if (!data || data.length === 0) return;

    const historicalCPAs = data.map(item => item.CPA).filter(cpa => cpa !== null && !isNaN(cpa));
    const avgCPA = historicalCPAs.reduce((sum, cpa) => sum + cpa, 0) / historicalCPAs.length;
    const lastCPA = historicalCPAs[historicalCPAs.length - 1] || avgCPA;

    const formattedForecast = Array.from({ length: parseInt(forecastDays) }, (_, index) => {
      const daysSinceLastActual = index - (data.length - 1);
      const forecastedCPA = daysSinceLastActual > 0
        ? lastCPA * Math.pow(1 + (growthRate / 100), daysSinceLastActual)
        : data[index]?.CPA || null;

      return {
        day: index + 1,
        actualCPA: index < data.length ? data[index].CPA : null,
        forecastedCPA: forecastedCPA,
        LTV: index < data.length ? data[index].LTV : null,
      };
    });

    setForecast(formattedForecast);
  };

  const handleCompleteForecast = () => {
    onForecastComplete(forecast);
  };

  if (!forecast) {
    return <div>Loading forecast...</div>;
  }

  return (
    <Card className="space-y-6">
      <CardHeader>
        <CardTitle>CPA and LTV Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="forecast-days">Forecast Days</Label>
            <Input
              id="forecast-days"
              type="number"
              value={forecastDays}
              onChange={(e) => setForecastDays(parseInt(e.target.value))}
              min={1}
              max={365}
            />
          </div>
          <div>
            <Label htmlFor="growth-rate">Growth Rate (%)</Label>
            <Slider
              id="growth-rate"
              min={-10}
              max={10}
              step={0.1}
              value={[growthRate]}
              onValueChange={(value) => setGrowthRate(value[0])}
            />
            <span className="text-sm text-gray-500">{growthRate.toFixed(1)}%</span>
          </div>
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
        <Button onClick={handleCompleteForecast} className="mt-4">Complete Forecast</Button>
      </CardContent>
    </Card>
  );
};

export default Forecasting;
