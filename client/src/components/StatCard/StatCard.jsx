import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  trend,
  trendValue,
  status,
  subtext,
  valueColor,
}) => (
  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 transition-shadow duration-300 relative">
    {/* Fixed Icon Position - Top Right */}
    <div className={`absolute top-4 right-4 p-3 rounded-full ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>

    {/* Content Area - Fixed Width */}
    <div className="pr-16">
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className={`text-2xl font-bold mt-1 ${valueColor || "text-gray-900"}`}>
        {value}
      </p>
      {subtext && (
        <div className="flex items-center gap-1 mt-1">
          <p className="text-xs text-gray-500">{subtext}</p>
          {trend && trendValue !== undefined && (
            <>
              {trend === "up" ? (
                <TrendingUp className="w-3 h-3 text-green-500" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500" />
              )}
              <span
                className={`text-xs font-medium ${
                  trend === "up" ? "text-green-600" : "text-red-600"
                }`}
              >
                {Math.abs(trendValue)}%
              </span>
            </>
          )}
        </div>
      )}
    </div>
  </div>
);

export default StatCard;
