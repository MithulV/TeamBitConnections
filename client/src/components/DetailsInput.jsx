import React, { useState, useEffect } from 'react';
import { RotateCcw, Plus, Trash2, FileStack, Save } from 'lucide-react';

function DetailsInput({ onBack, onSave, initialData = null, isAddMode = false, isEditMode = false,assignToUser }) {
  const [formData, setFormData] = useState({
    //contact_id
    contact_id: '',

    // Personal Details
    name: '',
    dob: '',
    gender: '',
    nationality: '',
    marital_status: '',
    category: '',
    age: '',

    // Contact Information
    phone_number: '',
    secondary_phone_number: '',
    email_address: '',
    secondary_email: '',

    // Emergency Contact
    emergency_contact_name: '',
    emergency_contact_phone_number: '',
    emergency_contact_relationship: '',

    // Address Details
    street: '',
    city: '',
    state: '',
    country: '',
    zipcode: '',

    // Education
    pg_course_name: '',
    pg_college: '',
    pg_university: '',
    pg_from_date: '',
    pg_to_date: '',
    ug_course_name: '',
    ug_college: '',
    ug_university: '',
    ug_from_date: '',
    ug_to_date: '',

    // General Skills
    skills: '',

    // Experience - An array
    experience: [
      { job_title: '', company: '', department: '', from_date: '', to_date: '', company_skills: '' }
    ],

    // Additional Information (focused on events)
    event_id: '',
    event_name: '',
    event_role: '',
    event_date: '',
    event_held_organization: '',
    event_location: '',
    linkedin_url: '',

    // Logger for notes
    logger: '',
  });

  useEffect(() => {
    if ((isAddMode || isEditMode) && initialData) {
      // Helper to format date strings from ISO to YYYY-MM-DD
      const formatDate = (dateString) => {
        if (!dateString) return '';
        return dateString.split('T')[0];
      };                                                                            

      // Safely access the first event, if it exists
      const firstEvent = initialData.events && initialData.events.length > 0 ? initialData.events[0] : {};

      setFormData(prevData => ({
        // --- contact_id ---
        contact_id: initialData.contact_id || '',

        // --- Personal Details ---
        name: initialData.name || '',
        dob: formatDate(initialData.dob),
        gender: initialData.gender || '',
        nationality: initialData.nationality || '',
        marital_status: initialData.marital_status || '',
        category: initialData.category || '',
        age: initialData.age || '',

        // --- Contact Info ---
        phone_number: initialData.phone_number || '',
        secondary_phone_number: initialData.secondary_phone_number || '',
        email_address: initialData.email_address || '',
        secondary_email: initialData.secondary_email || '',

        // --- Emergency Contact ---
        emergency_contact_name: initialData.emergency_contact_name || '',
        emergency_contact_phone_number: initialData.emergency_contact_phone_number || '',
        emergency_contact_relationship: initialData.emergency_contact_relationship || '',

        // --- Address Details (from nested 'address' object) ---
        street: initialData.address?.street || '',
        city: initialData.address?.city || '',
        state: initialData.address?.state || '',
        country: initialData.address?.country || '',
        zipcode: initialData.address?.zipcode || '',

        // --- Education Fields (from nested 'education' object) ---
        pg_course_name: initialData.education?.pg_course_name || '',
        pg_college: initialData.education?.pg_college || '',
        pg_university: initialData.education?.pg_university || '',
        pg_from_date: formatDate(initialData.education?.pg_from_date),
        pg_to_date: formatDate(initialData.education?.pg_to_date),
        ug_course_name: initialData.education?.ug_course_name || '',
        ug_college: initialData.education?.ug_college || '',
        ug_university: initialData.education?.ug_university || '',
        ug_from_date: formatDate(initialData.education?.ug_from_date),
        ug_to_date: formatDate(initialData.education?.ug_to_date),

        // --- Professional and Additional Info ---
        skills: initialData.skills || '',
        linkedin_url: initialData.linkedin_url || '',

        // --- Event Details (from the first item in the 'events' array) ---
        event_id: firstEvent.event_id || '',
        event_name: firstEvent.event_name || '',
        event_role: firstEvent.event_role || '',
        event_date: formatDate(firstEvent.event_date),
        event_held_organization: firstEvent.event_held_organization || '',
        event_location: firstEvent.event_location || '',

        // --- Experience History (from 'experiences' array) ---
        experience: Array.isArray(initialData.experiences) && initialData.experiences.length > 0
          ? initialData.experiences.map(exp => ({
            job_title: exp.job_title || '',
            company: exp.company || '',
            department: exp.department || '',
            from_date: formatDate(exp.from_date),
            to_date: formatDate(exp.to_date),
            company_skills: exp.company_skills || '',
          }))
          : [{ job_title: '', company: '', department: '', from_date: '', to_date: '', company_skills: '' }],

        // --- Logger ---
        logger: '',
      }));
    }
  }, [isAddMode, isEditMode, initialData]);

  // --- Field Definitions ---

  const personalDetails = [
    { label: "Name*", type: "text", name: "name", placeholder: "Enter full name", value: formData.name },
    { label: "Date of Birth", type: "date", name: "dob", value: formData.dob },
    { label: "Gender", type: "select", name: "gender", value: formData.gender, options: ['', 'Male', 'Female', 'Other', 'Prefer not to say'] },
    { label: "Nationality", type: "text", name: "nationality", placeholder: "Enter nationality", value: formData.nationality },
    { label: "Marital Status", type: "select", name: "marital_status", value: formData.marital_status, options: ['', 'Single', 'Married', 'Divorced', 'Widowed'] },
    { label: "Category", type: "text", name: "category", placeholder: "Enter category", value: formData.category },
    { label: "Age", type: "number", name: "age", placeholder: "Enter age", value: formData.age },
  ];

  const contactInfo = [
    { label: "Phone No (Primary)*", type: "tel", name: "phone_number", placeholder: "Enter primary phone number", value: formData.phone_number, inputMode: "numeric" },
    { label: "Phone No (Secondary)", type: "tel", name: "secondary_phone_number", placeholder: "Enter secondary phone number", value: formData.secondary_phone_number, inputMode: "numeric" },
    { label: "Email (Primary)*", type: "email", name: "email_address", placeholder: "Enter primary email address", value: formData.email_address },
    { label: "Email (Secondary)", type: "email", name: "secondary_email", placeholder: "Enter secondary email address", value: formData.secondary_email },
  ];

  const emergencyContact = [
    { label: "Contact Name", type: "text", name: "emergency_contact_name", placeholder: "Enter contact name", value: formData.emergency_contact_name },
    { label: "Contact Phone", type: "tel", name: "emergency_contact_phone_number", placeholder: "Enter contact phone", value: formData.emergency_contact_phone_number, inputMode: "numeric" },
    { label: "Relationship", type: "text", name: "emergency_contact_relationship", placeholder: "Enter relationship", value: formData.emergency_contact_relationship },
  ];

  const addressDetails = [
    { label: "Street", type: "text", name: "street", placeholder: "Enter street", value: formData.street },
    { label: "City", type: "text", name: "city", placeholder: "Enter city", value: formData.city },
    { label: "State", type: "text", name: "state", placeholder: "Enter state", value: formData.state },
    { label: "Country", type: "text", name: "country", placeholder: "Enter country", value: formData.country },
    { label: "Zipcode", type: "text", name: "zipcode", placeholder: "Enter zipcode", value: formData.zipcode },
  ];

  const educationFields = [
    { label: "PG Course Name", type: "text", name: "pg_course_name", placeholder: "Enter PG course name", value: formData.pg_course_name },
    { label: "PG College", type: "text", name: "pg_college", placeholder: "Enter PG college", value: formData.pg_college },
    { label: "PG University", type: "text", name: "pg_university", placeholder: "Enter PG university", value: formData.pg_university },
    { label: "PG From Date", type: "date", name: "pg_from_date", value: formData.pg_from_date },
    { label: "PG To Date", type: "date", name: "pg_to_date", value: formData.pg_to_date },
    { label: "UG Course Name", type: "text", name: "ug_course_name", placeholder: "Enter UG course name", value: formData.ug_course_name },
    { label: "UG College", type: "text", name: "ug_college", placeholder: "Enter UG college", value: formData.ug_college },
    { label: "UG University", type: "text", name: "ug_university", placeholder: "Enter UG university", value: formData.ug_university },
    { label: "UG From Date", type: "date", name: "ug_from_date", value: formData.ug_from_date },
    { label: "UG To Date", type: "date", name: "ug_to_date", value: formData.ug_to_date },
  ];

  const additionalInfo = [
    { label: "Event Name", type: "text", name: "event_name", placeholder: "Enter event name", value: formData.event_name },
    { label: "Event Role", type: "text", name: "event_role", placeholder: "Enter event role", value: formData.event_role },
    { label: "Event Date", type: "date", name: "event_date", value: formData.event_date },
    { label: "Event Held Organization", type: "text", name: "event_held_organization", placeholder: "Enter organization", value: formData.event_held_organization },
    { label: "Event Location", type: "text", name: "event_location", placeholder: "Enter event location", value: formData.event_location },
    { label: "LinkedIn Profile", type: "url", name: "linkedin_url", placeholder: "Enter LinkedIn profile URL", value: formData.linkedin_url },
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
      experience: [...prev.experience, { job_title: '', company: '', department: '', from_date: '', to_date: '', company_skills: '' }]
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
    console.log('Form Data:', formData);
    if (onSave) {
      onSave(formData);
    }
  };

  const handleReset = () => {
    if (!initialData) {
      // Reset to empty form for new entries
      setFormData({
        contact_id: '',
        name: '',
        dob: '',
        gender: '',
        nationality: '',
        marital_status: '',
        category: '',
        age: '',
        phone_number: '',
        secondary_phone_number: '',
        email_address: '',
        secondary_email: '',
        emergency_contact_name: '',
        emergency_contact_phone_number: '',
        emergency_contact_relationship: '',
        street: '',
        city: '',
        state: '',
        country: '',
        zipcode: '',
        pg_course_name: '',
        pg_college: '',
        pg_university: '',
        pg_from_date: '',
        pg_to_date: '',
        ug_course_name: '',
        ug_college: '',
        ug_university: '',
        ug_from_date: '',
        ug_to_date: '',
        skills: '',
        experience: [{ job_title: '', company: '', department: '', from_date: '', to_date: '', company_skills: '' }],
        event_id: '',
        event_name: '',
        event_role: '',
        event_date: '',
        event_held_organization: '',
        event_location: '',
        linkedin_url: '',
        logger: '',
      });
      return;
    }

    // Reset to initial data for existing entries
    const formatDate = (dateString) => {
      if (!dateString) return '';
      return dateString.split('T')[0];
    };

    const firstEvent = initialData.events && initialData.events.length > 0 ? initialData.events[0] : {};

    setFormData({
      contact_id: initialData.contact_id || '',
      name: initialData.name || '',
      dob: formatDate(initialData.dob),
      gender: initialData.gender || '',
      nationality: initialData.nationality || '',
      marital_status: initialData.marital_status || '',
      category: initialData.category || '',
      age: initialData.age || '',
      phone_number: initialData.phone_number || '',
      secondary_phone_number: initialData.secondary_phone_number || '',
      email_address: initialData.email_address || '',
      secondary_email: initialData.secondary_email || '',
      emergency_contact_name: initialData.emergency_contact_name || '',
      emergency_contact_phone_number: initialData.emergency_contact_phone_number || '',
      emergency_contact_relationship: initialData.emergency_contact_relationship || '',
      street: initialData.address?.street || '',
      city: initialData.address?.city || '',
      state: initialData.address?.state || '',
      country: initialData.address?.country || '',
      zipcode: initialData.address?.zipcode || '',
      pg_course_name: initialData.education?.pg_course_name || '',
      pg_college: initialData.education?.pg_college || '',
      pg_university: initialData.education?.pg_university || '',
      pg_from_date: formatDate(initialData.education?.pg_from_date),
      pg_to_date: formatDate(initialData.education?.pg_to_date),
      ug_course_name: initialData.education?.ug_course_name || '',
      ug_college: initialData.education?.ug_college || '',
      ug_university: initialData.education?.ug_university || '',
      ug_from_date: formatDate(initialData.education?.ug_from_date),
      ug_to_date: formatDate(initialData.education?.ug_to_date),
      skills: initialData.skills || '',
      linkedin_url: initialData.linkedin_url || '',
      event_id: firstEvent.event_id || '',
      event_name: firstEvent.event_name || '',
      event_role: firstEvent.event_role || '',
      event_date: formatDate(firstEvent.event_date),
      event_held_organization: firstEvent.event_held_organization || '',
      event_location: firstEvent.event_location || '',
      experience: Array.isArray(initialData.experiences) && initialData.experiences.length > 0
        ? initialData.experiences.map(exp => ({
          job_title: exp.job_title || '',
          company: exp.company || '',
          department: exp.department || '',
          from_date: formatDate(exp.from_date),
          to_date: formatDate(exp.to_date),
          company_skills: exp.company_skills || '',
        }))
        : [{ job_title: '', company: '', department: '', from_date: '', to_date: '', company_skills: '' }],
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
        <input type={field.type} id={field.name} name={field.name} value={field.value} placeholder={field.placeholder} onKeyPress={field.name.includes('phone') ? handlePhoneKeyPress : undefined} inputMode={field.inputMode} onChange={handleInputChange} required={field.label.includes('*')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077b8]" />
      )}
    </div>
  );

  // Determine the mode and display appropriate content
  const getTitle = () => {
    if (isAddMode) return 'Verify & Add Contact Details';
    if (isEditMode) return 'Edit Contact Details';
    return 'Contact Details';
  };

  const getDescription = () => {
    if (isAddMode) return 'Review and complete the contact information before adding to verified contacts. Required fields are marked with an asterisk (*).';
    if (isEditMode) return 'Update the contact information. Required fields are marked with an asterisk (*).';
    return 'Fill in the comprehensive details. Required fields are marked with an asterisk (*).';
  };

  const getButtonText = () => {
    if (isAddMode) return 'Verify & Add';
    if (isEditMode) return 'Save Changes';
    return 'Save Details';
  };

  const getButtonIcon = () => {
    if (isAddMode) return <Plus size={18} />;
    if (isEditMode) return <Save size={18} />;
    return <Plus size={18} />;
  };

  const getButtonClass = () => {
    if (isAddMode) return 'bg-green-600 hover:bg-green-700';
    if (isEditMode) return 'bg-blue-600 hover:bg-blue-700';
    return 'bg-[#0077b8] hover:bg-[#005f8f]';
  };

  return (
    <div className="flex flex-row mx-auto pt-0 pb-2 bg-[#F0F0F0] min-h-full">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="bg-white p-6 rounded-lg shadow-sm space-y-8">

          <div className='flex flex-1 justify-between items-center pr-20'>
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                {getTitle()}
              </h2>
              <p className="text-gray-600">
                {getDescription()}
              </p>
            </div>
            <div>
              {isAddMode && assignToUser && (
                <button
                  type='button'
                  className="flex items-center gap-3 px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 transition-all duration-200 cursor-pointer group"
                  onClick={() => {
                    //console.log(assignToUser);
                    assignToUser();
                  }}
                >
                  <div className="w-2 h-2 bg-orange-400 rounded-full group-hover:bg-orange-500 transition-colors duration-200"></div>
                  <span className="text-sm text-orange-700 font-medium group-hover:text-orange-800 transition-colors duration-200">
                    Assign to user
                  </span>
                </button>
              )}
            </div>
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

          {/* === SKILLS SECTION === */}
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
                <div key={index} className="p-4 rounded-lg bg-gray-50/50 relative">
                  {formData.experience.length > 1 && <button type="button" onClick={() => removeExperience(index)} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-100" title="Remove Experience"><Trash2 size={16} /></button>}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2"><label htmlFor={`job_title-${index}`} className="block text-sm font-medium text-gray-700">Job Title</label><input type="text" name="job_title" id={`job_title-${index}`} value={exp.job_title} onChange={e => handleExperienceChange(index, e)} placeholder="e.g., Software Engineer" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077b8]" /></div>
                    <div className="space-y-2"><label htmlFor={`company-${index}`} className="block text-sm font-medium text-gray-700">Company</label><input type="text" name="company" id={`company-${index}`} value={exp.company} onChange={e => handleExperienceChange(index, e)} placeholder="e.g., Tech Solutions Inc." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077b8]" /></div>
                    <div className="space-y-2"><label htmlFor={`department-${index}`} className="block text-sm font-medium text-gray-700">Department</label><input type="text" name="department" id={`department-${index}`} value={exp.department} onChange={e => handleExperienceChange(index, e)} placeholder="e.g., Product Development" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077b8]" /></div>
                    <div className="space-y-2"><label htmlFor={`from_date-${index}`} className="block text-sm font-medium text-gray-700">From Date</label><input type="date" name="from_date" id={`from_date-${index}`} value={exp.from_date} onChange={e => handleExperienceChange(index, e)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077b8]" /></div>
                    <div className="space-y-2"><label htmlFor={`to_date-${index}`} className="block text-sm font-medium text-gray-700">To Date</label><input type="date" name="to_date" id={`to_date-${index}`} value={exp.to_date} onChange={e => handleExperienceChange(index, e)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077b8]" /></div>
                    <div className="space-y-2 md:col-span-2 lg:col-span-1"><label htmlFor={`company_skills-${index}`} className="block text-sm font-medium text-gray-700">Job-specific Skills</label><textarea name="company_skills" id={`company_skills-${index}`} value={exp.company_skills} onChange={e => handleExperienceChange(index, e)} rows="1" placeholder="e.g., React, Node.js" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077b8] resize-vertical"></textarea></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Event Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{additionalInfo.map(renderField)}</div>
          </div>

          {/* === LOGGER SECTION === */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Notes / Logger</h3>
            <div className="space-y-2">
              <label htmlFor="logger" className="block text-sm font-medium text-gray-700">
                {isAddMode ? 'Verification Notes' : 'Add a note'}
              </label>
              <textarea
                id="logger"
                name="logger"
                value={formData.logger}
                placeholder={isAddMode ? "Add any verification notes or comments about this contact." : "Log an interaction, comment, or any other relevant information."}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077b8] resize-vertical"
              />
            </div>
          </div>

          {/* --- ACTION BUTTONS --- */}
          <div className="flex flex-col pt-4 sm:flex-row gap-4 justify-end">
            <button type="button" onClick={handleReset} className="px-6 py-2 flex items-center justify-center gap-x-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium">
              <RotateCcw size={18} />Reset Form
            </button>
            <button type="button" onClick={onBack} className="px-6 py-2 flex items-center justify-center gap-x-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium">
              Cancel
            </button>
            <button type="submit" className={`px-6 py-2 flex items-center justify-center gap-x-1.5 text-white rounded-lg transition-colors font-medium ${getButtonClass()}`}>
              {getButtonIcon()}
              {getButtonText()}
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}

export default DetailsInput;
