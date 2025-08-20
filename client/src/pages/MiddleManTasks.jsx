import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, CheckCircle2, Eye, Clock, Target, Trophy } from 'lucide-react';

// Mock API functions (replace with your actual API calls)
const mockTasks = [
  {
    id: 1,
    title: "Verify Customer Address",
    type: "assigned",
    status: "pending",
    dueDate: "2025-08-25",
    description: "Check and confirm customer's address record for account verification."
  },
  {
    id: 2,
    title: "Process Payment Verification",
    type: "automated",
    status: "pending",
    dueDate: "2025-08-23",
    description: "Automated verification of customer payment method and transaction history."
  },
  {
    id: 3,
    title: "Update Customer Profile",
    type: "assigned",
    status: "pending",
    dueDate: "2025-08-26",
    description: "Review and update customer information based on recent documentation."
  },
  {
    id: 4,
    title: "Send Welcome Email",
    type: "automated",
    status: "completed",
    dueDate: "2025-08-20",
    description: "Automated welcome email sent to new customer after account creation."
  },
  {
    id: 5,
    title: "Schedule Follow-up Call",
    type: "assigned",
    status: "pending",
    dueDate: "2025-08-27",
    description: "Schedule and conduct follow-up call with customer regarding service satisfaction."
  },
  {
    id: 6,
    title: "Generate Monthly Report",
    type: "automated",
    status: "pending",
    dueDate: "2025-08-30",
    description: "Automated generation of monthly customer activity and engagement report."
  }
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await updateTaskStatus(taskId, 'completed');
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, status: 'completed' }
            : task
        )
      );
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleViewDetails = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'All' || 
                         (filterType === 'Assigned' && task.type === 'assigned') ||
                         (filterType === 'Automated' && task.type === 'automated') ||
                         (filterType === 'Completed' && task.status === 'completed');

    return matchesSearch && matchesFilter;
  });

  const pendingTasks = filteredTasks.filter(task => task.status === 'pending');
  const completedTasks = filteredTasks.filter(task => task.status === 'completed');
  const totalTasks = filteredTasks.length;
  const completedCount = completedTasks.length;
  const progressPercentage = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0) return `In ${diffDays} days`;
    return `${Math.abs(diffDays)} days ago`;
  };

  const getDueDateColor = (dueDate, status) => {
    if (status === 'completed') return 'text-green-600';
    
    const today = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'text-red-600'; // Overdue
    if (diffDays <= 1) return 'text-orange-600'; // Due today/tomorrow
    return 'text-gray-600'; // Future
  };

  const TaskCard = ({ task }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-gray-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg mb-2">{task.title}</h3>
          <div className="flex items-center gap-3 mb-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              task.type === 'assigned' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-purple-100 text-purple-700'
            }`}>
              {task.type === 'assigned' ? '👤 Assigned' : '🤖 Automated'}
            </span>
            <span className={`inline-flex items-center gap-1 text-sm ${getDueDateColor(task.dueDate, task.status)}`}>
              <Calendar size={14} />
              {formatDate(task.dueDate)}
            </span>
          </div>
        </div>
        {task.status === 'completed' && (
          <CheckCircle2 className="text-green-500 ml-2" size={24} />
        )}
      </div>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{task.description}</p>
      
      {task.status === 'pending' && (
        <div className="flex gap-2">
          <button
            onClick={() => handleCompleteTask(task.id)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <CheckCircle2 size={16} />
            Complete
          </button>
          <button
            onClick={() => handleViewDetails(task)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            <Eye size={16} />
            View Details
          </button>
        </div>
      )}
    </div>
  );

  const TaskModal = () => (
    showModal && selectedTask && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Task Details</h3>
            <button
              onClick={() => setShowModal(false)}
              className="text-gray-400 hover:text-gray-600 text-2xl font-light"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-1">{selectedTask.title}</h4>
              <div className="flex items-center gap-2 mb-3">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  selectedTask.type === 'assigned' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-purple-100 text-purple-700'
                }`}>
                  {selectedTask.type === 'assigned' ? '👤 Assigned' : '🤖 Automated'}
                </span>
                <span className={`inline-flex items-center gap-1 text-sm ${getDueDateColor(selectedTask.dueDate, selectedTask.status)}`}>
                  <Calendar size={14} />
                  Due {formatDate(selectedTask.dueDate)}
                </span>
              </div>
            </div>
            
            <div>
              <h5 className="font-medium text-gray-700 mb-2">Description</h5>
              <p className="text-gray-600 text-sm">{selectedTask.description}</p>
            </div>
            
            <div>
              <h5 className="font-medium text-gray-700 mb-2">Status</h5>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                selectedTask.status === 'completed' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {selectedTask.status === 'completed' ? (
                  <>
                    <CheckCircle2 size={14} />
                    Completed
                  </>
                ) : (
                  <>
                    <Clock size={14} />
                    Pending
                  </>
                )}
              </span>
            </div>
          </div>
          
          <div className="mt-6 flex gap-2">
            {selectedTask.status === 'pending' && (
              <button
                onClick={() => {
                  handleCompleteTask(selectedTask.id);
                  setShowModal(false);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <CheckCircle2 size={16} />
                Mark Complete
              </button>
            )}
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tasks</h1>
        <p className="text-gray-600">Manage and track your assigned and automated tasks</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
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
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none cursor-pointer min-w-[160px]"
            >
              <option value="All">All Tasks</option>
              <option value="Assigned">Assigned</option>
              <option value="Automated">Automated</option>
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
          <h3 className="text-2xl font-bold text-green-800 mb-2">All tasks completed! 🎉</h3>
          <p className="text-green-600">Great job! You've finished all your tasks.</p>
        </div>
      )}

      {/* Tasks Grid */}
      {filteredTasks.length === 0 && searchTerm ? (
        <div className="text-center py-12">
          <Search className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gray-500 mb-2">No tasks found</h3>
          <p className="text-gray-400">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
          {filterType === 'All' || filterType === 'Completed' ? (
            completedTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))
          ) : null}
        </div>
      )}

      {/* Task Details Modal */}
      <TaskModal />
    </div>
  );
};

export default TasksPage;