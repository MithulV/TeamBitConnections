import React from 'react';

const QuickActionCard = ({
  title,
  description,
  icon: Icon,
  onClick,
  color,
  badge,
}) => (
  <div
    className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer hover:border-blue-300 group relative"
    onClick={onClick}
  >
    {badge && (
      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
        {badge}
      </div>
    )}
    <div className="flex items-center gap-3">
      <div
        className={`p-2 rounded-lg ${color} group-hover:scale-105 transition-transform`}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  </div>
);

export default QuickActionCard;
