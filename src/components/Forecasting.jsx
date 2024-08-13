import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Prophet from 'prophet';

const Forecasting = ({ data, onForecastComplete }) => {
  const [forecast, setForecast] = useState(null);
  const [forecastDays, setForecastDays] = useState(30);
  const [changepoint_prior_scale, setChangepointPriorScale] = useState(0.05);
  const [seasonality_prior_scale, setSeasonalityPriorScale] = useState(10);

  useEffect(() => {
    if (data) {
      runForecast();
    }
  }, [data, forecastDays, changepoint_prior_scale, seasonality_prior_scale]);

  const runForecast = async () => {
    const prophet = new Prophet({
      changepoint_prior_scale: parseFloat(changepoint_prior_scale),
      seasonality_prior_scale: parseFloat(seasonality_prior_scale),
    });

    const ds = data.map((item, index) => ({ ds: new Date(2023, 0, index + 1), y: item.CPA || null }));
    await prophet.fit(ds);

    const future = prophet.make_future_dataframe(parseInt(forecastDays));
    const forecast = await prophet.predict(future);

    const formattedForecast = forecast.map((f, index) => ({
      day: index + 1,
      actualCPA: index < data.length ? data[index].CPA : null,
      forecastedCPA: f.yhat,
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
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="forecast-days">Forecast Days</Label>
          <Input
            id="forecast-days"
            type="number"
            value={forecastDays}
            onChange={(e) => setForecastDays(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="changepoint-prior-scale">Changepoint Prior Scale</Label>
          <Input
            id="changepoint-prior-scale"
            type="number"
            step="0.01"
            value={changepoint_prior_scale}
            onChange={(e) => setChangepointPriorScale(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="seasonality-prior-scale">Seasonality Prior Scale</Label>
          <Input
            id="seasonality-prior-scale"
            type="number"
            step="0.1"
            value={seasonality_prior_scale}
            onChange={(e) => setSeasonalityPriorScale(e.target.value)}
          />
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
      <Button onClick={handleCompleteForecast}>Complete Forecast</Button>
    </div>
  );
};

export default Forecasting;
