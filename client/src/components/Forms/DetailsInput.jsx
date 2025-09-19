import React, { useState, useEffect } from "react";
import {
  RotateCcw,
  Plus,
  Trash2,
  FileStack,
  Save,
  ArrowLeft,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Header from "../Header/Header";
import Alert from "../Alert/Alert";
import { useAuthStore } from "../../store/AuthStore";
import api from "../../utils/axios";

// Custom styles for DatePicker
const datePickerStyles = `
  .custom-datepicker {
    border: 1px solid #d1d5db;
    border-radius: 8px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    font-family: inherit;
  }
  
  .custom-datepicker .react-datepicker__header {
    background-color: #0077b8;
    border-bottom: 1px solid #0077b8;
    border-radius: 8px 8px 0 0;
  }
  
  .custom-datepicker .react-datepicker__current-month,
  .custom-datepicker .react-datepicker__day-name {
    color: white;
    font-weight: 600;
  }
  
  .custom-datepicker .react-datepicker__day {
    border-radius: 4px;
    transition: all 0.2s ease;
  }
  
  .custom-datepicker .react-datepicker__day:hover {
    background-color: #e6f2ff;
    color: #0077b8;
  }
  
  .custom-datepicker .react-datepicker__day--selected {
    background-color: #0077b8;
    color: white;
  }
  
  .custom-datepicker .react-datepicker__day--selected:hover {
    background-color: #005f8f;
  }
  
  .custom-datepicker .react-datepicker__day--today {
    background-color: #fef3c7;
    color: #92400e;
    font-weight: 600;
  }
  
  .custom-datepicker .react-datepicker__navigation {
    border: none;
    border-radius: 4px;
    background-color: rgba(255, 255, 255, 0.2);
  }
  
  .custom-datepicker .react-datepicker__navigation:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
  
  .custom-datepicker-popper {
    z-index: 9999;
  }
  
  .react-datepicker__input-container input {
    cursor: pointer;
  }
  
  .react-datepicker__input-container input:read-only {
    background-color: #f9fafb;
    cursor: not-allowed;
  }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = datePickerStyles;
  document.head.appendChild(styleSheet);
}

function DetailsInput() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useAuthStore();

  // Get contact data and source information from navigation state
  const {
    contact: initialData = null,
    isAddMode = false,
    source = "unknown",
    currentUserId,
    userRole,
    successCallback,
  } = location.state || {};

  // Alert state
  const [alert, setAlert] = useState({
    isOpen: false,
    severity: "success",
    message: "",
  });

  const [formData, setFormData] = useState({
    contact_id: "",
    assignment_id: null,
    name: "",
    dob: "",
    gender: "",
    nationality: "",
    marital_status: "",
    category: "",
    age: "",
    phone_number: "",
    secondary_phone_number: "",
    email_address: "",
    secondary_email: "",
    emergency_contact_name: "",
    emergency_contact_phone_number: "",
    emergency_contact_relationship: "",
    street: "",
    city: "",
    state: "",
    country: "",
    zipcode: "",
    education: {
      pg_course_name: "",
      pg_college: "",
      pg_university: "",
      pg_from_date: "",
      pg_to_date: "",
      ug_course_name: "",
      ug_college: "",
      ug_university: "",
      ug_from_date: "",
      ug_to_date: "",
    },
    skills: "",
    experience: [
      {
        job_title: "",
        company: "",
        department: "",
        from_date: "",
        to_date: "",
        company_skills: "",
      },
    ],
    event_id: "",
    event_name: "",
    event_role: "",
    event_date: "",
    event_held_organization: "",
    event_location: "",
    linkedin_url: "",
    logger: "",
  });

  // Alert handlers
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

  useEffect(() => {
    if (isAddMode && initialData) {
      const formatDate = (dateString) => {
        if (!dateString) return "";
        return dateString.split("T")[0];
      };

      const firstEvent =
        initialData.events && initialData.events.length > 0
          ? initialData.events[0]
          : {};

      const formattedDob = formatDate(initialData.dob);
      const calculatedAge = formattedDob
        ? calculateAge(formattedDob)
        : initialData.age || "";

      setFormData((prevData) => ({
        contact_id: initialData.contact_id || "",
        assignment_id: initialData.assignment_id || null,
        name: initialData.name || "",
        dob: formattedDob,
        gender: initialData.gender || "",
        nationality: initialData.nationality || "",
        marital_status: initialData.marital_status || "",
        category: initialData.category || "",
        age: calculatedAge,
        phone_number: initialData.phone_number || "",
        secondary_phone_number: initialData.secondary_phone_number || "",
        email_address: initialData.email_address || "",
        secondary_email: initialData.secondary_email || "",
        emergency_contact_name: initialData.emergency_contact_name || "",
        emergency_contact_phone_number:
          initialData.emergency_contact_phone_number || "",
        emergency_contact_relationship:
          initialData.emergency_contact_relationship || "",
        street: initialData.address?.street || "",
        city: initialData.address?.city || "",
        state: initialData.address?.state || "",
        country: initialData.address?.country || "",
        zipcode: initialData.address?.zipcode || "",
        education: {
          pg_course_name: initialData.education?.pg_course_name || "",
          pg_college: initialData.education?.pg_college || "",
          pg_university: initialData.education?.pg_university || "",
          pg_from_date: formatDate(initialData.education?.pg_from_date),
          pg_to_date: formatDate(initialData.education?.pg_to_date),
          ug_course_name: initialData.education?.ug_course_name || "",
          ug_college: initialData.education?.ug_college || "",
          ug_university: initialData.education?.ug_university || "",
          ug_from_date: formatDate(initialData.education?.ug_from_date),
          ug_to_date: formatDate(initialData.education?.ug_to_date),
        },
        skills: initialData.skills || "",
        linkedin_url: initialData.linkedin_url || "",
        event_id: firstEvent.event_id || "",
        event_name: firstEvent.event_name || "",
        event_role: firstEvent.event_role || "",
        event_date: formatDate(firstEvent.event_date),
        event_held_organization: firstEvent.event_held_organization || "",
        event_location: firstEvent.event_location || "",
        experience:
          Array.isArray(initialData.experiences) &&
            initialData.experiences.length > 0
            ? initialData.experiences.map((exp) => ({
              job_title: exp.job_title || "",
              company: exp.company || "",
              department: exp.department || "",
              from_date: formatDate(exp.from_date),
              to_date: formatDate(exp.to_date),
              company_skills: exp.company_skills || "",
            }))
            : [
              {
                job_title: "",
                company: "",
                department: "",
                from_date: "",
                to_date: "",
                company_skills: "",
              },
            ],
        logger: initialData.logger || "",
      }));
    }
  }, [isAddMode, initialData]);

  // Field Definitions
  const personalDetails = [
    {
      label: "Name*",
      type: "text",
      name: "name",
      placeholder: "Enter full name",
      value: formData.name,
    },
    { label: "Date of Birth", type: "date", name: "dob", value: formData.dob },
    {
      label: "Gender",
      type: "select",
      name: "gender",
      value: formData.gender,
      options: ["", "Male", "Female", "Other", "Prefer not to say"],
    },
    {
      label: "Nationality",
      type: "select",
      name: "nationality",
      placeholder: "Enter nationality",
      value: formData.nationality,
      options: [
        "",
        "American",
        "Australian",
        "Belgian",
        "Brazilian",
        "Canadian",
        "Chinese",
        "French",
        "German",
        "Indian",
        "Indonesian",
        "Italian",
        "Japanese",
        "Mexican",
        "Russian",
      ],
    },
    {
      label: "Marital Status",
      type: "select",
      name: "marital_status",
      value: formData.marital_status,
      options: [
        "",
        "Single",
        "Married",
        "Divorced",
        "Widowed",
        "Prefer not to say",
      ],
    },
    {
      label: "Category",
      type: "select",
      name: "category",
      placeholder: "choose category",
      value: formData.category,
      options: ["", "A", "B", "C"],
    },
    {
      label: "Age (Auto-calculated)",
      type: "number",
      name: "age",
      placeholder: "Calculated from date of birth",
      value: formData.age,
      readOnly: true,
    },
  ];

  const contactInfo = [
    {
      label: "Phone No (Primary)*",
      type: "tel",
      name: "phone_number",
      placeholder: "Enter primary phone number",
      value: formData.phone_number,
      inputMode: "numeric",
    },
    {
      label: "Phone No (Secondary)",
      type: "tel",
      name: "secondary_phone_number",
      placeholder: "Enter secondary phone number",
      value: formData.secondary_phone_number,
      inputMode: "numeric",
    },
    {
      label: "Email (Primary)*",
      type: "email",
      name: "email_address",
      placeholder: "Enter primary email address",
      value: formData.email_address,
    },
    {
      label: "Email (Secondary)",
      type: "email",
      name: "secondary_email",
      placeholder: "Enter secondary email address",
      value: formData.secondary_email,
    },
  ];

  const emergencyContact = [
    {
      label: "Contact Name",
      type: "text",
      name: "emergency_contact_name",
      placeholder: "Enter contact name",
      value: formData.emergency_contact_name,
    },
    {
      label: "Contact Phone",
      type: "tel",
      name: "emergency_contact_phone_number",
      placeholder: "Enter contact phone",
      value: formData.emergency_contact_phone_number,
      inputMode: "numeric",
    },
    {
      label: "Relationship",
      type: "text",
      name: "emergency_contact_relationship",
      placeholder: "Enter relationship",
      value: formData.emergency_contact_relationship,
    },
  ];

  const addressDetails = [
    {
      label: "Street",
      type: "text",
      name: "street",
      placeholder: "Enter street",
      value: formData.street,
    },
    {
      label: "City",
      type: "text",
      name: "city",
      placeholder: "Enter city",
      value: formData.city,
    },
    {
      label: "State",
      type: "text",
      name: "state",
      placeholder: "Enter state",
      value: formData.state,
    },
    {
      label: "Country",
      type: "select",
      name: "country",
      placeholder: "Enter country",
      value: formData.country,
      options: [
        "",
        "Afghanistan",
        "Albania",
        "Algeria",
        "Andorra",
        "Angola",
        "Antigua and Barbuda",
        "Argentina",
        "Armenia",
        "Australia",
        "Austria",
        "Azerbaijan",
        "Bahamas",
        "Bahrain",
        "Bangladesh",
        "Barbados",
        "Belarus",
        "Belgium",
        "Belize",
        "Benin",
        "Bhutan",
        "Bolivia",
        "Bosnia and Herzegovina",
        "Botswana",
        "Brazil",
        "Brunei",
        "Bulgaria",
        "Burkina Faso",
        "Burundi",
        "Cabo Verde",
        "Cambodia",
        "Cameroon",
        "Canada",
        "Central African Republic",
        "Chad",
        "Chile",
        "China",
        "Colombia",
        "Comoros",
        "Congo (Congo-Brazzaville)",
        "Costa Rica",
        "Croatia",
        "Cuba",
        "Cyprus",
        "Czechia (Czech Republic)",
        "Democratic Republic of the Congo",
        "Denmark",
        "Djibouti",
        "Dominica",
        "Dominican Republic",
        "Ecuador",
        "Egypt",
        "El Salvador",
        "Equatorial Guinea",
        "Eritrea",
        "Estonia",
        'Eswatini (fmr. "Swaziland")',
        "Ethiopia",
        "Fiji",
        "Finland",
        "France",
        "Gabon",
        "Gambia",
        "Georgia",
        "Germany",
        "Ghana",
        "Greece",
        "Grenada",
        "Guatemala",
        "Guinea",
        "Guinea-Bissau",
        "Guyana",
        "Haiti",
        "Holy See (Vatican City)",
        "Honduras",
        "Hungary",
        "Iceland",
        "India",
        "Indonesia",
        "Iran",
        "Iraq",
        "Ireland",
        "Israel",
        "Italy",
        "Jamaica",
        "Japan",
        "Jordan",
        "Kazakhstan",
        "Kenya",
        "Kiribati",
        "Korea (North)",
        "Korea (South)",
        "Kuwait",
        "Kyrgyzstan",
        "Laos",
        "Latvia",
        "Lebanon",
        "Lesotho",
        "Liberia",
        "Libya",
        "Liechtenstein",
        "Lithuania",
        "Luxembourg",
        "Madagascar",
        "Malawi",
        "Malaysia",
        "Maldives",
        "Mali",
        "Malta",
        "Marshall Islands",
        "Mauritania",
        "Mauritius",
        "Mexico",
        "Micronesia",
        "Moldova",
        "Monaco",
        "Mongolia",
        "Montenegro",
        "Morocco",
        "Mozambique",
        "Myanmar (Burma)",
        "Namibia",
        "Nauru",
        "Nepal",
        "Netherlands",
        "New Zealand",
        "Nicaragua",
        "Niger",
        "Nigeria",
        "North Macedonia",
        "Norway",
        "Oman",
        "Pakistan",
        "Palau",
        "Palestine State",
        "Panama",
        "Papua New Guinea",
        "Paraguay",
        "Peru",
        "Philippines",
        "Poland",
        "Portugal",
        "Qatar",
        "Romania",
        "Russia",
        "Rwanda",
        "Saint Kitts and Nevis",
        "Saint Lucia",
        "Saint Vincent and the Grenadines",
        "Samoa",
        "San Marino",
        "Sao Tome and Principe",
        "Saudi Arabia",
        "Senegal",
        "Serbia",
        "Seychelles",
        "Sierra Leone",
        "Singapore",
        "Slovakia",
        "Slovenia",
        "Solomon Islands",
        "Somalia",
        "South Africa",
        "South Sudan",
        "Spain",
        "Sri Lanka",
        "Sudan",
        "Suriname",
        "Sweden",
        "Switzerland",
        "Syria",
        "Tajikistan",
        "Tanzania",
        "Thailand",
        "Timor-Leste",
        "Togo",
        "Tonga",
        "Trinidad and Tobago",
        "Tunisia",
        "Turkey",
        "Turkmenistan",
        "Tuvalu",
        "Uganda",
        "Ukraine",
        "United Arab Emirates",
        "United Kingdom",
        "United States of America",
        "Uruguay",
        "Uzbekistan",
        "Vanuatu",
        "Venezuela",
        "Vietnam",
        "Yemen",
        "Zambia",
        "Zimbabwe",
      ],
    },
    {
      label: "Zipcode",
      type: "text",
      name: "zipcode",
      placeholder: "Enter zipcode",
      value: formData.zipcode,
    },
  ];

  const educationFields = [
    {
      label: "PG Course Name",
      type: "text",
      name: "pg_course_name",
      placeholder: "Enter PG course name",
      value: formData.education.pg_course_name,
    },
    {
      label: "PG College",
      type: "text",
      name: "pg_college",
      placeholder: "Enter PG college",
      value: formData.education.pg_college,
    },
    {
      label: "PG University",
      type: "text",
      name: "pg_university",
      placeholder: "Enter PG university",
      value: formData.education.pg_university,
    },
    {
      label: "PG From Date",
      type: "date",
      name: "pg_from_date",
      value: formData.education.pg_from_date,
    },
    {
      label: "PG To Date",
      type: "date",
      name: "pg_to_date",
      value: formData.education.pg_to_date,
    },
    {
      label: "UG Course Name",
      type: "text",
      name: "ug_course_name",
      placeholder: "Enter UG course name",
      value: formData.education.ug_course_name,
    },
    {
      label: "UG College",
      type: "text",
      name: "ug_college",
      placeholder: "Enter UG college",
      value: formData.education.ug_college,
    },
    {
      label: "UG University",
      type: "text",
      name: "ug_university",
      placeholder: "Enter UG university",
      value: formData.education.ug_university,
    },
    {
      label: "UG From Date",
      type: "date",
      name: "ug_from_date",
      value: formData.education.ug_from_date,
    },
    {
      label: "UG To Date",
      type: "date",
      name: "ug_to_date",
      value: formData.education.ug_to_date,
    },
  ];

  const additionalInfo = [
    {
      label: "Event Name",
      type: "text",
      name: "event_name",
      placeholder: "Enter event name",
      value: formData.event_name,
    },
    {
      label: "Event Role",
      type: "text",
      name: "event_role",
      placeholder: "Enter event role",
      value: formData.event_role,
    },
    {
      label: "Event Date",
      type: "date",
      name: "event_date",
      value: formData.event_date,
    },
    {
      label: "Event Held Organization",
      type: "text",
      name: "event_held_organization",
      placeholder: "Enter organization",
      value: formData.event_held_organization,
    },
    {
      label: "Event Location",
      type: "text",
      name: "event_location",
      placeholder: "Enter event location",
      value: formData.event_location,
    },
    {
      label: "LinkedIn Profile",
      type: "url",
      name: "linkedin_url",
      placeholder: "Enter LinkedIn profile URL",
      value: formData.linkedin_url,
    },
  ];

  // Handlers
  const handlePhoneKeyPress = (e) => {
    if (!/[0-9]/.test(String.fromCharCode(e.which))) {
      e.preventDefault();
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return "";

    const today = new Date();
    const birthDate = new Date(dob);

    if (isNaN(birthDate.getTime())) return "";

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age >= 0 ? age.toString() : "";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "dob") {
      const calculatedAge = calculateAge(value);
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        age: calculatedAge,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEducationChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      education: {
        ...prev.education,
        [name]: value,
      },
    }));
  };

  const handleExperienceChange = (index, e) => {
    const { name, value } = e.target;
    const updatedExperience = [...formData.experience];
    updatedExperience[index][name] = value;
    setFormData((prev) => ({ ...prev, experience: updatedExperience }));
  };

  const addExperience = () => {
    setFormData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          job_title: "",
          company: "",
          department: "",
          from_date: "",
          to_date: "",
          company_skills: "",
        },
      ],
    }));
  };

  const removeExperience = (index) => {
    if (formData.experience.length > 1) {
      const updatedExperience = formData.experience.filter(
        (_, i) => i !== index
      );
      setFormData((prev) => ({ ...prev, experience: updatedExperience }));
    }
  };

  const transformFormDataForAPI = (formData) => {
    const addressFields = ["street", "city", "state", "country", "zipcode"];
    const hasAddressData = addressFields.some((field) =>
      formData[field]?.trim()
    );

    const address = hasAddressData
      ? {
        street: formData.street || null,
        city: formData.city || null,
        state: formData.state || null,
        country: formData.country || null,
        zipcode: formData.zipcode || null,
      }
      : null;

    const educationFields = Object.keys(formData.education);
    const hasEducationData = educationFields.some((field) =>
      formData.education[field]?.trim()
    );

    const education = hasEducationData
      ? {
        pg_course_name: formData.education.pg_course_name || null,
        pg_college: formData.education.pg_college || null,
        pg_university: formData.education.pg_university || null,
        pg_from_date: formData.education.pg_from_date || null,
        pg_to_date: formData.education.pg_to_date || null,
        ug_course_name: formData.education.ug_course_name || null,
        ug_college: formData.education.ug_college || null,
        ug_university: formData.education.ug_university || null,
        ug_from_date: formData.education.ug_from_date || null,
        ug_to_date: formData.education.ug_to_date || null,
      }
      : null;

    const experiences = formData.experience
      .filter((exp) => exp.job_title?.trim() || exp.company?.trim())
      .map((exp) => ({
        job_title: exp.job_title || null,
        company: exp.company || null,
        department: exp.department || null,
        from_date: exp.from_date || null,
        to_date: exp.to_date || null,
        company_skills: exp.company_skills || null,
      }));

    const apiPayload = {
      name: formData.name || null,
      phone_number: formData.phone_number || null,
      email_address: formData.email_address || null,
      dob: formData.dob || null,
      gender: formData.gender || null,
      nationality: formData.nationality || null,
      marital_status: formData.marital_status || null,
      category: formData.category || null,
      secondary_email: formData.secondary_email || null,
      secondary_phone_number: formData.secondary_phone_number || null,
      emergency_contact_name: formData.emergency_contact_name || null,
      emergency_contact_relationship:
        formData.emergency_contact_relationship || null,
      emergency_contact_phone_number:
        formData.emergency_contact_phone_number || null,
      skills: formData.skills || null,
      logger: formData.logger || null,
      linkedin_url: formData.linkedin_url || null,
      contact_id: formData.contact_id,
      assignment_id: formData.assignment_id || null,
      event_verified: formData.event_verified || false,
      ...(address && { address }),
      ...(education && { education }),
      ...(formData.event_name && {
        event_id: formData.event_id,
        event_name: formData.event_name,
        event_role: formData.event_role || null,
        event_date: formData.event_date || null,
        event_held_organization: formData.event_held_organization || null,
        event_location: formData.event_location || null,
      }),
      ...(isAddMode && formData.event_id && { event_id: formData.event_id }),
      ...(experiences.length > 0 && { experiences }),
    };

    return apiPayload;
  };
  console.log(location.state);
  // Handle different API calls with alerts
  const handleSubmit = async (e) => {
    e.preventDefault();
    const apiPayload = transformFormDataForAPI(formData);
    console.log("Transformed API Payload:", apiPayload);
    console.log("isAddMode:", isAddMode);
    console.log("initialData:", initialData);
    console.log("source:", source);
    try {
      if (isAddMode && initialData) {
        let response;
        let successMessage = "";

        // Different API calls based on source
        if (source === "middleman") {
          // For MiddleManRecords - approve contact
          response = await api.put(
            `/api/update-contact/${apiPayload.contact_id}?contact_status=approved&event_verified=true&userId=${id}`,
            apiPayload
          );
          successMessage = `${apiPayload.name || initialData.name
            } has been successfully verified and added to contacts.`;
          console.log("MiddleMan Update response:", response);
        } else if (source === "userassignments") {
          // For UserAssignments - update as pending
          response = await api.put(
            `/api/update-contact/${apiPayload.contact_id}?event_verified=false&contact_status=pending&userId=${id}`,
            apiPayload
          );
          successMessage =
            successCallback?.message ||
            `${apiPayload.name || initialData.name
            } has been successfully updated.`;
          console.log("UserAssignments Update response:", response);
        }

        // Show success alert before navigating
        showAlert("success", successMessage);

        // Navigate back with success state after a delay
        setTimeout(() => {
          if (source === "userassignments" && successCallback) {
            // Pass success info back to parent
            navigate(-1, {
              state: {
                fromDetailsInput: true,
                success: true,
                message: successMessage,
                refreshData: successCallback.refreshData,
              },
            });
          } else {
            navigate(-1);
          }
        }, 500);
      } else if (
        (isAddMode && !initialData) ||
        (isAddMode && initialData == null)
      ) {
        if (source == "admin") {
          let response;
          let successMessage = "";
          response = await api.post(
            `/api/create-contact-by-admin/?contact_status=approved&event_verified=true`,
            apiPayload
          );
          successMessage = `${apiPayload.name || initialData.name
            } has been successfully added to contacts.`;
          console.log("admin Update response:", response);
          showAlert("success", successMessage);
          setTimeout(() => {
            navigate(-1);
          }, 1500);
        }
      }
    } catch (error) {
      console.log("Error updating user", error);
      showAlert("error", "Failed to update contact. Please try again.");
    }
  };

  // Handle assign to user with alerts
  const handleAssignToUser = async () => {
    if (source === "middleman" && initialData && currentUserId) {
      try {
        const response = await api.post(`/api/assign/`, {
          assigned_by: currentUserId,
          assigned_to: initialData.events[0]?.created_by,
          event_id: initialData.events[0]?.event_id,
        });
        console.log("Assign to user response:", response.data);

        // Show success alert
        showAlert(
          "success",
          `${initialData.name} has been successfully assigned to user.`
        );

        // Navigate back after showing alert
        setTimeout(() => {
          navigate(-1);
        }, 1500);
      } catch (error) {
        console.log("Error assigning to user:", error);
        showAlert("error", "Failed to assign to user. Please try again.");
      }
    }
  };

  const handleReset = () => {
    if (!initialData) {
      setFormData({
        contact_id: "",
        assignment_id: null,
        name: "",
        dob: "",
        gender: "",
        nationality: "",
        marital_status: "",
        category: "",
        age: "",
        phone_number: "",
        secondary_phone_number: "",
        email_address: "",
        secondary_email: "",
        emergency_contact_name: "",
        emergency_contact_phone_number: "",
        emergency_contact_relationship: "",
        street: "",
        city: "",
        state: "",
        country: "",
        zipcode: "",
        education: {
          pg_course_name: "",
          pg_college: "",
          pg_university: "",
          pg_from_date: "",
          pg_to_date: "",
          ug_course_name: "",
          ug_college: "",
          ug_university: "",
          ug_from_date: "",
          ug_to_date: "",
        },
        skills: "",
        experience: [
          {
            job_title: "",
            company: "",
            department: "",
            from_date: "",
            to_date: "",
            company_skills: "",
          },
        ],
        event_id: "",
        event_name: "",
        event_role: "",
        event_date: "",
        event_held_organization: "",
        event_location: "",
        linkedin_url: "",
        logger: "",
      });
      return;
    }

    // Reset to initial data
    const formatDate = (dateString) => {
      if (!dateString) return "";
      return dateString.split("T")[0];
    };

    const firstEvent =
      initialData.events && initialData.events.length > 0
        ? initialData.events[0]
        : {};

    const formattedDob = formatDate(initialData.dob);
    const calculatedAge = formattedDob
      ? calculateAge(formattedDob)
      : initialData.age || "";

    setFormData({
      contact_id: initialData.contact_id || "",
      assignment_id: initialData.assignment_id || null,
      name: initialData.name || "",
      dob: formattedDob,
      gender: initialData.gender || "",
      nationality: initialData.nationality || "",
      marital_status: initialData.marital_status || "",
      category: initialData.category || "",
      age: calculatedAge,
      phone_number: initialData.phone_number || "",
      secondary_phone_number: initialData.secondary_phone_number || "",
      email_address: initialData.email_address || "",
      secondary_email: initialData.secondary_email || "",
      emergency_contact_name: initialData.emergency_contact_name || "",
      emergency_contact_phone_number:
        initialData.emergency_contact_phone_number || "",
      emergency_contact_relationship:
        initialData.emergency_contact_relationship || "",
      street: initialData.address?.street || "",
      city: initialData.address?.city || "",
      state: initialData.address?.state || "",
      country: initialData.address?.country || "",
      zipcode: initialData.address?.zipcode || "",
      education: {
        pg_course_name: initialData.education?.pg_course_name || "",
        pg_college: initialData.education?.pg_college || "",
        pg_university: initialData.education?.pg_university || "",
        pg_from_date: formatDate(initialData.education?.pg_from_date),
        pg_to_date: formatDate(initialData.education?.pg_to_date),
        ug_course_name: initialData.education?.ug_course_name || "",
        ug_college: initialData.education?.ug_college || "",
        ug_university: initialData.education?.ug_university || "",
        ug_from_date: formatDate(initialData.education?.ug_from_date),
        ug_to_date: formatDate(initialData.education?.ug_to_date),
      },
      skills: initialData.skills || "",
      linkedin_url: initialData.linkedin_url || "",
      event_id: firstEvent.event_id || "",
      event_name: firstEvent.event_name || "",
      event_role: firstEvent.event_role || "",
      event_date: formatDate(firstEvent.event_date),
      event_held_organization: firstEvent.event_held_organization || "",
      event_location: firstEvent.event_location || "",
      experience:
        Array.isArray(initialData.experiences) &&
          initialData.experiences.length > 0
          ? initialData.experiences.map((exp) => ({
            job_title: exp.job_title || "",
            company: exp.company || "",
            department: exp.department || "",
            from_date: formatDate(exp.from_date),
            to_date: formatDate(exp.to_date),
            company_skills: exp.company_skills || "",
          }))
          : [
            {
              job_title: "",
              company: "",
              department: "",
              from_date: "",
              to_date: "",
              company_skills: "",
            },
          ],
      logger: "",
      event_verified: true,
    });
  };

  const handleBack = () => {
    navigate(-1);
  };

  const renderField = (field, index) => (
    <div key={index} className="space-y-2">
      <label
        htmlFor={field.name}
        className="block text-sm font-medium text-gray-700"
      >
        {field.label}
      </label>
      {field.type === "select" ? (
        <select
          id={field.name}
          name={field.name}
          value={field.value}
          onChange={handleInputChange}
          required={field.label.includes("*")}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077b8]"
        >
          {field.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : field.type === "textarea" ? (
        <textarea
          id={field.name}
          name={field.name}
          value={field.value}
          placeholder={field.placeholder}
          onChange={handleInputChange}
          required={field.label.includes("*")}
          readOnly={field.readOnly || false}
          rows={3}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077b8] resize-vertical ${field.readOnly ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
        />
      ) : field.type === "date" ? (
        <DatePicker
          id={field.name}
          name={field.name}
          selected={field.value ? new Date(field.value) : null}
          onChange={(date) => {
            const event = {
              target: {
                name: field.name,
                value: date ? date.toISOString().split("T")[0] : "",
              },
            };
            handleInputChange(event);
          }}
          dateFormat="dd/MM/yyyy"
          placeholderText="Select date"
          showYearDropdown
          showMonthDropdown
          dropdownMode="select"
          yearDropdownItemNumber={100}
          scrollableYearDropdown
          maxDate={new Date()}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077b8]"
          calendarClassName="custom-datepicker"
          popperClassName="custom-datepicker-popper"
          required={field.label.includes("*")}
          readOnly={field.readOnly || false}
        />
      ) : (
        <input
          type={field.type}
          id={field.name}
          name={field.name}
          value={field.value}
          placeholder={field.placeholder}
          onKeyPress={
            field.name.includes("phone") ? handlePhoneKeyPress : undefined
          }
          inputMode={field.inputMode}
          onChange={handleInputChange}
          required={field.label.includes("*")}
          readOnly={field.readOnly || false}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077b8] ${field.readOnly ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
        />
      )}
    </div>
  );

  const renderEducationField = (field, index) => (
    <div key={index} className="space-y-2">
      <label
        htmlFor={field.name}
        className="block text-sm font-medium text-gray-700"
      >
        {field.label}
      </label>
      {field.type === "date" ? (
        <DatePicker
          id={field.name}
          name={field.name}
          selected={field.value ? new Date(field.value) : null}
          onChange={(date) => {
            const event = {
              target: {
                name: field.name,
                value: date ? date.toISOString().split("T")[0] : "",
              },
            };
            handleEducationChange(event);
          }}
          dateFormat="dd/MM/yyyy"
          placeholderText="Select date"
          showYearDropdown
          showMonthDropdown
          dropdownMode="select"
          yearDropdownItemNumber={30}
          scrollableYearDropdown
          maxDate={new Date()}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077b8]"
          calendarClassName="custom-datepicker"
          popperClassName="custom-datepicker-popper"
        />
      ) : (
        <input
          type={field.type}
          id={field.name}
          name={field.name}
          value={field.value}
          placeholder={field.placeholder}
          onChange={handleEducationChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077b8]"
        />
      )}
    </div>
  );

  const getTitle = () => {
    if (isAddMode) return "Verify & Add Contact Details";
    return "Contact Details";
  };

  const getDescription = () => {
    if (isAddMode)
      return "Review and complete the contact information before adding to verified contacts. Required fields are marked with an asterisk (*).";
    return "Fill in the comprehensive details. Required fields are marked with an asterisk (*).";
  };

  const getButtonText = () => {
    if (isAddMode) return "Verify & Add";
    return "Save Details";
  };

  const getButtonIcon = () => {
    if (isAddMode) return <Plus size={18} />;
    return <Save size={18} />;
  };

  const getButtonClass = () => {
    if (isAddMode) return "bg-green-600 hover:bg-green-700";
    return "bg-[#0077b8] hover:bg-[#005f8f]";
  };

  return (
    <div className="min-h-screen bg-[#F0F0F0] flex flex-col">
      {/* Alert Component */}
      <Alert
        isOpen={alert.isOpen}
        severity={alert.severity}
        message={alert.message}
        onClose={closeAlert}
        position="bottom"
        duration={4000}
      />

      {/* Header */}
      <div className="w-full bg-white shadow-sm border-b sticky top-0 z-50 border-gray-200">
        <div className="flex items-center justify-end">
          <div className="flex-shrink-0">
            <Header />
          </div>
        </div>
      </div>
     <div className="w-full container mx-auto px-4 md:px-6 pt-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors duration-200 bg-white hover:bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 shadow-sm mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium text-sm md:text-base">Back</span>
        </button>
      </div>
      {/* Main content area */}
      <div className="flex-1 overflow-auto">
        <form
          onSubmit={handleSubmit}
          className="w-full container mx-auto p-4 md:p-6"
        >
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm space-y-6 md:space-y-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-8 pr-0 md:pr-20">

              <div>
                <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2">
                  {getTitle()}
                </h2>
                <p className="text-gray-600 text-sm md:text-base">
                  {getDescription()}
                </p>
              </div>
              <div className="flex-shrink-0">
                {isAddMode && source === "middleman" && (
                  <button
                    type="button"
                    className="flex items-center gap-3 px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 transition-all duration-200 cursor-pointer group w-full md:w-auto justify-center md:justify-start"
                    onClick={handleAssignToUser}
                  >
                    <div className="w-2 h-2 bg-orange-400 rounded-full group-hover:bg-orange-500 transition-colors duration-200"></div>
                    <span className="text-sm text-orange-700 font-medium group-hover:text-orange-800 transition-colors duration-200">
                      Assign to user
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Personal Details Section */}
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-4 border-b border-blue-200 pb-2">
                Personal Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {personalDetails.map(renderField)}
              </div>
            </div>

            {/* Contact Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-4 border-b border-blue-200 pb-2">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contactInfo.map(renderField)}
              </div>
            </div>

            {/* Address Details Section */}
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-4 border-b border-blue-200 pb-2">
                Address Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {addressDetails.map(renderField)}
              </div>
            </div>

            {/* Emergency Contact Section */}
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-4 border-b border-blue-200 pb-2">
                Emergency Contact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {emergencyContact.map(renderField)}
              </div>
            </div>

            {/* Education Section */}
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-4 border-b border-blue-200 pb-2">
                Education
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {educationFields.map(renderEducationField)}
              </div>
            </div>

            {/* Skills Section */}
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-4 border-b border-blue-200 pb-2">
                Skills
              </h3>
              <div className="space-y-2">
                <label
                  htmlFor="skills"
                  className="block text-sm font-medium text-gray-700"
                >
                  General Skills
                </label>
                <textarea
                  id="skills"
                  name="skills"
                  value={formData.skills}
                  placeholder="Enter general skills, separated by commas (e.g., Python, Public Speaking, SEO)"
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077b8] resize-vertical"
                />
              </div>
            </div>

            {/* Experience Section */}
            <div>
              <div className="flex justify-between items-center mb-4 border-b border-blue-200 pb-2">
                <h3 className="text-lg font-semibold text-blue-800">
                  Experience
                </h3>
                <button
                  type="button"
                  onClick={addExperience}
                  className="flex items-center px-3 py-1.5 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md font-medium"
                >
                  <Plus size={16} className="mr-1" />
                  Add More
                </button>
              </div>
              <div className="space-y-6">
                {formData.experience.map((exp, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-gray-50/50 relative"
                  >
                    {formData.experience.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExperience(index)}
                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-100"
                        title="Remove Experience"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label
                          htmlFor={`job_title-${index}`}
                          className="block text-sm font-medium text-blue-700"
                        >
                          Job Title
                        </label>
                        <input
                          type="text"
                          name="job_title"
                          id={`job_title-${index}`}
                          value={exp.job_title}
                          onChange={(e) => handleExperienceChange(index, e)}
                          placeholder="e.g., Software Engineer"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077b8]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor={`company-${index}`}
                          className="block text-sm font-medium text-gray-700"
                        >
                          Company
                        </label>
                        <input
                          type="text"
                          name="company"
                          id={`company-${index}`}
                          value={exp.company}
                          onChange={(e) => handleExperienceChange(index, e)}
                          placeholder="e.g., Tech Solutions Inc."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077b8]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor={`department-${index}`}
                          className="block text-sm font-medium text-gray-700"
                        >
                          Department
                        </label>
                        <input
                          type="text"
                          name="department"
                          id={`department-${index}`}
                          value={exp.department}
                          onChange={(e) => handleExperienceChange(index, e)}
                          placeholder="e.g., Product Development"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077b8]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor={`from_date-${index}`}
                          className="block text-sm font-medium text-gray-700"
                        >
                          From Date
                        </label>
                        <DatePicker
                          name="from_date"
                          id={`from_date-${index}`}
                          selected={
                            exp.from_date ? new Date(exp.from_date) : null
                          }
                          onChange={(date) => {
                            const event = {
                              target: {
                                name: "from_date",
                                value: date
                                  ? date.toISOString().split("T")[0]
                                  : "",
                              },
                            };
                            handleExperienceChange(index, event);
                          }}
                          dateFormat="dd/MM/yyyy"
                          placeholderText="Select start date"
                          showYearDropdown
                          showMonthDropdown
                          dropdownMode="select"
                          yearDropdownItemNumber={50}
                          scrollableYearDropdown
                          maxDate={new Date()}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077b8]"
                          calendarClassName="custom-datepicker"
                          popperClassName="custom-datepicker-popper"
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor={`to_date-${index}`}
                          className="block text-sm font-medium text-gray-700"
                        >
                          To Date
                        </label>
                        <DatePicker
                          name="to_date"
                          id={`to_date-${index}`}
                          selected={exp.to_date ? new Date(exp.to_date) : null}
                          onChange={(date) => {
                            const event = {
                              target: {
                                name: "to_date",
                                value: date
                                  ? date.toISOString().split("T")[0]
                                  : "",
                              },
                            };
                            handleExperienceChange(index, event);
                          }}
                          dateFormat="dd/MM/yyyy"
                          placeholderText="Select end date"
                          showYearDropdown
                          showMonthDropdown
                          dropdownMode="select"
                          yearDropdownItemNumber={50}
                          scrollableYearDropdown
                          maxDate={new Date()}
                          minDate={
                            exp.from_date ? new Date(exp.from_date) : null
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077b8]"
                          calendarClassName="custom-datepicker"
                          popperClassName="custom-datepicker-popper"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2 lg:col-span-1">
                        <label
                          htmlFor={`company_skills-${index}`}
                          className="block text-sm font-medium text-gray-700"
                        >
                          Job-specific Skills
                        </label>
                        <textarea
                          name="company_skills"
                          id={`company_skills-${index}`}
                          value={exp.company_skills}
                          onChange={(e) => handleExperienceChange(index, e)}
                          rows="1"
                          placeholder="e.g., React, Node.js"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077b8] resize-vertical"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Event Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-4 border-b border-blue-200 pb-2">
                Event Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {additionalInfo.map(renderField)}
              </div>
            </div>

            {/* Notes/Logger Section */}
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-4 border-b border-blue-200 pb-2">
                Notes / Logger
              </h3>
              <div className="space-y-2">
                <label
                  htmlFor="logger"
                  className="block text-sm font-medium text-gray-700"
                >
                  {isAddMode ? "Verification Notes" : "Add a note"}
                </label>
                <textarea
                  id="logger"
                  name="logger"
                  value={formData.logger}
                  placeholder={
                    isAddMode
                      ? "Add any verification notes or comments about this contact."
                      : "Log an interaction, comment, or any other relevant information."
                  }
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077b8] resize-vertical"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col pt-4 sm:flex-row gap-4 justify-end">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2 flex items-center justify-center gap-x-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
              >
                <RotateCcw size={18} />
                Reset Form
              </button>
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-2 flex items-center justify-center gap-x-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-6 py-2 flex items-center justify-center gap-x-1.5 text-white rounded-lg transition-colors font-medium ${getButtonClass()}`}
              >
                {getButtonIcon()}
                {getButtonText()}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DetailsInput;
