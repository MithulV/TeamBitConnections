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
  Target
} from 'lucide-react';

function TaskAssignments() {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { id, role } = useAuthStore();
  
  const [newTask, setNewTask] = useState({
    task_title: '',
    task_description: '',
    task_assigned_to: '',
    task_deadline: '',
    task_assigned_category: role
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
    } catch (error) {
      console.error(error);
      showAlert('error', 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async () => {
    if (!newTask.task_title || !newTask.task_assigned_to || !newTask.task_deadline) {
      showAlert('error', 'Please fill all required fields');
      return;
    }

    try {
      await axios.post('http://localhost:8000/api/create-task', newTask);
      
      setNewTask({
        task_title: '',
        task_description: '',
        task_assigned_to: '',
        task_deadline: '',
        task_assigned_category: role
      });
      
      setShowCreateForm(false);
      showAlert('success', 'Task created successfully');
      getTasks(); // Refresh tasks
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
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-lg"
            >
              <Plus size={20} />
              Create Task
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
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

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
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

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
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

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
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
          </div>

          {/* Tasks List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-900">Pending Tasks</h2>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                  {data.length} tasks
                </span>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : data.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <CheckCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No pending tasks</h3>
                  <p className="text-gray-500">All tasks have been completed or no tasks have been assigned yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.map((task, index) => {
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
                                <span>Assigned to: {task.task_assigned_to}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowCreateForm(false)}></div>
          
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Create New Task</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter task title"
                  value={newTask.task_title}
                  onChange={(e) => setNewTask({...newTask, task_title: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter task description"
                  rows={3}
                  value={newTask.task_description}
                  onChange={(e) => setNewTask({...newTask, task_description: e.target.value})}
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign To *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter user ID or name"
                  value={newTask.task_assigned_to}
                  onChange={(e) => setNewTask({...newTask, task_assigned_to: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline *</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={newTask.task_deadline}
                  onChange={(e) => setNewTask({...newTask, task_deadline: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateForm(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={createTask}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                disabled={!newTask.task_title || !newTask.task_assigned_to || !newTask.task_deadline}
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
