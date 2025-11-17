// components/IconButton.jsx
// (මෙය .tsx වුවත් ගැටළුවක් නැත, .jsx ලෙස භාවිතා කරන්න)

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// icon, title, onClick, සහ අලුත් badge prop එක භාරගැනීම
const IconButton = ({ icon, title, onClick, badge, ...props }) => {
  return (
    // 'relative' class එක badge එක නිවැරදිව පෙන්වීමට අත්‍යවශ්‍යයි
    <button
      type="button"
      onClick={onClick} // Dashboard.tsx සහ NotificationBell.jsx වලින් එන onClick function එක
      title={title}
      className="relative w-10 h-10 flex items-center justify-center text-gray-600 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      {...props} // වෙනත් ඕනෑම props (disabled වැනි)
    >
      <FontAwesomeIcon icon={icon} className="h-5 w-5" />
      
      {/* --- අලුතින් එකතු කළ BADGE එක පෙන්වීමේ Logic එක --- */}
      {badge && (
        <span className="absolute -top-1 -right-1 block h-5 w-5 min-w-[20px] rounded-full bg-red-600 text-white text-xs font-medium ring-2 ring-white flex items-center justify-center p-1">
          {badge}
        </span>
      )}
    </button>
  );
};

export default IconButton;