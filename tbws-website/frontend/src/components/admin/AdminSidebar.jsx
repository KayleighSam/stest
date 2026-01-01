import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Users,
  MapPin,
  Shield,
  Settings,
  LogOut,
  Folder,
  UserCircle,
  X,
  Image,
  Mail,
  Send,
  FileCode,
  Award,
  HelpCircle,
  History,
  DollarSign,
  Briefcase,
  FileSignature,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import toast from 'react-hot-toast';

const AdminSidebar = ({ isOpen, onClose }) => {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin/dashboard',
    },
    {
      title: 'Posts',
      icon: FileText,
      path: '/admin/posts',
    },
    {
      title: 'Categories',
      icon: Folder,
      path: '/admin/categories',
    },
    {
      title: 'Messages',
      icon: Mail,
      path: '/admin/messages',
    },
    {
      title: 'Newsletter',
      icon: Send,
      path: '/admin/newsletter',
    },
    {
      title: 'Events',
      icon: Calendar,
      path: '/admin/events',
    },
    {
      title: 'Gallery',
      icon: Image,
      path: '/admin/gallery',
    },
    {
      section: 'Pages & Content',
    },
    {
      title: 'Static Pages',
      icon: FileCode,
      path: '/admin/pages',
    },
    {
      title: 'Site Settings',
      icon: Settings,
      path: '/admin/site-settings',
    },
    {
      title: 'Core Values',
      icon: Award,
      path: '/admin/core-values',
    },
    {
      title: 'Team Members',
      icon: Users,
      path: '/admin/team',
    },
    {
      title: 'FAQs',
      icon: HelpCircle,
      path: '/admin/faqs',
    },
    {
      title: 'History Timeline',
      icon: History,
      path: '/admin/history',
    },
    {
      title: 'Sponsors',
      icon: DollarSign,
      path: '/admin/sponsors',
    },
    {
      title: 'League Rules',
      icon: FileSignature,
      path: '/admin/league-rules',
    },
    {
      title: 'Venues',
      icon: MapPin,
      path: '/admin/venues',
    },
    {
      title: 'Draft Info',
      icon: Briefcase,
      path: '/admin/draft-info',
    },
    {
      title: 'Managers',
      icon: UserCircle,
      path: '/admin/manager-info',
    },
    {
      section: 'User Management',
    },
    {
      title: 'Settings & Users',
      icon: Settings,
      path: '/admin/settings',
    },
    {
      title: 'Players',
      icon: Shield,
      path: '/admin/players',
    },
  ];

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
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="admin-sidebar-overlay" onClick={onClose} />
      )}

      <aside className={`admin-sidebar ${isOpen ? 'mobile-open' : ''}`}>
        <div className="admin-sidebar-header">
          <div className="admin-logo">
            <Shield size={32} />
            <span>TBWS Admin</span>
          </div>
          <button className="mobile-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <nav className="admin-nav">
          {menuItems.map((item, index) => {
            if (item.section) {
              return (
                <div key={index} className="admin-nav-section">
                  {item.section}
                </div>
              );
            }
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `admin-nav-item ${isActive ? 'admin-nav-active' : ''}`
                }
              >
                <item.icon size={20} strokeWidth={1.5} />
                <span>{item.title}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <button onClick={handleLogout} className="admin-logout-btn">
            <LogOut size={20} strokeWidth={1.5} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;