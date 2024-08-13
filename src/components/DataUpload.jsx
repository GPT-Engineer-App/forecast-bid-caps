import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Upload } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const DataUpload = ({ onDataUploaded }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setError(null);
  };

  const validateCSV = (text) => {
    const rows = text.split('\n').map(row => row.split(','));
    if (rows.length < 2) {
      throw new Error("The CSV file must contain at least a header row and one data row.");
    }
    const headers = rows[0];
    if (!headers.includes('CPA') || !headers.includes('LTV')) {
      throw new Error("The CSV file must include 'CPA' and 'LTV' columns.");
    }
    return { headers, rows };
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    try {
      const text = await file.text();
      const { headers, rows } = validateCSV(text);
      const data = rows.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header.trim()] = row[index] ? row[index].trim() : '';
        });
        return obj;
      });

      onDataUploaded(data);
    } catch (err) {
      setError(`Error processing file: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="file-upload">Upload your CSV file with campaign data</Label>
        <Input id="file-upload" type="file" accept=".csv" onChange={handleFileChange} className="mt-1" />
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button onClick={handleUpload} disabled={!file}>
        <Upload className="mr-2 h-4 w-4" /> Upload and Process Data
      </Button>
      <div className="text-sm text-gray-600">
        <p>The CSV file should contain at least the following columns:</p>
        <ul className="list-disc list-inside">
          <li>CPA (Cost Per Acquisition)</li>
          <li>LTV (Lifetime Value)</li>
        </ul>
        <p>Ensure your CSV file has a header row with these column names.</p>
      </div>
    </div>
  );
};

export default DataUpload;
