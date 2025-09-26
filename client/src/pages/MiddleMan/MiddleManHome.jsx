import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  Trash2,
  X,
  Filter,
  MapPinned,
  ShieldCheckIcon,
  University,
  FileCheckIcon,
  Loader,
  ChevronUp,
} from "lucide-react";
import ContactCard from "../../components/Cards/MiddleManCard";
import DetailsInput from "../../components/Forms/DetailsInput";
import Header from "../../components/Header/Header";
import { useAuthStore } from "../../store/AuthStore";
import api from "../../utils/axios";
import Alert from "../../components/Alert/Alert";
import { useNavigate } from "react-router-dom";
import DeleteConfirmationModal from "../../components/Modals/DeleteConfirmationModal";

// Helper function to generate initials from a name
const getInitials = (name = "") => {
  if (!name) return "";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-6xl bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Professional Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-4 md:px-8 py-4 md:py-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-white/10 rounded-lg backdrop-blur-sm">
                <Filter size={20} />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-semibold">
                  Advanced Filters
                </h2>
                <p className="text-slate-300 text-xs md:text-sm mt-1">
                  {getActiveFilterCount() > 0
                    ? `${getActiveFilterCount()} active filters • ${contacts.length
                    } contacts found`
                    : `Filter from ${filterOptions.skills?.length || 0
                    }+ skills, ${filterOptions.companies?.length || 0
                    }+ companies, and more`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getActiveFilterCount() > 0 && (
                <button
                  onClick={clearFilters}
                  className="px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-white bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/20"
                >
                  Clear All ({getActiveFilterCount()})
                </button>
              )}
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
          <div className="p-4 md:p-8 space-y-6 md:space-y-8">
            {/* Active Filters Summary */}
            {getActiveFilterCount() > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-blue-900">
                    Active Filters ({getActiveFilterCount()})
                  </h3>
                  <button
                    onClick={clearFilters}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(activeFilters).map(([filterType, values]) =>
                    values.map((value) => (
                      <span
                        key={`${filterType}-${value}`}
                        className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                      >
                        {value}
                        <button
                          onClick={() => toggleFilter(filterType, value)}
                          className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200 transition-colors"
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
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
                  <FileCheckIcon size={16} className="text-white" />
                </div>
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filterOptions.genders?.length > 0 && (
                  <SearchableMultiSelect
                    options={filterOptions.genders}
                    selectedValues={activeFilters.gender || []}
                    onSelectionChange={(values) =>
                      handleFilterChange("gender", values)
                    }
                    placeholder="All genders"
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
                    placeholder="All nationalities"
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
                    placeholder="Any status"
                    label="Marital Status"
                    color="blue"
                  />
                )}
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
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
                    placeholder="Any country"
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
                    placeholder="Any state"
                    label="State/Province"
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
                    placeholder="Any city"
                    label="City"
                    color="green"
                  />
                )}
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <ShieldCheckIcon size={16} className="text-white" />
                </div>
                Professional Experience
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filterOptions.companies?.length > 0 && (
                  <SearchableMultiSelect
                    options={filterOptions.companies}
                    selectedValues={activeFilters.company || []}
                    onSelectionChange={(values) =>
                      handleFilterChange("company", values)
                    }
                    placeholder="Any company"
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
                    placeholder="Any role"
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
                    placeholder="Any skills"
                    label="Skills & Technologies"
                    color="purple"
                  />
                )}
              </div>
            </div>

            {/* Education Information */}
            <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
                  <University size={16} className="text-white" />
                </div>
                Education Background
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filterOptions.pg_courses?.length > 0 && (
                  <SearchableMultiSelect
                    options={filterOptions.pg_courses}
                    selectedValues={activeFilters.pg_course_name || []}
                    onSelectionChange={(values) =>
                      handleFilterChange("pg_course_name", values)
                    }
                    placeholder="Any postgraduate course"
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
                    placeholder="Any undergraduate course"
                    label="Undergraduate Courses"
                    color="orange"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Modal Footer */}
        <div className="bg-white border-t border-gray-200 px-4 md:px-8 py-4 md:py-6 flex-shrink-0">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-6">
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-lg text-gray-900">
                  {contacts.length.toLocaleString()}
                </span>
                <span className="ml-2">
                  contact{contacts.length !== 1 ? "s" : ""} found
                </span>
              </div>
              {getActiveFilterCount() > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-xs font-medium text-blue-700">
                    {getActiveFilterCount()} filter
                    {getActiveFilterCount() > 1 ? "s" : ""} applied
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <button
                onClick={handleClose}
                className="px-6 py-3 md:py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center"
              >
                Cancel
              </button>
              <button
                onClick={handleClose}
                className="px-8 py-3 md:py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors font-medium shadow-sm text-center"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MiddleManHome = () => {
  // ✅ PAGINATION AND INFINITE SCROLL STATE
  const [contacts, setContacts] = useState([]);
  const [allContacts, setAllContacts] = useState([]); // Store all loaded contacts
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_contacts: 0,
    limit: 20,
    has_next: false,
    has_previous: false,
  });
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const navigate = useNavigate();

  // ✅ INTERSECTION OBSERVER REFS
  const observerRef = useRef();
  const loadingTriggerRef = useRef();
  const lastContactElementRef = useCallback((node) => {
    if (loading || loadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && pagination.has_next) {
          console.log("🔄 Loading more contacts via Intersection Observer...");
          loadMoreContacts();
        }
      },
      {
        rootMargin: '200px', // Start loading 200px before the element is visible
        threshold: 0.1,
      }
    );
    
    if (node) observerRef.current.observe(node);
  }, [loading, loadingMore, pagination.has_next]);

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
  const [isDeleting, setIsDeleting] = useState(false);
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

  // ✅ SCROLL TO TOP FUNCTIONALITY
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fetch filter options with category filtering
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const rolesDict = { cata: "A", catb: "B", catc: "C" };
        const category = rolesDict[role];

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
  }, [role]);

  // ✅ FETCH CONTACTS WITH PAGINATION
  const fetchContacts = async (page = 1, shouldAppend = false) => {
    if (!role) return;

    const rolesDict = { cata: "A", catb: "B", catc: "C" };
    const category = rolesDict[role];

    if (!category && role !== "admin") {
      console.error("Invalid role for fetching contacts:", role);
      showAlert("error", "Invalid role for fetching contacts");
      return;
    }

    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      // Build query parameters
      const params = new URLSearchParams();

      // Add pagination
      params.append("page", page.toString());
      params.append("limit", "20");

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

      console.log(`🔍 Fetching contacts - Page ${page}, URL: /api/contacts/filter/?${params.toString()}`);

      const response = await api.get(
        `/api/contacts/filter/?${params.toString()}`
      );

      // Handle the response structure from GetFilteredContacts API
      const contactsData = response.data.data?.contacts || [];
      const paginationData = response.data.data?.pagination || {};

      console.log("📊 Contacts fetched:", {
        page,
        contactsCount: contactsData.length,
        totalContacts: paginationData.total_contacts,
        hasNext: paginationData.has_next,
      });

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

      // Update pagination
      setPagination(paginationData);

      // Update contacts based on whether we're appending or replacing
      if (shouldAppend && page > 1) {
        setContacts((prevContacts) => [...prevContacts, ...formattedContacts]);
        setAllContacts((prevContacts) => [...prevContacts, ...formattedContacts]);
      } else {
        setContacts(formattedContacts);
        setAllContacts(formattedContacts);
      }

    } catch (error) {
      console.error("Failed to fetch contacts:", error);
      showAlert("error", "Failed to fetch contacts. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // ✅ LOAD MORE CONTACTS FUNCTION
  const loadMoreContacts = async () => {
    if (loadingMore || !pagination.has_next) return;
    
    console.log("🔄 Loading more contacts, next page:", pagination.current_page + 1);
    await fetchContacts(pagination.current_page + 1, true);
  };

  // Reset to first page when filters or search change
  useEffect(() => {
    console.log("🔄 Filters or search changed, resetting to page 1");
    fetchContacts(1, false);
  }, [role, searchTerm, activeFilters]);

  // Debounced search to avoid too many API calls
  const [searchTimeout, setSearchTimeout] = useState(null);
  
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeoutId = setTimeout(() => {
      if (searchTerm !== undefined) {
        console.log("🔍 Search debounced, fetching contacts with search:", searchTerm);
        fetchContacts(1, false);
      }
    }, 500);
    
    setSearchTimeout(timeoutId);
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [searchTerm]);

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

  // Edit handlers
  const handleEditClick = (user) => {
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

    setIsDeleting(true);

    try {
      console.log(
        "Making API call to delete contact:",
        contactToDelete.contact_id
      );

      await api.delete(
        `/api/verified-contact-delete/${contactToDelete.contact_id}?userType=${role}&eventId=${id}`
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
      
      {/* ✅ SCROLL TO TOP BUTTON */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 hover:scale-110"
          aria-label="Scroll to top"
        >
          <ChevronUp size={20} />
        </button>
      )}

      <div className="w-full bg-white shadow-sm sticky top-0 z-50 border-b-2 border-b-gray-50">
        <div className="flex justify-end">
          <Header />
        </div>
      </div>

      {/* Page Title Section */}
      <div className="px-6 pt-6 pb-2">
        <div className="container mx-auto">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {role === "admin"
                ? "All Contact Records"
                : "Your Contact Records"}
            </h1>
            <p className="text-gray-600 mt-1">
              {role === "admin"
                ? "View and manage all contact records across all categories (A, B, C)"
                : `Manage your category ${role === "cata" ? "A" : role === "catb" ? "B" : "C"
                } contact records`}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="container mx-auto">
          {/* Search and Filter Controls */}
          <div className="flex md:flex-row gap-4 items-center mb-6">
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
              className={`relative flex items-center gap-2 px-4 py-3 border rounded-lg transition-colors ${getActiveFilterCount() > 0
                ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              title="Open Filters"
            >
              <Filter size={20} />
              <span className="hidden md:inline">Filters</span>
              {getActiveFilterCount() > 0 && (
                <>
                  <span className="hidden md:flex bg-white text-blue-600 text-xs w-5 h-5 rounded-full font-medium items-center justify-center">
                    {getActiveFilterCount()}
                  </span>
                  <span className="md:hidden absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                    {getActiveFilterCount()}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">
                Loading contacts...
              </span>
            </div>
          )}

          {/* Results Summary */}
          {!loading && (
            <div className="flex justify-between items-center mb-6 p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-500">
                  <span className="font-medium text-gray-900">
                    {pagination.total_contacts?.toLocaleString() || filteredContacts.length}
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

          {/* ✅ CONTACT CARDS GRID WITH INTERSECTION OBSERVER */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredContacts.map((contact, index) => {
              const isLastElement = index === filteredContacts.length - 1;
              return (
                <div
                  key={contact.contact_id}
                  ref={isLastElement ? lastContactElementRef : null}
                >
                  <ContactCard
                    contact={contact}
                    onEdit={() => handleEditClick(contact)}
                    onDelete={() => handleDeleteClick(contact)}
                  />
                </div>
              );
            })}
          </div>

          {/* ✅ LOADING MORE INDICATOR */}
          {loadingMore && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading more contacts...</span>
            </div>
          )}

          {/* NO RESULTS MESSAGE */}
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
        </div>
      </div>

      {/* Delete Confirmation Modal with Loading State */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        itemName={contactToDelete?.name || "this contact"}
        deleteType="contact"
        isDeleting={isDeleting}
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
