import React, { useState, useEffect } from 'react';
import { RotateCcw, Save, Plus } from 'lucide-react';

function DetailsInput({ onBack, onSave, initialData = null, isAddMode = false }) {
  const [formData, setFormData] = useState({
    // Personal Details
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    
    // Contact Information
    primaryPhone: '',
    secondaryPhone: '',
    primaryEmail: '',
    alternateEmail: '',
    
    // Address Details
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    
    // Professional Information
    jobTitle: '',
    company: '',
    department: '',
    workExperience: '',
    skills: '',
    
    // Emergency Contact
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    
    // Additional Information
    notes: '',
    category: '',
    priority: '',
    source: '',
    tags: ''
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
    {
      label: "First Name*",
      type: "text",
      name: "firstName",
      placeholder: "Enter first name",
      value: formData.firstName
    },
    {
      label: "Last Name*",
      type: "text",
      name: "lastName",
      placeholder: "Enter last name",
      value: formData.lastName
    },
    {
      label: "Date of Birth",
      type: "date",
      name: "dateOfBirth",
      placeholder: "",
      value: formData.dateOfBirth
    },
    {
      label: "Gender",
      type: "select",
      name: "gender",
      value: formData.gender,
      options: ['', 'Male', 'Female', 'Other', 'Prefer not to say']
    },
    {
      label: "Nationality",
      type: "text",
      name: "nationality",
      placeholder: "Enter nationality",
      value: formData.nationality
    }
  ];

  // Contact Information Fields
  const contactInfo = [
    {
      label: "Primary Phone*",
      type: "tel",
      name: "primaryPhone",
      placeholder: "Enter primary phone number",
      value: formData.primaryPhone,
      inputMode: "numeric"
    },
    {
      label: "Secondary Phone",
      type: "tel",
      name: "secondaryPhone",
      placeholder: "Enter secondary phone number",
      value: formData.secondaryPhone,
      inputMode: "numeric"
    },
    {
      label: "Primary Email*",
      type: "email",
      name: "primaryEmail",
      placeholder: "Enter primary email address",
      value: formData.primaryEmail
    },
    {
      label: "Alternate Email",
      type: "email",
      name: "alternateEmail",
      placeholder: "Enter alternate email address",
      value: formData.alternateEmail
    }
  ];

  // Address Details Fields
  const addressDetails = [
    {
      label: "Street Address",
      type: "text",
      name: "street",
      placeholder: "Enter street address",
      value: formData.street
    },
    {
      label: "City",
      type: "text",
      name: "city",
      placeholder: "Enter city",
      value: formData.city
    },
    {
      label: "State/Province",
      type: "text",
      name: "state",
      placeholder: "Enter state or province",
      value: formData.state
    },
    {
      label: "ZIP/Postal Code",
      type: "text",
      name: "zipCode",
      placeholder: "Enter ZIP or postal code",
      value: formData.zipCode
    },
    {
      label: "Country",
      type: "text",
      name: "country",
      placeholder: "Enter country",
      value: formData.country
    }
  ];

  // Professional Information Fields
  const professionalInfo = [
    {
      label: "Job Title",
      type: "text",
      name: "jobTitle",
      placeholder: "Enter job title",
      value: formData.jobTitle
    },
    {
      label: "Company",
      type: "text",
      name: "company",
      placeholder: "Enter company name",
      value: formData.company
    },
    {
      label: "Department",
      type: "text",
      name: "department",
      placeholder: "Enter department",
      value: formData.department
    },
    {
      label: "Work Experience (Years)",
      type: "number",
      name: "workExperience",
      placeholder: "Enter years of experience",
      value: formData.workExperience
    },
    {
      label: "Skills",
      type: "textarea",
      name: "skills",
      placeholder: "Enter relevant skills (comma separated)",
      value: formData.skills
    }
  ];

  // Emergency Contact Fields
  const emergencyContact = [
    {
      label: "Emergency Contact Name",
      type: "text",
      name: "emergencyContactName",
      placeholder: "Enter emergency contact name",
      value: formData.emergencyContactName
    },
    {
      label: "Emergency Contact Phone",
      type: "tel",
      name: "emergencyContactPhone",
      placeholder: "Enter emergency contact phone",
      value: formData.emergencyContactPhone,
      inputMode: "numeric"
    },
    {
      label: "Relationship",
      type: "select",
      name: "emergencyContactRelation",
      value: formData.emergencyContactRelation,
      options: ['', 'Spouse', 'Parent', 'Child', 'Sibling', 'Friend', 'Other']
    }
  ];

  // Additional Information Fields
  const additionalInfo = [
    {
      label: "Category",
      type: "select",
      name: "category",
      value: formData.category,
      options: ['', 'Client', 'Vendor', 'Employee', 'Partner', 'Event Participant', 'Other']
    },
    {
      label: "Priority Level",
      type: "select",
      name: "priority",
      value: formData.priority,
      options: ['', 'High', 'Medium', 'Low']
    },
    {
      label: "Source",
      type: "text",
      name: "source",
      placeholder: "How did you find this contact?",
      value: formData.source
    },
    {
      label: "Tags",
      type: "text",
      name: "tags",
      placeholder: "Enter tags (comma separated)",
      value: formData.tags
    },
    {
      label: "Additional Notes",
      type: "textarea",
      name: "notes",
      placeholder: "Enter any additional notes",
      value: formData.notes
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

          {/* Professional Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Professional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {professionalInfo.map((field, index) => renderField(field, index))}
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {emergencyContact.map((field, index) => renderField(field, index))}
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
