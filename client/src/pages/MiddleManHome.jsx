import React, { useState, useEffect } from "react";
import { Search, ChevronDown, Trash2, X } from "lucide-react";
import StatusBar from "../components/StatusBar";
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
  isDeleting = false 
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
            <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-medium text-gray-900 mb-1">Confirm Delete</h2>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <p className="text-gray-600 text-sm leading-relaxed pl-13">
            Are you sure you want to delete {itemName}? This will permanently remove the contact and all associated data.
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
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
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

      const rolesDict = { "cata": "A", "catb": "B", "catc": "C" };
      const category = rolesDict[role];

      if (!category) {
        console.error("Invalid role for fetching contacts:", role);
        showAlert("error", "Invalid role for fetching contacts");
        return;
      }
      
      try {
        const response = await axios.get(`http://localhost:8000/api/get-contacts-by-category/?category=${category}`);
        
        const formattedContacts = response.data.map(item => ({
          ...item, 
          role: item.experiences?.[0]?.job_title || 'N/A',
          company: item.experiences?.[0]?.company || 'N/A',
          location: `${item.address?.city || ''}, ${item.address?.state || ''}`.trim() === ',' ? 'N/A' : `${item.address?.city || ''}, ${item.address?.state || ''}`,
          skills: item.skills ? item.skills.split(',').map(skill => skill.trim()) : [],
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

  const taskStatus = {
    completed: 7,
    total: 16,
    percentage: 44,
  };

  // Filter logic
  const filteredContacts = contacts.filter((contact) => {
    const searchTermLower = searchTerm.toLowerCase();
    const skillsString = Array.isArray(contact.skills) ? contact.skills.join(' ').toLowerCase() : '';

    const matchesSearch =
      contact.name?.toLowerCase().includes(searchTermLower) ||
      contact.company?.toLowerCase().includes(searchTermLower) ||
      contact.role?.toLowerCase().includes(searchTermLower) ||
      skillsString.includes(searchTermLower);

    const matchesStatus = statusFilter === "All Status" || contact.status === statusFilter;
    const matchesCategory = categoryFilter === "All Categories" || contact.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
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
      
      setContacts(prevContacts =>
        prevContacts.map(contact =>
          contact.contact_id === updatedData.contact_id
            ? { ...contact, ...updatedData }
            : contact
        )
      );
      
      showAlert("success", `${updatedData.name} has been successfully updated.`);
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
      console.log("Making API call to delete contact:", contactToDelete.contact_id);
      
      await axios.delete(`http://localhost:8000/api/delete-contact/${contactToDelete.contact_id}/`);
      
      console.log("Delete successful, updating state");
      
      // Update state
      setContacts(prevContacts => 
        prevContacts.filter(contact => contact.contact_id !== contactToDelete.contact_id)
      );
      
      showAlert("success", `${contactToDelete.name} has been successfully deleted.`);
      
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
                <div className="w-full md:w-auto flex gap-4">
                  <div className="flex-1 relative">
                    <select
                      className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option>All Status</option>
                      <option>Active</option>
                      <option>Prospect</option>
                      <option>Inactive</option>
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                    />
                  </div>
                  <div className="flex-1 relative">
                    <select
                      className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <option>All Categories</option>
                      <option>A</option>
                      <option>B</option>
                      <option>C</option>
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              {/* Status Bar */}
              <StatusBar
                completed={taskStatus.completed}
                total={taskStatus.total}
                percentage={taskStatus.percentage}
              />

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
