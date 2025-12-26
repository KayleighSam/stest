import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FileText,
  Calendar,
  Image,
  Mail,
  Folder,
  Eye,
  ArrowRight,
  Star,
  Clock,
  X,
  Send,
  Phone,
  MessageSquare,
  Bell,
} from 'lucide-react';
import { contentService } from '../../api/content';
import { galleryService } from '../../api/gallery';
import { useAdminAuth } from '../../context/AdminAuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAdminAuth();
  const [showMessagesModal, setShowMessagesModal] = useState(false);

  // Fetch all data
  const { data: postsData } = useQuery({
    queryKey: ['dashboard-posts'],
    queryFn: async () => {
      const response = await contentService.getPosts();
      return response.data;
    },
  });

  const { data: eventsData } = useQuery({
    queryKey: ['dashboard-events'],
    queryFn: async () => {
      const response = await contentService.getPosts({ post_type: 'event' });
      return response.data;
    },
  });

  const { data: messagesData } = useQuery({
    queryKey: ['dashboard-messages'],
    queryFn: async () => {
      const response = await contentService.getMessages();
      return response.data;
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['dashboard-categories'],
    queryFn: async () => {
      const response = await contentService.getCategories();
      return response.data;
    },
  });

  const { data: albumsData } = useQuery({
    queryKey: ['dashboard-albums'],
    queryFn: async () => {
      const response = await galleryService.getAlbums();
      return response.data;
    },
  });

  const { data: imagesData } = useQuery({
    queryKey: ['dashboard-images'],
    queryFn: async () => {
      const response = await galleryService.getImages();
      return response.data;
    },
  });

  const posts = postsData?.results || postsData || [];
  const events = eventsData?.results || eventsData || [];
  const messages = messagesData?.results || messagesData || [];
  const categories = categoriesData?.results || categoriesData || [];
  const albums = albumsData?.results || albumsData || [];
  const images = imagesData?.results || imagesData || [];

  // Calculate statistics
  const stats = {
    totalPosts: posts.length,
    publishedPosts: posts.filter((p) => p.status === 'published').length,
    draftPosts: posts.filter((p) => p.status === 'draft').length,
    totalEvents: events.length,
    upcomingEvents: events.filter(
      (e) => e.event_date && new Date(e.event_date) > new Date()
    ).length,
    totalMessages: messages.length,
    unreadMessages: messages.filter((m) => !m.is_read).length,
    totalCategories: categories.length,
    totalAlbums: albums.length,
    totalImages: images.length,
    featuredPosts: posts.filter((p) => p.is_featured).length,
  };

  // Recent posts
  const recentPosts = posts
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  // Recent messages
  const recentMessages = messages
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 10);

  // Upcoming events
  const upcomingEvents = events
    .filter((e) => e.event_date && new Date(e.event_date) > new Date())
    .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
    .slice(0, 3);

  return (
    <div className="admin-dashboard">
      {/* Welcome Header */}
      <div className="dashboard-welcome">
        <div className="welcome-content">
          <h1 className="dashboard-title">
            Welcome back, {user?.first_name || 'Admin'}! 👋
          </h1>
          <p className="dashboard-subtitle">
            Here's what's happening with your basketball league today
          </p>
        </div>
        <div className="dashboard-header-actions">
          <div className="dashboard-date">
            <Clock size={18} />
            <span>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
          
          {/* Messages Notification Button */}
          <button
            onClick={() => setShowMessagesModal(true)}
            className="messages-notification-btn"
          >
            <Mail size={20} />
            {stats.unreadMessages > 0 && (
              <span className="notification-badge">{stats.unreadMessages}</span>
            )}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Posts"
          value={stats.totalPosts}
          subtitle={`${stats.publishedPosts} published, ${stats.draftPosts} drafts`}
          icon={FileText}
          color="#3b82f6"
          link="/admin/posts"
        />
        <StatCard
          title="Events"
          value={stats.totalEvents}
          subtitle={`${stats.upcomingEvents} upcoming events`}
          icon={Calendar}
          color="#8b5cf6"
          link="/admin/events"
        />
        <StatCard
          title="Messages"
          value={stats.totalMessages}
          subtitle={`${stats.unreadMessages} unread messages`}
          icon={Mail}
          color="#ef4444"
          link="/admin/messages"
          badge={stats.unreadMessages > 0 ? stats.unreadMessages : null}
        />
        <StatCard
          title="Gallery"
          value={stats.totalImages}
          subtitle={`${stats.totalAlbums} albums created`}
          icon={Image}
          color="#10b981"
          link="/admin/gallery"
        />
      </div>

      {/* Content Grid */}
      <div className="dashboard-content-grid">
        {/* Recent Posts */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2 className="card-title">
              <FileText size={20} />
              Recent Posts
            </h2>
            <Link to="/admin/posts" className="view-all-link">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="card-body">
            {recentPosts.length === 0 ? (
              <div className="empty-state-small">
                <FileText size={48} />
                <p>No posts yet</p>
                <Link to="/admin/posts/create" className="btn-create-small">
                  Create Post
                </Link>
              </div>
            ) : (
              <div className="posts-list">
                {recentPosts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/admin/posts/edit/${post.slug}`}
                    className="post-item"
                  >
                    <div className="post-item-content">
                      <h4>{post.title}</h4>
                      <div className="post-item-meta">
                        <span className={`status-dot ${post.status}`}></span>
                        <span>{post.status}</span>
                        <span>•</span>
                        <span>
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                        {post.is_featured && (
                          <>
                            <span>•</span>
                            <Star size={12} className="featured-icon" />
                          </>
                        )}
                      </div>
                    </div>
                    <div className="post-item-stats">
                      <Eye size={14} />
                      {post.views || 0}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2 className="card-title">
              <Calendar size={20} />
              Upcoming Events
            </h2>
            <Link to="/admin/events" className="view-all-link">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="card-body">
            {upcomingEvents.length === 0 ? (
              <div className="empty-state-small">
                <Calendar size={48} />
                <p>No upcoming events</p>
                <Link to="/admin/events" className="btn-create-small">
                  Create Event
                </Link>
              </div>
            ) : (
              <div className="events-list">
                {upcomingEvents.map((event) => (
                  <Link
                    key={event.id}
                    to={`/admin/events`}
                    className="event-item"
                  >
                    <div className="event-date-badge">
                      <span className="event-month">
                        {new Date(event.event_date).toLocaleString('default', {
                          month: 'short',
                        })}
                      </span>
                      <span className="event-day">
                        {new Date(event.event_date).getDate()}
                      </span>
                    </div>
                    <div className="event-item-content">
                      <h4>{event.title}</h4>
                      <p className="event-location">{event.event_location}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2 className="section-title">Quick Actions</h2>
        <div className="actions-grid">
          <QuickActionCard
            title="Create Post"
            description="Write a new blog post or article"
            icon={FileText}
            link="/admin/posts/create"
            color="#3b82f6"
          />
          <QuickActionCard
            title="Create Event"
            description="Add a new basketball event"
            icon={Calendar}
            link="/admin/events"
            color="#8b5cf6"
          />
          <QuickActionCard
            title="Upload Photos"
            description="Add images to gallery"
            icon={Image}
            link="/admin/gallery"
            color="#10b981"
          />
          <QuickActionCard
            title="Manage Categories"
            description="Organize your content"
            icon={Folder}
            link="/admin/categories"
            color="#f59e0b"
          />
        </div>
      </div>

      {/* Messages Modal */}
      <AnimatePresence>
        {showMessagesModal && (
          <MessagesModal
            messages={recentMessages}
            unreadCount={stats.unreadMessages}
            onClose={() => setShowMessagesModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, subtitle, icon: Icon, color, link, badge }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -4 }}
    className="stat-card"
  >
    <Link to={link} className="stat-card-link">
      <div className="stat-card-icon" style={{ background: `${color}15`, color }}>
        <Icon size={24} strokeWidth={1.5} />
      </div>
      <div className="stat-card-content">
        <div className="stat-card-header">
          <span className="stat-card-title">{title}</span>
          {badge && (
            <span className="stat-badge" style={{ background: color }}>
              {badge}
            </span>
          )}
        </div>
        <div className="stat-card-value">{value}</div>
        <div className="stat-card-subtitle">{subtitle}</div>
      </div>
    </Link>
  </motion.div>
);

// Quick Action Card Component
const QuickActionCard = ({ title, description, icon: Icon, link, color }) => (
  <motion.div whileHover={{ y: -4 }} className="quick-action-wrapper">
    <Link to={link} className="quick-action-card">
      <div
        className="quick-action-icon"
        style={{ background: `${color}15`, color }}
      >
        <Icon size={24} strokeWidth={1.5} />
      </div>
      <div className="quick-action-content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <ArrowRight size={20} className="quick-action-arrow" style={{ color }} />
    </Link>
  </motion.div>
);

// Messages Modal Component
const MessagesModal = ({ messages, unreadCount, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal-overlay"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="modal-content messages-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-header-content">
            <h2>Recent Messages</h2>
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount} unread</span>
            )}
          </div>
          <button onClick={onClose} className="modal-close">
            <X size={24} />
          </button>
        </div>

        <div className="modal-body messages-modal-body">
          {messages.length === 0 ? (
            <div className="empty-state-modal">
              <Mail size={64} />
              <h3>No messages yet</h3>
              <p>Messages from your contact form will appear here</p>
            </div>
          ) : (
            <div className="messages-modal-list">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message-modal-item ${
                    !message.is_read ? 'unread' : ''
                  }`}
                >
                  <div className="message-modal-header">
                    <div className="message-sender-info">
                      <h4>{message.name}</h4>
                      <span className="message-email">
                        <Mail size={12} />
                        {message.email}
                      </span>
                    </div>
                    <div className="message-modal-badges">
                      {!message.is_read && (
                        <span className="badge-new">New</span>
                      )}
                      {message.is_replied && (
                        <span className="badge-replied">Replied</span>
                      )}
                    </div>
                  </div>

                  <p className="message-modal-subject">
                    <strong>Subject:</strong> {message.subject}
                  </p>

                  <p className="message-modal-preview">
                    {message.message.length > 100
                      ? `${message.message.substring(0, 100)}...`
                      : message.message}
                  </p>

                  <div className="message-modal-footer">
                    <span className="message-type-badge">
                      {message.inquiry_type}
                    </span>
                    <span className="message-date">
                      <Clock size={12} />
                      {new Date(message.created_at).toLocaleDateString()}
                    </span>
                    {message.phone && (
                      <span className="message-phone">
                        <Phone size={12} />
                        {message.phone}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <Link to="/admin/messages" className="btn-view-all" onClick={onClose}>
            View All Messages
            <ArrowRight size={18} />
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;