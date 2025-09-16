import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Users, UserX } from 'lucide-react';
import { format } from 'date-fns';

const OnlineUsersCard = () => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [onlineCount, setOnlineCount] = useState(0);
  const [onlinePercentage, setOnlinePercentage] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchOnlineUsers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/users/online"
      );

      if (response.data.success) {
        setOnlineUsers(response.data.data || []);
        setTotalUsers(response.data.totalCount || 0);
        setOnlineCount(response.data.onlineCount || 0);
        setOnlinePercentage(response.data.onlinePercentage || 0);
      }

      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch online users:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnlineUsers();

    // Refresh every 10 seconds
    const interval = setInterval(fetchOnlineUsers, 10000);

    return () => clearInterval(interval);
  }, []);

  const getTimeAgo = (dateString) => {
    if (!dateString) return "Unknown";

    const now = new Date();
    const lastSeen = new Date(dateString);
    const diff = now - lastSeen;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-semibold text-gray-900">Online Users</h2>
          <div className="ml-auto">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading online users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-green-600" />
        <h2 className="text-lg font-semibold text-gray-900">Online Users</h2>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
            Live
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-700">Total Users</p>
            <p className="text-2xl font-bold text-green-800">
              {totalUsers.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-green-700">
              Currently Online
            </p>
            <p className="text-2xl font-bold text-green-800">{onlineCount}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-green-700">Online Rate</p>
            <p className="text-lg font-bold text-green-800">
              {onlinePercentage}%
            </p>
          </div>
        </div>
      </div>

      {/* Online Users List */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Active Users ({onlineCount})
        </h3>

        {/* FIXED HEIGHT CONTAINER WITH SCROLLING */}
        <div 
          className="overflow-y-auto space-y-2 pr-2"
          style={{ height: '210px' }} 
        >
          {onlineUsers.length > 0 ? (
            onlineUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {(user.username || user.email || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {user.username || user.email || "Unknown User"}
                    </p>
                    <p className="text-xs text-gray-600">
                      Role: {user.role || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-xs text-green-600 font-medium">
                      Online
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {getTimeAgo(user.last_seen)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <UserX className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                No users are currently online
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Users will appear here when they're active
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Refresh Info */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Auto-refreshes every 10 seconds • Last updated:{" "}
          {format(new Date(), "HH:mm:ss")}
        </p>
      </div>
    </div>
  );
};

export default OnlineUsersCard;
