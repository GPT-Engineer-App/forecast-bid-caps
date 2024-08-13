import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CostBidCapCalculator = ({ forecastData }) => {
  const [costCap, setCostCap] = useState(0);
  const [bidCap, setBidCap] = useState(0);
  const [roas, setRoas] = useState(0);

  useEffect(() => {
    if (forecastData) {
      const avgCPA = forecastData.reduce((sum, day) => sum + day.forecastedCPA, 0) / forecastData.length;
      const validLTVs = forecastData.filter(day => day.LTV !== null);
      const avgLTV = validLTVs.length > 0
        ? validLTVs.reduce((sum, day) => sum + day.LTV, 0) / validLTVs.length
        : null;
      
      if (avgLTV !== null) {
        const calculatedRoas = avgLTV / avgCPA;
        setRoas(calculatedRoas);
      } else {
        setRoas(null);
      }

      // Set initial cost cap and bid cap based on forecasted data
      setCostCap(avgCPA * 1.1); // 10% higher than average CPA
      setBidCap(avgCPA * 1.2); // 20% higher than average CPA
    }
  }, [forecastData]);

  const handleCalculate = () => {
    // Implement your advanced calculation logic here
    // This is a simplified example
    const newCostCap = costCap * (roas > 1 ? 1.05 : 0.95);
    const newBidCap = bidCap * (roas > 1 ? 1.1 : 0.9);

    setCostCap(newCostCap);
    setBidCap(newBidCap);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cost/Bid Cap Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cost-cap">Cost Cap ($)</Label>
              <Input
                id="cost-cap"
                type="number"
                value={costCap.toFixed(2)}
                onChange={(e) => setCostCap(parseFloat(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="bid-cap">Bid Cap ($)</Label>
              <Input
                id="bid-cap"
                type="number"
                value={bidCap.toFixed(2)}
                onChange={(e) => setBidCap(parseFloat(e.target.value))}
              />
            </div>
          </div>
          {roas !== null && (
            <div className="mt-4">
              <Label>Calculated ROAS</Label>
              <p className="text-2xl font-bold">{roas.toFixed(2)}</p>
            </div>
          )}
          <Button onClick={handleCalculate} className="mt-4">Recalculate Caps</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CostBidCapCalculator;
