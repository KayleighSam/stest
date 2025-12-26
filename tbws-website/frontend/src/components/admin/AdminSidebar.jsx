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
      title: 'Teams',
      icon: Shield,
      path: '/admin/teams',
    },
    {
      title: 'Players',
      icon: Users,
      path: '/admin/players',
    },
    {
      title: 'Venues',
      icon: MapPin,
      path: '/admin/venues',
    },
    {
      title: 'Users',
      icon: UserCircle,
      path: '/admin/users',
    },
    {
      title: 'Settings',
      icon: Settings,
      path: '/admin/settings',
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
          {menuItems.map((item) => (
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
          ))}
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