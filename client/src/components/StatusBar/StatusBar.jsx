import React from 'react';

const StatusBar = ({ completed, total, percentage }) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-800">Tasks status</h3>
        <span className="text-2xl font-bold text-gray-800">{percentage}%</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">{completed} of {total} completed</span>
        <div className="flex-1 bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;