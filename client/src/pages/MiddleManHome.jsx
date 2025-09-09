import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Trash2,
  X,
  Filter,
  MapPinned,
  ShieldCheckIcon,
  University,
  FileCheckIcon,
} from "lucide-react";
import ContactCard from "../components/MiddleManCard";
import DetailsInput from "../components/DetailsInput";
import Header from "../components/Header";
import { useAuthStore } from "../store/AuthStore";
import api from "../utils/axios";
import Alert from "../components/Alert";
import { useNavigate } from "react-router-dom";

// Helper function to generate initials from a name
const getInitials = (name = "") => {
  if (!name) return "";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

// isEditing ? (
//             <div className="p-5">
//               <DetailsInput
//                 onBack={handleEditCancel}
//                 onSave={handleEditComplete}
//                 initialData={editingUser}
//                 isEditMode={true}
//               />
//             </div>
//           ) : (

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

// Searchable Multi-Select Component
const SearchableMultiSelect = ({
  options = [],
  selectedValues = [],
  onSelectionChange,
  placeholder = "Search and select...",
  label,
  color = "blue",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle selection
  const handleToggleOption = (value) => {
    const newSelection = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onSelectionChange(newSelection);
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const colorClasses = {
    blue: {
      dropdown: "border-blue-200 focus:border-blue-500 focus:ring-blue-500",
      tag: "bg-blue-100 text-blue-800",
      button: "text-blue-600 hover:text-blue-800",
      checkbox: "text-blue-600 focus:ring-blue-500",
    },
    green: {
      dropdown: "border-green-200 focus:border-green-500 focus:ring-green-500",
      tag: "bg-green-100 text-green-800",
      button: "text-green-600 hover:text-green-800",
      checkbox: "text-green-600 focus:ring-green-500",
    },
    purple: {
      dropdown:
        "border-purple-200 focus:border-purple-500 focus:ring-purple-500",
      tag: "bg-purple-100 text-purple-800",
      button: "text-purple-600 hover:text-purple-800",
      checkbox: "text-purple-600 focus:ring-purple-500",
    },
    orange: {
      dropdown:
        "border-orange-200 focus:border-orange-500 focus:ring-orange-500",
      tag: "bg-orange-100 text-orange-800",
      button: "text-orange-600 hover:text-orange-800",
      checkbox: "text-orange-600 focus:ring-orange-500",
    },
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 text-left bg-white border ${colors.dropdown} rounded-md shadow-sm focus:outline-none focus:ring-1 transition-colors`}
      >
        <span className="block truncate text-sm">
          {selectedValues.length > 0
            ? `${selectedValues.length} selected`
            : placeholder}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pt-7 pointer-events-none">
          {isOpen ? <X size={16} /> : <Search size={16} />}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search ${label.toLowerCase()}...`}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Options List */}
          <div className="py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedValues.includes(option.value)}
                      onChange={() => handleToggleOption(option.value)}
                      className={`mr-3 rounded border-gray-300 ${colors.checkbox}`}
                    />
                    <span className="text-sm text-gray-700 truncate">
                      {option.value}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full ml-2">
                    {option.count}
                  </span>
                </label>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Filter Modal Component
const FilterModal = ({
  filterOptions,
  activeFilters,
  setActiveFilters,
  contacts,
  setIsFilterModalOpen,
  getActiveFilterCount,
  clearFilters,
  toggleFilter,
}) => {
  const handleClose = () => setIsFilterModalOpen(false);

  const handleFilterChange = (filterType, selectedValues) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterType]: selectedValues,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-7xl bg-white rounded-2xl shadow-2xl max-h-[95vh] overflow-hidden">
        {/* Enhanced Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-opacity-20 rounded-lg backdrop-blur-sm">
                <Filter size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Advanced Filters</h2>
                <p className="text-blue-100 text-sm">
                  {getActiveFilterCount() > 0
                    ? `${getActiveFilterCount()} active filters • ${
                        contacts.length
                      } contacts found`
                    : `Filter from ${
                        filterOptions.skills?.length || 0
                      }+ skills, ${
                        filterOptions.companies?.length || 0
                      }+ companies, and more`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getActiveFilterCount() > 0 && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm font-medium text-black bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all duration-200 backdrop-blur-sm"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white hover:text-black hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-180px)]">
          <div className="p-6 space-y-8">
            {/* Quick Filter Tags */}
            {getActiveFilterCount() > 0 && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Active Filters ({getActiveFilterCount()})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(activeFilters).map(([filterType, values]) =>
                    values.map((value) => (
                      <span
                        key={`${filterType}-${value}`}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {value}
                        <button
                          onClick={() => toggleFilter(filterType, value)}
                          className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Basic Information */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <FileCheckIcon size={16} className="text-white" />
                </div>
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filterOptions.genders?.length > 0 && (
                  <SearchableMultiSelect
                    options={filterOptions.genders}
                    selectedValues={activeFilters.gender || []}
                    onSelectionChange={(values) =>
                      handleFilterChange("gender", values)
                    }
                    placeholder="Select genders..."
                    label="Gender"
                    color="blue"
                  />
                )}
                {filterOptions.nationalities?.length > 0 && (
                  <SearchableMultiSelect
                    options={filterOptions.nationalities}
                    selectedValues={activeFilters.nationality || []}
                    onSelectionChange={(values) =>
                      handleFilterChange("nationality", values)
                    }
                    placeholder="Select nationalities..."
                    label="Nationality"
                    color="blue"
                  />
                )}
                {filterOptions.marital_statuses?.length > 0 && (
                  <SearchableMultiSelect
                    options={filterOptions.marital_statuses}
                    selectedValues={activeFilters.marital_status || []}
                    onSelectionChange={(values) =>
                      handleFilterChange("marital_status", values)
                    }
                    placeholder="Select marital status..."
                    label="Marital Status"
                    color="blue"
                  />
                )}
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <MapPinned size={16} className="text-white" />
                </div>
                Location
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filterOptions.countries?.length > 0 && (
                  <SearchableMultiSelect
                    options={filterOptions.countries}
                    selectedValues={activeFilters.address_country || []}
                    onSelectionChange={(values) =>
                      handleFilterChange("address_country", values)
                    }
                    placeholder="Search countries..."
                    label="Country"
                    color="green"
                  />
                )}
                {filterOptions.states?.length > 0 && (
                  <SearchableMultiSelect
                    options={filterOptions.states}
                    selectedValues={activeFilters.address_state || []}
                    onSelectionChange={(values) =>
                      handleFilterChange("address_state", values)
                    }
                    placeholder="Search states..."
                    label="State"
                    color="green"
                  />
                )}
                {filterOptions.cities?.length > 0 && (
                  <SearchableMultiSelect
                    options={filterOptions.cities}
                    selectedValues={activeFilters.address_city || []}
                    onSelectionChange={(values) =>
                      handleFilterChange("address_city", values)
                    }
                    placeholder="Search cities..."
                    label="City"
                    color="green"
                  />
                )}
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <ShieldCheckIcon size={16} className="text-white" />
                </div>
                Professional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterOptions.companies?.length > 0 && (
                  <SearchableMultiSelect
                    options={filterOptions.companies}
                    selectedValues={activeFilters.company || []}
                    onSelectionChange={(values) =>
                      handleFilterChange("company", values)
                    }
                    placeholder="Search companies..."
                    label="Company"
                    color="purple"
                  />
                )}
                {filterOptions.job_titles?.length > 0 && (
                  <SearchableMultiSelect
                    options={filterOptions.job_titles}
                    selectedValues={activeFilters.job_title || []}
                    onSelectionChange={(values) =>
                      handleFilterChange("job_title", values)
                    }
                    placeholder="Search job titles..."
                    label="Job Title"
                    color="purple"
                  />
                )}
                {filterOptions.skills?.length > 0 && (
                  <SearchableMultiSelect
                    options={filterOptions.skills}
                    selectedValues={activeFilters.skills || []}
                    onSelectionChange={(values) =>
                      handleFilterChange("skills", values)
                    }
                    placeholder="Search skills..."
                    label="Skills"
                    color="purple"
                  />
                )}
              </div>
            </div>

            {/* Education Information */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <University size={16} className="text-white" />
                </div>
                Education
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filterOptions.pg_courses?.length > 0 && (
                  <SearchableMultiSelect
                    options={filterOptions.pg_courses}
                    selectedValues={activeFilters.pg_course_name || []}
                    onSelectionChange={(values) =>
                      handleFilterChange("pg_course_name", values)
                    }
                    placeholder="Search postgraduate courses..."
                    label="Postgraduate Courses"
                    color="orange"
                  />
                )}
                {filterOptions.ug_courses?.length > 0 && (
                  <SearchableMultiSelect
                    options={filterOptions.ug_courses}
                    selectedValues={activeFilters.ug_course_name || []}
                    onSelectionChange={(values) =>
                      handleFilterChange("ug_course_name", values)
                    }
                    placeholder="Search undergraduate courses..."
                    label="Undergraduate Courses"
                    color="orange"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Modal Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <span className="font-medium text-lg">{contacts.length}</span>
                <span>contact{contacts.length !== 1 ? "s" : ""} found</span>
                {getActiveFilterCount() > 0 && (
                  <span className="text-blue-600 font-medium">
                    • {getActiveFilterCount()} filter
                    {getActiveFilterCount() > 1 ? "s" : ""} applied
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleClose}
                className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Close
              </button>
              <button
                onClick={handleClose}
                className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg"
              >
                Apply Filters ({contacts.length})
              </button>
            </div>
          </div>
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
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Filter options from API
  const [filterOptions, setFilterOptions] = useState({
    genders: [],
    categories: [],
    nationalities: [],
    marital_statuses: [],
    countries: [],
    states: [],
    cities: [],
    companies: [],
    job_titles: [],
    pg_courses: [],
    ug_courses: [],
    skills: [],
  });

  // Active filter states - expanded to match API capabilities
  const [activeFilters, setActiveFilters] = useState({
    category: [],
    gender: [],
    nationality: [],
    marital_status: [],
    skills: [],
    address_country: [],
    address_state: [],
    address_city: [],
    company: [],
    job_title: [],
    pg_university: [],
    ug_university: [],
    pg_course_name: [],
    ug_course_name: [],
  });

  // Delete modal states with loading
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false); // Add isDeleting state
  const [alert, setAlert] = useState({
    isOpen: false,
    severity: "success",
    message: "",
  });

  const { id, role } = useAuthStore();

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

  // Fetch filter options with category filtering
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const rolesDict = { cata: "A", catb: "B", catc: "C" };
        const category = rolesDict[role];

        // For admin users, fetch all filter options without category filter
        const url = category
          ? `/api/get-filter-options?category=${role}`
          : `/api/get-filter-options?category=${role}`;

        const response = await api.get(url);
        console.log("Filter Options: ", response.data);
        setFilterOptions(response.data.data);
      } catch (error) {
        console.error("Failed to fetch filter options:", error);
      }
    };

    if (role) {
      fetchFilterOptions();
    }
  }, [role]); // Add role as dependency to refetch when role changes

  // Fetch contacts using filtered API
  const fetchContacts = async () => {
    if (!role) return;

    const rolesDict = { cata: "A", catb: "B", catc: "C" };
    const category = rolesDict[role];

    // For admin users, we don't filter by category to show all records
    if (!category && role !== "admin") {
      console.error("Invalid role for fetching contacts:", role);
      showAlert("error", "Invalid role for fetching contacts");
      return;
    }

    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();

      // Add category filter based on user role (skip for admin to show all categories)
      if (category) {
        params.append("category", category);
      }

      // Add search term if exists
      if (searchTerm.trim()) {
        params.append("name", searchTerm);
      }

      // Add active filters
      Object.entries(activeFilters).forEach(([key, values]) => {
        if (values.length > 0) {
          values.forEach((value) => params.append(key, value));
        }
      });

      const response = await api.get(
        `/api/contacts/filter/?${params.toString()}`
      );

      // Handle the response structure from GetFilteredContacts API
      const contactsData = response.data.data?.contacts || [];

      const formattedContacts = contactsData.map((item) => ({
        ...item,
        role: item.experiences?.[0]?.job_title || "N/A",
        company: item.experiences?.[0]?.company || "N/A",
        location:
          `${item.city || ""}, ${item.state || ""}`.trim() === ","
            ? "N/A"
            : `${item.city || ""}, ${item.state || ""}`,
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
    } finally {
      setLoading(false);
    }
  };

  // Fetch contacts when role, search term, or filters change
  useEffect(() => {
    fetchContacts();
  }, [role, searchTerm, activeFilters]);

  // Since filtering is now handled by API, we just use contacts directly
  const filteredContacts = contacts;

  // Filter handlers
  const toggleFilter = (filterType, value) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter((item) => item !== value)
        : [...prev[filterType], value],
    }));
  };

  const clearFilters = () => {
    setActiveFilters({
      category: [],
      gender: [],
      nationality: [],
      marital_status: [],
      skills: [],
      address_country: [],
      address_state: [],
      address_city: [],
      company: [],
      job_title: [],
      pg_university: [],
      ug_university: [],
      pg_course_name: [],
      ug_course_name: [],
    });
  };

  const getActiveFilterCount = () => {
    return Object.values(activeFilters).reduce(
      (total, filterArray) => total + filterArray.length,
      0
    );
  };

  // Debounced search to avoid too many API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchContacts();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Edit handlers
  const handleEditClick = (user) => {
    // setEditingUser(user || null);
    // setIsEditing(true);
    navigate("/details-input", {
      state: {
        contact: user,
        isAddMode: true,
        source: "middleman",
        currentUserId: id,
        userRole: role,
        successCallback: {
          message: `${user.name} has been successfully verified and added to contacts.`,
          refreshData: true,
        },
      },
    });
  };

  const handleEditComplete = async (updatedData) => {
    try {
      console.log("Saving data:", updatedData);

      const response = await api.put(
        `/api/update-contact/${updatedData.contact_id}`,
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

      await api.delete(
        `/api/delete-contact/${contactToDelete.contact_id}/?userType=${role}`
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

      {/* Page Title Section */}
      <div className="px-6 pt-6 pb-2">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {role === "admin"
                ? "All Contact Records"
                : "Your Contact Records"}
            </h1>
            <p className="text-gray-600 mt-1">
              {role === "admin"
                ? "View and manage all contact records across all categories (A, B, C)"
                : `Manage your category ${
                    role === "cata" ? "A" : role === "catb" ? "B" : "C"
                  } contact records`}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="max-w-7xl mx-auto">
          {
            <>
              {/* Search and Filter Controls */}
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

                {/* Filter Button */}
                <button
                  onClick={() => setIsFilterModalOpen(true)}
                  className={`flex items-center gap-2 px-4 py-3 border rounded-lg transition-colors ${
                    getActiveFilterCount() > 0
                      ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                  title="Open Filters"
                >
                  <Filter size={20} />
                  Filters
                  {getActiveFilterCount() > 0 && (
                    <span className="bg-white text-blue-600 text-xs px-2 py-1 rounded-full font-medium">
                      {getActiveFilterCount()}
                    </span>
                  )}
                </button>
              </div>

              {/* Loading indicator */}
              {loading && (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">
                    Loading contacts...
                  </span>
                </div>
              )}

              {/* Results Summary */}
              {!loading && (
                <div className="flex justify-between items-center mb-6 p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium text-gray-900">
                        {filteredContacts.length}
                      </span>{" "}
                      contacts found
                      {role === "admin" && (
                        <span className="text-gray-500 ml-2">
                          (All categories: A, B, C)
                        </span>
                      )}
                    </div>
                    {getActiveFilterCount() > 0 && (
                      <div className="text-sm text-blue-600">
                        {getActiveFilterCount()} filter
                        {getActiveFilterCount() !== 1 ? "s" : ""} applied
                      </div>
                    )}
                  </div>
                  {role === "admin" && (
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                        A
                      </span>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                        B
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        C
                      </span>
                    </div>
                  )}
                </div>
              )}

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

              {filteredContacts.length === 0 && !loading && (
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

      {/* Delete Confirmation Modal with Loading State */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        itemName={contactToDelete?.name || "this contact"}
        isDeleting={isDeleting} // Pass isDeleting state
      />

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <FilterModal
          filterOptions={filterOptions}
          activeFilters={activeFilters}
          setActiveFilters={setActiveFilters}
          contacts={contacts}
          setIsFilterModalOpen={setIsFilterModalOpen}
          getActiveFilterCount={getActiveFilterCount}
          clearFilters={clearFilters}
          toggleFilter={toggleFilter}
        />
      )}
    </div>
  );
};

export default MiddleManHome;
