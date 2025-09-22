import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  Clock,
  Target,
  Eye,
  X,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import { useAuthStore } from "../../store/AuthStore";
import api from "../../utils/axios";

const TasksPage = () => {
  const { id } = useAuthStore();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
  });

  const authStore = useAuthStore();

  const getCategory = (category) => {
    switch (category) {
      case "cata":
        return "A";
      case "catb":
        return "B";
      case "catc":
        return "C";
      default:
        return null;
    }
  };

  // Helper functions for contact formatting [web:574][web:581]
  const getInitials = (name) => {
    if (!name) return "??";
    const names = name.split(' ');
    const initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) {
      return initials + names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  };

  const getAvatarColor = (contactId) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
      '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43'
    ];
    return colors[contactId % colors.length];
  };

  // Updated navigateToContactProfile function [web:569][web:572]
  const navigateToContactProfile = async (contactId) => {
    try {
      console.log("Fetching complete contact data for ID:", contactId);

      // Use the updated GetFilteredContacts API with contact_id parameter
      const response = await api.get(`/api/contacts/filter/?contact_id=${contactId}`);
      
      if (!response.data.success) {
        console.error("Failed to fetch contact data:", response.data.message);
        alert("Failed to load contact information");
        return;
      }

      // Extract the single contact data from the response [web:573][web:574]
      const contactData = response.data.data.contact;
      
      if (!contactData) {
        console.error("Contact data not found in response");
        alert("Contact information not available");
        return;
      }

      console.log("Raw contact data:", contactData);

      // Format the single contact object (not array) [web:574][web:577]
      const formattedContact = {
        ...contactData,
        role: contactData.experiences?.[0]?.job_title || "N/A",
        company: contactData.experiences?.[0]?.company || "N/A",
        location:
          `${contactData.city || ""}, ${contactData.state || ""}`.trim() === ","
            ? "N/A"
            : `${contactData.city || ""}, ${contactData.state || ""}`,
        skills: contactData.skills
          ? contactData.skills.split(",").map((skill) => skill.trim())
          : [],
        initials: getInitials(contactData.name),
        avatarColor: getAvatarColor(contactData.contact_id),
      };

      console.log("Formatted contact data:", {
        contact_id: formattedContact.contact_id,
        name: formattedContact.name,
        role: formattedContact.role,
        company: formattedContact.company,
        location: formattedContact.location,
        skills_count: formattedContact.skills.length,
        experiences_count: formattedContact.experiences?.length || 0,
        events_count: formattedContact.events?.length || 0
      });

      // Navigate to profile with formatted contact data [web:577][web:582]
      navigate(`/profile/${formattedContact.contact_id}`, { 
        state: formattedContact 
      });

    } catch (error) {
      console.error("Error fetching contact data:", error);

      // Enhanced error handling with user-friendly messages
      let errorMessage = "Failed to load contact information";

      if (error.response?.status === 404) {
        errorMessage = "Contact not found";
      } else if (error.response?.status === 403) {
        errorMessage = "You don't have permission to view this contact";
      } else if (error.response?.status === 500) {
        errorMessage = "Server error occurred while fetching contact data";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = `Network error: ${error.message}`;
      }

      alert(errorMessage);
    }
  };

  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        const category = getCategory(authStore.role);

        if (category) {
          const response = await api.get(`/api/get-tasks/?category=${category}`);
          setTasks(response.data.data || []);
          setTaskStats(response.data.stats || { total: 0, completed: 0, pending: 0 });
        } else {
          setTasks([]);
          setTaskStats({ total: 0, completed: 0, pending: 0 });
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    if (authStore.role) {
      fetchTaskData();
    } else {
      setLoading(false);
    }
  }, [authStore.role]);

  const handleCompleteTask = async (taskId) => {
    try {
      const taskToComplete = tasks.find((task) => task.id === taskId);

      const response = await api.put(`/api/complete-task/${taskId}`, {
        modified_by: id,
      });

      if (response.data.success) {
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
        setTaskStats((prevStats) => {
          const newStats = {
            ...prevStats,
            completed: prevStats.completed + 1,
            pending: prevStats.pending - 1,
          };

          if (prevStats.breakdown && taskToComplete) {
            const taskType = taskToComplete.task_type;
            if (taskType === "assigned" || taskType === "automated") {
              newStats.breakdown = {
                ...prevStats.breakdown,
                [taskType]: {
                  ...prevStats.breakdown[taskType],
                  completed: prevStats.breakdown[taskType].completed + 1,
                  pending: prevStats.breakdown[taskType].pending - 1,
                },
              };
            }
          }

          return newStats;
        });
      }
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  const handleViewDetails = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTask(null);
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.task_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.task_description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterType === "All" ||
      (filterType === "Assigned" && task.task_type === "assigned") ||
      (filterType === "Automated" && task.task_type === "automated");

    return matchesSearch && matchesFilter;
  });

  const pendingTasks = filteredTasks;

  const getFilteredStats = () => {
    if (filterType === "All") {
      return {
        completed: taskStats.completed,
        total: taskStats.total,
        pending: taskStats.pending,
      };
    } else if (filterType === "Assigned") {
      return taskStats.breakdown?.assigned || { completed: 0, total: 0, pending: 0 };
    } else if (filterType === "Automated") {
      return taskStats.breakdown?.automated || { completed: 0, total: 0, pending: 0 };
    }
    return { completed: 0, total: 0, pending: 0 };
  };

  const filteredStats = getFilteredStats();
  const filteredCompletedCount = filteredStats.completed;
  const filteredTotalTasks = filteredStats.total;
  const progressPercentage =
    filteredTotalTasks > 0 ? (filteredCompletedCount / filteredTotalTasks) * 100 : 0;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    date.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays < 0) return "Overdue";
    if (diffDays === 1) return "Tomorrow";
    return `In ${diffDays} days`;
  };

  const getDueDateColor = (dueDate, status) => {
    if (status === "completed") return "text-green-600";

    const today = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "text-red-600";
    if (diffDays <= 1) return "text-orange-600";
    return "text-gray-600";
  };

  const TaskCard = ({ task }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-gray-300 min-w-0">
      <div className="flex items-start justify-between mb-4 min-w-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900 text-lg line-clamp-1 truncate min-w-0 flex-1">
              {task.task_title}
            </h3>
            {task.contact_id && (
              <button
                onClick={() => navigateToContactProfile(task.contact_id)}
                className="ml-2 p-1 text-gray-400 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50"
                title={`View profile of ${task.assigned_to_name || 'Contact'}`}
              >
                <ExternalLink size={16} />
              </button>
            )}
          </div>

          {task.assigned_to_name && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-600">
                Assigned to: <span className="font-medium text-gray-800">{task.assigned_to_name}</span>
              </span>
              {task.assigned_to_email && (
                <span className="text-xs text-gray-500">({task.assigned_to_email})</span>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 mb-3">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                task.task_type === "assigned"
                  ? "bg-blue-100 text-blue-700"
                  : task.task_type === "automated"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {task.task_type === "assigned"
                ? "👤 Assigned"
                : task.task_type === "automated"
                ? "🤖 Automated"
                : `📋 ${task.task_type}`}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <span className="flex items-center gap-1 bg-green-100 rounded-2xl p-1">
              <Calendar size={14} />
              Assigned: {formatDate(task.created_at)}
            </span>
            <span
              className={`flex items-center gap-1 ${getDueDateColor(
                task.task_deadline,
                "pending"
              )} bg-red-100 rounded-2xl p-1`}
            >
              <Clock size={14} />
              Due: {formatDate(task.task_deadline)}
            </span>
          </div>
        </div>
      </div>
      <div className="flex h-19 flex-1">
        <p
          className="text-gray-600 text-sm mb-4 min-w-0"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "normal",
            maxHeight: "2.8em",
          }}
        >
          {task.task_description}
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => handleViewDetails(task)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Eye size={16} />
          View Details
        </button>
        <button
          onClick={() => handleCompleteTask(task.id)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <CheckCircle2 size={16} />
          Complete
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="w-full bg-white shadow-sm sticky top-0 z-50 border-b-2 border-b-gray-50">
        <div className="flex justify-end">
          <Header />
        </div>
      </div>

      <div className="p-6">
        <div className="container mx-auto">
          <h1 className="text-3xl font-semibold text-gray-800 mb-4">Tasks</h1>
          <p className="text-gray-600 mb-6">
            Manage and track your assigned and automated tasks
          </p>

          {/* Controls */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="flex-1 relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search tasks by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter */}
              <div className="relative">
                <Filter
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={20}
                />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none cursor-pointer min-w-[160px]"
                >
                  <option value="All">All Tasks</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Automated">Automated</option>
                </select>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="text-blue-600" size={20} />
                  <span className="font-medium text-gray-900">
                    Progress ({filterType} Tasks)
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {filteredCompletedCount} of {filteredTotalTasks} completed
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {progressPercentage.toFixed(0)}% complete • {filteredTasks.length} pending
              </div>
            </div>
          </div>

          {/* Tasks Grid */}
          {filteredTasks.length === 0 && searchTerm ? (
            <div className="text-center py-12">
              <Search className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-gray-500 mb-2">No tasks found</h3>
              <p className="text-gray-400">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task Details Modal */}
      {showModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-semibold text-gray-900">Task Details</h2>
                {selectedTask.contact_id && (
                  <button
                    onClick={() => {
                      navigateToContactProfile(selectedTask.contact_id);
                      closeModal();
                    }}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50"
                    title={`View profile of ${selectedTask.assigned_to_name || 'Contact'}`}
                  >
                    <ExternalLink size={18} />
                  </button>
                )}
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Task Title */}
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {selectedTask.task_title}
              </h3>

              {/* Contact Info Section */}
              {selectedTask.assigned_to_name && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Assigned Contact</h4>
                  <div className="space-y-1">
                    <p className="text-blue-900 font-medium">{selectedTask.assigned_to_name}</p>
                    {selectedTask.assigned_to_email && (
                      <p className="text-blue-700 text-sm">{selectedTask.assigned_to_email}</p>
                    )}
                    {selectedTask.assigned_to_phone && (
                      <p className="text-blue-700 text-sm">{selectedTask.assigned_to_phone}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Task Type and Category */}
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    selectedTask.task_type === "assigned"
                      ? "bg-blue-100 text-blue-700"
                      : selectedTask.task_type === "automated"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {selectedTask.task_type === "assigned"
                    ? "👤 Assigned"
                    : selectedTask.task_type === "automated"
                    ? "🤖 Automated"
                    : `📋 ${selectedTask.task_type}`}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                  Category: {selectedTask.task_assigned_category}
                </span>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                  <Calendar size={18} className="text-green-600" />
                  <div>
                    <p className="text-sm text-green-600 font-medium">Assigned Date</p>
                    <p className="text-green-800">{formatDate(selectedTask.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                  <Clock size={18} className="text-red-600" />
                  <div>
                    <p className="text-sm text-red-600 font-medium">Due Date</p>
                    <p className="text-red-800">{formatDate(selectedTask.task_deadline)}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-900 mb-3">Description</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedTask.task_description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    handleCompleteTask(selectedTask.id);
                    closeModal();
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  <CheckCircle2 size={18} />
                  Complete Task
                </button>
                <button
                  onClick={closeModal}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
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

export default TasksPage;
