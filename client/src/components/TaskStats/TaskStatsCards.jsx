import React from "react";
import { Target, CheckCircle, Clock, User, Zap, BarChart3 } from "lucide-react";

const TaskStatsCards = ({ stats, categoryStats, activeFilter, handleFilterChange }) => {
  const statsData = [
    {
      key: "total",
      title: "Total Tasks",
      value: stats.total || 0,
      icon: Target,
      color: "blue"
    },
    {
      key: "completed",
      title: "Completed",
      value: stats.completed || 0,
      icon: CheckCircle,
      color: "green"
    },
    {
      key: "pending",
      title: "Pending",
      value: stats.pending || 0,
      icon: Clock,
      color: "orange"
    },
    {
      key: "manual",
      title: "Manual Tasks",
      value: stats.breakdown?.assigned?.total || 0,
      icon: User,
      color: "purple"
    },
    {
      key: "automated",
      title: "Automated",
      value: stats.breakdown?.automated?.total || 0,
      icon: Zap,
      color: "indigo"
    },
    {
      key: "performance",
      title: "Performance",
      value: `${Object.values(categoryStats).filter(stat => !stat.isUnderperforming).length}/3`,
      icon: BarChart3,
      color: "teal"
    }
  ];

  const getCardClasses = (key, color) => {
    const isActive = activeFilter === key;
    return `bg-white rounded-xl p-4 sm:p-6 shadow-sm border-2 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
      isActive
        ? `border-${color}-500 bg-${color}-50`
        : `border-gray-200 hover:border-${color}-300`
    }`;
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-6 mb-8">
      {statsData.map(({ key, title, value, icon: Icon, color }) => (
        <div
          key={key}
          className={getCardClasses(key, color)}
          onClick={() => handleFilterChange(key)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                {title}
              </p>
              <p className={`text-2xl sm:text-3xl font-bold text-${color}-600`}>
                {value}
              </p>
            </div>
            <div className={`p-2 sm:p-3 bg-${color}-100 rounded-full`}>
              <Icon className={`w-5 h-5 sm:w-6 sm:h-6 text-${color}-600`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskStatsCards;
