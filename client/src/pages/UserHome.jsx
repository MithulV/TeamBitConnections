import React, { useState } from "react";
import CameraInput from "../components/CameraInput";
import FormInput from "../components/FormInput";
import Avatar from "../assets/Avatar.png";
import { Camera, UserPlus, ArrowLeft } from "lucide-react";
import Header from "../components/Header";
import axios from "axios";
import { useAuthStore } from "../store/AuthStore";
import Alert from "../components/Alert";
function UserHome() {
  const { id } = useAuthStore()
  const [activeView, setActiveView] = useState("default"); // 'default', 'camera', 'form'
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
  const handleCameraClick = () => {
    setActiveView("camera");
  };

  const handleManualAddClick = () => {
    setActiveView("form");
  };

  const handleBackToDefault = () => {
    setActiveView("default");
  };

  const handleSaveContact = async (formData) => {
    try {
      console.log(formData);
      const response = await axios.post(`http://localhost:8000/api/create-contact`, formData);
      console.log(response);
      showAlert(
        "success", `contact has been successfully added.`
      );
    } catch (error) {
      console.log("Error saving contact:", error);
      showAlert(
        "error", `failed to add contact.`
      );
    }
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
      {/* <div className="p-8 pt-4 pb-3 shadow bg-white flex-shrink-0"> */}
      <div className="flex  items-center justify-between">
        {/* User Profile Header */}
        <Header />
        {/* Conditional Action Buttons */}
        {activeView === "default" ? undefined : (
          <button
            onClick={handleBackToDefault}
            className="px-4 py-2 mr-5 flex items-center gap-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
          >
            <ArrowLeft size={20} />
            Back
          </button>
        )}
      </div>
      {/* </div> */}

      <hr className="border-0 border-t border-gray-300 opacity-60" />

      {/* Main Content Area - Conditional Rendering */}
      <div className="flex-1 bg-[#F0F0F0]">
        {activeView === "default" && (
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
        )}

        {activeView === "camera" && (
          <div className="h-full">
            <CameraInput onBack={handleBackToDefault} onSave={handleSaveContact} />
          </div>
        )}

        {activeView === "form" && (
          <div className="p-6">
            <FormInput
              onBack={handleBackToDefault}
              onSave={handleSaveContact}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default UserHome;
