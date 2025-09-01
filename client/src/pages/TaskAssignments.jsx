import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/AuthStore';
import Alert from '../components/Alert';
import Header from '../components/Header';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { 
  LayoutDashboard, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  User,
  FileText,
  Target,
  ChevronLeft,
  ChevronRight,
  Zap,
  X
} from 'lucide-react';

function TaskAssignments() {
  const [data, setData] = useState([]);
  const [allTasks, setAllTasks] = useState({});
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage] = useState(5);
  const { id, role } = useAuthStore();
  
  const [newTask, setNewTask] = useState({
    task_title: '',
    task_description: '',
    task_deadline: '',
    task_assigned_category: '',
  });

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
      const response = await axios.get(`http://localhost:8000/api/get-tasks?category=${role}`);
      setData(response.data.data);
      setStats(response.data.stats);
      
      // Store all task types for admin
      if (role === 'admin' && response.data.adminData) {
        setAllTasks({
          pending: response.data.adminData.pendingTasks,
          completed: response.data.adminData.completedTasks,
          total: response.data.adminData.totalTasks,
          manual: response.data.adminData.manualTasks,
          automated: response.data.adminData.automatedTasks
        });
      } else {
        // For non-admin, set the data appropriately
        setAllTasks({
          pending: response.data.data,
          total: response.data.data,
          manual: response.data.data.filter(task => task.task_type === 'assigned'),
          automated: response.data.data.filter(task => task.task_type === 'automated'),
          completed: [] // Non-admin doesn't see completed tasks
        });
      }
      
      console.log(response.data);
    } catch (error) {
      console.error(error);
      showAlert('error', 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async () => {
    if (!newTask.task_title || !newTask.task_assigned_category || !newTask.task_deadline) {
      showAlert('error', 'Please fill all required fields');
      return;
    }

    try {
      await axios.post('http://localhost:8000/api/create-task', newTask);
      
      setNewTask({
        task_title: '',
        task_description: '',
        task_deadline: '',
        task_assigned_category: ''
      });
      
      setShowCreateForm(false);
      showAlert('success', 'Task created successfully');
      getTasks();
    } catch (error) {
      console.error(error);
      showAlert('error', 'Failed to create task');
    }
  };

  const getTaskPriority = (deadline) => {
    const today = new Date();
    const taskDeadline = new Date(deadline);
    const daysUntilDeadline = Math.ceil((taskDeadline - today) / (1000 * 60 * 60 * 24));

    if (daysUntilDeadline < 0) return { label: 'Overdue', color: 'bg-red-100 text-red-800' };
    if (daysUntilDeadline <= 2) return { label: 'Urgent', color: 'bg-orange-100 text-orange-800' };
    if (daysUntilDeadline <= 7) return { label: 'High', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Normal', color: 'bg-green-100 text-green-800' };
  };

  // Get current tasks based on filter and pagination
  const getCurrentTasks = () => {
    const tasks = allTasks[activeFilter] || [];
    const indexOfLastTask = currentPage * tasksPerPage;
    const indexOfFirstTask = indexOfLastTask - tasksPerPage;
    return tasks.slice(indexOfFirstTask, indexOfLastTask);
  };

  const totalPages = Math.ceil((allTasks[activeFilter]?.length || 0) / tasksPerPage);

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
      case 'total': return 'All Tasks';
      case 'completed': return 'Completed Tasks';
      case 'pending': return 'Pending Tasks';
      case 'manual': return 'Manual Tasks';
      case 'automated': return 'Automated Tasks';
      default: return 'Tasks';
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
      
      <Header />
      
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <LayoutDashboard className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Task Management Dashboard</h1>
                <p className="text-gray-600">Assign and monitor tasks efficiently</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus size={20} />
              Create Task
            </button>
          </div>

          {/* Stats Cards - Clickable */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            {/* Total Tasks */}
            <div 
              className={`bg-white rounded-xl p-6 shadow-sm border-2 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                activeFilter === 'total' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => handleFilterChange('total')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total || 0}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Completed Tasks */}
            <div 
              className={`bg-white rounded-xl p-6 shadow-sm border-2 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                activeFilter === 'completed' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'
              }`}
              onClick={() => handleFilterChange('completed')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-3xl font-bold text-green-600">{stats.completed || 0}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Pending Tasks */}
            <div 
              className={`bg-white rounded-xl p-6 shadow-sm border-2 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                activeFilter === 'pending' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'
              }`}
              onClick={() => handleFilterChange('pending')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.pending || 0}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            {/* Manual Tasks */}
            <div 
              className={`bg-white rounded-xl p-6 shadow-sm border-2 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                activeFilter === 'manual' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
              }`}
              onClick={() => handleFilterChange('manual')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Manual Tasks</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.breakdown?.assigned?.total || 0}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Automated Tasks */}
            <div 
              className={`bg-white rounded-xl p-6 shadow-sm border-2 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                activeFilter === 'automated' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
              }`}
              onClick={() => handleFilterChange('automated')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Automated</p>
                  <p className="text-3xl font-bold text-indigo-600">{stats.breakdown?.automated?.total || 0}</p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-full">
                  <Zap className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Tasks List with Pagination */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <h2 className="text-xl font-semibold text-gray-900">{getFilterTitle()}</h2>
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                    {allTasks[activeFilter]?.length || 0} tasks
                  </span>
                </div>
                
                {/* Pagination Info */}
                <div className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages || 1}
                </div>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : getCurrentTasks().length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <CheckCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No {activeFilter} tasks</h3>
                  <p className="text-gray-500">No tasks found for this category.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {getCurrentTasks().map((task, index) => {
                      const priority = getTaskPriority(task.task_deadline);
                      return (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">{task.task_title}</h3>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${priority.color}`}>
                                  {priority.label}
                                </span>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  task.task_type === 'assigned' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {task.task_type === 'assigned' ? 'Manual' : 'Automated'}
                                </span>
                                {task.task_completion && (
                                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                    Completed
                                  </span>
                                )}
                              </div>
                              
                              {task.task_description && (
                                <p className="text-gray-600 mb-3">{task.task_description}</p>
                              )}
                              
                              <div className="flex items-center gap-6 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>Due: {format(parseISO(task.task_deadline), 'PPP')}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <User className="w-4 h-4" />
                                  <span>Category: {task.task_assigned_category}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                      <button
                        onClick={prevPage}
                        disabled={currentPage === 1}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors duration-200"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </button>

                      <span className="text-sm text-gray-700">
                        Showing {((currentPage - 1) * tasksPerPage) + 1} to {Math.min(currentPage * tasksPerPage, allTasks[activeFilter]?.length || 0)} of {allTasks[activeFilter]?.length || 0} tasks
                      </span>

                      <button
                        onClick={nextPage}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors duration-200"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Create Task Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm" onClick={() => setShowCreateForm(false)}></div>
          
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 transform transition-all duration-300 scale-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Plus className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Create New Task</h2>
              </div>
              <button
                onClick={() => setShowCreateForm(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                  placeholder="Enter a descriptive task title"
                  value={newTask.task_title}
                  onChange={(e) => setNewTask({...newTask, task_title: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 resize-none"
                  placeholder="Provide detailed task description..."
                  rows={4}
                  value={newTask.task_description}
                  onChange={(e) => setNewTask({...newTask, task_description: e.target.value})}
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Assign To Category <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={newTask.task_assigned_category}
                  onChange={(e) => setNewTask({...newTask, task_assigned_category: e.target.value})}
                >
                  <option value="">Select a category</option>
                  <option value="A">Category A</option>
                  <option value="B">Category B</option>
                  <option value="C">Category C</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Deadline <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={newTask.task_deadline}
                  onChange={(e) => setNewTask({...newTask, task_deadline: e.target.value})}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setShowCreateForm(false)}
                className="flex-1 px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={createTask}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!newTask.task_title || !newTask.task_assigned_category || !newTask.task_deadline}
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskAssignments;
