import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, UserPlus, Edit, FileText, CheckCircle, Users, Trash2, Phone, Calendar, Activity, X } from 'lucide-react';
import { format } from 'date-fns';

const RecentEventsTimeline = ({ contacts }) => {
  const [modificationHistory, setModificationHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [showFullHistory, setShowFullHistory] = useState(false);

  // Fetch modification history from API
  useEffect(() => {
    const fetchModificationHistory = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/get-all-modification-history/`
        );
        const data = response.data;

        if (data.success && data.data) {
          setModificationHistory(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch modification history:", error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchModificationHistory();
  }, []);

  // Helper functions
  const getModificationTypeIcon = (modificationType) => {
    switch (modificationType) {
      case "CREATE":
        return <UserPlus className="w-4 h-4" />;
      case "UPDATE":
        return <Edit className="w-4 h-4" />;
      case "USER UPDATE":
        return <FileText className="w-4 h-4" />;
      case "USER VERIFY":
        return <CheckCircle className="w-4 h-4" />;
      case "ASSIGN":
        return <Users className="w-4 h-4" />;
      case "DELETE":
        return <Trash2 className="w-4 h-4" />;
      case "CONTACT":
        return <Phone className="w-4 h-4" />;
      case "UPDATE USER EVENT":
        return <Calendar className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getModificationTypeTitle = (modificationType) => {
    switch (modificationType) {
      case "CREATE":
        return "Contact Created";
      case "UPDATE":
        return "Profile Updated";
      case "USER UPDATE":
        return "Information Modified";
      case "USER VERIFY":
        return "Profile Verified";
      case "ASSIGN":
        return "Contact Assigned";
      case "DELETE":
        return "Contact Removed";
      case "CONTACT":
        return "Contact Activity";
      case "UPDATE USER EVENT":
        return "Event Added";
      default:
        return "Activity Logged";
    }
  };

  const getModificationTypeColor = (modificationType) => {
    switch (modificationType) {
      case "CREATE":
        return "from-emerald-50 to-green-100 border-emerald-200 text-emerald-700";
      case "UPDATE":
        return "from-blue-50 to-indigo-100 border-blue-200 text-blue-700";
      case "USER UPDATE":
        return "from-amber-50 to-orange-100 border-amber-200 text-amber-700";
      case "USER VERIFY":
        return "from-violet-50 to-purple-100 border-violet-200 text-violet-700";
      case "ASSIGN":
        return "from-cyan-50 to-teal-100 border-cyan-200 text-cyan-700";
      case "DELETE":
        return "from-rose-50 to-red-100 border-rose-200 text-rose-700";
      case "CONTACT":
        return "from-pink-50 to-fuchsia-100 border-pink-200 text-pink-700";
      case "UPDATE USER EVENT":
        return "from-yellow-50 to-amber-100 border-yellow-200 text-yellow-700";
      default:
        return "from-slate-50 to-gray-100 border-slate-200 text-slate-700";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Combine modification history with existing contact data
  const combinedActivityHistory = [
    ...modificationHistory.map((item) => ({
      id: item.id,
      type: "modification",
      modificationType: item.modification_type,
      initiator: item.username,
      assignedTo: item.assigned_to_username,
      date: formatDate(item.created_at),
      time: new Date(item.created_at).toLocaleTimeString(),
      title: getModificationTypeTitle(item.modification_type),
      description: item.description,
      contactName: item.contact_name || "Unknown Contact",
      created_at: item.created_at,
    })),
    // Add recent contact additions
    ...contacts.slice(0, 10).map((contact) => ({
      id: `contact-${contact.contact_id}`,
      type: "contact_added",
      modificationType: "CREATE",
      initiator: contact.added_by || "System",
      title: `${contact.name || "Unknown"} joined`,
      description: contact.event_name
        ? `Event: ${contact.event_name.split(";")[0]}`
        : `Category: ${contact.category || "N/A"}`,
      contactName: contact.name,
      date: formatDate(contact.created_at),
      time: contact.created_at
        ? new Date(contact.created_at).toLocaleTimeString()
        : "Unknown",
      category: contact.category,
      created_at: contact.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 15);

  // Full History Modal Component
  const FullHistoryModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-5 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
              <Clock className="text-white w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                System Activity Timeline
              </h2>
              <p className="text-slate-300 text-sm">
                {combinedActivityHistory.length} system interactions tracked
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowFullHistory(false)}
            className="p-2 hover:bg-slate-700 rounded-xl transition-colors group"
          >
            <X className="w-5 h-5 text-slate-300 group-hover:text-white" />
          </button>
        </div>

        {/* Enhanced Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] bg-gradient-to-br from-slate-50 to-gray-100">
          {isLoadingHistory ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-3 border-indigo-600 border-t-transparent"></div>
              <span className="mt-4 text-gray-600 font-medium">
                Loading system activity...
              </span>
            </div>
          ) : (
            <div className="space-y-4">
              {combinedActivityHistory.map((historyItem, index) => (
                <div
                  key={`${historyItem.type}-${historyItem.id}`}
                  className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-300 group"
                >
                  <div className="flex items-start gap-4">
                    {/* Enhanced Icon */}
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-sm bg-gradient-to-br ${getModificationTypeColor(
                        historyItem.modificationType
                      )}`}
                    >
                      {getModificationTypeIcon(historyItem.modificationType)}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Enhanced Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-gray-800 bg-gray-100 px-3 py-1 rounded-full">
                            {historyItem.initiator}
                          </span>
                          {historyItem.assignedTo && (
                            <div className="flex items-center gap-1 text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                              <span>assigned to</span>
                              <span className="font-semibold">
                                {historyItem.assignedTo}
                              </span>
                            </div>
                          )}
                          {historyItem.contactName && (
                            <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-full border border-green-200">
                              {historyItem.contactName}
                            </span>
                          )}
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          <div className="font-medium">{historyItem.date}</div>
                          <div>{historyItem.time}</div>
                        </div>
                      </div>

                      {/* Enhanced Title and Description */}
                      <h4 className="font-bold text-gray-900 mb-2 text-lg group-hover:text-indigo-700 transition-colors">
                        {historyItem.title}
                      </h4>
                      <p className="text-gray-700 leading-relaxed">
                        {historyItem.description}
                      </p>

                      {/* Activity Badge */}
                      <div className="mt-3 flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gradient-to-r ${getModificationTypeColor(
                            historyItem.modificationType
                          )}`}
                        >
                          Activity #{combinedActivityHistory.length - index}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Recent System Activity
          </h2>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <div className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">
              Live Updates
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              <span className="ml-2 text-gray-600">
                Loading recent activity...
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              {combinedActivityHistory.slice(0, 3).map((historyItem, index) => (
                <div
                  key={`recent-${historyItem.type}-${historyItem.id}`}
                  className="flex items-start gap-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 hover:border-gray-200 transition-all duration-200 group"
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg flex-shrink-0 shadow-sm bg-gradient-to-br ${getModificationTypeColor(
                      historyItem.modificationType
                    )}`}
                  >
                    {getModificationTypeIcon(historyItem.modificationType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-800 bg-gray-100 px-2 py-1 rounded-full">
                          {historyItem.initiator}
                        </span>
                        {historyItem.assignedTo && (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                            → {historyItem.assignedTo}
                          </span>
                        )}
                        {historyItem.contactName && (
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                            {historyItem.contactName}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {historyItem.date} • {historyItem.time}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-indigo-700 transition-colors">
                      {historyItem.title}
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {historyItem.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => setShowFullHistory(true)}
            className="w-full mt-6 py-3 text-center bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-all duration-200 rounded-xl font-semibold text-indigo-700 border border-indigo-200 hover:border-indigo-300 flex items-center justify-center gap-2"
          >
            <Clock className="w-4 h-4" />
            View Complete System Timeline ({combinedActivityHistory.length}{" "}
            activities)
          </button>
        </div>
      </div>

      {/* Full History Modal */}
      {showFullHistory && <FullHistoryModal />}
    </>
  );
};

export default RecentEventsTimeline;
