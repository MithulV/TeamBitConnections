import React from "react";
import { BarChart3, AlertTriangle, TrendingDown } from "lucide-react";

const ProgressBar = ({ percentage, category }) => {
  const isUnderperforming = percentage < 80;
  const barColor = isUnderperforming
    ? "bg-red-500"
    : percentage >= 90
      ? "bg-green-500"
      : "bg-yellow-500";

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          Category {category}
        </span>
        <span className={`text-sm font-bold ${isUnderperforming ? 'text-red-600' : 'text-gray-600'}`}>
          {percentage}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const PerformanceAnalytics = ({ categoryStats }) => {
  console.log(categoryStats);
  const underperformingCategories = Object.entries(categoryStats).filter(
    ([_, stats]) => stats.isUnderperforming
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Object.entries(categoryStats).map(([category, stats]) => (
          <div
            key={category}
            className={`bg-white rounded-xl p-6 shadow-sm border-2 transition-all duration-200 ${
              stats.isUnderperforming
                ? "border-red-300 bg-red-50"
                : "border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${
                  stats.isUnderperforming ? "bg-red-100" : "bg-blue-100"
                }`}>
                  <BarChart3 className={`w-5 h-5 ${
                    stats.isUnderperforming ? "text-red-600" : "text-blue-600"
                  }`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Category {category}
                </h3>
              </div>
              {stats.isUnderperforming && (
                <AlertTriangle className="w-5 h-5 text-red-500" />
              )}
            </div>

            <ProgressBar percentage={stats.percentage} category={category} />

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="text-xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
              <div className="bg-green-50 rounded-lg p-2">
                <div className="text-xl font-bold text-green-600">{stats.completed}</div>
                <div className="text-xs text-gray-600">Completed</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-2">
                <div className="text-xl font-bold text-orange-600">{stats.pending}</div>
                <div className="text-xs text-gray-600">Pending</div>
              </div>
            </div>

            {stats.isUnderperforming && (
              <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <TrendingDown className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-red-800">
                      Performance Alert
                    </div>
                    <div className="text-xs text-red-700">
                      Category {category} is underperforming with only {stats.percentage}% completion rate.
                      Immediate attention required to improve productivity.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {underperformingCategories.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Performance Issues Detected
              </h3>
              <p className="text-red-800 mb-3">
                {underperformingCategories.length} categor{underperformingCategories.length === 1 ? 'y' : 'ies'} {underperformingCategories.length === 1 ? 'is' : 'are'} operating below the 80% completion threshold:
              </p>
              <div className="space-y-1">
                {underperformingCategories.map(([category, stats]) => (
                  <div key={category} className="text-sm text-red-700">
                    • Category {category}: {stats.percentage}% completion rate ({stats.completed}/{stats.total} tasks)
                  </div>
                ))}
              </div>
              <div className="mt-3 text-sm font-medium text-red-800">
                Recommended Action: Review task allocation, provide additional resources, or reassess deadlines for underperforming categories.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceAnalytics;
