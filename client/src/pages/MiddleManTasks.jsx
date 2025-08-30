import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  Eye,
  Clock,
  Target,
  Trophy,
} from "lucide-react";
import Header from "../components/Header";
import { useAuthStore } from "../store/AuthStore";
import axios from "axios";
// Mock API functions (replace with your actual API calls)
const mockTasks = [
  {
    id: 1,
    task_title: "Verify Customer Address",
    task_type: "assigned",
    task_assigned_category: "high",
    task_assigned_date: "2025-08-20",
    task_deadline: "2025-08-25",
    task_description:
      "Check and confirm customer's address record for account verification. This includes validating the provided address against government records and ensuring all details are accurate.",
    status: "pending",
  },
  {
    id: 2,
    task_title: "Process Payment Verification",
    task_type: "automated",
    task_assigned_category: "medium",
    task_assigned_date: "2025-08-18",
    task_deadline: "2025-08-23",
    task_description:
      "Automated verification of customer payment method and transaction history. System will validate payment credentials and flag any suspicious activities.",
    status: "pending",
  },
  {
    id: 3,
    task_title: "Update Customer Profile",
    task_type: "assigned",
    task_assigned_category: "low",
    task_assigned_date: "2025-08-19",
    task_deadline: "2025-08-26",
    task_description:
      "Review and update customer information based on recent documentation. Ensure all profile fields are complete and accurate.",
    status: "pending",
  },
  {
    id: 4,
    task_title: "Send Welcome Email",
    task_type: "automated",
    task_assigned_category: "low",
    task_assigned_date: "2025-08-15",
    task_deadline: "2025-08-20",
    task_description:
      "Automated welcome email sent to new customer after account creation. Include onboarding materials and next steps.",
    status: "completed",
  },
  {
    id: 5,
    task_title: "Schedule Follow-up Call",
    task_type: "assigned",
    task_assigned_category: "high",
    task_assigned_date: "2025-08-22",
    task_deadline: "2025-08-27",
    task_description:
      "Schedule and conduct follow-up call with customer regarding service satisfaction. Document any concerns or feedback.",
    status: "pending",
  },
  {
    id: 6,
    task_title: "Generate Monthly Report",
    task_type: "reporting",
    task_assigned_category: "medium",
    task_assigned_date: "2025-08-25",
    task_deadline: "2025-08-30",
    task_description:
      "Automated generation of monthly customer activity and engagement report. Include metrics on customer satisfaction and service utilization.",
    status: "pending",
  },
];

const fetchTasks = async () => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockTasks), 500);
  });
};

const updateTaskStatus = async (taskId, status) => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => resolve({ success: true }), 300);
  });
};

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");

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
          const response = await axios.get(
            `http://localhost:8000/api/get-tasks/?category=${category}`,
          );

          setTasks(response.data.data || []);
          console.log("Tasks fetched:", response.data);
        } else {
          console.log("No valid category found, setting empty tasks");
          setTasks([]);
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
      await updateTaskStatus(taskId, "completed");
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: "completed" } : task
        )
      );
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.task_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.task_description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterType === "All" ||
      (filterType === "Assigned" && task.task_type === "assigned") ||
      (filterType === "Automated" && task.task_type === "automated") ||
      (filterType === "Reporting" && task.task_type === "reporting") ||
      (filterType === "Completed" && task.status === "completed");

    return matchesSearch && matchesFilter;
  });

  const pendingTasks = filteredTasks.filter(
    (task) => task.status === "pending"
  );
  const completedTasks = filteredTasks.filter(
    (task) => task.status === "completed"
  );
  const totalTasks = filteredTasks.length;
  const completedCount = completedTasks.length;
  const progressPercentage =
    totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;

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
          <h3 className="font-semibold text-gray-900 text-lg mb-2">
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
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              Assigned: {formatDate(task.task_assigned_date)}
            </span>
            <span
              className={`flex items-center gap-1 ${getDueDateColor(
                task.task_deadline,
                task.status
              )}`}
            >
              <Clock size={14} />
              Due: {formatDate(task.task_deadline)}
            </span>
          </div>
        </div>
        {task.status === "completed" && (
          <CheckCircle2 className="text-green-500 ml-2" size={24} />
        )}
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {task.task_description}
      </p>

      {task.status === "pending" && (
        <div className="flex gap-2">
          <button
            onClick={() => handleCompleteTask(task.id)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <CheckCircle2 size={16} />
            Complete
          </button>
        </div>
      )}
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
                  <option value="Reporting">Reporting</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="text-blue-600" size={20} />
                  <span className="font-medium text-gray-900">Progress</span>
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {completedCount} of {totalTasks} completed
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {progressPercentage.toFixed(0)}% complete
              </div>
            </div>
          </div>

          {/* All tasks completed message */}
          {pendingTasks.length === 0 && totalTasks > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200 p-8 text-center mb-6">
              <Trophy className="mx-auto text-green-500 mb-4" size={48} />
              <h3 className="text-2xl font-bold text-green-800 mb-2">
                All tasks completed! 
              </h3>
              <p className="text-green-600">
                Great job! You've finished all your tasks.
              </p>
            </div>
          )}

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
              {filterType === "All" || filterType === "Completed"
                ? completedTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))
                : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
