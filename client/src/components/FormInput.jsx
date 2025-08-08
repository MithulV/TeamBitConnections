import React, { useState, useEffect } from 'react';
import { RotateCcw, UserPlus } from 'lucide-react';

function FormInput({ onBack }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    event: '',
    role: '',
    date: '',
    org: '',
    location: ''
  });

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({
      ...prev,
      date: today
    }));
  }, []);

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
      name: "phone",
      placeholder: "Enter phone number",
      value: formData.phone,
      inputMode: "numeric"
    },
    {
      label: "Email Address",
      type: "email",
      name: "email",
      placeholder: "Enter email address",
      value: formData.email
    },
  ];

  const eventNRole = [
    {
      label: "Event Name*",
      type: "text",
      name: "event",
      placeholder: "Enter event name",
      value: formData.event
    },
    {
      label: "Event Role*",
      type: "text",
      name: "role",
      placeholder: "Enter your role",
      value: formData.role
    },
    {
      label: "Event Date*",
      type: "date",
      name: "date",
      placeholder: "",
      value: formData.date
    },
    {
      label: "Organization",
      type: "text",
      name: "org",
      placeholder: "Enter organization name",
      value: formData.org
    },
    {
      label: "Event Location",
      type: "text",
      name: "location",
      placeholder: "Enter event location",
      value: formData.location
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
    if (name === 'phone') {
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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    if (onBack) onBack();
  };

  const handleReset = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      event: '',
      role: '',
      date: '',
      org: '',
      location: ''
    });
  };

  return (
    <div className="flex flex-row mx-auto pt-0 pb-2 bg-[#f9fafb] min-h-full">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="bg-white p-6 rounded-lg bordershadow-sm">

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Contact Information</h2>
            <p className="text-gray-600">Fill in the details for the new contact. Required fields are marked with an asterisk.</p>
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
                      onKeyPress={item.name === 'phone' ? handlePhoneKeyPress : undefined}
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
              type="submit"
              className="px-6 py-2 flex gap-x-1.5 bg-[#0077b8] hover:bg-[#005f8f] text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#0077b8] font-medium"
            >
              <UserPlus size={18} className="mt-0.5" />
              Save Contact
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default FormInput;
