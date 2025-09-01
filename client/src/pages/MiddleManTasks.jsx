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
} from "lucide-react";
import Header from "../components/Header";
import { useAuthStore } from "../store/AuthStore";
import api from '../utils/axios';

const TasksPage = () => {
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
  console.log(authStore.role);

  const getCategory = (category) => {
    switch (category) {
      case "cata":
        return "A";
      case "catb":
        return "B";
      case "catc":
        return "C";
      default:
        return null; // Return null for unknown categories
    }
  };

  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        const category = getCategory(authStore.role);
        console.log("User role:", authStore.role);
        console.log("Mapped category:", category);

        if (category) {
          const response = await api.get(
            `/api/get-tasks/?category=${category}`
          );

          setTasks(response.data.data || []);
          setTaskStats(
            response.data.stats || { total: 0, completed: 0, pending: 0 }
          );
          console.log("Tasks fetched:", response.data);
          console.log("Task stats:", response.data.stats);
        } else {
          console.log("No valid category found, setting empty tasks");
          setTasks([]);
          setTaskStats({ total: 0, completed: 0, pending: 0 });
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setTasks([]); // Set empty array in case of error
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
      // Find the task being completed to know its type
      const taskToComplete = tasks.find((task) => task.id === taskId);

      const response = await api.put(
        `/api/complete-task/${taskId}`
      );

      if (response.data.success) {
        // Remove the completed task from the current tasks list
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));

        // Update stats to reflect the completion
        setTaskStats((prevStats) => {
          const newStats = {
            ...prevStats,
            completed: prevStats.completed + 1,
            pending: prevStats.pending - 1,
          };

          // Update breakdown stats if breakdown exists and we know the task type
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

  // Calculate progress based on filtered tasks using real breakdown data
  const pendingTasks = filteredTasks;

  // Get actual stats for the current filter from backend breakdown
  const getFilteredStats = () => {
    if (filterType === "All") {
      return {
        completed: taskStats.completed,
        total: taskStats.total,
        pending: taskStats.pending,
      };
    } else if (filterType === "Assigned") {
      return (
        taskStats.breakdown?.assigned || { completed: 0, total: 0, pending: 0 }
      );
    } else if (filterType === "Automated") {
      return (
        taskStats.breakdown?.automated || { completed: 0, total: 0, pending: 0 }
      );
    }
    return { completed: 0, total: 0, pending: 0 };
  };

  const filteredStats = getFilteredStats();
  const filteredCompletedCount = filteredStats.completed;
  const filteredTotalTasks = filteredStats.total;
  const progressPercentage =
    filteredTotalTasks > 0
      ? (filteredCompletedCount / filteredTotalTasks) * 100
      : 0;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday";
    if (diffDays > 0) return `In ${diffDays} days`;
    return `${Math.abs(diffDays)} days ago`;
  };

  const getDueDateColor = (dueDate, status) => {
    if (status === "completed") return "text-green-600";

    const today = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "text-red-600"; // Overdue
    if (diffDays <= 1) return "text-orange-600"; // Due today/tomorrow
    return "text-gray-600"; // Future
  };

  const TaskCard = ({ task }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-gray-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-1">
            {task.task_title}
          </h3>
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

      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {task.task_description}
      </p>

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
      <Header />
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
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
                {progressPercentage.toFixed(0)}% complete •{" "}
                {filteredTasks.length} pending
              </div>
            </div>
          </div>

          {/* Tasks Grid */}
          {filteredTasks.length === 0 && searchTerm ? (
            <div className="text-center py-12">
              <Search className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-gray-500 mb-2">
                No tasks found
              </h3>
              <p className="text-gray-400">
                Try adjusting your search or filter criteria
              </p>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900">
                Task Details
              </h2>
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
                    <p className="text-sm text-green-600 font-medium">
                      Assigned Date
                    </p>
                    <p className="text-green-800">
                      {formatDate(selectedTask.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                  <Clock size={18} className="text-red-600" />
                  <div>
                    <p className="text-sm text-red-600 font-medium">Due Date</p>
                    <p className="text-red-800">
                      {formatDate(selectedTask.task_deadline)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-900 mb-3">
                  Description
                </h4>
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
