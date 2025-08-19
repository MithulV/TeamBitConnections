import React, { useState, useEffect } from 'react';
import { RotateCcw, Save, Plus } from 'lucide-react';

function DetailsInput({ onBack, onSave, initialData = null, isAddMode = false }) {
  const [formData, setFormData] = useState({
    // Personal Details
    name: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    maritalStatus: '',
    category: '',
    age: '',

    // Contact Information
    phonePrimary: '',
    phoneSecondary: '',
    emailPrimary: '',
    emailSecondary: '',

    // Emergency Contact
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',

    // Address Details
    street: '',
    city: '',
    state: '',
    country: '',
    zipcode: '',

    // Education
    pgCourseName: '',
    pgCollege: '',
    pgUniversity: '',
    pgFromDate: '',
    pgToDate: '',
    ugCourseName: '',
    ugCollege: '',
    ugUniversity: '',
    ugFromDate: '',
    ugToDate: '',

    // Experience
    jobTitle: '',
    company: '',
    department: '',
    expFromDate: '',
    expToDate: '',
    expSkills: '',

    // Additional Information
    eventName: '',
    eventRole: '',
    eventDate: '',
    eventHeldOrganization: '',
    eventLocation: '',
    additionalNote: '',
    linkedinProfile: '',
  });

  useEffect(() => {
    if (isAddMode && initialData) {
      // Handle your specific data structure - pre-fill with existing data
      const nameParts = initialData.name ? initialData.name.split(' ') : ['', ''];
      
      setFormData({
        firstName: nameParts[0] || initialData.firstName || '',
        lastName: nameParts.slice(1).join(' ') || initialData.lastName || '',
        primaryPhone: initialData.phone || initialData.primaryPhone || '',
        primaryEmail: initialData.email || initialData.primaryEmail || '',
        jobTitle: initialData.role || initialData.jobTitle || '',
        company: initialData.org || initialData.eventOrg || initialData.company || '',
        city: initialData.location || initialData.city || '',
        notes: initialData.event ? `Event: ${initialData.event} on ${initialData.date}` : initialData.notes || '',
        category: initialData.category || 'Event Participant',
        source: initialData.source || 'Event Registration',
        
        // Map other existing fields or set defaults for additional details
        dateOfBirth: initialData.dateOfBirth || '',
        gender: initialData.gender || '',
        nationality: initialData.nationality || '',
        secondaryPhone: initialData.secondaryPhone || '',
        alternateEmail: initialData.alternateEmail || '',
        street: initialData.street || '',
        state: initialData.state || '',
        zipCode: initialData.zipCode || '',
        country: initialData.country || '',
        department: initialData.department || '',
        workExperience: initialData.workExperience || '',
        skills: initialData.skills || '',
        emergencyContactName: initialData.emergencyContactName || '',
        emergencyContactPhone: initialData.emergencyContactPhone || '',
        emergencyContactRelation: initialData.emergencyContactRelation || '',
        priority: initialData.priority || '',
        tags: initialData.tags || ''
      });
    }
  }, [isAddMode, initialData]);

  // Personal Details Fields
  const personalDetails = [
    { label: "Name*", type: "text", name: "name", placeholder: "Enter full name", value: formData.name },
    { label: "Date of Birth", type: "date", name: "dateOfBirth", value: formData.dateOfBirth },
    { label: "Gender", type: "select", name: "gender", value: formData.gender, options: ['', 'Male', 'Female', 'Other', 'Prefer not to say'] },
    { label: "Nationality", type: "text", name: "nationality", placeholder: "Enter nationality", value: formData.nationality },
    { label: "Marital Status", type: "select", name: "maritalStatus", value: formData.maritalStatus, options: ['', 'Single', 'Married', 'Divorced', 'Widowed'] },
    { label: "Category", type: "text", name: "category", placeholder: "Enter category", value: formData.category },
    { label: "Age", type: "number", name: "age", placeholder: "Enter age", value: formData.age },
  ];

  // Contact Information Fields
  const contactInfo = [
    { label: "Phone No (Primary)*", type: "tel", name: "phonePrimary", placeholder: "Enter primary phone number", value: formData.phonePrimary, inputMode: "numeric" },
    { label: "Phone No (Secondary)", type: "tel", name: "phoneSecondary", placeholder: "Enter secondary phone number", value: formData.phoneSecondary, inputMode: "numeric" },
    { label: "Email (Primary)*", type: "email", name: "emailPrimary", placeholder: "Enter primary email address", value: formData.emailPrimary },
    { label: "Email (Secondary)", type: "email", name: "emailSecondary", placeholder: "Enter secondary email address", value: formData.emailSecondary },
  ];

  // Emergency Contact Fields
  const emergencyContact = [
    { label: "Contact Name", type: "text", name: "emergencyContactName", placeholder: "Enter contact name", value: formData.emergencyContactName },
    { label: "Contact Phone", type: "tel", name: "emergencyContactPhone", placeholder: "Enter contact phone", value: formData.emergencyContactPhone, inputMode: "numeric" },
    { label: "Relationship", type: "text", name: "emergencyContactRelationship", placeholder: "Enter relationship", value: formData.emergencyContactRelationship },
  ];

  // Address Details Fields
  const addressDetails = [
    { label: "Street", type: "text", name: "street", placeholder: "Enter street", value: formData.street },
    { label: "City", type: "text", name: "city", placeholder: "Enter city", value: formData.city },
    { label: "State", type: "text", name: "state", placeholder: "Enter state", value: formData.state },
    { label: "Country", type: "text", name: "country", placeholder: "Enter country", value: formData.country },
    { label: "Zipcode", type: "text", name: "zipcode", placeholder: "Enter zipcode", value: formData.zipcode },
  ];

  // Education Fields
  const educationFields = [
    { label: "PG Course Name", type: "text", name: "pgCourseName", placeholder: "Enter PG course name", value: formData.pgCourseName },
    { label: "PG College", type: "text", name: "pgCollege", placeholder: "Enter PG college", value: formData.pgCollege },
    { label: "PG University", type: "text", name: "pgUniversity", placeholder: "Enter PG university", value: formData.pgUniversity },
    { label: "PG From Date", type: "date", name: "pgFromDate", value: formData.pgFromDate },
    { label: "PG To Date", type: "date", name: "pgToDate", value: formData.pgToDate },
    { label: "UG Course Name", type: "text", name: "ugCourseName", placeholder: "Enter UG course name", value: formData.ugCourseName },
    { label: "UG College", type: "text", name: "ugCollege", placeholder: "Enter UG college", value: formData.ugCollege },
    { label: "UG University", type: "text", name: "ugUniversity", placeholder: "Enter UG university", value: formData.ugUniversity },
    { label: "UG From Date", type: "date", name: "ugFromDate", value: formData.ugFromDate },
    { label: "UG To Date", type: "date", name: "ugToDate", value: formData.ugToDate },
  ];

  // Experience Fields
  const experienceFields = [
    { label: "Job Title", type: "text", name: "jobTitle", placeholder: "Enter job title", value: formData.jobTitle },
    { label: "Company", type: "text", name: "company", placeholder: "Enter company name", value: formData.company },
    { label: "Department", type: "text", name: "department", placeholder: "Enter department", value: formData.department },
    { label: "From Date", type: "date", name: "expFromDate", value: formData.expFromDate },
    { label: "To Date", type: "date", name: "expToDate", value: formData.expToDate },
    { label: "Skills", type: "textarea", name: "expSkills", placeholder: "Enter skills", value: formData.expSkills },
  ];

  // Additional Information Fields
  const additionalInfo = [
    { label: "Event Name", type: "text", name: "eventName", placeholder: "Enter event name", value: formData.eventName },
    { label: "Event Role", type: "text", name: "eventRole", placeholder: "Enter event role", value: formData.eventRole },
    { label: "Event Date", type: "date", name: "eventDate", value: formData.eventDate },
    { label: "Event Held Organization", type: "text", name: "eventHeldOrganization", placeholder: "Enter event held organization", value: formData.eventHeldOrganization },
    { label: "Event Location", type: "text", name: "eventLocation", placeholder: "Enter event location", value: formData.eventLocation },
    { label: "Additional Note/Logger", type: "textarea", name: "additionalNote", placeholder: "Enter additional note or logger", value: formData.additionalNote },
    { label: "LinkedIn Profile", type: "url", name: "linkedinProfile", placeholder: "Enter LinkedIn profile URL", value: formData.linkedinProfile },
  ];

  const handlePhoneKeyPress = (e) => {
    const char = String.fromCharCode(e.which);
    if (!/[0-9]/.test(char)) {
      e.preventDefault();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('Phone')) {
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
    console.log('Details form submitted:', formData);
    if (onSave) {
      onSave(formData);
      if (onBack) onBack(); // Always go back after adding details
    }
  };

  const handleReset = () => {
    if (isAddMode && initialData) {
      // Reset to original mapped data when adding mode
      const nameParts = initialData.name ? initialData.name.split(' ') : ['', ''];
      setFormData({
        firstName: nameParts[0] || initialData.firstName || '',
        lastName: nameParts.slice(1).join(' ') || initialData.lastName || '',
        primaryPhone: initialData.phone || initialData.primaryPhone || '',
        primaryEmail: initialData.email || initialData.primaryEmail || '',
        jobTitle: initialData.role || initialData.jobTitle || '',
        company: initialData.org || initialData.eventOrg || initialData.company || '',
        city: initialData.location || initialData.city || '',
        notes: initialData.event ? `Event: ${initialData.event} on ${initialData.date}` : initialData.notes || '',
        category: initialData.category || 'Event Participant',
        source: initialData.source || 'Event Registration',
        dateOfBirth: initialData.dateOfBirth || '',
        gender: initialData.gender || '',
        nationality: initialData.nationality || '',
        secondaryPhone: initialData.secondaryPhone || '',
        alternateEmail: initialData.alternateEmail || '',
        street: initialData.street || '',
        state: initialData.state || '',
        zipCode: initialData.zipCode || '',
        country: initialData.country || '',
        department: initialData.department || '',
        workExperience: initialData.workExperience || '',
        skills: initialData.skills || '',
        emergencyContactName: initialData.emergencyContactName || '',
        emergencyContactPhone: initialData.emergencyContactPhone || '',
        emergencyContactRelation: initialData.emergencyContactRelation || '',
        priority: initialData.priority || '',
        tags: initialData.tags || ''
      });
    } else {
      // Reset to completely empty form for new entries
      setFormData({
        firstName: '', lastName: '', dateOfBirth: '', gender: '', nationality: '',
        primaryPhone: '', secondaryPhone: '', primaryEmail: '', alternateEmail: '',
        street: '', city: '', state: '', zipCode: '', country: '',
        jobTitle: '', company: '', department: '', workExperience: '', skills: '',
        emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelation: '',
        notes: '', category: '', priority: '', source: '', tags: ''
      });
    }
  };

  const renderField = (field, index) => (
    <div key={index} className="space-y-2">
      <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
        {field.label}
      </label>
      {field.type === 'select' ? (
        <select
          id={field.name}
          name={field.name}
          value={field.value}
          onChange={handleInputChange}
          required={field.label.includes('*')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077b8] focus:border-transparent transition-colors"
        >
          {field.options.map((option, i) => (
            <option key={i} value={option}>{option}</option>
          ))}
        </select>
      ) : field.type === 'textarea' ? (
        <textarea
          id={field.name}
          name={field.name}
          value={field.value}
          placeholder={field.placeholder}
          onChange={handleInputChange}
          required={field.label.includes('*')}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077b8] focus:border-transparent transition-colors resize-vertical"
        />
      ) : (
        <input
          type={field.type}
          id={field.name}
          name={field.name}
          value={field.value}
          placeholder={field.placeholder}
          onKeyPress={field.name.includes('Phone') ? handlePhoneKeyPress : undefined}
          inputMode={field.inputMode}
          onChange={handleInputChange}
          required={field.label.includes('*')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077b8] focus:border-transparent transition-colors"
        />
      )}
    </div>
  );

  return (
    <div className="flex flex-row mx-auto pt-0 pb-2 bg-[#F0F0F0] min-h-full">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Add Additional Details
            </h2>
            <p className="text-gray-600">
              {isAddMode
                ? 'Add comprehensive details to this existing contact. Required fields are marked with an asterisk.'
                : 'Fill in the comprehensive details for the new contact. Required fields are marked with an asterisk.'
              }
            </p>
          </div>

          {/* Personal Details */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {personalDetails.map((field, index) => renderField(field, index))}
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contactInfo.map((field, index) => renderField(field, index))}
            </div>
          </div>

          {/* Address Details */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Address Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {addressDetails.map((field, index) => renderField(field, index))}
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {emergencyContact.map((field, index) => renderField(field, index))}
            </div>
          </div>

          {/* Education */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Education</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {educationFields.map((field, index) => renderField(field, index))}
            </div>
          </div>

          {/* Experience */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Experience</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {experienceFields.map((field, index) => renderField(field, index))}
            </div>
          </div>

          {/* Additional Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {additionalInfo.map((field, index) => renderField(field, index))}
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
              <Plus size={18} className="mt-0.5" />
              Add Details
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default DetailsInput;
