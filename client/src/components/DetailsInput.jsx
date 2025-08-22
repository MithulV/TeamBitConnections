import React, { useState, useEffect } from 'react';
import { RotateCcw, Plus, Trash2 } from 'lucide-react';

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

    // NEW: General Skills
    skills: '',

    // Experience - An array
    experience: [
      { jobTitle: '', company: '', department: '', expFromDate: '', expToDate: '', expSkills: '' }
    ],

    // Additional Information (focused on events)
    eventName: '',
    eventRole: '',
    eventDate: '',
    eventHeldOrganization: '',
    eventLocation: '',
    linkedinProfile: '',

    // NEW: Logger for notes
    logger: '',
  });

  useEffect(() => {
    if (isAddMode && initialData) {
      // Helper to format date strings from ISO to YYYY-MM-DD
      const formatDate = (dateString) => {
        if (!dateString) return '';
        return dateString.split('T')[0];
      };

      // Safely access the first event, if it exists
      const firstEvent = initialData.events && initialData.events[0] ? initialData.events[0] : {};

      setFormData(prevData => ({
        ...prevData,

        // --- Personal Details ---
        name: initialData.name || '',
        dateOfBirth: formatDate(initialData.dob), // Format the date correctly
        gender: initialData.gender || '',
        nationality: initialData.nationality || '',
        maritalStatus: initialData.marital_status || '',
        category: initialData.category || 'Event Participant',
        age: '', // 'age' is not in the JSON, so it's initialized as empty

        // --- Contact Info ---
        phonePrimary: initialData.phone_number || '',
        phoneSecondary: initialData.secondary_phone_number || '',
        emailPrimary: initialData.email_address || '',
        emailSecondary: initialData.secondary_email || '',

        // --- Emergency Contact ---
        emergencyContactName: initialData.emergency_contact_name || '',
        emergencyContactPhone: initialData.emergency_contact_phone_number || '',
        emergencyContactRelationship: initialData.emergency_contact_relationship || '',

        // --- Address Details (from nested 'address' object) ---
        street: initialData.address?.street || '',
        city: initialData.address?.city || '',
        state: initialData.address?.state || '',
        country: initialData.address?.country || '',
        zipcode: initialData.address?.zipcode || '',

        // --- Education Fields (from nested 'education' object) ---
        pgCourseName: initialData.education?.pg_course_name || '',
        pgCollege: initialData.education?.pg_college || '',
        pgUniversity: initialData.education?.pg_university || '',
        pgFromDate: initialData.education?.pg_from_date || '',
        pgToDate: initialData.education?.pg_to_date || '',
        ugCourseName: initialData.education?.ug_course_name || '',
        ugCollege: initialData.education?.ug_college || '',
        ugUniversity: initialData.education?.ug_university || '',
        ugFromDate: initialData.education?.ug_from_date || '',
        ugToDate: initialData.education?.ug_to_date || '',

        // --- Professional and Additional Info ---
        skills: initialData.skills || '',
        linkedinProfile: initialData.linkedin_url || '',

        // --- Event Details (from the first item in the 'events' array) ---
        eventName: firstEvent.event_name || '',
        eventRole: firstEvent.event_role || '',
        eventDate: firstEvent.event_date || '',
        eventHeldOrganization: firstEvent.event_held_orgranization || '',
        eventLocation: firstEvent.event_location || '',

        // --- Experience History (from 'experiences' array) ---
        experience: Array.isArray(initialData.experiences) && initialData.experiences.length > 0
          ? initialData.experiences.map(exp => ({
            jobTitle: exp.job_title || '',
            company: exp.company || '',
            department: exp.department || '',
            expFromDate: exp.from_date || '',
            expToDate: exp.to_date || '',
            expSkills: '', // 'expSkills' is not in the source JSON
          }))
          : [{ jobTitle: '', company: '', department: '', expFromDate: '', expToDate: '', expSkills: '' }],
      }));
    }
  }, [isAddMode, initialData]);

  // --- Field Definitions (Grouped for clarity) ---

  const personalDetails = [
    { label: "Name*", type: "text", name: "name", placeholder: "Enter full name", value: formData.name },
    { label: "Date of Birth", type: "date", name: "dateOfBirth", value: formData.dateOfBirth },
    { label: "Gender", type: "select", name: "gender", value: formData.gender, options: ['', 'Male', 'Female', 'Other', 'Prefer not to say'] },
    { label: "Nationality", type: "text", name: "nationality", placeholder: "Enter nationality", value: formData.nationality },
    { label: "Marital Status", type: "select", name: "maritalStatus", value: formData.maritalStatus, options: ['', 'Single', 'Married', 'Divorced', 'Widowed'] },
    { label: "Category", type: "text", name: "category", placeholder: "Enter category", value: formData.category },
    { label: "Age", type: "number", name: "age", placeholder: "Enter age", value: formData.age },
  ];
  const contactInfo = [
    { label: "Phone No (Primary)*", type: "tel", name: "phonePrimary", placeholder: "Enter primary phone number", value: formData.phonePrimary, inputMode: "numeric" },
    { label: "Phone No (Secondary)", type: "tel", name: "phoneSecondary", placeholder: "Enter secondary phone number", value: formData.phoneSecondary, inputMode: "numeric" },
    { label: "Email (Primary)*", type: "email", name: "emailPrimary", placeholder: "Enter primary email address", value: formData.emailPrimary },
    { label: "Email (Secondary)", type: "email", name: "emailSecondary", placeholder: "Enter secondary email address", value: formData.emailSecondary },
  ];
  const emergencyContact = [
    { label: "Contact Name", type: "text", name: "emergencyContactName", placeholder: "Enter contact name", value: formData.emergencyContactName },
    { label: "Contact Phone", type: "tel", name: "emergencyContactPhone", placeholder: "Enter contact phone", value: formData.emergencyContactPhone, inputMode: "numeric" },
    { label: "Relationship", type: "text", name: "emergencyContactRelationship", placeholder: "Enter relationship", value: formData.emergencyContactRelationship },
  ];
  const addressDetails = [
    { label: "Street", type: "text", name: "street", placeholder: "Enter street", value: formData.street },
    { label: "City", type: "text", name: "city", placeholder: "Enter city", value: formData.city },
    { label: "State", type: "text", name: "state", placeholder: "Enter state", value: formData.state },
    { label: "Country", type: "text", name: "country", placeholder: "Enter country", value: formData.country },
    { label: "Zipcode", type: "text", name: "zipcode", placeholder: "Enter zipcode", value: formData.zipcode },
  ];
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
  // Updated to remove logger
  const additionalInfo = [
    { label: "Event Name", type: "text", name: "eventName", placeholder: "Enter event name", value: formData.eventName },
    { label: "Event Role", type: "text", name: "eventRole", placeholder: "Enter event role", value: formData.eventRole },
    { label: "Event Date", type: "date", name: "eventDate", value: formData.eventDate },
    { label: "Event Held Organization", type: "text", name: "eventHeldOrganization", placeholder: "Enter organization", value: formData.eventHeldOrganization },
    { label: "Event Location", type: "text", name: "eventLocation", placeholder: "Enter event location", value: formData.eventLocation },
    { label: "LinkedIn Profile", type: "url", name: "linkedinProfile", placeholder: "Enter LinkedIn profile URL", value: formData.linkedinProfile },
  ];

  // --- Handlers ---

  const handlePhoneKeyPress = (e) => {
    if (!/[0-9]/.test(String.fromCharCode(e.which))) {
      e.preventDefault();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleExperienceChange = (index, e) => {
    const { name, value } = e.target;
    const updatedExperience = [...formData.experience];
    updatedExperience[index][name] = value;
    setFormData(prev => ({ ...prev, experience: updatedExperience }));
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, { jobTitle: '', company: '', department: '', expFromDate: '', expToDate: '', expSkills: '' }]
    }));
  };

  const removeExperience = (index) => {
    if (formData.experience.length > 1) {
      const updatedExperience = formData.experience.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, experience: updatedExperience }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave?.(formData);
    onBack?.();
  };

  const handleReset = () => {
    // Resets to the initial empty state structure
    setFormData({
      name: '', dateOfBirth: '', gender: '', nationality: '', maritalStatus: '', category: '', age: '',
      phonePrimary: '', phoneSecondary: '', emailPrimary: '', emailSecondary: '',
      emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelationship: '',
      street: '', city: '', state: '', country: '', zipcode: '',
      pgCourseName: '', pgCollege: '', pgUniversity: '', pgFromDate: '', pgToDate: '', ugCourseName: '', ugCollege: '', ugUniversity: '', ugFromDate: '', ugToDate: '',
      skills: '',
      experience: [{ jobTitle: '', company: '', department: '', expFromDate: '', expToDate: '', expSkills: '' }],
      eventName: '', eventRole: '', eventDate: '', eventHeldOrganization: '', eventLocation: '', linkedinProfile: '',
      logger: '',
    });
  };

  const renderField = (field, index) => (
    <div key={index} className="space-y-2">
      <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">{field.label}</label>
      {field.type === 'select' ? (
        <select id={field.name} name={field.name} value={field.value} onChange={handleInputChange} required={field.label.includes('*')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077b8]">
          {field.options.map(option => <option key={option} value={option}>{option}</option>)}
        </select>
      ) : field.type === 'textarea' ? (
        <textarea id={field.name} name={field.name} value={field.value} placeholder={field.placeholder} onChange={handleInputChange} required={field.label.includes('*')} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077b8] resize-vertical" />
      ) : (
        <input type={field.type} id={field.name} name={field.name} value={field.value} placeholder={field.placeholder} onKeyPress={field.name.includes('Phone') ? handlePhoneKeyPress : undefined} inputMode={field.inputMode} onChange={handleInputChange} required={field.label.includes('*')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077b8]" />
      )}
    </div>
  );

  return (
    <div className="flex flex-row mx-auto pt-0 pb-2 bg-[#F0F0F0] min-h-full">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="bg-white p-6 rounded-lg shadow-sm space-y-8">

          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Add Additional Details</h2>
            <p className="text-gray-600">Fill in the comprehensive details. Required fields are marked with an asterisk (*).</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{personalDetails.map(renderField)}</div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{contactInfo.map(renderField)}</div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Address Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{addressDetails.map(renderField)}</div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{emergencyContact.map(renderField)}</div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Education</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{educationFields.map(renderField)}</div>
          </div>

          {/* === NEW SKILLS SECTION === */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Skills</h3>
            <div className="space-y-2">
              <label htmlFor="skills" className="block text-sm font-medium text-gray-700">General Skills</label>
              <textarea id="skills" name="skills" value={formData.skills} placeholder="Enter general skills, separated by commas (e.g., Python, Public Speaking, SEO)" onChange={handleInputChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077b8] resize-vertical" />
            </div>
          </div>

          {/* === EXPERIENCE SECTION === */}
          <div>
            <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
              <h3 className="text-lg font-semibold text-gray-800">Experience</h3>
              <button type="button" onClick={addExperience} className="flex items-center px-3 py-1.5 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md font-medium"><Plus size={16} className="mr-1" />Add More</button>
            </div>
            <div className="space-y-6">
              {formData.experience.map((exp, index) => (
                <div key={index} className="p-4  rounded-lg bg-gray-50/50 relative">
                  {formData.experience.length > 1 && <button type="button" onClick={() => removeExperience(index)} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-100" title="Remove Experience"><Trash2 size={16} /></button>}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2"><label htmlFor={`jobTitle-${index}`} className="block text-sm font-medium text-gray-700">Job Title</label><input type="text" name="jobTitle" id={`jobTitle-${index}`} value={exp.jobTitle} onChange={e => handleExperienceChange(index, e)} placeholder="e.g., Software Engineer" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077b8]" /></div>
                    <div className="space-y-2"><label htmlFor={`company-${index}`} className="block text-sm font-medium text-gray-700">Company</label><input type="text" name="company" id={`company-${index}`} value={exp.company} onChange={e => handleExperienceChange(index, e)} placeholder="e.g., Tech Solutions Inc." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077b8]" /></div>
                    <div className="space-y-2"><label htmlFor={`department-${index}`} className="block text-sm font-medium text-gray-700">Department</label><input type="text" name="department" id={`department-${index}`} value={exp.department} onChange={e => handleExperienceChange(index, e)} placeholder="e.g., Product Development" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077b8]" /></div>
                    <div className="space-y-2"><label htmlFor={`expFromDate-${index}`} className="block text-sm font-medium text-gray-700">From Date</label><input type="date" name="expFromDate" id={`expFromDate-${index}`} value={exp.expFromDate} onChange={e => handleExperienceChange(index, e)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077b8]" /></div>
                    <div className="space-y-2"><label htmlFor={`expToDate-${index}`} className="block text-sm font-medium text-gray-700">To Date</label><input type="date" name="expToDate" id={`expToDate-${index}`} value={exp.expToDate} onChange={e => handleExperienceChange(index, e)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077b8]" /></div>
                    <div className="space-y-2 md:col-span-2 lg:col-span-1"><label htmlFor={`expSkills-${index}`} className="block text-sm font-medium text-gray-700">Job-specific Skills</label><textarea name="expSkills" id={`expSkills-${index}`} value={exp.expSkills} onChange={e => handleExperienceChange(index, e)} rows="1" placeholder="e.g., React, Node.js" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077b8] resize-vertical"></textarea></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{additionalInfo.map(renderField)}</div>
          </div>

          {/* === NEW LOGGER SECTION === */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Logger / Notes</h3>
            <div className="space-y-2">
              <label htmlFor="logger" className="block text-sm font-medium text-gray-700">Add a note</label>
              <textarea id="logger" name="logger" value={formData.logger} placeholder="Log an interaction, comment, or any other relevant information." onChange={handleInputChange} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077b8] resize-vertical" />
            </div>
          </div>

          {/* --- ACTION BUTTONS --- */}
          <div className="flex flex-col pt-4 sm:flex-row gap-4 justify-end">
            <button type="button" onClick={handleReset} className="px-6 py-2 flex items-center justify-center gap-x-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"><RotateCcw size={18} />Reset Form</button>
            <button type="button" onClick={onBack} className="px-6 py-2 flex items-center justify-center gap-x-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium">Cancel</button>
            <button type="submit" className="px-6 py-2 flex items-center justify-center gap-x-1.5 bg-[#0077b8] hover:bg-[#005f8f] text-white rounded-lg transition-colors font-medium"><Plus size={18} />Add Details</button>
          </div>

        </div>
      </form>
    </div>
  );
}

export default DetailsInput;