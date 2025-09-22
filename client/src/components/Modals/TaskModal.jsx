import React, { useState, useEffect } from "react";
import { Plus, Edit, X, FileText, User, Calendar } from "lucide-react";
import ContactAutocomplete from "../ContactAutocomplete/ContactAutocomplete";

const TaskModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  submitText,
  task,
  isSubmitting = false,
  mode = "create",
}) => {
  const [taskData, setTaskData] = useState({
    task_title: "",
    task_description: "",
    task_deadline: "",
    task_assigned_category: "",
    assigned_to: "",
    contact_id: null,
  });

  useEffect(() => {
    if (isOpen && mode === "edit" && task) {
      setTaskData({
        task_title: task.task_title || "",
        task_description: task.task_description || "",
        task_deadline: task.task_deadline ? task.task_deadline.split('T')[0] : "",
        task_assigned_category: task.task_assigned_category || "",
        assigned_to: task.assigned_to_name || "",
        contact_id: task.contact_id || null,
      });
    } else if (isOpen && mode === "create") {
      setTaskData({
        task_title: "",
        task_description: "",
        task_deadline: "",
        task_assigned_category: "",
        assigned_to: "",
        contact_id: null,
      });
    }
  }, [isOpen, mode, task]);

  const handleSubmit = () => {
    if (!taskData.task_title || !taskData.task_assigned_category || !taskData.task_deadline) {
      return;
    }

    const submitData = {
      task_title: taskData.task_title,
      task_description: taskData.task_description,
      task_deadline: taskData.task_deadline,
      task_assigned_category: taskData.task_assigned_category,
      contact_id: taskData.contact_id,
    };

    console.log("🚀 Submitting data:", submitData);
    onSubmit(submitData);
  };

  const handleContactChange = (name, contactId) => {
    setTaskData(prev => ({
      ...prev,
      assigned_to: name,
      contact_id: contactId
    }));
  };

  const handleContactSelect = (contact) => {
    console.log("Selected contact:", contact);
  };

  const isFormValid = taskData.task_title && taskData.task_assigned_category && taskData.task_deadline;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300"
        onClick={!isSubmitting ? onClose : undefined}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 transform transition-all duration-300 scale-100 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${mode === "edit" ? "bg-orange-100" : "bg-blue-100"}`}>
              {mode === "edit" ? (
                <Edit className="w-5 h-5 text-orange-600" />
              ) : (
                <Plus className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-600 mt-1">
                {mode === "edit" ? "Update task details below" : "Fill in the task information"}
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
          <div className="space-y-6">
            {/* Task Title */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Task Title <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-4 py-3.5 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-sm group-hover:border-gray-400"
                  placeholder="Enter a descriptive task title"
                  value={taskData.task_title}
                  onChange={(e) => setTaskData({ ...taskData, task_title: e.target.value })}
                  disabled={isSubmitting}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <FileText className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Description
              </label>
              <textarea
                className="w-full px-4 py-3.5 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 resize-none text-sm min-h-[100px] group-hover:border-gray-400"
                placeholder="Provide detailed task description (optional)"
                rows={4}
                value={taskData.task_description}
                onChange={(e) => setTaskData({ ...taskData, task_description: e.target.value })}
                disabled={isSubmitting}
              />
            </div>

            {/* Grid for Category, Deadline, and Assigned To */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Category */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm appearance-none group-hover:border-gray-400"
                    value={taskData.task_assigned_category}
                    onChange={(e) => setTaskData({ ...taskData, task_assigned_category: e.target.value })}
                    disabled={isSubmitting}
                  >
                    <option value="">Select category</option>
                    <option value="A">Category A</option>
                    <option value="B">Category B</option>
                    <option value="C">Category C</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Deadline */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Deadline <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    className="w-full px-4 py-3.5 pr-12 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm group-hover:border-gray-400 date-input-custom"
                    value={taskData.task_deadline}
                    onChange={(e) => setTaskData({ ...taskData, task_deadline: e.target.value })}
                    disabled={isSubmitting}
                    style={{ colorScheme: 'light' }}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Assigned To */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Assigned To
                </label>
                <ContactAutocomplete
                  value={taskData.assigned_to}
                  onChange={handleContactChange}
                  onSelect={handleContactSelect}
                  initialContactId={taskData.contact_id}
                  placeholder="Search contacts or leave empty"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Search and select a contact to assign this task
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 bg-gray-50 border-t border-gray-100 rounded-b-2xl">
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              className={`px-6 py-2.5 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[120px] ${
                mode === "edit"
                  ? "bg-orange-600 border-orange-600 hover:bg-orange-700 focus:ring-orange-500"
                  : "bg-blue-600 border-blue-600 hover:bg-blue-700 focus:ring-blue-500"
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
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
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  {mode === "edit" ? "Updating..." : "Creating..."}
                </>
              ) : (
                submitText
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Custom CSS */}
      <style jsx>{`
        .date-input-custom::-webkit-calendar-picker-indicator {
          opacity: 0;
          position: absolute;
          right: 12px;
          width: 20px;
          height: 100%;
          cursor: pointer;
        }
        
        .date-input-custom::-webkit-inner-spin-button,
        .date-input-custom::-webkit-clear-button {
          -webkit-appearance: none;
          display: none;
        }
      `}</style>
    </div>
  );
};

export default TaskModal;
