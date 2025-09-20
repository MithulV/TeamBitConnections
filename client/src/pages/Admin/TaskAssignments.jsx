import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/AuthStore";
import Alert from "../../components/Alert/Alert";
import Header from "../../components/Header/Header";
import api from "../../utils/axios";
import { format, parseISO } from "date-fns";
import {
  LayoutDashboard,
  Plus,
  Clock,
  CheckCircle,
  Calendar,
  User,
  Target,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Edit,
  Trash2,
  UserCheck,
} from "lucide-react";

import ContactAutocomplete from "../../components/ContactAutocomplete/ContactAutocomplete";
import DeleteConfirmationModal from "../../components/Modals/DeleteConfirmationModal";
import TaskModal from "../../components/Modals/TaskModal";
import TaskStatsCards from "../../components/TaskStats/TaskStatsCards";
import PerformanceAnalytics from "../../components/TaskAnalytics/PerformanceAnalytics";

function TaskAssignments() {
  const [data, setData] = useState([]);
  const [allTasks, setAllTasks] = useState({});
  const [stats, setStats] = useState({});
  const [categoryStats, setCategoryStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeFilter, setActiveFilter] = useState("pending");
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage] = useState(5);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { id, role } = useAuthStore();

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

  useEffect(() => {
    getTasks();
  }, [role]);

  const getTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/get-tasks?category=${role}`);
      setData(response.data.data);
      setStats(response.data.stats);

      if (role === "admin" && response.data.adminData) {
        setAllTasks({
          pending: response.data.adminData.pendingTasks,
          completed: response.data.adminData.completedTasks,
          total: response.data.adminData.totalTasks,
          manual: response.data.adminData.manualTasks,
          automated: response.data.adminData.automatedTasks,
        });
      } else {
        setAllTasks({
          pending: response.data.data,
          total: response.data.data,
          manual: response.data.data.filter(
            (task) => task.task_type === "assigned"
          ),
          automated: response.data.data.filter(
            (task) => task.task_type === "automated"
          ),
          completed: [],
        });
      }

      calculateCategoryStats(response.data.data, response.data.adminData);
      console.log(response.data);
    } catch (error) {
      console.error(error);
      showAlert("error", "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const calculateCategoryStats = (tasks, adminData) => {
    const categories = ['A', 'B', 'C'];
    const categoryPerformance = {};

    categories.forEach(category => {
      const categoryTasks = tasks?.filter(task => task.task_assigned_category === category) || [];
      const completedTasks = categoryTasks.filter(task => task.task_completion);
      const totalTasks = categoryTasks.length;
      const completionPercentage = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

      categoryPerformance[category] = {
        total: totalTasks,
        completed: completedTasks.length,
        pending: totalTasks - completedTasks.length,
        percentage: completionPercentage,
        isUnderperforming: completionPercentage < 80,
      };
    });

    setCategoryStats(categoryPerformance);
  };

  const createTask = async (taskData) => {
    try {
      setIsSubmitting(true);
      console.log("Creating task with data:", taskData);
      await api.post("/api/create-task", taskData);
      setShowCreateForm(false);
      showAlert("success", "Task created successfully");
      getTasks();
    } catch (error) {
      console.error(error);
      showAlert("error", "Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateTask = async (taskData) => {
    try {
      setIsSubmitting(true);
      
      console.log("🔧 Editing task:", editingTask);
      console.log("🔧 Update data:", taskData);
      
      // Handle different possible ID field names
      const taskId = editingTask.task_id || editingTask.id || editingTask._id;
      
      console.log("🔧 Using task ID:", taskId);
      
      if (!taskId) {
        console.error("❌ No task ID found in editingTask:", editingTask);
        showAlert("error", "Task ID not found");
        return;
      }
      
      const response = await api.put(`/api/update-task/${taskId}`, taskData);
      console.log("🔧 Update response:", response.data);
      
      setShowEditForm(false);
      setEditingTask(null);
      showAlert("success", "Task updated successfully");
      getTasks();
    } catch (error) {
      console.error("❌ Update error:", error);
      console.error("❌ Error response:", error.response?.data);
      showAlert("error", "Failed to update task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteTask = async () => {
    try {
      setIsDeleting(true);
      
      // Handle different possible ID field names
      const taskId = deletingTask.task_id || deletingTask.id || deletingTask._id;
      
      if (!taskId) {
        showAlert("error", "Task ID not found");
        return;
      }
      
      await api.delete(`/api/delete-task/${taskId}`);
      setShowDeleteConfirm(false);
      setDeletingTask(null);
      showAlert("success", "Task deleted successfully");
      getTasks();
    } catch (error) {
      console.error(error);
      showAlert("error", "Failed to delete task");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = (task) => {
    console.log("Edit clicked for task:", task);
    setEditingTask(task);
    setShowEditForm(true);
  };

  const handleDeleteClick = (task) => {
    console.log("Delete clicked for task:", task);
    setDeletingTask(task);
    setShowDeleteConfirm(true);
  };

  const getTaskPriority = (deadline) => {
    const today = new Date();
    const taskDeadline = new Date(deadline);
    const daysUntilDeadline = Math.ceil(
      (taskDeadline - today) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilDeadline < 0)
      return { label: "Overdue", color: "bg-red-100 text-red-800" };
    if (daysUntilDeadline <= 2)
      return { label: "Urgent", color: "bg-orange-100 text-orange-800" };
    if (daysUntilDeadline <= 7)
      return { label: "High", color: "bg-yellow-100 text-yellow-800" };
    return { label: "Normal", color: "bg-green-100 text-green-800" };
  };

  const getCurrentTasks = () => {
    const tasks = allTasks[activeFilter] || [];
    const indexOfLastTask = currentPage * tasksPerPage;
    const indexOfFirstTask = indexOfLastTask - tasksPerPage;
    return tasks.slice(indexOfFirstTask, indexOfLastTask);
  };

  const totalPages = Math.ceil(
    (allTasks[activeFilter]?.length || 0) / tasksPerPage
  );

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getFilterTitle = () => {
    switch (activeFilter) {
      case "total":
        return "All Tasks";
      case "completed":
        return "Completed Tasks";
      case "pending":
        return "Pending Tasks";
      case "manual":
        return "Manual Tasks";
      case "automated":
        return "Automated Tasks";
      case "performance":
        return "Category Performance Analytics";
      default:
        return "Tasks";
    }
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

      <div className="w-full bg-white shadow-sm sticky top-0 z-50 border-b-2 border-b-gray-50">
        <div className="flex justify-end">
          <Header />
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="container mx-auto">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <LayoutDashboard className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Task Management Dashboard
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Assign and monitor tasks efficiently
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 w-full sm:w-auto"
            >
              <Plus size={18} className="sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Create Task</span>
            </button>
          </div>

          {/* Stats Cards Component */}
          <TaskStatsCards 
            stats={stats}
            categoryStats={categoryStats}
            activeFilter={activeFilter}
            handleFilterChange={handleFilterChange}
          />

          {/* Tasks List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2">
                  {activeFilter === "performance" ? (
                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  ) : (
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  )}
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    {getFilterTitle()}
                  </h2>
                  {activeFilter !== "performance" && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs sm:text-sm">
                      {allTasks[activeFilter]?.length || 0} tasks
                    </span>
                  )}
                </div>

                {activeFilter !== "performance" && (
                  <div className="text-xs sm:text-sm text-gray-500">
                    Page {currentPage} of {totalPages || 1}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {activeFilter === "performance" ? (
                <PerformanceAnalytics categoryStats={categoryStats} />
              ) : (
                <>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
                    </div>
                  ) : getCurrentTasks().length === 0 ? (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full mb-4">
                        <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                      </div>
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                        No {activeFilter} tasks
                      </h3>
                      <p className="text-sm sm:text-base text-gray-500">
                        No tasks found for this category.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        {getCurrentTasks().map((task, index) => {
                          const priority = getTaskPriority(task.task_deadline);
                          const isCompleted = task.task_completion;
                          const showActions = !isCompleted && activeFilter !== "completed";

                          return (
                            <div
                              key={task.task_id || task.id || index}
                              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 overflow-hidden relative"
                            >
                              <div className="flex flex-col space-y-3 min-w-0">
                                <div className="flex-1 min-w-0">
                                  {/* Title and badges with edit/delete icons */}
                                  <div className="flex flex-col space-y-3 mb-3">
                                    {/* Title and Action Icons Row */}
                                    <div className="flex justify-between items-start w-full">
                                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words hyphens-auto min-w-0 flex-1 pr-2">
                                        {task.task_title}
                                      </h3>

                                      {/* Edit and Delete Icons - Top Right Corner */}
                                      {showActions && (
                                        <div className="flex gap-2 flex-shrink-0">
                                          <button
                                            onClick={() => handleEditClick(task)}
                                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                                            title="Edit Task"
                                          >
                                            <Edit className="w-4 h-4" />
                                          </button>
                                          <button
                                            onClick={() => handleDeleteClick(task)}
                                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors duration-200"
                                            title="Delete Task"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>
                                      )}
                                    </div>

                                    {/* Badges container - Separate line */}
                                    <div className="flex flex-wrap gap-2">
                                      <span
                                        className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${priority.color}`}
                                      >
                                        {priority.label}
                                      </span>
                                      <span
                                        className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                                          task.task_type === "assigned"
                                            ? "bg-blue-100 text-blue-800"
                                            : "bg-gray-100 text-gray-800"
                                        }`}
                                      >
                                        {task.task_type === "assigned" ? "Manual" : "Automated"}
                                      </span>
                                      {task.task_completion && (
                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 whitespace-nowrap">
                                          Completed
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Description */}
                                  {task.task_description && (
                                    <p className="text-sm sm:text-base text-gray-600 mb-3 break-words hyphens-auto whitespace-pre-wrap">
                                      {task.task_description}
                                    </p>
                                  )}

                                  {/* Task details */}
                                  <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:gap-6 text-xs sm:text-sm text-gray-500">
                                    <div className="flex items-center gap-1 whitespace-nowrap">
                                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                      <span>
                                        Due: {format(parseISO(task.task_deadline), "PPP")}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <User className="w-3 h-3 sm:w-4 sm:h-4" />
                                      <span className="break-words">
                                        Category: {task.task_assigned_category}
                                      </span>
                                    </div>
                                    {/* Show assigned contact if available */}
                                    {task.assigned_to_name && (
                                      <div className="flex items-center gap-1">
                                        <UserCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                                        <span className="break-words">
                                          Assigned: {task.assigned_to_name}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 pt-4 border-t border-gray-200">
                          <button
                            onClick={prevPage}
                            disabled={currentPage === 1}
                            className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors duration-200"
                          >
                            <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                            Previous
                          </button>

                          <span className="text-xs sm:text-sm text-gray-700 text-center">
                            Showing {(currentPage - 1) * tasksPerPage + 1} to{" "}
                            {Math.min(
                              currentPage * tasksPerPage,
                              allTasks[activeFilter]?.length || 0
                            )}{" "}
                            of {allTasks[activeFilter]?.length || 0} tasks
                          </span>

                          <button
                            onClick={nextPage}
                            disabled={currentPage === totalPages}
                            className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors duration-200"
                          >
                            Next
                            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Create Task Modal */}
      <TaskModal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={createTask}
        title="Create New Task"
        submitText="Create Task"
        mode="create"
        isSubmitting={isSubmitting}
      />

      {/* Enhanced Edit Task Modal */}
      <TaskModal
        isOpen={showEditForm}
        onClose={() => {
          setShowEditForm(false);
          setEditingTask(null);
        }}
        onSubmit={updateTask}
        title="Edit Task"
        submitText="Update Task"
        task={editingTask}
        mode="edit"
        isSubmitting={isSubmitting}
      />

      {/* Enhanced Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteConfirm}
        onConfirm={deleteTask}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDeletingTask(null);
        }}
        itemName={deletingTask?.task_title}
        deleteType="task"
        isDeleting={isDeleting}
      />
    </div>
  );
}

export default TaskAssignments;
