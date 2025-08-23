import React, { useState, useEffect } from "react";
import { Search, ChevronDown } from "lucide-react";
import StatusBar from "../components/StatusBar";
import ContactCard from "../components/MiddleManCard";
import DetailsInput from "../components/DetailsInput";
import Header from "../components/Header";
import { useAuthStore } from "../store/AuthStore";
import axios from "axios";

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

const MiddleManHome = () => {
  const [contacts, setContacts] = useState([]); // State to hold API data
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [isAdding, setIsAdding] = useState(false);
  const [addingUser, setAddingUser] = useState(null);
  const { role } = useAuthStore(); // Get role from your auth store

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

  const handleAddClick = (user) => {
    setAddingUser(user || null);
    setIsAdding(true);
  };

  const handleAddComplete = (updatedData) => {
    // Here you would typically make an API call to save the data.
    // For now, we'll just close the form.
    console.log("Saving data:", updatedData);
    setIsAdding(false);
    setAddingUser(null);
    // Optionally, re-fetch data or update state optimistically.
  };

  const handleAddCancel = () => {
    setIsAdding(false);
    setAddingUser(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {isAdding ? (
            <div className="p-5">
              <DetailsInput
                onBack={handleAddCancel}
                onSave={handleAddComplete}
                initialData={addingUser}
                isAddMode={true} // You might want to distinguish between add and edit modes
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
                    onEdit={() => handleAddClick(contact)}
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
    </div>
  );
};

export default MiddleManHome;