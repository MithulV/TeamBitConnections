import React, { useState, useEffect } from 'react';
import { RotateCcw, UserPlus, Save } from 'lucide-react';
import { useAuthStore } from '../store/AuthStore';

function FormInput({ onBack, onSave, initialData = null, isEditMode = false }) {
  console.log(initialData)
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    emailAddress: '',
    events: [{
      eventName: '',
      eventRole: '',
      eventDate: '',
      eventHeldOrganization: '',
      eventLocation: ''
    }]
  });

  useEffect(() => {
    if (isEditMode && initialData) {
      // Pre-fill form with existing data
      setFormData({
        name: initialData.name || '',
        phoneNumber: initialData.phoneNumber || '',
        emailAddress: initialData.emailAddress || '',
        events: initialData.events && initialData.events.length > 0 ? initialData.events.map(event => ({
          eventName: event.eventName || '',
          eventRole: event.eventRole || '',
          eventDate: event.eventDate || '',
          eventHeldOrganization: event.eventHeldOrganization || '',
          eventLocation: event.eventLocation || ''
        })) : [{
          eventName: '',
          eventRole: '',
          eventDate: '',
          eventHeldOrganization: '',
          eventLocation: ''
        }]
      });
    } else {
      // Set today's date for new entries
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        events: [{
          ...prev.events[0],
          eventDate: today
        }]
      }));
    }
  }, [isEditMode, initialData]);

  const basicInfo = [
    {
      label: "Name*",
      type: "text",
      name: "name",
      placeholder: "Enter full name",
      value: formData.name
    },
    {
      label: "Phone Number*",
      type: "tel",
      name: "phoneNumber",
      placeholder: "Enter phone number",
      value: formData.phoneNumber,
      inputMode: "numeric"
    },
    {
      label: "Email Address",
      type: "email",
      name: "emailAddress",
      placeholder: "Enter email address",
      value: formData.emailAddress
    },
  ];

  const eventNRole = [
    {
      label: "Event Name*",
      type: "text",
      name: "eventName",
      placeholder: "Enter event name",
      value: formData.events[0].eventName
    },
    {
      label: "Event Role*",
      type: "text",
      name: "eventRole",
      placeholder: "Enter your role",
      value: formData.events[0].eventRole
    },
    {
      label: "Event Date*",
      type: "date",
      name: "eventDate",
      placeholder: "",
      value: formData.events[0].eventDate
    },
    {
      label: "Event held Organization",
      type: "text",
      name: "eventHeldOrganization",
      placeholder: "Enter organization name",
      value: formData.events[0].eventHeldOrganization
    },
    {
      label: "Event Location",
      type: "text",
      name: "eventLocation",
      placeholder: "Enter event location",
      value: formData.events[0].eventLocation
    }
  ];

  const handlePhoneKeyPress = (e) => {
    const char = String.fromCharCode(e.which);
    if (!/[0-9]/.test(char)) {
      e.preventDefault();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const eventFields = ["eventName", "eventRole", "eventDate", "eventHeldOrganization", "eventLocation"];

    if (eventFields.includes(name)) {
      setFormData(prev => ({
        ...prev,
        events: [{
          ...prev.events[0],
          [name]: value
        }]
      }));
    } else {
      if (name === 'phoneNumber') {
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
    if (isEditMode && onSave) {
      // Edit mode - call onSave to update existing contact
      onSave(formData);
    } else if (onSave) {
      // Create mode - call onSave to create new contact
      onSave(formData);
      // Optionally call onBack after saving
      if (onBack) onBack();
    } else if (onBack) {
      // Fallback - just go back without saving
      onBack();
    }
  };

  const handleReset = () => {
    if (isEditMode && initialData) {
      // Reset to original data when editing
      setFormData({
        name: initialData.name || '',
        phoneNumber: initialData.phoneNumber || '',
        emailAddress: initialData.emailAddress || '',
        events: initialData.events && initialData.events.length > 0 ? initialData.events.map(event => ({
          eventName: event.eventName || '',
          eventRole: event.eventRole || '',
          eventDate: event.eventDate || '',
          eventHeldOrganization: event.eventHeldOrganization || '',
          eventLocation: event.eventLocation || ''
        })) : [{
          eventName: '',
          eventRole: '',
          eventDate: '',
          eventHeldOrganization: '',
          eventLocation: ''
        }]
      });
    } else {
      // Reset to empty form with today's date when creating new
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        name: '',
        phoneNumber: '',
        emailAddress: '',
        events: [{
          eventName: '',
          eventRole: '',
          eventDate: today,
          eventHeldOrganization: '',
          eventLocation: ''
        }]
      });
    }
  };

  return (
    <div className="flex flex-row mx-auto pt-0 pb-2 bg-[#F0F0F0] min-h-full">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="bg-white p-6 rounded-lg bordershadow-sm">

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              {isEditMode ? 'Edit Contact Information' : 'Contact Information'}
            </h2>
            <p className="text-gray-600">
              {isEditMode
                ? 'Update the details for this contact. Required fields are marked with an asterisk.'
                : 'Fill in the details for the new contact. Required fields are marked with an asterisk.'
              }
            </p>
          </div>

          {/* Side-by-side sections */}
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            {/* Basic Info */}
            <div className="flex-1 bg-white p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {basicInfo.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <label htmlFor={item.name} className="block text-sm font-medium text-gray-700">
                      {item.label}
                    </label>
                    <input
                      type={item.type}
                      id={item.name}
                      name={item.name}
                      value={item.value}
                      placeholder={item.placeholder}
                      onKeyPress={item.name === 'phoneNumber' ? handlePhoneKeyPress : undefined}
                      inputMode={item.inputMode}
                      onChange={handleInputChange}
                      required={item.label.includes('*')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077b8] focus:border-transparent transition-colors"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden md:block w-px bg-gray-200 mx-2" />

            {/* Event & Role Info */}
            <div className="flex-1 bg-white p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Event & Role Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {eventNRole.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <label htmlFor={item.name} className="block text-sm font-medium text-gray-700">
                      {item.label}
                    </label>
                    <input
                      type={item.type}
                      id={item.name}
                      name={item.name}
                      value={item.value}
                      placeholder={item.placeholder}
                      onChange={handleInputChange}
                      required={item.label.includes('*')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077b8] focus:border-transparent transition-colors"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col pt-4 sm:flex-row gap-4 justify-end">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2 flex gap-x-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 font-medium"
            >
              <RotateCcw size={18} className="mt-1" />
              Reset Form
            </button>
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-2 flex gap-x-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 flex gap-x-1.5 bg-[#0077b8] hover:bg-[#005f8f] text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#0077b8] font-medium"
            >
              {isEditMode ? <Save size={18} className="mt-0.5" /> : <UserPlus size={18} className="mt-0.5" />}
              {isEditMode ? 'Update Contact' : 'Save Contact'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default FormInput;