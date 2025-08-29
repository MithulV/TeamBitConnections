import React, { useState, useEffect } from "react";
import { Search, ChevronDown, Trash2, X, Grid3X3 } from "lucide-react";
import ContactCard from "../components/MiddleManCard";
import DetailsInput from "../components/DetailsInput";
import Header from "../components/Header";
import { useAuthStore } from "../store/AuthStore";
import axios from "axios";
import Alert from "../components/Alert";

// Helper function to generate initials from a name
const getInitials = (name = "") => {
  if (!name) return "";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

// Helper function to assign a consistent color based on the contact's ID
const colors = [
  "#4F46E5", // Indigo
  "#DC2626", // Red
  "#059669", // Green
  "#7C3AED", // Violet
  "#D97706", // Amber
  "#DB2777", // Pink
  "#0891B2", // Cyan
];

const getAvatarColor = (id) => {
  if (!id) return colors[0];
  return colors[id % colors.length];
};

// Delete Confirmation Modal Component with Loading State
const DeleteConfirmationModal = ({
  isOpen,
  onConfirm,
  onCancel,
  itemName = "this contact",
  isDeleting = false,
}) => {
  if (!isOpen) return null;

  // Handle confirm with proper event handling
  const handleConfirm = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Modal confirm button clicked");
    onConfirm();
  };

  // Handle cancel with proper event handling
  const handleCancel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Modal cancel button clicked");
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!isDeleting ? handleCancel : undefined} // Prevent closing during deletion
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-start gap-3 p-6 pb-4">
          <div className="flex items-center justify-center w-10 h-10 bg-orange-50 rounded-full flex-shrink-0 mt-1">
            <svg
              className="w-6 h-6 text-orange-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-medium text-gray-900 mb-1">
              Confirm Delete
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <p className="text-gray-600 text-sm leading-relaxed pl-13">
            Are you sure you want to delete {itemName}? This will permanently
            remove the contact and all associated data.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 px-6 pb-6">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isDeleting}
            className="px-6 py-2 text-sm font-medium text-blue-600 bg-transparent border-none rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="px-6 py-2 text-sm font-medium text-red-600 bg-transparent border-none rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-all duration-200 uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[100px]"
          >
            {isDeleting ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-red-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  ></path>
                </svg>
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const MiddleManHome = () => {
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isGridModalOpen, setIsGridModalOpen] = useState(false);

  // Filter states
  const [activeFilters, setActiveFilters] = useState({
    skills: [],
    gender: [],
    nationality: [],
    marital_status: [],
    age: [],
    city: [],
    state: [],
    country: [],
    pg_course_name: [],
    pg_college: [],
    pg_university: [],
    ug_course_name: [],
    ug_college: [],
    ug_university: [],
    job_title: [],
    company: [],
    department: [],
    event_name: [],
  });
  const [expandedSections, setExpandedSections] = useState({});

  // Delete modal states with loading
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false); // Add isDeleting state
  const [alert, setAlert] = useState({
    isOpen: false,
    severity: "success",
    message: "",
  });

  const { role } = useAuthStore();

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

  // Fetch contacts
  useEffect(() => {
    const getCategoryContacts = async () => {
      if (!role) return;

      const rolesDict = { cata: "A", catb: "B", catc: "C" };
      const category = rolesDict[role];

      if (!category) {
        console.error("Invalid role for fetching contacts:", role);
        showAlert("error", "Invalid role for fetching contacts");
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:8000/api/get-contacts-by-category/?category=${category}`
        );

        const formattedContacts = response.data.map((item) => ({
          ...item,
          role: item.experiences?.[0]?.job_title || "N/A",
          company: item.experiences?.[0]?.company || "N/A",
          location:
            `${item.address?.city || ""}, ${
              item.address?.state || ""
            }`.trim() === ","
              ? "N/A"
              : `${item.address?.city || ""}, ${item.address?.state || ""}`,
          skills: item.skills
            ? item.skills.split(",").map((skill) => skill.trim())
            : [],
          initials: getInitials(item.name),
          avatarColor: getAvatarColor(item.contact_id),
        }));

        setContacts(formattedContacts);
      } catch (error) {
        console.error("Failed to fetch contacts:", error);
        showAlert("error", "Failed to fetch contacts. Please try again.");
      }
    };

    getCategoryContacts();
  }, [role]);

  // Filter logic - only search term filtering
  const filteredContacts = contacts.filter((contact) => {
    const searchTermLower = searchTerm.toLowerCase();
    const skillsString = Array.isArray(contact.skills)
      ? contact.skills.join(" ").toLowerCase()
      : "";

    const matchesSearch =
      contact.name?.toLowerCase().includes(searchTermLower) ||
      contact.company?.toLowerCase().includes(searchTermLower) ||
      contact.role?.toLowerCase().includes(searchTermLower) ||
      skillsString.includes(searchTermLower);

    return matchesSearch;
  });

  // Edit handlers
  const handleEditClick = (user) => {
    setEditingUser(user || null);
    setIsEditing(true);
  };

  const handleEditComplete = async (updatedData) => {
    try {
      console.log("Saving data:", updatedData);

      const response = await axios.put(
        `http://localhost:8000/api/update-contact/${updatedData.contact_id}`,
        updatedData
      );

      console.log("Update response:", response);

      setContacts((prevContacts) =>
        prevContacts.map((contact) =>
          contact.contact_id === updatedData.contact_id
            ? { ...contact, ...updatedData }
            : contact
        )
      );

      showAlert(
        "success",
        `${updatedData.name} has been successfully updated.`
      );
      setIsEditing(false);
      setEditingUser(null);
    } catch (error) {
      console.error("Failed to update contact:", error);
      showAlert("error", "Failed to update contact. Please try again.");
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditingUser(null);
  };

  // Delete handlers with loading state
  const handleDeleteClick = (contact) => {
    console.log("Delete button clicked for contact:", contact);
    setContactToDelete(contact);
    setShowDeleteModal(true);
  };

  // Updated delete confirmation with loading state
  const handleDeleteConfirm = async () => {
    console.log("Delete confirmed for:", contactToDelete);

    if (!contactToDelete) {
      console.log("No contact to delete");
      return;
    }

    setIsDeleting(true); // Start loading

    try {
      console.log(
        "Making API call to delete contact:",
        contactToDelete.contact_id
      );

      await axios.delete(
        `http://localhost:8000/api/delete-contact/${contactToDelete.contact_id}/`
      );

      console.log("Delete successful, updating state");

      // Update state
      setContacts((prevContacts) =>
        prevContacts.filter(
          (contact) => contact.contact_id !== contactToDelete.contact_id
        )
      );

      showAlert(
        "success",
        `${contactToDelete.name} has been successfully deleted.`
      );
    } catch (error) {
      console.error("Delete failed:", error);
      showAlert("error", "Failed to delete contact. Please try again.");
    } finally {
      // Always close modal and reset loading state
      setIsDeleting(false);
      setShowDeleteModal(false);
      setContactToDelete(null);
    }
  };

  // Updated cancel handler
  const handleDeleteCancel = () => {
    if (isDeleting) return; // Prevent closing during deletion
    console.log("Delete cancelled");
    setShowDeleteModal(false);
    setContactToDelete(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Alert
        isOpen={alert.isOpen}
        severity={alert.severity}
        message={alert.message}
        onClose={closeAlert}
        position="bottom"
        duration={4000}
      />
      <Header />
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {isEditing ? (
            <div className="p-5">
              <DetailsInput
                onBack={handleEditCancel}
                onSave={handleEditComplete}
                initialData={editingUser}
                isEditMode={true}
              />
            </div>
          ) : (
            <>
              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
                <div className="flex-1 w-full relative">
                  <Search
                    size={20}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search contacts by name, company, role or skill..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                {/* Grid Icon Button */}
                <button
                  onClick={() => setIsGridModalOpen(true)}
                  className="p-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  title="Open Grid View"
                >
                  <Grid3X3 size={20} className="text-gray-600" />
                </button>
              </div>

              {/* Contact Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContacts.map((contact) => (
                  <ContactCard
                    key={contact.contact_id}
                    contact={contact}
                    onEdit={() => handleEditClick(contact)}
                    onDelete={() => handleDeleteClick(contact)}
                  />
                ))}
              </div>

              {filteredContacts.length === 0 && (
                <div className="text-center py-12 col-span-full">
                  <div className="text-gray-400 text-lg mb-2">
                    No contacts found
                  </div>
                  <div className="text-gray-500">
                    Try adjusting your search or filters.
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Side Grid Modal */}
      {isGridModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-transparent"
            onClick={() => setIsGridModalOpen(false)}
          />

          {/* Modal Content - Right Side */}
          <div className="relative z-10 mt-16 mr-4 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 transform transition-transform duration-300 ease-in-out max-h-[80vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              <button
                onClick={() => setIsGridModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Body - Filter Content */}
            <div className="p-4 space-y-4">
              {/* Skills Filter */}
              <div className="border-b border-gray-200 pb-3">
                <button
                  onClick={() =>
                    setExpandedSections((prev) => ({
                      ...prev,
                      skills: !prev.skills,
                    }))
                  }
                  className="flex items-center justify-between w-full text-left"
                >
                  <span className="font-medium text-gray-900">Skills</span>
                  <ChevronDown
                    className={`w-4 h-4 transform transition-transform ${
                      expandedSections.skills ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedSections.skills && (
                  <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                    {[
                      "JavaScript",
                      "React",
                      "Node.js",
                      "Python",
                      "Java",
                      "C++",
                      "SQL",
                      "MongoDB",
                    ].map((skill) => (
                      <label
                        key={skill}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          className="text-blue-600 focus:ring-blue-500 rounded"
                          checked={activeFilters.skills.includes(skill)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setActiveFilters((prev) => ({
                                ...prev,
                                skills: [...prev.skills, skill],
                              }));
                            } else {
                              setActiveFilters((prev) => ({
                                ...prev,
                                skills: prev.skills.filter((s) => s !== skill),
                              }));
                            }
                          }}
                        />
                        <span className="text-sm text-gray-600">{skill}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Basic Info Filters */}
              <div className="border-b border-gray-200 pb-3">
                <button
                  onClick={() =>
                    setExpandedSections((prev) => ({
                      ...prev,
                      basicInfo: !prev.basicInfo,
                    }))
                  }
                  className="flex items-center justify-between w-full text-left"
                >
                  <span className="font-medium text-gray-900">
                    Basic Information
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transform transition-transform ${
                      expandedSections.basicInfo ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedSections.basicInfo && (
                  <div className="mt-2 space-y-3">
                    {/* Gender */}
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Gender
                      </span>
                      <div className="mt-1 space-y-1">
                        {["Male", "Female", "Other"].map((gender) => (
                          <label
                            key={gender}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              className="text-blue-600 focus:ring-blue-500 rounded"
                              checked={activeFilters.gender.includes(gender)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setActiveFilters((prev) => ({
                                    ...prev,
                                    gender: [...prev.gender, gender],
                                  }));
                                } else {
                                  setActiveFilters((prev) => ({
                                    ...prev,
                                    gender: prev.gender.filter(
                                      (g) => g !== gender
                                    ),
                                  }));
                                }
                              }}
                            />
                            <span className="text-sm text-gray-600">
                              {gender}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Marital Status */}
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Marital Status
                      </span>
                      <div className="mt-1 space-y-1">
                        {["Single", "Married", "Divorced", "Widowed"].map(
                          (status) => (
                            <label
                              key={status}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="checkbox"
                                className="text-blue-600 focus:ring-blue-500 rounded"
                                checked={activeFilters.marital_status.includes(
                                  status
                                )}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setActiveFilters((prev) => ({
                                      ...prev,
                                      marital_status: [
                                        ...prev.marital_status,
                                        status,
                                      ],
                                    }));
                                  } else {
                                    setActiveFilters((prev) => ({
                                      ...prev,
                                      marital_status:
                                        prev.marital_status.filter(
                                          (s) => s !== status
                                        ),
                                    }));
                                  }
                                }}
                              />
                              <span className="text-sm text-gray-600">
                                {status}
                              </span>
                            </label>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Location Filters */}
              <div className="border-b border-gray-200 pb-3">
                <button
                  onClick={() =>
                    setExpandedSections((prev) => ({
                      ...prev,
                      location: !prev.location,
                    }))
                  }
                  className="flex items-center justify-between w-full text-left"
                >
                  <span className="font-medium text-gray-900">Location</span>
                  <ChevronDown
                    className={`w-4 h-4 transform transition-transform ${
                      expandedSections.location ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedSections.location && (
                  <div className="mt-2 space-y-3">
                    {/* Country */}
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Country
                      </span>
                      <div className="mt-1 space-y-1 max-h-24 overflow-y-auto">
                        {[
                          "USA",
                          "Canada",
                          "UK",
                          "Australia",
                          "Germany",
                          "France",
                          "India",
                          "Japan",
                        ].map((country) => (
                          <label
                            key={country}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              className="text-blue-600 focus:ring-blue-500 rounded"
                              checked={activeFilters.country.includes(country)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setActiveFilters((prev) => ({
                                    ...prev,
                                    country: [...prev.country, country],
                                  }));
                                } else {
                                  setActiveFilters((prev) => ({
                                    ...prev,
                                    country: prev.country.filter(
                                      (c) => c !== country
                                    ),
                                  }));
                                }
                              }}
                            />
                            <span className="text-sm text-gray-600">
                              {country}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Education Filters */}
              <div className="border-b border-gray-200 pb-3">
                <button
                  onClick={() =>
                    setExpandedSections((prev) => ({
                      ...prev,
                      education: !prev.education,
                    }))
                  }
                  className="flex items-center justify-between w-full text-left"
                >
                  <span className="font-medium text-gray-900">Education</span>
                  <ChevronDown
                    className={`w-4 h-4 transform transition-transform ${
                      expandedSections.education ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedSections.education && (
                  <div className="mt-2 space-y-3">
                    {/* PG Courses */}
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        PG Courses
                      </span>
                      <div className="mt-1 space-y-1 max-h-24 overflow-y-auto">
                        {["MBA", "MS", "PhD", "M.Tech", "MA", "M.Com"].map(
                          (course) => (
                            <label
                              key={course}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="checkbox"
                                className="text-blue-600 focus:ring-blue-500 rounded"
                                checked={activeFilters.pg_course_name.includes(
                                  course
                                )}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setActiveFilters((prev) => ({
                                      ...prev,
                                      pg_course_name: [
                                        ...prev.pg_course_name,
                                        course,
                                      ],
                                    }));
                                  } else {
                                    setActiveFilters((prev) => ({
                                      ...prev,
                                      pg_course_name:
                                        prev.pg_course_name.filter(
                                          (c) => c !== course
                                        ),
                                    }));
                                  }
                                }}
                              />
                              <span className="text-sm text-gray-600">
                                {course}
                              </span>
                            </label>
                          )
                        )}
                      </div>
                    </div>

                    {/* UG Courses */}
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        UG Courses
                      </span>
                      <div className="mt-1 space-y-1 max-h-24 overflow-y-auto">
                        {["B.Tech", "B.E", "BCA", "B.Com", "BA", "B.Sc"].map(
                          (course) => (
                            <label
                              key={course}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="checkbox"
                                className="text-blue-600 focus:ring-blue-500 rounded"
                                checked={activeFilters.ug_course_name.includes(
                                  course
                                )}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setActiveFilters((prev) => ({
                                      ...prev,
                                      ug_course_name: [
                                        ...prev.ug_course_name,
                                        course,
                                      ],
                                    }));
                                  } else {
                                    setActiveFilters((prev) => ({
                                      ...prev,
                                      ug_course_name:
                                        prev.ug_course_name.filter(
                                          (c) => c !== course
                                        ),
                                    }));
                                  }
                                }}
                              />
                              <span className="text-sm text-gray-600">
                                {course}
                              </span>
                            </label>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Work Experience Filters */}
              <div className="border-b border-gray-200 pb-3">
                <button
                  onClick={() =>
                    setExpandedSections((prev) => ({
                      ...prev,
                      work: !prev.work,
                    }))
                  }
                  className="flex items-center justify-between w-full text-left"
                >
                  <span className="font-medium text-gray-900">
                    Work Experience
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transform transition-transform ${
                      expandedSections.work ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedSections.work && (
                  <div className="mt-2 space-y-3">
                    {/* Job Titles */}
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Job Title
                      </span>
                      <div className="mt-1 space-y-1 max-h-24 overflow-y-auto">
                        {[
                          "Software Engineer",
                          "Product Manager",
                          "Designer",
                          "Data Scientist",
                          "Marketing Manager",
                          "Sales Executive",
                        ].map((title) => (
                          <label
                            key={title}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              className="text-blue-600 focus:ring-blue-500 rounded"
                              checked={activeFilters.job_title.includes(title)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setActiveFilters((prev) => ({
                                    ...prev,
                                    job_title: [...prev.job_title, title],
                                  }));
                                } else {
                                  setActiveFilters((prev) => ({
                                    ...prev,
                                    job_title: prev.job_title.filter(
                                      (t) => t !== title
                                    ),
                                  }));
                                }
                              }}
                            />
                            <span className="text-sm text-gray-600">
                              {title}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Companies */}
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Company
                      </span>
                      <div className="mt-1 space-y-1 max-h-24 overflow-y-auto">
                        {[
                          "Google",
                          "Microsoft",
                          "Amazon",
                          "Apple",
                          "Meta",
                          "Netflix",
                          "Tesla",
                          "IBM",
                        ].map((company) => (
                          <label
                            key={company}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              className="text-blue-600 focus:ring-blue-500 rounded"
                              checked={activeFilters.company.includes(company)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setActiveFilters((prev) => ({
                                    ...prev,
                                    company: [...prev.company, company],
                                  }));
                                } else {
                                  setActiveFilters((prev) => ({
                                    ...prev,
                                    company: prev.company.filter(
                                      (c) => c !== company
                                    ),
                                  }));
                                }
                              }}
                            />
                            <span className="text-sm text-gray-600">
                              {company}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Filter Actions */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={() => {
                    setActiveFilters({
                      skills: [],
                      gender: [],
                      nationality: [],
                      marital_status: [],
                      age: [],
                      city: [],
                      state: [],
                      country: [],
                      pg_course_name: [],
                      pg_college: [],
                      pg_university: [],
                      ug_course_name: [],
                      ug_college: [],
                      ug_university: [],
                      job_title: [],
                      company: [],
                      department: [],
                      event_name: [],
                    });
                  }}
                  className="w-full px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Clear All Filters
                </button>
                <button
                  onClick={() => setIsGridModalOpen(false)}
                  className="w-full px-3 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal with Loading State */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        itemName={contactToDelete?.name || "this contact"}
        isDeleting={isDeleting} // Pass isDeleting state
      />
    </div>
  );
};

export default MiddleManHome;
