import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { io } from "socket.io-client";
import { useToast } from "@/components/ui/use-toast";
import Address from "@/components/shopping-view/address";
import { fetchAllAddresses } from "@/store/shop/address-slice";

// Initialize socket
const socket = io("http://localhost:5000");

export default function UplodePrecription() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const fileInputRef = useRef(null); // 👈 Ref for file input
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { addressList } = useSelector((state) => state.shopAddress);
  const { toast } = useToast();

  // Fetch addresses when component mounts
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchAllAddresses(user.id));
    }
  }, [dispatch, user]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast({
        title: "Please upload or capture a prescription first.",
        variant: "destructive",
      });
      return;
    }

    if (!currentSelectedAddress) {
      toast({
        title: "Please select an address before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("prescription", selectedFile);

    // Add user information
    if (user) {
      formData.append("userId", user.id);
      formData.append("userName", user.name || "Anonymous User");
    }

    // Add address information
    formData.append("addressId", currentSelectedAddress._id);
    formData.append("address", currentSelectedAddress.address);
    formData.append("city", currentSelectedAddress.city);
    formData.append("pincode", currentSelectedAddress.pincode);
    formData.append("phone", currentSelectedAddress.phone);
    formData.append("notes", currentSelectedAddress.notes || "");

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Emit socket event for real-time notification
        socket.emit("new_prescription", data.data);

        toast({
          title: "Prescription uploaded successfully!",
          variant: "success",
        });
        setSelectedFile(null);
        setPreview(null);
        setCurrentSelectedAddress(null);
      } else {
        toast({
          title: "Failed to upload prescription.",
          description: data.message || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mt-3 sm:mt-5 p-3 sm:p-5">
      <div className="order-2 md:order-1">
        <Address
          selectedId={currentSelectedAddress}
          setCurrentSelectedAddress={setCurrentSelectedAddress}
        />
      </div>

      <div className="flex flex-col items-center justify-center p-5 border rounded-lg shadow-lg bg-white order-1 md:order-2">
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
          disabled={isUploading || !selectedFile || !currentSelectedAddress}
        >
          {isUploading ? "Uploading..." : "Submit Prescription"}
        </Button>

        {!currentSelectedAddress && (
          <p className="text-red-500 text-sm mt-2">Please select an address to continue</p>
        )}
      </div>
    </div>
  );
}
