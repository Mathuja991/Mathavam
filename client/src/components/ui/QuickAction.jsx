import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/**
 * Quick action button component for navigation/actions.
 */
const QuickAction = ({ title, desc, onClick, icon, bgColor }) => (
  <button
    onClick={onClick}
    className={`p-6 rounded-xl text-white transform hover:scale-[1.03] transition-all duration-300 ease-in-out shadow-lg ${bgColor} flex flex-col items-start text-left min-h-[150px]`}
  >
    <FontAwesomeIcon icon={icon} className="text-3xl mb-3" />
    <h3 className="text-xl font-semibold mb-1">{title}</h3>
    <p className="text-sm opacity-90">{desc}</p>
  </button>
);

export default QuickAction;