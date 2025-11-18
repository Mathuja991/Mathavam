import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/**
 * Statistics display card component.
 */
const StatCard = ({ title, value, desc, icon, iconColor, bgColor }) => (
  <div className={`p-4 rounded-xl flex items-center space-x-4 ${bgColor}`}>
    <div className={`text-4xl ${iconColor}`}>
      <FontAwesomeIcon icon={icon} />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{desc}</p>
    </div>
  </div>
);

export default StatCard;