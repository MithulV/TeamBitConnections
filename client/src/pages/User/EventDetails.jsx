import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Calendar,
  MapPin,
  Camera,
  FileText,
  X,
} from "lucide-react";
import Header from "../../components/Header/Header";
import Alert from "../../components/Alert/Alert";
import api from "../../utils/axios";
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

  // State for event autocomplete
  const [eventSuggestions, setEventSuggestions] = useState([]);
  const [showEventSuggestions, setShowEventSuggestions] = useState(false);
  const [activeEventField, setActiveEventField] = useState("");

  // Click outside handler to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.autocomplete-container')) {
        setShowEventSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  // Event autocomplete helper functions
  const getRecentEvents = () => {
    try {
      const stored = localStorage.getItem(`recent-events-${id}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading recent events:", error);
      return [];
    }
  };

  const saveRecentEvent = (eventData) => {
    try {
      const existing = getRecentEvents();
      
      // Create a unique key for each event based on all fields
      const eventKey = `${eventData.eventName}-${eventData.eventHeldOrganization}-${eventData.eventLocation}`;
      
      // Remove if already exists to avoid duplicates
      const filtered = existing.filter(event => {
        const existingKey = `${event.eventName}-${event.eventHeldOrganization}-${event.eventLocation}`;
        return existingKey !== eventKey;
      });
      
      // Convert to the format we used in FormInput (with underscores for consistency)
      const eventToStore = {
        event_name: eventData.eventName,
        event_role: eventData.eventRole,
        event_date: eventData.eventDate,
        event_held_organization: eventData.eventHeldOrganization,
        event_location: eventData.eventLocation,
      };
      
      // Add to beginning of array
      const updated = [eventToStore, ...filtered].slice(0, 10); // Keep only 10 most recent
      
      localStorage.setItem(`recent-events-${id}`, JSON.stringify(updated));
    } catch (error) {
      console.error("Error saving recent event:", error);
    }
  };

  const getEventSuggestions = (query, fieldName) => {
    const recentEvents = getRecentEvents();
    
    if (!query || query.length < 1) return [];
    
    // Map camelCase field names to underscore format for consistency
    const fieldMap = {
      eventName: 'event_name',
      eventHeldOrganization: 'event_held_organization',
      eventLocation: 'event_location'
    };
    
    const mappedFieldName = fieldMap[fieldName] || fieldName;
    
    return recentEvents
      .filter(event => {
        const fieldValue = event[mappedFieldName];
        return fieldValue && fieldValue.toLowerCase().includes(query.toLowerCase());
      })
      .map(event => ({
        ...event,
        matchedField: mappedFieldName
      }))
      .slice(0, 5); // Show max 5 suggestions
  };

  // Close event suggestions dropdown
  const closeEventSuggestions = () => {
    setShowEventSuggestions(false);
    setEventSuggestions([]);
  };

  // On selecting an event suggestion, fill all event fields from that event
  const handleSelectEventSuggestion = (eventData) => {
    setEventData({
      eventName: eventData.event_name,
      eventRole: eventData.event_role || "",
      eventDate: eventData.event_date || "",
      eventHeldOrganization: eventData.event_held_organization,
      eventLocation: eventData.event_location,
    });
    setShowEventSuggestions(false);
    setEventSuggestions([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Handle event field autocomplete
    const eventAutocompleteFields = ["eventName", "eventHeldOrganization", "eventLocation"];
    if (eventAutocompleteFields.includes(name) && value.trim().length > 0) {
      const suggestions = getEventSuggestions(value, name);
      setEventSuggestions(suggestions);
      setActiveEventField(name);
      setShowEventSuggestions(suggestions.length > 0);
    } else if (eventAutocompleteFields.includes(name)) {
      setEventSuggestions([]);
      setShowEventSuggestions(false);
    }
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

      const res = await api.post(
        "/api/upload-contact",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("Event save success:", res.data);
      showAlert("success", "Event details have been successfully saved.");

      // Save event to recent events for future autocomplete
      if (eventData.eventName && eventData.eventHeldOrganization && eventData.eventLocation) {
        saveRecentEvent(eventData);
      }

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

  // Event suggestion item component
  const EventSuggestionItem = ({ event, onSelect }) => (
    <li
      onClick={() => onSelect(event)}
      className="cursor-pointer px-4 py-3 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200 border-b border-gray-100 last:border-b-0"
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">E</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {event.event_name}
          </p>
          <div className="flex flex-col space-y-1 mt-1">
            <p className="text-xs text-gray-600 truncate">
              📍 {event.event_location}
            </p>
            <p className="text-xs text-gray-600 truncate">
              🏢 {event.event_held_organization}
            </p>
            {event.event_date && (
              <p className="text-xs text-gray-500">
                📅 {new Date(event.event_date).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
            Recent
          </div>
        </div>
      </div>
    </li>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full bg-white shadow-sm sticky top-0 z-50 border-b-2 border-b-gray-50">
        <div className="flex justify-end">
          <Header />
        </div>
      </div>
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
              <div className="md:col-span-2 relative autocomplete-container">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Name *
                </label>
                <input
                  type="text"
                  name="eventName"
                  value={eventData.eventName}
                  onChange={handleInputChange}
                  autoComplete="off"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Tech Conference 2024"
                  required
                />
                {showEventSuggestions &&
                  activeEventField === "eventName" &&
                  eventSuggestions.length > 0 && (
                    <div className="absolute z-20 w-full bg-white border border-gray-200 rounded-xl mt-1 shadow-2xl overflow-hidden max-h-80">
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                        <p className="text-xs font-medium text-gray-600">
                          Recent events ({eventSuggestions.length} found)
                        </p>
                        <button
                          type="button"
                          onClick={closeEventSuggestions}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title="Close suggestions"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <ul className="max-h-64 overflow-auto">
                        {eventSuggestions.map((event, index) => (
                          <EventSuggestionItem
                            key={index}
                            event={event}
                            onSelect={handleSelectEventSuggestion}
                          />
                        ))}
                      </ul>
                    </div>
                  )}
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
              <div className="relative autocomplete-container">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organizing Company/Institution *
                </label>
                <input
                  type="text"
                  name="eventHeldOrganization"
                  value={eventData.eventHeldOrganization}
                  onChange={handleInputChange}
                  autoComplete="off"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Organization hosting the event"
                  required
                />
                {showEventSuggestions &&
                  activeEventField === "eventHeldOrganization" &&
                  eventSuggestions.length > 0 && (
                    <div className="absolute z-20 w-full bg-white border border-gray-200 rounded-xl mt-1 shadow-2xl overflow-hidden max-h-80">
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                        <p className="text-xs font-medium text-gray-600">
                          Recent organizations ({eventSuggestions.length} found)
                        </p>
                        <button
                          type="button"
                          onClick={closeEventSuggestions}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title="Close suggestions"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <ul className="max-h-64 overflow-auto">
                        {eventSuggestions.map((event, index) => (
                          <EventSuggestionItem
                            key={index}
                            event={event}
                            onSelect={handleSelectEventSuggestion}
                          />
                        ))}
                      </ul>
                    </div>
                  )}
              </div>

              {/* Location */}
              <div className="md:col-span-2 relative autocomplete-container">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <MapPin size={16} />
                  Location *
                </label>
                <input
                  type="text"
                  name="eventLocation"
                  value={eventData.eventLocation}
                  onChange={handleInputChange}
                  autoComplete="off"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Event venue or location"
                  required
                />
                {showEventSuggestions &&
                  activeEventField === "eventLocation" &&
                  eventSuggestions.length > 0 && (
                    <div className="absolute z-20 w-full bg-white border border-gray-200 rounded-xl mt-1 shadow-2xl overflow-hidden max-h-80">
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                        <p className="text-xs font-medium text-gray-600">
                          Recent locations ({eventSuggestions.length} found)
                        </p>
                        <button
                          type="button"
                          onClick={closeEventSuggestions}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title="Close suggestions"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <ul className="max-h-64 overflow-auto">
                        {eventSuggestions.map((event, index) => (
                          <EventSuggestionItem
                            key={index}
                            event={event}
                            onSelect={handleSelectEventSuggestion}
                          />
                        ))}
                      </ul>
                    </div>
                  )}
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
