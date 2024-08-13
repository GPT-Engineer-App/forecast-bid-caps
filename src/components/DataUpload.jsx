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

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    try {
      // Here you would typically send the file to a server
      // For this example, we'll simulate parsing the CSV file
      const text = await file.text();
      const rows = text.split('\n').map(row => row.split(','));
      const headers = rows[0];
      const data = rows.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header.trim()] = row[index].trim();
        });
        return obj;
      });

      onDataUploaded(data);
    } catch (err) {
      setError("Error processing file. Please ensure it's a valid CSV.");
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
    </div>
  );
};

export default DataUpload;
