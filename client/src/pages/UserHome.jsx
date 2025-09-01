import React, { useState } from "react";
import Avatar from "../assets/Avatar.png";
import { Camera, UserPlus, ArrowLeft } from "lucide-react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/AuthStore";
import Alert from "../components/Alert";
import axios from "axios";

function UserHome() {
  const { id } = useAuthStore();
  const navigate = useNavigate();
  
  const [alert, setAlert] = useState({
    isOpen: false,
    severity: "success",
    message: "",
  });

  const showAlert = (severity, message) => {
    setAlert({
      isOpen: true,
      severity,
      message,
    });
  };

  const closeAlert = () => {
    setAlert((prev) => ({
      ...prev,
      isOpen: false,
    }));
  };

  // Define save handler for form
  const handleSaveContact = async (formData) => {
    try {
      console.log(formData);
      const response = await axios.post(`http://localhost:8000/api/create-contact`, formData);
      console.log(response);
      showAlert("success", `Contact has been successfully added.`);
    } catch (error) {
      console.log("Error saving contact:", error);
      showAlert("error", `Failed to add contact.`);
    }
  };

  // Define save handler for camera
  const handleSavePhoto = async (mode, capturedImage) => {
    try {
      let formData = new FormData();

      if (mode === 'select') {
        formData.append("image", uploadFile);
        formData.append("user_id", id);
      } else if (capturedImage) {
        const byteString = atob(capturedImage.split(",")[1]);
        const mimeString = capturedImage.split(",")[0].split(":")[1].split(";")[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });

        formData.append("image", blob, "photo.png");
        formData.append("user_id", id);
      }

      const res = await axios.post("http://localhost:8000/api/upload-contact", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Upload success:", res.data);
      showAlert("success", `Contact has been successfully added.`);
    } catch (err) {
      console.error("Upload failed:", err);
      showAlert("error", `Failed to add contact.`);
    }
  };

  const handleCameraClick = () => {
    navigate("/camera-input", { state: { onSave: handleSavePhoto } });
  };

  const handleManualAddClick = () => {
    navigate("/form-input", { state: { onSave: handleSaveContact } });
  };

  return (
    <div className="h-full flex flex-col bg-[#ffffff]">
      <Alert
        isOpen={alert.isOpen}
        severity={alert.severity}
        message={alert.message}
        onClose={closeAlert}
        position="bottom"
        duration={4000}
      />
      
      {/* Header Section */}
      <div className="w-full bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex-shrink-0"></div>
          <div className="flex-shrink-0">
            <Header />
          </div>
        </div>
      </div>

      <hr className="border-0 border-t border-gray-300 opacity-60" />

      {/* Main Content */}
      <div className="flex-1 bg-[#F0F0F0]">
        <div className="text-center py-12 px-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Welcome to your homepage
          </h2>
          <p className="text-gray-600 mb-8">
            Choose an option below to get started
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div
              className="p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-[#0077b8] transition-colors cursor-pointer shadow-sm"
              onClick={handleCameraClick}
            >
              <Camera size={40} className="mx-auto mb-4 text-[#0077b8]" />
              <h3 className="font-semibold mb-2">Scan Card</h3>
              <p className="text-sm text-gray-600">
                Use your camera to quickly scan and add cards
              </p>
            </div>
            <div
              className="p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-[#0077b8] transition-colors cursor-pointer shadow-sm"
              onClick={handleManualAddClick}
            >
              <UserPlus size={40} className="mx-auto mb-4 text-[#0077b8]" />
              <h3 className="font-semibold mb-2">Add Manually</h3>
              <p className="text-sm text-gray-600">
                Enter card information manually using the form
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserHome;
