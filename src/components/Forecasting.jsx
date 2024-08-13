import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Forecasting = ({ data, onForecastComplete }) => {
  const [forecastDays, setForecastDays] = useState(30);
  const [growthRate, setGrowthRate] = useState(0);
  const [seasonality, setSeasonality] = useState('none');
  const [smoothing, setSmoothing] = useState(0.5);

  const runForecast = useMemo(() => {
    if (!data || data.length === 0) return [];

    const historicalCPAs = data.map(item => item.CPA).filter(cpa => cpa !== null && !isNaN(cpa));
    const avgCPA = historicalCPAs.reduce((sum, cpa) => sum + cpa, 0) / historicalCPAs.length;
    const lastCPA = historicalCPAs[historicalCPAs.length - 1] || avgCPA;

    const applySeasonality = (value, day) => {
      switch (seasonality) {
        case 'weekly':
          return value * (1 + 0.1 * Math.sin(2 * Math.PI * day / 7));
        case 'monthly':
          return value * (1 + 0.2 * Math.sin(2 * Math.PI * day / 30));
        default:
          return value;
      }
    };

    const applySmoothing = (previousValue, newValue) => {
      return smoothing * previousValue + (1 - smoothing) * newValue;
    };

    let previousForecastedCPA = lastCPA;

    return Array.from({ length: parseInt(forecastDays) }, (_, index) => {
      const day = index + 1;
      const isActual = index < data.length;
      
      let forecastedCPA;
      if (isActual) {
        forecastedCPA = data[index].CPA;
      } else {
        const growthFactor = Math.pow(1 + (growthRate / 100), day - data.length);
        const rawForecast = lastCPA * growthFactor;
        const seasonalForecast = applySeasonality(rawForecast, day);
        forecastedCPA = applySmoothing(previousForecastedCPA, seasonalForecast);
      }

      previousForecastedCPA = forecastedCPA;

      return {
        day,
        actualCPA: isActual ? data[index].CPA : null,
        forecastedCPA: forecastedCPA,
        LTV: isActual ? data[index].LTV : null,
      };
    });
  }, [data, forecastDays, growthRate, seasonality, smoothing]);

  useEffect(() => {
    onForecastComplete(runForecast);
  }, [runForecast, onForecastComplete]);

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
          <div>
            <Label htmlFor="seasonality">Seasonality</Label>
            <Select value={seasonality} onValueChange={setSeasonality}>
              <SelectTrigger id="seasonality">
                <SelectValue placeholder="Select seasonality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="smoothing">Smoothing Factor</Label>
            <Slider
              id="smoothing"
              min={0}
              max={1}
              step={0.1}
              value={[smoothing]}
              onValueChange={(value) => setSmoothing(value[0])}
            />
            <span className="text-sm text-gray-500">{smoothing.toFixed(1)}</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={runForecast}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="actualCPA" stroke="#8884d8" name="Actual CPA" />
            <Line type="monotone" dataKey="forecastedCPA" stroke="#82ca9d" name="Forecasted CPA" />
            {runForecast.some(item => item.LTV !== null) && (
              <Line type="monotone" dataKey="LTV" stroke="#ffc658" name="LTV" />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default Forecasting;
