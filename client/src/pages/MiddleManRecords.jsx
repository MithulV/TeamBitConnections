import React, { useState, useEffect } from "react";
import { Search, ChevronDown } from "lucide-react";
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

const DeleteConfirmationModal = ({
  isOpen,
  onConfirm,
  onCancel,
  itemName = "this user",
  deleteType = "contact", // Add deleteType prop to distinguish between different deletion types
}) => {
  if (!isOpen) return null;

  const getDeleteMessage = () => {
    switch (deleteType) {
      case "contact":
        return `Are you sure you want to delete ${itemName}? This will remove the contact from unverified list.`;
      case "assignment":
        return `Are you sure you want to delete the assignment for ${itemName}? This will remove the user from your assigned list.`;
      case "visitingCard":
        return `Are you sure you want to delete this visiting card? This action cannot be undone.`;
      default:
        return `Are you sure you want to delete ${itemName}? This action cannot be undone.`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur effect */}
      <div
        className="absolute inset-0 bg-black/60 bg-opacity-50 backdrop-blur-sm transition-all duration-300"
        onClick={onCancel}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100 animate-fadeIn">
        {/* Header with Material Design styling */}
        <div className="flex items-start gap-3 p-6 pb-4">
          {/* Warning Icon with circular background */}
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
            {getDeleteMessage()}
          </p>
        </div>

        {/* Actions with Material Design button styling */}
        <div className="flex justify-end gap-3 px-6 pb-6">
          <button
            onClick={onCancel}
            className="px-6 py-2 text-sm font-medium text-blue-600 bg-transparent border-none rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 uppercase tracking-wide"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 text-sm font-medium text-red-600 bg-transparent border-none rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-all duration-200 uppercase tracking-wide"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
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

const MiddleManHome = () => {
  const [contacts, setContacts] = useState([]); // State to hold API data
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const { role } = useAuthStore(); // Get role from your auth store
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

  // useEffect to fetch data when the component mounts or the role changes
  useEffect(() => {
    const getCategoryContacts = async () => {
      if (!role) return; // Don't fetch if the role is not yet available

      const rolesDict = { "cata": "A", "catb": "B", "catc": "C" };
      const category = rolesDict[role];

      if (!category) {
        console.error("Invalid role for fetching contacts:", role);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:8000/api/get-contacts-by-category/?category=${category}`);

        // --- DATA TRANSFORMATION ---
        // Map the API response to the format your ContactCard and UI expects
        const formattedContacts = response.data.map(item => ({
          // 1. Spread the original API object first to get all its properties.
          ...item,

          // 2. Now, overwrite or create new properties needed for the UI.
          // This ensures your transformed values are the final ones.
          role: item.experiences?.[0]?.job_title || 'N/A',
          company: item.experiences?.[0]?.company || 'N/A',
          location: `${item.address?.city || ''}, ${item.address?.state || ''}`.trim() === ',' ? 'N/A' : `${item.address?.city || ''}, ${item.address?.state || ''}`,

          // This correctly transforms the skills string into an array.
          skills: item.skills ? item.skills.split(',').map(skill => skill.trim()) : [],

          // Generate UI-specific properties
          initials: getInitials(item.name),
          avatarColor: getAvatarColor(item.contact_id),
        }));

        setContacts(formattedContacts); // Update the state with the formatted data
      } catch (error) {
        console.error("Failed to fetch contacts:", error);
      }
    };

    getCategoryContacts();
  }, [role]); // Dependency array: re-run the effect if the user's role changes

  const taskStatus = {
    completed: 7,
    total: 16,
    percentage: 44,
  };

  // Filter logic now operates on the 'contacts' state variable
  const filteredContacts = contacts.filter((contact) => {
    const searchTermLower = searchTerm.toLowerCase();

    // Check if skills is an array before joining
    const skillsString = Array.isArray(contact.skills) ? contact.skills.join(' ').toLowerCase() : '';

    const matchesSearch =
      contact.name?.toLowerCase().includes(searchTermLower) ||
      contact.company?.toLowerCase().includes(searchTermLower) ||
      contact.role?.toLowerCase().includes(searchTermLower) ||
      skillsString.includes(searchTermLower);

    const matchesStatus =
      statusFilter === "All Status" || contact.status === statusFilter; // Assuming a 'status' field might exist
    const matchesCategory =
      categoryFilter === "All Categories" ||
      contact.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

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

      setIsEditing(false);
      setEditingUser(null);
      setContacts(prev =>
        prev.map(contact =>
          contact.contact_id === updatedData.contact_id
            ? {
              ...contact,
              ...updatedData,
              contact_id: contact.contact_id // Ensure ID doesn't change
            }
            : contact
        )
      );

      showAlert("success", "Successfully edited user");
    } catch (error) {
      console.error("Failed to edit user:", error);
      showAlert("error", "Failed to edit user!");
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditingUser(null);
  };

  // Delete functionality handlers
  const handleDelete = (contact) => {
    setUserToDelete({
      ...contact,
      type: 'contact' // Set the delete type
    });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      // Make API call to delete the contact
      await axios.delete(`http://localhost:8000/api/delete-contact/${userToDelete.contact_id}`);

      // Remove the contact from local state
      setContacts(prev =>
        prev.filter(contact => contact.contact_id !== userToDelete.contact_id)
      );

      // Close modal and reset state
      setShowDeleteModal(false);
      setUserToDelete(null);
      showAlert("success", "Successfully deleted user");
      console.log('Contact deleted successfully');
    } catch (error) {
      console.error('Failed to delete contact:', error);
      showAlert("error", "Failed to delete user");
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
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
                isEditMode={true} // This is now edit mode, not add mode
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
                    key={contact.contact_id} // Use a unique and stable key
                    contact={contact}
                    onEdit={() => handleEditClick(contact)}
                    onDelete={() => handleDelete(contact)}
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

              {/* Delete Confirmation Modal - MOVED HERE */}
              <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
                itemName={userToDelete?.name}
                deleteType={userToDelete?.type} // Pass the delete type
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MiddleManHome;
