// components/NotificationBell.jsx

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// අලුත් icon එකක් import කරමු (e.g., faInfoCircle)
import { faBell, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import IconButton from './IconButton'; // IconButton component එක

// Timestamp function එක (වෙනසක් නැත)
function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
}

// Dashboard එකෙන් එන 'user' prop එක භාරගැනීම
const NotificationBell = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // childRegNo එක ලබාගැනීම (වෙනසක් නැත)
  const getChildRegNo = () => {
    try {
      if (user && user.userType === 'Parent' && user.childRegNo) {
        return user.childRegNo;
      }
    } catch (e) {
      console.error('Error reading user prop', e);
    }
    return null;
  };
  const childRegNo = getChildRegNo();

  // Notifications fetch කිරීම (වෙනසක් නැත)
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!childRegNo) {
        setNotifications([]); // Parent නොවේ නම් හිස් කිරීම
        return;
      }
      try {
        const res = await axios.post('http://localhost:5000/api/notifications', {
          childRegNo: childRegNo
        });
        if (res.data && Array.isArray(res.data)) {
          setNotifications(res.data);
        } else {
          setNotifications([]);
        }
      } catch (err) {
        console.error('Failed to fetch notifications:', err.response ? err.response.data : err.message);
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 120000);
    return () => clearInterval(interval);
  }, [childRegNo]);

  // Dropdown එකෙන් පිටත click කළ විට වැසීම (වෙනසක් නැත)
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Bell icon එක click කළ විට (Mark as Read) (වෙනසක් නැත)
  const handleToggle = async () => {
    setIsOpen(!isOpen);
    const currentUnreadCount = notifications.filter(n => !n.isRead).length;
    if (!isOpen && currentUnreadCount > 0 && childRegNo) {
      try {
        await axios.put('http://localhost:5000/api/notifications/mark-read', {
          childRegNo: childRegNo
        });
        setNotifications(prev =>
          prev.map(n => ({ ...n, isRead: true }))
        );
      } catch (err) {
        console.error('Failed to mark notifications as read:', err.response ? err.response.data : err.message);
      }
    }
  };

  // unreadCount එක render කිරීමට පෙර ලබාගැනීම
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // --- Render Logic ---
  return (
    <div className="relative" ref={dropdownRef}>
      {/* IconButton එක (වෙනසක් නැත) */}
      <IconButton
        icon={faBell}
        title="Notifications"
        onClick={handleToggle}
        badge={unreadCount > 0 ? String(unreadCount) : undefined}
      />

      {/* Dropdown එක open වූ විට */}
      {isOpen && (
        <div
          // --- Dropdown Style ---
          className="absolute right-0 mt-2 w-80 max-w-sm bg-white rounded-xl shadow-lg border border-gray-100 dark:bg-slate-800 dark:border-slate-700 z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="p-3 border-b border-gray-200 dark:border-slate-700">
            <h4 className="font-semibold text-gray-800 dark:text-slate-100">Notifications</h4>
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-700"> {/* අයිතම අතර line එකක් */}
            {notifications.length === 0 ? (
              // Empty State
              <div className="p-6 text-center">
                 <FontAwesomeIcon icon={faBell} className="text-3xl text-gray-300 dark:text-slate-600 mb-2" />
                 <p className="text-sm text-gray-500 dark:text-slate-400">
                   You have no new notifications.
                 </p>
              </div>
            ) : (
              // --- Notification Item Mapping ---
              notifications.map(notif => (
                <div
                  key={notif._id}
                  // --- Notification Item Style (Unread/Read වෙනස) ---
                  className={`flex items-start gap-3 p-3 transition-colors ${
                    !notif.isRead
                      ? 'bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50' // Unread style
                      : 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50'     // Read style
                  }`}
                >
                  {/* Icon */}
                  <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full grid place-items-center ${
                       !notif.isRead ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600 dark:bg-slate-600 dark:text-slate-300'
                     }`}>
                     <FontAwesomeIcon icon={faInfoCircle} className="h-3 w-3" />
                     {/* Unread dot (Optional) */}
                     {/* {!notif.isRead && <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-1 ring-white"></span>} */}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                     {/* Message */}
                     <p className={`text-sm ${
                        !notif.isRead ? 'font-medium text-gray-800 dark:text-slate-100' : 'text-gray-600 dark:text-slate-300'
                      }`}>
                       {notif.message}
                     </p>
                     {/* Timestamp and RegNo */}
                     <div className="flex justify-between items-center mt-1 text-xs text-gray-400 dark:text-slate-500">
                       <span>{timeAgo(notif.createdAt)}</span>
                       {notif.patientRegNo && (
                         <span className="font-medium text-gray-500 dark:text-slate-400">
                           Reg: {notif.patientRegNo}
                         </span>
                       )}
                     </div>
                  </div>
                </div>
              ))
            )}
          </div>
           {/* Footer (Optional) */}
           {/* <div className="p-2 text-center border-t border-gray-200 dark:border-slate-700">
             <a href="#" className="text-sm text-blue-600 hover:underline">View All</a>
           </div> */}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;