import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload } from "lucide-react";

export default function UplodePrecription() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null); // 👈 Ref for file input

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      alert("Please upload or capture a prescription first.");
      return;
    }

    const formData = new FormData();
    formData.append("prescription", selectedFile);

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Prescription uploaded successfully!");
        setSelectedFile(null);
        setPreview(null);
      } else {
        alert("Failed to upload prescription.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-5 border rounded-lg shadow-lg bg-white">
      <h2 className="text-lg font-semibold mb-4">Upload Your Prescription Image</h2>

      {/* Upload Icon (optional) */}
      <Upload size={40} className="text-blue-500 mb-2 cursor-pointer" onClick={() => fileInputRef.current.click()} />

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Upload Button */}
      <Button variant="outline" onClick={() => fileInputRef.current.click()}>
        Upload from Device
      </Button>

      {/* Preview */}
      {preview && (
        <div className="mt-4">
          <h3 className="text-sm font-medium">Preview:</h3>
          <img src={preview} alt="Preview" className="mt-2 w-48 h-48 rounded-lg shadow" />
        </div>
      )}

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md"
      >
        Submit Prescription
      </Button>
    </div>
  );
}
