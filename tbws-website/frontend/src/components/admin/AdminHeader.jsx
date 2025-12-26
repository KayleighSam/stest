import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Bell, 
  Search, 
  User, 
  Menu, 
  Mail, 
  Calendar,
  X,
  ArrowRight,
  Clock,
  ChevronDown,
  LogOut,
  Settings,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { contentService } from '../../api/content';
import toast from 'react-hot-toast';
import './AdminHeader.css';

const AdminHeader = ({ onMenuClick }) => {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Fetch unread messages and upcoming events for notifications
  const { data: messagesData } = useQuery({
    queryKey: ['header-messages'],
    queryFn: async () => {
      const response = await contentService.getMessages({ is_read: false });
      return response.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: eventsData } = useQuery({
    queryKey: ['header-events'],
    queryFn: async () => {
      const response = await contentService.getPosts({ post_type: 'event' });
      return response.data;
    },
  });

  const unreadMessages = messagesData?.results || messagesData || [];
  const events = eventsData?.results || eventsData || [];
  
  // Get upcoming events (within next 7 days)
  const upcomingEvents = events.filter(event => {
    if (!event.event_date) return false;
    const eventDate = new Date(event.event_date);
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return eventDate >= now && eventDate <= sevenDaysFromNow;
  }).slice(0, 3);

  const totalNotifications = unreadMessages.length + upcomingEvents.length;

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/admin/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <>
      <header className="admin-header">
        <div className="admin-header-left">
          <button className="mobile-menu-btn" onClick={onMenuClick}>
            <Menu size={24} />
          </button>
          
          <div className="admin-search">
            <Search size={18} />
            <input type="text" placeholder="Search posts, events, messages..." />
          </div>
        </div>

        <div className="admin-header-right">
          {/* Notifications */}
          <div className="notification-wrapper">
            <button 
              className="admin-icon-btn"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} strokeWidth={1.5} />
              {totalNotifications > 0 && (
                <span className="admin-badge">{totalNotifications}</span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <NotificationsDropdown
                  messages={unreadMessages}
                  events={upcomingEvents}
                  onClose={() => setShowNotifications(false)}
                />
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          <div className="user-menu-wrapper">
            <button 
              className="admin-user-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="user-avatar">
                {user?.first_name?.charAt(0) || 'A'}
              </div>
              <span className="user-name">{user?.first_name || 'Admin'}</span>
              <ChevronDown size={16} />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <UserMenuDropdown
                  user={user}
                  onLogout={handleLogout}
                  onClose={() => setShowUserMenu(false)}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Overlay for dropdowns */}
      {(showNotifications || showUserMenu) && (
        <div 
          className="dropdown-overlay" 
          onClick={() => {
            setShowNotifications(false);
            setShowUserMenu(false);
          }}
        />
      )}
    </>
  );
};

// Notifications Dropdown Component
const NotificationsDropdown = ({ messages, events, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="notifications-dropdown"
    >
      <div className="dropdown-header">
        <h3>Notifications</h3>
        <button onClick={onClose} className="close-dropdown">
          <X size={18} />
        </button>
      </div>

      <div className="dropdown-body">
        {messages.length === 0 && events.length === 0 ? (
          <div className="empty-notifications">
            <Bell size={32} />
            <p>No new notifications</p>
          </div>
        ) : (
          <>
            {/* Unread Messages */}
            {messages.length > 0 && (
              <div className="notification-section">
                <h4 className="section-title">
                  <Mail size={14} />
                  New Messages ({messages.length})
                </h4>
                {messages.slice(0, 3).map((message) => (
                  <Link
                    key={message.id}
                    to="/admin/messages"
                    className="notification-item"
                    onClick={onClose}
                  >
                    <div className="notification-icon message">
                      <Mail size={16} />
                    </div>
                    <div className="notification-content">
                      <p className="notification-title">{message.name}</p>
                      <p className="notification-text">{message.subject}</p>
                      <span className="notification-time">
                        <Clock size={12} />
                        {new Date(message.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                ))}
                {messages.length > 3 && (
                  <Link to="/admin/messages" className="view-all-notif" onClick={onClose}>
                    View all messages <ArrowRight size={14} />
                  </Link>
                )}
              </div>
            )}

            {/* Upcoming Events */}
            {events.length > 0 && (
              <div className="notification-section">
                <h4 className="section-title">
                  <Calendar size={14} />
                  Upcoming Events ({events.length})
                </h4>
                {events.map((event) => (
                  <Link
                    key={event.id}
                    to="/admin/events"
                    className="notification-item"
                    onClick={onClose}
                  >
                    <div className="notification-icon event">
                      <Calendar size={16} />
                    </div>
                    <div className="notification-content">
                      <p className="notification-title">{event.title}</p>
                      <p className="notification-text">{event.event_location}</p>
                      <span className="notification-time">
                        <Clock size={12} />
                        {new Date(event.event_date).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className="dropdown-footer">
        <Link to="/admin/messages" className="footer-link" onClick={onClose}>
          View All Notifications
          <ArrowRight size={16} />
        </Link>
      </div>
    </motion.div>
  );
};

// User Menu Dropdown Component
const UserMenuDropdown = ({ user, onLogout, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="user-menu-dropdown"
    >
      <div className="user-menu-header">
        <div className="user-menu-avatar">
          {user?.first_name?.charAt(0) || 'A'}
        </div>
        <div className="user-menu-info">
          <p className="user-menu-name">
            {user?.first_name} {user?.last_name}
          </p>
          <p className="user-menu-email">{user?.email}</p>
        </div>
      </div>

      <div className="user-menu-items">
        <Link to="/admin/settings" className="user-menu-item" onClick={onClose}>
          <Settings size={18} />
          <span>Settings</span>
        </Link>
        <button onClick={onLogout} className="user-menu-item logout">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </motion.div>
  );
};

export default AdminHeader;