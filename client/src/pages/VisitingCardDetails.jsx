import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/axios";
import Alert from "../components/Alert";
import {
  ArrowLeft,
  Zap,
  Save,
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  Briefcase,
  Eye,
  Check,
  X,
  Download,
  Share2,
  Clock,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Globe,
  Heart,
  GraduationCap,
  Award,
  Users,
  FileText,
  Plus,
  Trash2,
} from "lucide-react";

const VisitingCardDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isExtracting, setIsExtracting] = useState(false);
  const [isExtracted, setIsExtracted] = useState(false);
  const [currentCard, setCurrentCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Alert state
  const [alert, setAlert] = useState({
    isOpen: false,
    severity: "success",
    message: "",
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

  const [visitingCardDetails, setVisitingCardDetails] = useState({
    //contact_id
    contact_id: "",

    // Personal Details
    name: "",
    dob: "",
    gender: "",
    nationality: "",
    marital_status: "",
    category: "",
    age: "",

    // Contact Information
    phone_number: "",
    secondary_phone_number: "",
    email_address: "",
    secondary_email: "",

    // Emergency Contact
    emergency_contact_name: "",
    emergency_contact_phone_number: "",
    emergency_contact_relationship: "",

    // Address Details
    street: "",
    city: "",
    state: "",
    country: "",
    zipcode: "",

    // Education
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

    // NEW: General Skills
    skills: "",

    // Experience - An array
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

    // Additional Information (focused on events)
    event_id: "",
    event_name: "",
    event_role: "",
    event_date: "",
    event_held_organization: "",
    event_location: "",
    linkedin_url: "",
    verified: true,

    // NEW: Logger for notes
    logger: "",
  });

  // Fetch the specific visiting card data
  useEffect(() => {
    const fetchCardDetails = async () => {
      try {
        setLoading(true);

        // Fetch all cards and find the one with matching ID
        const response = await api.get(`/api/get-unverified-images/`);

        const card = response.data.data?.find((card) => {
          return card.id.toString() === id.toString();
        });

        setCurrentCard(card);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching cards:", error);
        setLoading(false);
      }
    };

    if (id) {
      fetchCardDetails();
    }
  }, [id]);

  // Handle keyboard events for modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && isModalOpen) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  const [extractedData, setExtractedData] = useState({
    name: "THOMAS SMITH",
    phone_number: "+1 (555) 123-4567",
    email_address: "thomas.smith@techcorp.com",
    city: "San Francisco",
    state: "CA",
    country: "USA",
  });

  const steps = [
    {
      id: 0,
      title: "Personal Details",
      shortTitle: "Personal",
      icon: User,
      fields: [
        "name",
        "dob",
        "gender",
        "nationality",
        "marital_status",
        "category",
        "age",
      ],
    },
    {
      id: 1,
      title: "Contact Information",
      shortTitle: "Contact",
      icon: Phone,
      fields: [
        "phone_number",
        "secondary_phone_number",
        "email_address",
        "secondary_email",
      ],
    },
    {
      id: 2,
      title: "Emergency Contact",
      shortTitle: "Emergency",
      icon: Heart,
      fields: [
        "emergency_contact_name",
        "emergency_contact_phone_number",
        "emergency_contact_relationship",
      ],
    },
    {
      id: 3,
      title: "Address Details",
      shortTitle: "Address",
      icon: MapPin,
      fields: ["street", "city", "state", "country", "zipcode"],
    },
    {
      id: 4,
      title: "Education",
      shortTitle: "Education",
      icon: GraduationCap,
      fields: [
        "pg_course_name",
        "pg_college",
        "pg_university",
        "pg_from_date",
        "pg_to_date",
        "ug_course_name",
        "ug_college",
        "ug_university",
        "ug_from_date",
        "ug_to_date",
      ],
    },
    {
      id: 5,
      title: "Skills & Experience",
      shortTitle: "Experience",
      icon: Award,
      fields: ["skills", "experience"],
    },
    {
      id: 6,
      title: "Event Details",
      shortTitle: "Events",
      icon: Calendar,
      fields: [
        "event_id",
        "event_name",
        "event_role",
        "event_date",
        "event_held_organization",
        "event_location",
        "linkedin_url",
      ],
    },
    {
      id: 7,
      title: "Notes & Review",
      shortTitle: "Review",
      icon: FileText,
      fields: ["logger"],
    },
  ];

  const handleExtract = () => {
    setIsExtracting(true);
    setTimeout(() => {
      setVisitingCardDetails((prev) => ({
        ...prev,
        ...extractedData,
      }));
      setIsExtracting(false);
      setIsExtracted(true);
    }, 2500);
  };

  const handleInputChange = (field, value) => {
    setVisitingCardDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleExperienceChange = (index, field, value) => {
    setVisitingCardDetails((prev) => ({
      ...prev,
      experience: prev.experience.map((exp, i) =>
        i === index ? { ...exp, [field]: value } : exp
      ),
    }));
  };

  const addExperience = () => {
    setVisitingCardDetails((prev) => ({
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
    if (visitingCardDetails.experience.length > 1) {
      setVisitingCardDetails((prev) => ({
        ...prev,
        experience: prev.experience.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSave = async () => {
    try {
      console.log("Original visiting card details:", visitingCardDetails);

      // Transform the flat structure into the nested structure expected by the API
      const transformedData = {
        // Main contact details
        name: visitingCardDetails.name,
        phone_number: visitingCardDetails.phone_number,
        email_address: visitingCardDetails.email_address,
        dob: visitingCardDetails.dob,
        gender: visitingCardDetails.gender,
        nationality: visitingCardDetails.nationality,
        marital_status: visitingCardDetails.marital_status,
        category: visitingCardDetails.category,
        secondary_email: visitingCardDetails.secondary_email,
        secondary_phone_number: visitingCardDetails.secondary_phone_number,
        created_by: 1, // You may want to get this from auth context
        emergency_contact_name: visitingCardDetails.emergency_contact_name,
        emergency_contact_relationship:
          visitingCardDetails.emergency_contact_relationship,
        emergency_contact_phone_number:
          visitingCardDetails.emergency_contact_phone_number,
        skills: visitingCardDetails.skills,
        logger: visitingCardDetails.logger,
        linkedin_url: visitingCardDetails.linkedin_url,

        // Nested address object
        address: {
          street: visitingCardDetails.street,
          city: visitingCardDetails.city,
          state: visitingCardDetails.state,
          country: visitingCardDetails.country,
          zipcode: visitingCardDetails.zipcode,
        },

        // Nested education object
        education: {
          pg_course_name: visitingCardDetails.pg_course_name,
          pg_college: visitingCardDetails.pg_college,
          pg_university: visitingCardDetails.pg_university,
          pg_from_date: visitingCardDetails.pg_from_date,
          pg_to_date: visitingCardDetails.pg_to_date,
          ug_course_name: visitingCardDetails.ug_course_name,
          ug_college: visitingCardDetails.ug_college,
          ug_university: visitingCardDetails.ug_university,
          ug_from_date: visitingCardDetails.ug_from_date,
          ug_to_date: visitingCardDetails.ug_to_date,
        },

        // Experiences array (keeping the existing structure)
        experiences: visitingCardDetails.experience,

        // Events array - transform from flat fields to object array
        events: visitingCardDetails.event_name
          ? [
              {
                event_name: visitingCardDetails.event_name,
                event_role: visitingCardDetails.event_role,
                event_date: visitingCardDetails.event_date,
                event_held_organization:
                  visitingCardDetails.event_held_organization,
                event_location: visitingCardDetails.event_location,
                verified: true,
              },
            ]
          : [],
      };

      console.log("Transformed data for API:", transformedData);

      const response = await api.post("/api/create-contact", transformedData);
      const response2 = await api.post(
        `/api/verify-image/${id}`,
        transformedData
      );

      console.log("Contact created successfully:", response.data);

      // Show success notification with alert modal
      showAlert("success", "Contact has been successfully verified and saved!");

      // Navigate back to records page after a short delay
      setTimeout(() => {
        navigate("/verify-records", {
          state: { view: "visitingCards" },
        });
      }, 2000);
    } catch (error) {
      console.error("Error creating contact:", error);

      // Show error message with alert modal
      if (error.response?.data?.message) {
        showAlert("error", `Error: ${error.response.data.message}`);
      } else {
        showAlert("error", "Failed to save contact. Please try again.");
      }
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex) => {
    setCurrentStep(stepIndex);
  };

  const getStepStatus = (stepIndex) => {
    if (stepIndex < currentStep) return "completed";
    if (stepIndex === currentStep) return "current";
    return "upcoming";
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Personal Details
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={visitingCardDetails.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      isExtracted && extractedData.name
                        ? "bg-blue-50 border-blue-200"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter full name"
                  />
                  {isExtracted && extractedData.name && (
                    <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={visitingCardDetails.dob}
                    onChange={(e) => handleInputChange("dob", e.target.value)}
                    className="w-full pl-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  value={visitingCardDetails.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                  className="w-full py-3 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter age"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  value={visitingCardDetails.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                  className="w-full py-3 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nationality
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={visitingCardDetails.nationality}
                    onChange={(e) =>
                      handleInputChange("nationality", e.target.value)
                    }
                    className="w-full pl-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter nationality"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marital Status
                </label>
                <select
                  value={visitingCardDetails.marital_status}
                  onChange={(e) =>
                    handleInputChange("marital_status", e.target.value)
                  }
                  className="w-full py-3 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Status</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={visitingCardDetails.category}
                  onChange={(e) =>
                    handleInputChange("category", e.target.value)
                  }
                  className="w-full py-3 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter category"
                />
              </div>
            </div>
          </div>
        );

      case 1: // Contact Information
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Phone <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={visitingCardDetails.phone_number}
                    onChange={(e) =>
                      handleInputChange("phone_number", e.target.value)
                    }
                    className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      isExtracted && extractedData.phone_number
                        ? "bg-blue-50 border-blue-200"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter primary phone"
                  />
                  {isExtracted && extractedData.phone_number && (
                    <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={visitingCardDetails.secondary_phone_number}
                    onChange={(e) =>
                      handleInputChange(
                        "secondary_phone_number",
                        e.target.value
                      )
                    }
                    className="w-full pl-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter secondary phone"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={visitingCardDetails.email_address}
                    onChange={(e) =>
                      handleInputChange("email_address", e.target.value)
                    }
                    className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      isExtracted && extractedData.email_address
                        ? "bg-blue-50 border-blue-200"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter primary email"
                  />
                  {isExtracted && extractedData.email_address && (
                    <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={visitingCardDetails.secondary_email}
                    onChange={(e) =>
                      handleInputChange("secondary_email", e.target.value)
                    }
                    className="w-full pl-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter secondary email"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2: // Emergency Contact
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={visitingCardDetails.emergency_contact_name}
                    onChange={(e) =>
                      handleInputChange(
                        "emergency_contact_name",
                        e.target.value
                      )
                    }
                    className="w-full pl-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter emergency contact name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={visitingCardDetails.emergency_contact_phone_number}
                    onChange={(e) =>
                      handleInputChange(
                        "emergency_contact_phone_number",
                        e.target.value
                      )
                    }
                    className="w-full pl-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter contact phone"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relationship
                </label>
                <div className="relative">
                  <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={visitingCardDetails.emergency_contact_relationship}
                    onChange={(e) =>
                      handleInputChange(
                        "emergency_contact_relationship",
                        e.target.value
                      )
                    }
                    className="w-full pl-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Spouse, Parent, Sibling"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3: // Address Details
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    value={visitingCardDetails.street}
                    onChange={(e) =>
                      handleInputChange("street", e.target.value)
                    }
                    className="w-full pl-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={3}
                    placeholder="Enter street address"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={visitingCardDetails.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className={`w-full py-3 px-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    isExtracted && extractedData.city
                      ? "bg-blue-50 border-blue-200"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State/Province
                </label>
                <input
                  type="text"
                  value={visitingCardDetails.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  className={`w-full py-3 px-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    isExtracted && extractedData.state
                      ? "bg-blue-50 border-blue-200"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter state/province"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={visitingCardDetails.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  className={`w-full py-3 px-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    isExtracted && extractedData.country
                      ? "bg-blue-50 border-blue-200"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter country"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP/Postal Code
                </label>
                <input
                  type="text"
                  value={visitingCardDetails.zipcode}
                  onChange={(e) => handleInputChange("zipcode", e.target.value)}
                  className="w-full py-3 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter ZIP/postal code"
                />
              </div>
            </div>
          </div>
        );

      case 4: // Education
        return (
          <div className="space-y-8">
            {/* Post Graduate */}
            <div className="space-y-6">
              <h4 className="text-md font-medium text-gray-800 border-b border-gray-200 pb-2">
                Post Graduate Education
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Name
                  </label>
                  <input
                    type="text"
                    value={visitingCardDetails.pg_course_name}
                    onChange={(e) =>
                      handleInputChange("pg_course_name", e.target.value)
                    }
                    className="w-full py-3 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Master of Science in Computer Science"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    College/Institute
                  </label>
                  <input
                    type="text"
                    value={visitingCardDetails.pg_college}
                    onChange={(e) =>
                      handleInputChange("pg_college", e.target.value)
                    }
                    className="w-full py-3 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter college name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    University
                  </label>
                  <input
                    type="text"
                    value={visitingCardDetails.pg_university}
                    onChange={(e) =>
                      handleInputChange("pg_university", e.target.value)
                    }
                    className="w-full py-3 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter university name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={visitingCardDetails.pg_from_date}
                    onChange={(e) =>
                      handleInputChange("pg_from_date", e.target.value)
                    }
                    className="w-full py-3 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={visitingCardDetails.pg_to_date}
                    onChange={(e) =>
                      handleInputChange("pg_to_date", e.target.value)
                    }
                    className="w-full py-3 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Under Graduate */}
            <div className="space-y-6">
              <h4 className="text-md font-medium text-gray-800 border-b border-gray-200 pb-2">
                Under Graduate Education
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Name
                  </label>
                  <input
                    type="text"
                    value={visitingCardDetails.ug_course_name}
                    onChange={(e) =>
                      handleInputChange("ug_course_name", e.target.value)
                    }
                    className="w-full py-3 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Bachelor of Technology"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    College/Institute
                  </label>
                  <input
                    type="text"
                    value={visitingCardDetails.ug_college}
                    onChange={(e) =>
                      handleInputChange("ug_college", e.target.value)
                    }
                    className="w-full py-3 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter college name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    University
                  </label>
                  <input
                    type="text"
                    value={visitingCardDetails.ug_university}
                    onChange={(e) =>
                      handleInputChange("ug_university", e.target.value)
                    }
                    className="w-full py-3 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter university name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={visitingCardDetails.ug_from_date}
                    onChange={(e) =>
                      handleInputChange("ug_from_date", e.target.value)
                    }
                    className="w-full py-3 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={visitingCardDetails.ug_to_date}
                    onChange={(e) =>
                      handleInputChange("ug_to_date", e.target.value)
                    }
                    className="w-full py-3 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 5: // Skills & Experience
        return (
          <div className="space-y-8">
            {/* Skills */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-800">
                General Skills
              </h4>
              <textarea
                value={visitingCardDetails.skills}
                onChange={(e) => handleInputChange("skills", e.target.value)}
                className="w-full py-3 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={4}
                placeholder="List your skills separated by commas (e.g., JavaScript, React, Node.js, Python, Project Management)"
              />
            </div>

            {/* Experience */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-md font-medium text-gray-800">
                  Professional Experience
                </h4>
                <button
                  type="button"
                  onClick={addExperience}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Experience</span>
                </button>
              </div>

              {visitingCardDetails.experience.map((exp, index) => (
                <div
                  key={index}
                  className="p-6 border border-gray-200 rounded-lg space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-medium text-gray-700">
                      Experience #{index + 1}
                    </h5>
                    {visitingCardDetails.experience.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExperience(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Job Title
                      </label>
                      <input
                        type="text"
                        value={exp.job_title}
                        onChange={(e) =>
                          handleExperienceChange(
                            index,
                            "job_title",
                            e.target.value
                          )
                        }
                        className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Software Engineer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company
                      </label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) =>
                          handleExperienceChange(
                            index,
                            "company",
                            e.target.value
                          )
                        }
                        className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Company name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department
                      </label>
                      <input
                        type="text"
                        value={exp.department}
                        onChange={(e) =>
                          handleExperienceChange(
                            index,
                            "department",
                            e.target.value
                          )
                        }
                        className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Department/Team"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Skills
                      </label>
                      <input
                        type="text"
                        value={exp.company_skills}
                        onChange={(e) =>
                          handleExperienceChange(
                            index,
                            "company_skills",
                            e.target.value
                          )
                        }
                        className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Skills used at this company"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        From Date
                      </label>
                      <input
                        type="date"
                        value={exp.from_date}
                        onChange={(e) =>
                          handleExperienceChange(
                            index,
                            "from_date",
                            e.target.value
                          )
                        }
                        className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        To Date
                      </label>
                      <input
                        type="date"
                        value={exp.to_date}
                        onChange={(e) =>
                          handleExperienceChange(
                            index,
                            "to_date",
                            e.target.value
                          )
                        }
                        className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 6: // Event Details
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event ID
                </label>
                <input
                  type="text"
                  value={visitingCardDetails.event_id}
                  onChange={(e) =>
                    handleInputChange("event_id", e.target.value)
                  }
                  className="w-full py-3 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter event ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Name
                </label>
                <input
                  type="text"
                  value={visitingCardDetails.event_name}
                  onChange={(e) =>
                    handleInputChange("event_name", e.target.value)
                  }
                  className="w-full py-3 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter event name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Role
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={visitingCardDetails.event_role}
                    onChange={(e) =>
                      handleInputChange("event_role", e.target.value)
                    }
                    className="w-full pl-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your role in the event"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={visitingCardDetails.event_date}
                    onChange={(e) =>
                      handleInputChange("event_date", e.target.value)
                    }
                    className="w-full pl-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organizing Body
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={visitingCardDetails.event_held_organization}
                    onChange={(e) =>
                      handleInputChange(
                        "event_held_organization",
                        e.target.value
                      )
                    }
                    className="w-full pl-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Organization that held the event"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={visitingCardDetails.event_location}
                    onChange={(e) =>
                      handleInputChange("event_location", e.target.value)
                    }
                    className="w-full pl-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Event location"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn Profile URL
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    value={visitingCardDetails.linkedin_url}
                    onChange={(e) =>
                      handleInputChange("linkedin_url", e.target.value)
                    }
                    className="w-full pl-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 7: // Notes & Review
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes/Logger
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  value={visitingCardDetails.logger}
                  onChange={(e) => handleInputChange("logger", e.target.value)}
                  className="w-full pl-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={6}
                  placeholder="Add any additional notes, observations, or important information..."
                />
              </div>
            </div>

            {/* Review Summary */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-md font-medium text-gray-800 mb-4">
                Form Completion Summary
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Personal Details:</span>
                  <span
                    className={
                      visitingCardDetails.name
                        ? "text-green-600 font-medium"
                        : "text-gray-400"
                    }
                  >
                    {visitingCardDetails.name ? "✓ Complete" : "Incomplete"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Contact Info:</span>
                  <span
                    className={
                      visitingCardDetails.phone_number &&
                      visitingCardDetails.email_address
                        ? "text-green-600 font-medium"
                        : "text-gray-400"
                    }
                  >
                    {visitingCardDetails.phone_number &&
                    visitingCardDetails.email_address
                      ? "✓ Complete"
                      : "Incomplete"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Emergency Contact:</span>
                  <span
                    className={
                      visitingCardDetails.emergency_contact_name
                        ? "text-green-600 font-medium"
                        : "text-gray-400"
                    }
                  >
                    {visitingCardDetails.emergency_contact_name
                      ? "✓ Complete"
                      : "Incomplete"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Address:</span>
                  <span
                    className={
                      visitingCardDetails.city && visitingCardDetails.state
                        ? "text-green-600 font-medium"
                        : "text-gray-400"
                    }
                  >
                    {visitingCardDetails.city && visitingCardDetails.state
                      ? "✓ Complete"
                      : "Incomplete"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Education:</span>
                  <span
                    className={
                      visitingCardDetails.ug_course_name ||
                      visitingCardDetails.pg_course_name
                        ? "text-green-600 font-medium"
                        : "text-gray-400"
                    }
                  >
                    {visitingCardDetails.ug_course_name ||
                    visitingCardDetails.pg_course_name
                      ? "✓ Complete"
                      : "Incomplete"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Experience:</span>
                  <span
                    className={
                      visitingCardDetails.experience[0].job_title
                        ? "text-green-600 font-medium"
                        : "text-gray-400"
                    }
                  >
                    {visitingCardDetails.experience[0].job_title
                      ? "✓ Complete"
                      : "Incomplete"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading visiting card...</p>
        </div>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Card Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The requested visiting card with ID "{id}" could not be found.
          </p>
          <button
            onClick={() => {
              console.log("Navigating with state:", { view: "visitingCards" });
              navigate("/verify-records", { state: { view: "visitingCards" } });
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Records
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Alert Component */}
      <Alert
        isOpen={alert.isOpen}
        severity={alert.severity}
        message={alert.message}
        onClose={closeAlert}
        position="top"
        duration={4000}
      />

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  console.log("Navigating with state:", {
                    view: "visitingCards",
                  });
                  navigate("/verify-records", {
                    state: { view: "visitingCards" },
                  });
                }}
                className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Visiting Card Extraction
                </h1>
                <p className="text-sm text-gray-500">
                  Extract and manage contact information - Card ID: {id}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Visiting Card
                </h2>
                <div className="relative bg-gray-50 rounded-lg p-6 mb-6">
                  <div
                    className="aspect-[4/3] bg-white rounded-md shadow-sm border overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200"
                    onClick={() => setIsModalOpen(true)}
                  >
                    {currentCard?.file_path ? (
                      <img
                        src={`http://localhost:8000/${currentCard.file_path.replace(
                          /\\/g,
                          "/"
                        )}`}
                        alt="Visiting Card"
                        className="w-full h-full object-contain hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          e.target.src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 240'%3E%3Crect width='400' height='240' fill='%23f5f5f5'/%3E%3Ctext x='200' y='120' text-anchor='middle' fill='%23999' font-family='Arial' font-size='14'%3EImage not found%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <p className="text-gray-500 text-sm">
                          No card image available
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="text-center mt-2">
                    <p className="text-xs text-gray-500 flex items-center justify-center">
                      <Eye className="w-3 h-3 mr-1" />
                      Click image to enlarge
                    </p>
                  </div>
                </div>

                {/* Extract Button */}
                <button
                  onClick={handleExtract}
                  disabled={isExtracting}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                    isExtracting
                      ? "bg-blue-500 text-white cursor-not-allowed"
                      : isExtracted
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {isExtracting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Extracting...</span>
                    </div>
                  ) : isExtracted ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Check className="w-4 h-4" />
                      <span>Extraction Complete</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Zap className="w-4 h-4" />
                      <span>Extract Information</span>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Extraction Results */}
            {isExtracted && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Extraction Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600">
                        Confidence Level
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full">
                          <div
                            className="w-15 h-2 bg-green-500 rounded-full"
                            style={{ width: "94%" }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-green-600">
                          94%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600">
                        Fields Extracted
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        5 of 7
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600">
                        Processing Time
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        2.1s
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Form with Stepper */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              {/* Horizontal Stepper */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  {steps.map((step, index) => {
                    const status = getStepStatus(index);
                    const Icon = step.icon;

                    return (
                      <div key={step.id} className="flex items-center">
                        {/* Step Circle */}
                        <button
                          onClick={() => goToStep(index)}
                          className={`relative flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                            status === "completed"
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : status === "current"
                              ? "bg-blue-100 text-blue-600 border-2 border-blue-600"
                              : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                          }`}
                        >
                          {status === "completed" ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <Icon className="w-5 h-5" />
                          )}
                        </button>

                        {/* Step Connector */}
                        {index < steps.length - 1 && (
                          <div
                            className={`h-0.5 w-8 mx-2 ${
                              index < currentStep
                                ? "bg-blue-600"
                                : "bg-gray-200"
                            }`}
                          ></div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Step Labels */}
                <div className="flex items-center justify-between mt-3">
                  {steps.map((step, index) => {
                    const status = getStepStatus(index);

                    return (
                      <div key={step.id} className="flex items-center">
                        <div className="text-center">
                          <p
                            className={`text-xs font-medium ${
                              status === "current"
                                ? "text-blue-600"
                                : status === "completed"
                                ? "text-blue-600"
                                : "text-gray-400"
                            }`}
                          >
                            {step.shortTitle}
                          </p>
                        </div>
                        {index < steps.length - 1 && (
                          <div className="w-8 mx-2"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Form Content */}
              <div className="p-6">
                {/* Step Title */}
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {steps[currentStep].title}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Step {currentStep + 1} of {steps.length}
                  </p>
                </div>

                {/* Step Content */}
                <div className="min-h-[500px]">{renderStepContent()}</div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-8">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className={`flex items-center space-x-2 px-6 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      currentStep === 0
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-50 border border-gray-300"
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <div className="flex space-x-3">
                    {currentStep === steps.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => {
                          handleSave();
                        }}
                        className="flex items-center space-x-2 px-6 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Contact</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={nextStep}
                        className="flex items-center space-x-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Image Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent backdrop-blur-sm">
          {/* Modal Backdrop */}
          <div
            className="absolute inset-0 bg-transparent"
            onClick={() => setIsModalOpen(false)}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white rounded-lg shadow-2xl max-w-4xl max-h-[90vh] w-full overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Visiting Card - Enlarged View
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="flex justify-center">
                {currentCard?.file_path ? (
                  <img
                    src={`http://localhost:8000/${currentCard.file_path.replace(
                      /\\/g,
                      "/"
                    )}`}
                    alt="Visiting Card - Enlarged"
                    className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                    onError={(e) => {
                      e.target.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 240'%3E%3Crect width='400' height='240' fill='%23f5f5f5'/%3E%3Ctext x='200' y='120' text-anchor='middle' fill='%23999' font-family='Arial' font-size='14'%3EImage not found%3C/text%3E%3C/svg%3E";
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                    <p className="text-gray-500">No card image available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-600">
                Card ID: {id} • Click outside or press X to close
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitingCardDetails;
