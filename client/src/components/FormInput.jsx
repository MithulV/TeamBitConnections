import React, { useState, useEffect } from 'react';
import { RotateCcw, UserPlus, Save, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/AuthStore';
import { useNavigate, useLocation } from 'react-router-dom'; // **NEW: Added useLocation**
import Header from '../components/Header';
import Alert from '../components/Alert';
import axios from 'axios';

function FormInput() { // **UPDATED: Removed props, now gets data from navigation**
  const { id } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation(); // **NEW: Hook to get navigation state**
  
  // **NEW: Extract contact data and edit mode from navigation state**
  const { contact: initialData = null, isEditMode = false } = location.state || {};

  const [alert, setAlert] = useState({
    isOpen: false,
    severity: "success",
    message: "",
  });

  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    email_address: '',
    created_by: id,
    events: [{
      event_id: '',
      event_name: '',
      event_role: '',
      event_date: '',
      event_held_organization: '',
      event_location: ''
    }]
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

  const handleSaveContact = async (formData) => {
    try {
      console.log(formData);
      let response;

      if (isEditMode) {
        response = await axios.put(`http://localhost:8000/api/update-contacts-and-events/${initialData.id}`, formData);
        showAlert("success", `Contact has been successfully updated.`);
      } else {
        response = await axios.post(`http://localhost:8000/api/create-contact`, formData);
        showAlert("success", `Contact has been successfully added.`);
      }

      console.log(response);

      setTimeout(() => {
        handleBack();
      }, 2000);
    } catch (error) {
      console.log("Error saving contact:", error);
      showAlert("error", `Failed to ${isEditMode ? 'update' : 'add'} contact.`);
    }
  };

  const handleBack = () => {
    navigate(-1); // **UPDATED: Always navigate back instead of conditional logic**
  };

  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        name: initialData.name || '',
        phone_number: initialData.phoneNumber || '',
        created_by: id,
        email_address: initialData.emailAddress || '',
        events: initialData.events && initialData.events.length > 0 ? initialData.events.map(event => ({
          event_id: event.eventId || '',
          event_name: event.eventName || '',
          event_role: event.eventRole || '',
          event_date: event.eventDate || '',
          event_held_organization: event.eventHeldOrganization || '',
          event_location: event.eventLocation || ''
        })) : [{
          event_id: '',
          event_name: '',
          event_role: '',
          event_date: '',
          event_held_organization: '',
          event_location: ''
        }]
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        events: [{
          ...prev.events[0],
          event_date: today
        }]
      }));
    }
  }, [isEditMode, initialData]);

  const handlePhoneKeyPress = (e) => {
    const char = String.fromCharCode(e.which);
    if (!/[0-9]/.test(char)) {
      e.preventDefault();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const eventFields = ["event_name", "event_role", "event_date", "event_held_organization", "event_location"];

    if (eventFields.includes(name)) {
      setFormData(prev => ({
        ...prev,
        events: [{
          ...prev.events[0],
          [name]: value
        }]
      }));
    } else {
      if (name === 'phone_number') {
        const numbersOnly = value.replace(/[^0-9]/g, '');
        setFormData(prev => ({
          ...prev,
          [name]: numbersOnly
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    handleSaveContact(formData);
  };

  const handleReset = () => {
    if (isEditMode && initialData) {
      setFormData({
        name: initialData.name || '',
        phone_number: initialData.phoneNumber || '',
        email_address: initialData.emailAddress || '',
        created_by: id,
        events: initialData.events && initialData.events.length > 0 ? initialData.events.map(event => ({
          event_id: event.eventId || '',
          event_name: event.eventName || '',
          event_role: event.eventRole || '',
          event_date: event.eventDate || '',
          event_held_organization: event.eventHeldOrganization || '',
          event_location: event.eventLocation || ''
        })) : [{
          event_id: '',
          event_name: '',
          event_role: '',
          event_date: '',
          event_held_organization: '',
          event_location: ''
        }]
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        name: '',
        phone_number: '',
        email_address: '',
        created_by: id,
        events: [{
          event_name: '',
          event_role: '',
          event_date: today,
          event_held_organization: '',
          event_location: ''
        }]
      });
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      <Alert
        isOpen={alert.isOpen}
        severity={alert.severity}
        message={alert.message}
        onClose={closeAlert}
        position="bottom"
        duration={4000}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Back Button */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="px-4 py-2 ml-5 flex items-center gap-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
              >
                <ArrowLeft size={20} />
                Back
              </button>
            </div>
            <Header />
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-hidden bg-white">
          <div className="h-full flex flex-col p-8">
            {/* Form Header */}
            <div className="flex-shrink-0 mb-8">
              <h1 className="text-3xl font-semibold text-gray-900 mb-3">
                {isEditMode ? 'Edit Contact Information' : 'Contact Information'}
              </h1>
              <p className="text-gray-600">
                {isEditMode
                  ? 'Update the details for this contact. Required fields are marked with an asterisk.'
                  : 'Fill in the details for the new contact. Required fields are marked with an asterisk.'
                }
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
              {/* Main Layout: Basic Info | Divider | Event Info */}
              <div className="flex-1 flex gap-8">

                {/* Left Section - Basic Information */}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Name Field */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Name*
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        placeholder="Enter full name"
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Phone Number Field */}
                    <div>
                      <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number*
                      </label>
                      <input
                        type="tel"
                        id="phone_number"
                        name="phone_number"
                        value={formData.phone_number}
                        placeholder="Enter phone number"
                        onKeyPress={handlePhoneKeyPress}
                        inputMode="numeric"
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Email Field - Spans both columns */}
                    <div className="col-span-2">
                      <label htmlFor="email_address" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address*
                      </label>
                      <input
                        type="email"
                        id="email_address"
                        name="email_address"
                        value={formData.email_address}
                        placeholder="Enter email address"
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Vertical Divider */}
                <div className="w-px bg-gray-200"></div>

                {/* Right Section - Event & Role Information */}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Event & Role Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Event Name */}
                    <div>
                      <label htmlFor="event_name" className="block text-sm font-medium text-gray-700 mb-2">
                        Event Name*
                      </label>
                      <input
                        type="text"
                        id="event_name"
                        name="event_name"
                        value={formData.events[0].event_name}
                        placeholder="Enter event name"
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Event Role */}
                    <div>
                      <label htmlFor="event_role" className="block text-sm font-medium text-gray-700 mb-2">
                        Event Role*
                      </label>
                      <input
                        type="text"
                        id="event_role"
                        name="event_role"
                        value={formData.events[0].event_role}
                        placeholder="Enter your role"
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Event Date */}
                    <div>
                      <label htmlFor="event_date" className="block text-sm font-medium text-gray-700 mb-2">
                        Event Date*
                      </label>
                      <input
                        type="date"
                        id="event_date"
                        name="event_date"
                        value={formData.events[0].event_date}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Event Organization */}
                    <div>
                      <label htmlFor="event_held_organization" className="block text-sm font-medium text-gray-700 mb-2">
                        Event held Organization*
                      </label>
                      <input
                        type="text"
                        id="event_held_organization"
                        name="event_held_organization"
                        value={formData.events[0].event_held_organization}
                        placeholder="Enter organization name"
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Event Location - Spans both columns */}
                    <div className="col-span-2">
                      <label htmlFor="event_location" className="block text-sm font-medium text-gray-700 mb-2">
                        Event Location*
                      </label>
                      <input
                        type="text"
                        id="event_location"
                        name="event_location"
                        value={formData.events[0].event_location}
                        placeholder="Enter event location"
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Fixed at Bottom */}
              <div className="flex-shrink-0 flex justify-end gap-3 pt-8 border-t border-gray-200 mt-8">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 bg-white text-gray-700 font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <RotateCcw size={16} />
                  Reset Form
                </button>
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-6 py-3 border border-gray-300 bg-white text-gray-700 font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {isEditMode ? <Save size={16} /> : <UserPlus size={16} />}
                  {isEditMode ? 'Update Contact' : 'Save Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FormInput;
