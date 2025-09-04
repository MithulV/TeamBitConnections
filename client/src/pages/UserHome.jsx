import React, { useState } from "react";
import { Camera, UserPlus } from "lucide-react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import Alert from "../components/Alert";

function UserHome() {
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

  const handleCameraClick = () => {
    navigate("/camera-input");
  };

  const handleManualAddClick = () => {
    navigate("/form-input");
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
