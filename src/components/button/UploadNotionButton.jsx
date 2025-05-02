"use client";

import { useState } from "react";
import Button from "@components/button/Button";
import FileInput from "@components/input/FileInput";

const UploadNotionButton = ({ onUpload }) => {
  const [loading, setLoading] = useState(false);

  const handleFileSelect = async (file) => {
    setLoading(true);

    try {
      // Read the file content
      const fileContent = await file.text();
      const jsonData = JSON.parse(fileContent); // Parse the JSON content

      // Pass the JSON data to the parent component
      onUpload(jsonData);

      console.log("Uploaded Notion Config:", jsonData);
      alert("Notion Config uploaded successfully!");
    } catch (err) {
      console.error("Error uploading Notion Config:", err);
      alert("Failed to upload Notion Config. Please ensure it is a valid JSON file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <FileInput onFileSelect={handleFileSelect} />
      <label htmlFor="file-input">
        <Button
          type="button"
          text={loading ? "Uploading..." : "Upload Notion Config"}
          disabled={loading}
        />
      </label>
    </div>
  );
};

export default UploadNotionButton;