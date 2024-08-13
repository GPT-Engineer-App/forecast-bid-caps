import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";

const Forecasting = ({ data, onForecastComplete }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [forecastDays, setForecastDays] = useState(30);
  const [growthRate, setGrowthRate] = useState(0);
  const [seasonality, setSeasonality] = useState('none');
  const [smoothing, setSmoothing] = useState(0.5);

  useEffect(() => {
    if (data && data.length > 0) {
      setStartDate(new Date(data[0].date));
      setEndDate(new Date(data[data.length - 1].date));
    }
  }, [data]);

  const filteredData = useMemo(() => {
    if (!data || !startDate || !endDate) return [];
    return data.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate && itemDate <= endDate;
    });
  }, [data, startDate, endDate]);

  const runForecast = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];

    const historicalCPAs = filteredData.map(item => item.CPA).filter(cpa => cpa !== null && !isNaN(cpa));
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

    const actualData = filteredData.map((item, index) => ({
      day: index + 1,
      date: item.date,
      actualCPA: item.CPA,
      forecastedCPA: null,
      LTV: item.LTV,
    }));

    const forecastData = Array.from({ length: parseInt(forecastDays) }, (_, index) => {
      const day = filteredData.length + index + 1;
      const growthFactor = Math.pow(1 + (growthRate / 100), index + 1);
      const rawForecast = lastCPA * growthFactor;
      const seasonalForecast = applySeasonality(rawForecast, day);
      const forecastedCPA = applySmoothing(previousForecastedCPA, seasonalForecast);

      previousForecastedCPA = forecastedCPA;

      return {
        day,
        date: new Date(endDate.getTime() + (index + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        actualCPA: null,
        forecastedCPA: forecastedCPA,
        LTV: null,
      };
    });

    return [...actualData, ...forecastData];
  }, [filteredData, forecastDays, growthRate, seasonality, smoothing, endDate]);

  useEffect(() => {
    console.log('Forecast data:', runForecast);
    console.log('Forecast parameters:', { forecastDays, growthRate, seasonality, smoothing });
    onForecastComplete(runForecast);
  }, [runForecast, onForecastComplete, forecastDays, growthRate, seasonality, smoothing]);

  return (
    <Card className="space-y-6">
      <CardHeader>
        <CardTitle>CPA and LTV Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="start-date">Start Date</Label>
            <DatePicker
              id="start-date"
              selected={startDate}
              onChange={setStartDate}
              selectsStart
              startDate={startDate}
              endDate={endDate}
            />
          </div>
          <div>
            <Label htmlFor="end-date">End Date</Label>
            <DatePicker
              id="end-date"
              selected={endDate}
              onChange={setEndDate}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
            />
          </div>
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
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="actualCPA" stroke="#8884d8" name="Actual CPA" strokeWidth={2} dot={{ r: 1 }} />
            <Line type="monotone" dataKey="forecastedCPA" stroke="#82ca9d" name="Forecasted CPA" strokeWidth={2} dot={{ r: 1 }} />
            {runForecast.some(item => item.LTV !== null) && (
              <Line type="monotone" dataKey="LTV" stroke="#ffc658" name="LTV" strokeWidth={2} dot={{ r: 1 }} />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default Forecasting;