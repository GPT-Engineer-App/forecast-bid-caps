import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DataUpload from '../components/DataUpload';
import Forecasting from '../components/Forecasting';
import CostBidCapCalculator from '../components/CostBidCapCalculator';

const Index = () => {
  const [step, setStep] = useState(1);
  const [uploadedData, setUploadedData] = useState(null);
  const [forecastData, setForecastData] = useState(null);

  const handleDataUploaded = (data) => {
    setUploadedData(data);
    setStep(2);
  };

  const handleForecastComplete = (forecast) => {
    setForecastData(forecast);
    setStep(3);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Meta Campaign Cost/Bid Cap Calculator</CardTitle>
          <CardDescription>Set optimal cost/bid caps based on CPA forecasting and LTV</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && <DataUpload onDataUploaded={handleDataUploaded} />}
          {step === 2 && (
            <Forecasting
              data={uploadedData}
              onForecastComplete={handleForecastComplete}
            />
          )}
          {step === 3 && <CostBidCapCalculator forecastData={forecastData} />}
          
          <div className="mt-6 flex justify-between">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Previous
              </Button>
            )}
            {step < 3 && (
              <Button variant="outline" onClick={() => setStep(step + 1)} disabled={!uploadedData || (step === 2 && !forecastData)}>
                Next
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
