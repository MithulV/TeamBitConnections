import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Calendar,
  MapPin,
  Camera,
  FileText,
} from "lucide-react";
import Header from "../../components/Header/Header";
import Alert from "../../components/Alert/Alert";
import axios from "axios";
import { useAuthStore } from "../../store/AuthStore";

function EventDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useAuthStore();

  // Get the captured image from navigation state
  const capturedImage = location.state?.capturedImage || null;

  const [loading, setLoading] = useState(false);
  const [eventData, setEventData] = useState({
    eventName: "",
    eventRole: "",
    eventDate: "",
    eventHeldOrganization: "",
    eventLocation: "",
  });

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    // Basic validation
    if (
      !eventData.eventName ||
      !eventData.eventRole ||
      !eventData.eventDate ||
      !eventData.eventHeldOrganization ||
      !eventData.eventLocation
    ) {
      showAlert("error", "Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();

      // If there's a captured image, add it to the form data
      if (capturedImage) {
        const response = await fetch(capturedImage);
        const blob = await response.blob();
        formData.append("image", blob, "event_image.jpg");
      }

      // Add event data
      formData.append("user_id", id);
      formData.append("eventName", eventData.eventName);
      formData.append("eventRole", eventData.eventRole);
      formData.append("eventDate", eventData.eventDate);
      formData.append("eventHeldOrganization", eventData.eventHeldOrganization);
      formData.append("eventLocation", eventData.eventLocation);

      const res = await axios.post(
        "http://localhost:8000/api/upload-contact",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("Event save success:", res.data);
      showAlert("success", "Event details have been successfully saved.");

      // Navigate back after success
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      console.error("Event save failed:", err);
      showAlert("error", "Failed to save event details.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Alert
        isOpen={alert.isOpen}
        onClose={closeAlert}
        severity={alert.severity}
        message={alert.message}
      />

      <div className="container mx-auto p-4 pt-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft size={20} />
                Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Event Details
                </h1>
                <p className="text-gray-600">
                  Add details about the event where you met this contact
                </p>
              </div>
            </div>

            {/* Show captured image if available */}
            {capturedImage && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Camera size={20} />
                  Captured Business Card
                </h3>
                <img
                  src={capturedImage}
                  alt="Business card"
                  className="w-full max-w-md rounded-lg shadow-sm border border-gray-200"
                />
              </div>
            )}
          </div>

          {/* Event Details Form */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <FileText size={20} />
              Event Information
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Event Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Name *
                </label>
                <input
                  type="text"
                  name="eventName"
                  value={eventData.eventName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Tech Conference 2024"
                  required
                />
              </div>

              {/* Event Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Role *
                </label>
                <input
                  type="text"
                  name="eventRole"
                  value={eventData.eventRole}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Attendee, Speaker, Organizer"
                  required
                />
              </div>

              {/* Event Date */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} />
                  Event Date *
                </label>
                <input
                  type="date"
                  name="eventDate"
                  value={eventData.eventDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Event Held Organization */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organizing Company/Institution *
                </label>
                <input
                  type="text"
                  name="eventHeldOrganization"
                  value={eventData.eventHeldOrganization}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Organization hosting the event"
                  required
                />
              </div>

              {/* Location */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <MapPin size={16} />
                  Location *
                </label>
                <input
                  type="text"
                  name="eventLocation"
                  value={eventData.eventLocation}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Event venue or location"
                  required
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <Save size={20} />
                {loading ? "Saving..." : "Save Event Details"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetails;
