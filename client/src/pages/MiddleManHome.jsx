import React, { useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import StatusBar from "../components/StatusBar";
import ContactCard from "../components/MiddleManCard";
import DetailsInput from "../components/DetailsInput";

const MiddleManHome = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [isAdding, setIsAdding] = useState(false);
  const [addingUser, setAddingUser] = useState(null);

  // Sample data
  const contacts = [
    {
      name: "Charlie Wilson",
      role: "Software Engineer",
      company: "NeuroNet",
      location: "San Francisco, CA",
      phone: "9988776611",
      email: "charlie.wilson@neuronet.com",
      category: "A",
      skills: [
        "Gen AI",
        "Machine Learning",
        "Python",
        "Full stack development",
        "React",
        "Node.js",
      ],
      avatarColor: "#4F46E5",
      initials: "CW",
    },
    {
      name: "Carol White",
      role: "Data Scientist",
      company: "DataWorks",
      location: "New York, NY",
      phone: "3456789012",
      email: "carol.white@dataworks.com",
      category: "A",
      skills: ["Python", "R"],
      avatarColor: "#DC2626",
      initials: "CW",
    },
    {
      name: "Mithul Varshan",
      role: "AI Engineer",
      company: "SkyTech",
      location: "Austin, TX",
      phone: "9965390035",
      email: "mithul@skytech.com",
      category: "B",
      skills: ["Python", "TensorFlow"],
      avatarColor: "#059669",
      initials: "MV",
    },
    {
      name: "Alice Thomas",
      role: "Volunteer",
      company: "Community Center",
      location: "Seattle, WA",
      phone: "2234567890",
      email: "alice.thomas@community.org",
      category: "C",
      skills: ["Community Outreach", "Event Planning"],
      avatarColor: "#7C3AED",
      initials: "AT",
    },
  ];

  const taskStatus = {
    completed: 7,
    total: 16,
    percentage: 44,
  };

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All Status" || contact.status === statusFilter;
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
    // You can handle saving logic here (e.g., update contacts array)
    setIsAdding(false);
    setAddingUser(null);
  };

  const handleAddCancel = () => {
    setIsAdding(false);
    setAddingUser(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {isAdding ? (
          <div className="p-5">
            <DetailsInput
              onBack={handleAddCancel}
              onSave={handleAddComplete}
              initialData={addingUser}
              isAddMode={true}
            />
          </div>
        ) : (
          <>
            {/* Search and Filters */}
            <div className="flex gap-4 items-center mb-6">
              <div className="flex-1 relative">
                <Search
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search contacts by name, company, or role..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative">
                <select
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                />
              </div>
              <div className="relative">
                <select
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                />
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
              {filteredContacts.map((contact, index) => (
                <ContactCard
                  key={index}
                  contact={contact}
                  onEdit={() => handleAddClick(contact)}
                />
              ))}
            </div>
            {filteredContacts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-2">
                  No contacts found
                </div>
                <div className="text-gray-500">
                  Try adjusting your search or filters
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MiddleManHome;
