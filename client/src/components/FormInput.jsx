import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, UserPlus, Save, ArrowLeft, User, Mail, Phone, Plus } from 'lucide-react';
import { useAuthStore } from '../store/AuthStore';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Alert from '../components/Alert';
import axios from 'axios';

function FormInput() {
  const { id } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract contact data and edit mode from navigation state
  const { contact: initialData = null, isEditMode = false } = location.state || {};

  // State for alert messages
  const [alert, setAlert] = useState({
    isOpen: false,
    severity: "success",
    message: "",
  });

  // State for form data
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

  // State for autocomplete suggestions and selected contact
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false);
  const [showPhoneSuggestions, setShowPhoneSuggestions] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [activeField, setActiveField] = useState('');
  const debounceTimeout = useRef(null);

  // Alert helper functions
  const showAlert = (severity, message) => {
    setAlert({
      isOpen: true,
      severity,
      message,
    });
  };

  const closeAlert = () => {
    setAlert(prev => ({
      ...prev,
      isOpen: false,
    }));
  };

  // Decide if form is in "fixed" mode (existing contact selected)
  const isFixed = !!selectedContact;

  // Handle saving contact (create, update, or add event to existing)
  const handleSaveContact = async (formData) => {
    try {
      let response;
      
      if (isEditMode && initialData) {
        // We are in edit mode - updating existing contact and event
        const eventToUpdate = {
          ...formData,
          events: formData.events.map(event => ({
            ...event,
            event_id: event.event_id || initialData.events[0]?.eventId || initialData.events[0]?.event_id // Ensure event_id is included
          }))
        };
        
        response = await axios.put(
          `http://localhost:8000/api/update-contacts-and-events/${initialData.id || initialData.contact_id}/${id}`, 
          eventToUpdate
        );
        showAlert("success", `Contact and event have been successfully updated.`);
        
      } else if (selectedContact) {
        // Check if this is just adding an event to existing contact or updating contact info
        const contactChanged = 
          selectedContact.name !== formData.name ||
          selectedContact.email_address !== formData.email_address ||
          selectedContact.phone_number !== formData.phone_number;

        if (contactChanged) {
          // Contact info changed, update the contact
          response = await axios.put(`http://localhost:8000/api/update-contacts-and-events/${selectedContact.contact_id}/${id}`, formData);
          showAlert("success", `Contact has been successfully updated.`);
        } else {
          // Contact info unchanged, just add new event
          const eventData = {
            eventName: formData.events[0].event_name,
            eventRole: formData.events[0].event_role,
            eventDate: formData.events[0].event_date,
            eventHeldOrganization: formData.events[0].event_held_organization,
            eventLocation: formData.events[0].event_location,
            verified: false
          };
          
          response = await axios.post(`http://localhost:8000/api/add-event-existing-contact/${selectedContact.contact_id}/${id}`, eventData);
          showAlert("success", `New event added to existing contact successfully!`);
        }
      } else {
        // Create new contact
        response = await axios.post(`http://localhost:8000/api/create-contact`, formData);
        showAlert("success", `Contact has been successfully added.`);
      }
      
      setTimeout(() => {
        handleBack();
      }, 2000);
    } catch (error) {
      console.error("Save contact error:", error);
      if (isEditMode) {
        showAlert("error", `Failed to update contact and event.`);
      } else if (selectedContact) {
        showAlert("error", `Failed to ${formData.name !== selectedContact.name || formData.email_address !== selectedContact.email_address || formData.phone_number !== selectedContact.phone_number ? 'update contact' : 'add event to contact'}.`);
      } else {
        showAlert("error", `Failed to add contact.`);
      }
    }
  };

  // Go back navigation
  const handleBack = () => {
    navigate(-1);
  };

  // On component mount or edit mode/data change, fill form data and set selectedContact if editing
  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        name: initialData.name || '',
        phone_number: initialData.phoneNumber || '',
        email_address: initialData.emailAddress || '',
        created_by: id,
        events: initialData.events && initialData.events.length > 0 ? initialData.events.map(event => ({
          event_id: event.eventId || event.event_id || '', // Handle both possible field names
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
      // Don't set selectedContact in edit mode - this is different from selecting existing contact
      setSelectedContact(null);
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        events: [{
          ...prev.events[0],
          event_date: today
        }]
      }));
      setSelectedContact(null);
    }
    setSuggestions([]);
    setShowSuggestions(false);
    setShowEmailSuggestions(false);
    setShowPhoneSuggestions(false);
  }, [isEditMode, initialData, id]);

  // Allow only digits for phone input
  const handlePhoneKeyPress = (e) => {
    const char = String.fromCharCode(e.which);
    if (!/[0-9]/.test(char)) {
      e.preventDefault();
    }
  };

  // Hide all suggestion dropdowns
  const hideAllSuggestions = () => {
    setShowSuggestions(false);
    setShowEmailSuggestions(false);
    setShowPhoneSuggestions(false);
  };

  // Fetch suggestions from backend with debounce
  const fetchSuggestions = async (query, field) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/searchContacts?q=${encodeURIComponent(query)}`);
      setSuggestions(response.data.data);
      setActiveField(field);
      
      // Show appropriate dropdown
      hideAllSuggestions();
      if (field === 'name') {
        setShowSuggestions(true);
      } else if (field === 'email_address') {
        setShowEmailSuggestions(true);
      } else if (field === 'phone_number') {
        setShowPhoneSuggestions(true);
      }
    } catch {
      setSuggestions([]);
      hideAllSuggestions();
    }
  };

  // Handle form input changes, reset selected contact on user edit
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
        if (selectedContact && selectedContact.phone_number !== numbersOnly) {
          // Don't clear selectedContact, just mark that contact info changed
        }
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
        if (['name', 'email_address'].includes(name) && selectedContact) {
          // Don't clear selectedContact, just mark that contact info changed
        }
      }

      if (['name', 'email_address', 'phone_number'].includes(name)) {
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        if (value.trim().length === 0) {
          setSuggestions([]);
          hideAllSuggestions();
          if (selectedContact) setSelectedContact(null);
          return;
        }
        debounceTimeout.current = setTimeout(() => {
          fetchSuggestions(value, name);
        }, 300);
      }
    }
  };

  // On selecting a suggestion, fill form fields and store selected contact
  const handleSelectSuggestion = (contact) => {
    setFormData(prev => ({
      ...prev,
      name: contact.name,
      email_address: contact.email_address,
      phone_number: contact.phone_number,
      contact_id: contact.contact_id,
      events: prev.events
    }));
    setSelectedContact(contact);
    hideAllSuggestions();
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    handleSaveContact(formData);
  };

  // Reset form to initial or empty values and clear selected contact
  const handleReset = () => {
    if (isEditMode && initialData) {
      setFormData({
        name: initialData.name || '',
        phone_number: initialData.phoneNumber || '',
        email_address: initialData.emailAddress || '',
        created_by: id,
        events: initialData.events && initialData.events.length > 0 ? initialData.events.map(event => ({
          event_id: event.eventId || event.event_id || '',
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
      setSelectedContact(null);
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
      setSelectedContact(null);
    }
    setSuggestions([]);
    hideAllSuggestions();
  };

  // Check if contact info has changed from selected contact
  const contactInfoChanged = selectedContact && (
    selectedContact.name !== formData.name ||
    selectedContact.email_address !== formData.email_address ||
    selectedContact.phone_number !== formData.phone_number
  );

  // Enhanced suggestion item component
  const SuggestionItem = ({ contact, onSelect }) => (
    <li
      onClick={() => onSelect(contact)}
      className="cursor-pointer px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 border-b border-gray-100 last:border-b-0"
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{contact.name}</p>
          <div className="flex items-center space-x-4 mt-1">
            <div className="flex items-center space-x-1">
              <Mail className="w-3 h-3 text-gray-400" />
              <p className="text-xs text-gray-600 truncate">{contact.email_address}</p>
            </div>
            <div className="flex items-center space-x-1">
              <Phone className="w-3 h-3 text-gray-400" />
              <p className="text-xs text-gray-600">{contact.phone_number}</p>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
        </div>
      </div>
    </li>
  );

  // Get button text and icon based on current state
  const getButtonConfig = () => {
    if (isEditMode) {
      return { text: 'Update Contact', icon: Save, color: 'blue' };
    }
    if (selectedContact) {
      if (contactInfoChanged) {
        return { text: 'Update Contact', icon: Save, color: 'orange' };
      } else {
        return { text: 'Add Event', icon: Plus, color: 'green' };
      }
    }
    return { text: 'Save Contact', icon: UserPlus, color: 'blue' };
  };

  const buttonConfig = getButtonConfig();

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

      <div className="flex-1 flex flex-col overflow-hidden">
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

        <div className="flex-1 overflow-hidden">
          <div
            className={`h-full flex flex-col p-8 rounded-lg transition-all duration-300 relative
              ${isFixed ? 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-400 shadow-xl' : 'bg-white border border-gray-200 shadow-sm'}`}
          >
            {isFixed && (
              <div className="absolute top-4 right-4 flex gap-2">
                <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                  Existing Contact
                </div>
                {contactInfoChanged && (
                  <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                    Info Modified
                  </div>
                )}
              </div>
            )}
            
            <div className="flex-shrink-0 mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {isEditMode 
                  ? 'Edit Contact Information'
                  : isFixed 
                    ? (contactInfoChanged ? 'Update Contact Information' : 'Add Event to Contact')
                    : 'Contact Information'
                }
              </h1>
              <p className="text-gray-600">
                {isEditMode
                  ? 'Update the details for this contact. Required fields are marked with an asterisk.'
                  : isFixed
                    ? (contactInfoChanged 
                        ? 'You are updating an existing contact\'s information.'
                        : 'You are adding a new event to an existing contact.')
                    : 'Fill in the details for the new contact. Required fields are marked with an asterisk.'
                }
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
              <div className="flex-1 flex gap-8">

                {/* Left Section - Basic Information */}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-2 gap-6">

                    {/* Name Field with autocomplete */}
                    <div className="relative">
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
                        autoComplete="off"
                        onFocus={() => { if (suggestions.length && activeField === 'name') setShowSuggestions(true); }}
                        required
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm
                          ${isFixed ? 'border-blue-400 focus:ring-blue-500 bg-white' : 'border-gray-300 focus:ring-blue-500 hover:border-gray-400'}`}
                      />
                      {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute z-20 w-full bg-white border border-gray-200 rounded-xl mt-1 shadow-2xl overflow-hidden">
                          <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                            <p className="text-xs font-medium text-gray-600">Select existing contact</p>
                          </div>
                          <ul className="max-h-64 overflow-auto">
                            {suggestions.map(contact => (
                              <SuggestionItem
                                key={contact.contact_id}
                                contact={contact}
                                onSelect={handleSelectSuggestion}
                              />
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Phone Number Field */}
                    <div className="relative">
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
                        autoComplete="off"
                        onFocus={() => { if (suggestions.length && activeField === 'phone_number') setShowPhoneSuggestions(true); }}
                        required
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm
                          ${isFixed ? 'border-blue-400 focus:ring-blue-500 bg-white' : 'border-gray-300 focus:ring-blue-500 hover:border-gray-400'}`}
                      />
                      {showPhoneSuggestions && suggestions.length > 0 && (
                        <div className="absolute z-20 w-full bg-white border border-gray-200 rounded-xl mt-1 shadow-2xl overflow-hidden">
                          <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                            <p className="text-xs font-medium text-gray-600">Select existing contact</p>
                          </div>
                          <ul className="max-h-64 overflow-auto">
                            {suggestions.map(contact => (
                              <SuggestionItem
                                key={contact.contact_id}
                                contact={contact}
                                onSelect={handleSelectSuggestion}
                              />
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Email Address Field */}
                    <div className="col-span-2 relative">
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
                        autoComplete="off"
                        onFocus={() => { if (suggestions.length && activeField === 'email_address') setShowEmailSuggestions(true); }}
                        required
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm
                          ${isFixed ? 'border-blue-400 focus:ring-blue-500 bg-white' : 'border-gray-300 focus:ring-blue-500 hover:border-gray-400'}`}
                      />
                      {showEmailSuggestions && suggestions.length > 0 && (
                        <div className="absolute z-20 w-full bg-white border border-gray-200 rounded-xl mt-1 shadow-2xl overflow-hidden">
                          <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                            <p className="text-xs font-medium text-gray-600">Select existing contact</p>
                          </div>
                          <ul className="max-h-64 overflow-auto">
                            {suggestions.map(contact => (
                              <SuggestionItem
                                key={contact.contact_id}
                                contact={contact}
                                onSelect={handleSelectSuggestion}
                              />
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Vertical Divider */}
                <div className="w-px bg-gradient-to-b from-gray-200 via-gray-300 to-gray-200"></div>

                {/* Right Section - Event & Role Information */}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Event & Role Information</h3>
                  <div className="grid grid-cols-2 gap-6">

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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-all duration-200 shadow-sm"
                      />
                    </div>

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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-all duration-200 shadow-sm"
                      />
                    </div>

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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-all duration-200 shadow-sm"
                      />
                    </div>

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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-all duration-200 shadow-sm"
                      />
                    </div>

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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-all duration-200 shadow-sm"
                      />
                    </div>

                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex-shrink-0 flex justify-end gap-3 pt-8 border-t border-gray-200 mt-8">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 bg-white text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
                >
                  <RotateCcw size={16} />
                  Reset Form
                </button>
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-6 py-3 border border-gray-300 bg-white text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`inline-flex items-center gap-2 px-6 py-3 font-medium rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 shadow-lg
                    ${buttonConfig.color === 'green' 
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 focus:ring-green-500'
                      : buttonConfig.color === 'orange'
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 focus:ring-orange-500'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 focus:ring-blue-500'}`}
                >
                  <buttonConfig.icon size={16} />
                  {buttonConfig.text}
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
