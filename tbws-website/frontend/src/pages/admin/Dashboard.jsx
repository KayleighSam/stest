import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FileText,
  Calendar,
  Image,
  Mail,
  Eye,
  ArrowRight,
  Star,
  Clock,
  X,
  Phone,
  MessageCircle,
  Send,
  Users,
  CheckCircle,
  TrendingUp,
  Activity,
  Zap,
  Award,
  Target,
  Sparkles,
  Shield,
  Settings,
  BarChart3,
} from 'lucide-react';
import { contentService } from '../../api/content';
import { galleryService } from '../../api/gallery';
import usersService from '../../api/users';
import { useAdminAuth } from '../../context/AdminAuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAdminAuth();
  const [showMessagesModal, setShowMessagesModal] = useState(false);

  // Fetch content data
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

  const { data: commentsData } = useQuery({
    queryKey: ['dashboard-comments'],
    queryFn: async () => {
      const response = await contentService.getComments();
      return response.data;
    },
  });

  const { data: subscribersData } = useQuery({
    queryKey: ['dashboard-subscribers'],
    queryFn: async () => {
      const response = await contentService.getSubscribers();
      return response.data;
    },
  });

  // Fetch user management data
  const { data: usersData } = useQuery({
    queryKey: ['dashboard-users'],
    queryFn: async () => {
      const response = await usersService.getUsers();
      return response.data;
    },
  });

  const { data: playersData } = useQuery({
    queryKey: ['dashboard-players'],
    queryFn: async () => {
      const response = await usersService.getPlayers();
      return response.data;
    },
  });

  const posts = postsData?.results || postsData || [];
  const events = eventsData?.results || eventsData || [];
  const messages = messagesData?.results || messagesData || [];
  const categories = categoriesData?.results || categoriesData || [];
  const albums = albumsData?.results || albumsData || [];
  const images = imagesData?.results || imagesData || [];
  const comments = commentsData?.results || commentsData || [];
  const subscribers = subscribersData?.results || subscribersData || [];
  const users = Array.isArray(usersData) ? usersData : usersData?.results || [];
  const players = Array.isArray(playersData) ? playersData : playersData?.results || [];

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
    totalComments: comments.length,
    pendingComments: comments.filter((c) => !c.is_approved).length,
    totalSubscribers: subscribers.length,
    activeSubscribers: subscribers.filter((s) => s.is_active).length,
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.is_active).length,
    totalPlayers: players.length,
    activePlayers: players.filter((p) => p.status === 'active').length,
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
      {/* Animated Background */}
      <div className="dashboard-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="dashboard-hero"
      >
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={16} />
            <span>Dashboard Overview</span>
          </div>
          <h1 className="hero-title">
            Welcome back, <span className="highlight">{user?.first_name || 'Admin'}</span>! 🏀
          </h1>
          <p className="hero-subtitle">
            Here's your TBWS command center. Let's make today amazing.
          </p>
        </div>
        <div className="hero-actions">
          <div className="dashboard-date">
            <Clock size={18} />
            <span>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
          <button
            onClick={() => setShowMessagesModal(true)}
            className="messages-notification-btn"
          >
            <Mail size={20} />
            {stats.unreadMessages > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="notification-badge pulse"
              >
                {stats.unreadMessages}
              </motion.span>
            )}
          </button>
        </div>
      </motion.div>

      {/* Premium Stats Grid */}
      <div className="premium-stats-grid">
        <PremiumStatCard
          title="Total Posts"
          value={stats.totalPosts}
          subtitle={`${stats.publishedPosts} live • ${stats.draftPosts} drafts`}
          icon={FileText}
          gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          link="/admin/posts"
          trend="+12%"
        />
        <PremiumStatCard
          title="Events"
          value={stats.totalEvents}
          subtitle={`${stats.upcomingEvents} upcoming`}
          icon={Calendar}
          gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
          link="/admin/events"
          trend="+8%"
        />
        <PremiumStatCard
          title="Messages"
          value={stats.totalMessages}
          subtitle={`${stats.unreadMessages} unread`}
          icon={Mail}
          gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
          link="/admin/messages"
          badge={stats.unreadMessages}
        />
        <PremiumStatCard
          title="Gallery"
          value={stats.totalImages}
          subtitle={`${stats.totalAlbums} albums`}
          icon={Image}
          gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
          link="/admin/gallery"
        />
        <PremiumStatCard
          title="Users"
          value={stats.totalUsers}
          subtitle={`${stats.activeUsers} active`}
          icon={Users}
          gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
          link="/admin/settings"
        />
        <PremiumStatCard
          title="Players"
          value={stats.totalPlayers}
          subtitle={`${stats.activePlayers} playing`}
          icon={Shield}
          gradient="linear-gradient(135deg, #30cfd0 0%, #330867 100%)"
          link="/admin/players"
        />
        <PremiumStatCard
          title="Comments"
          value={stats.totalComments}
          subtitle={`${stats.pendingComments} pending`}
          icon={MessageCircle}
          gradient="linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
          link="/admin/comments"
          badge={stats.pendingComments}
        />
        <PremiumStatCard
          title="Newsletter"
          value={stats.totalSubscribers}
          subtitle={`${stats.activeSubscribers} subscribed`}
          icon={Send}
          gradient="linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)"
          link="/admin/newsletter"
        />
      </div>

      {/* Content Dashboard */}
      <div className="content-dashboard">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card activity-card"
        >
          <div className="card-header-modern">
            <div className="card-title-group">
              <Activity size={24} className="card-icon" />
              <div>
                <h2 className="card-title-modern">Recent Posts</h2>
                <p className="card-subtitle-modern">{stats.totalPosts} total articles</p>
              </div>
            </div>
            <Link to="/admin/posts" className="view-all-modern">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="card-body-modern">
            {recentPosts.length === 0 ? (
              <div className="empty-state-modern">
                <FileText size={48} />
                <h3>No posts yet</h3>
                <p>Start creating amazing content</p>
                <Link to="/admin/posts/create" className="btn-create-modern">
                  <Zap size={16} />
                  Create Post
                </Link>
              </div>
            ) : (
              <div className="posts-modern-list">
                {recentPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link to={`/admin/posts/edit/${post.slug}`} className="post-modern-item">
                      <div className="post-modern-content">
                        <div className="post-modern-header">
                          <h4>{post.title}</h4>
                          <div className="post-badges">
                            <span className={`status-badge ${post.status}`}>
                              {post.status}
                            </span>
                            {post.is_featured && (
                              <span className="featured-badge">
                                <Star size={12} />
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="post-modern-meta">
                          <span className="meta-item">
                            <Eye size={14} />
                            {post.views || 0} views
                          </span>
                          <span className="meta-item">
                            <MessageCircle size={14} />
                            {post.comment_count || 0} comments
                          </span>
                          <span className="meta-item">
                            <Clock size={14} />
                            {new Date(post.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <ArrowRight size={18} className="post-arrow" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card events-card"
        >
          <div className="card-header-modern">
            <div className="card-title-group">
              <Calendar size={24} className="card-icon" />
              <div>
                <h2 className="card-title-modern">Upcoming Events</h2>
                <p className="card-subtitle-modern">{stats.upcomingEvents} scheduled</p>
              </div>
            </div>
            <Link to="/admin/events" className="view-all-modern">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="card-body-modern">
            {upcomingEvents.length === 0 ? (
              <div className="empty-state-modern">
                <Calendar size={48} />
                <h3>No upcoming events</h3>
                <p>Schedule your next big game</p>
                <Link to="/admin/events" className="btn-create-modern">
                  <Zap size={16} />
                  Create Event
                </Link>
              </div>
            ) : (
              <div className="events-modern-list">
                {upcomingEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="event-modern-item"
                  >
                    <div className="event-date-modern">
                      <span className="event-month">
                        {new Date(event.event_date).toLocaleString('default', {
                          month: 'short',
                        })}
                      </span>
                      <span className="event-day">
                        {new Date(event.event_date).getDate()}
                      </span>
                    </div>
                    <div className="event-modern-content">
                      <h4>{event.title}</h4>
                      <p className="event-location-modern">
                        📍 {event.event_location}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Analytics Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card analytics-card"
        >
          <div className="card-header-modern">
            <div className="card-title-group">
              <BarChart3 size={24} className="card-icon" />
              <div>
                <h2 className="card-title-modern">Quick Analytics</h2>
                <p className="card-subtitle-modern">At a glance</p>
              </div>
            </div>
          </div>
          <div className="card-body-modern">
            <div className="analytics-grid">
              <div className="analytics-item">
                <div className="analytics-icon">
                  <TrendingUp size={20} />
                </div>
                <div className="analytics-content">
                  <span className="analytics-value">{stats.publishedPosts}</span>
                  <span className="analytics-label">Published</span>
                </div>
              </div>
              <div className="analytics-item">
                <div className="analytics-icon">
                  <Star size={20} />
                </div>
                <div className="analytics-content">
                  <span className="analytics-value">{stats.featuredPosts}</span>
                  <span className="analytics-label">Featured</span>
                </div>
              </div>
              <div className="analytics-item">
                <div className="analytics-icon">
                  <Target size={20} />
                </div>
                <div className="analytics-content">
                  <span className="analytics-value">{stats.totalCategories}</span>
                  <span className="analytics-label">Categories</span>
                </div>
              </div>
              <div className="analytics-item">
                <div className="analytics-icon">
                  <Award size={20} />
                </div>
                <div className="analytics-content">
                  <span className="analytics-value">{stats.totalAlbums}</span>
                  <span className="analytics-label">Albums</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="quick-actions-section"
      >
        <h2 className="section-title-modern">
          <Zap size={24} />
          Quick Actions
        </h2>
        <div className="quick-actions-grid">
          <QuickActionModern
            title="Create Post"
            description="Write new content"
            icon={FileText}
            link="/admin/posts/create"
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          />
          <QuickActionModern
            title="Add Event"
            description="Schedule an event"
            icon={Calendar}
            link="/admin/events"
            gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
          />
          <QuickActionModern
            title="Upload Photos"
            description="Add to gallery"
            icon={Image}
            link="/admin/gallery"
            gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
          />
          <QuickActionModern
            title="Manage Users"
            description="User settings"
            icon={Users}
            link="/admin/settings"
            gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
          />
          <QuickActionModern
            title="Players"
            description="Manage players"
            icon={Shield}
            link="/admin/players"
            gradient="linear-gradient(135deg, #30cfd0 0%, #330867 100%)"
          />
          <QuickActionModern
            title="Settings"
            description="Site configuration"
            icon={Settings}
            link="/admin/site-settings"
            gradient="linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
          />
        </div>
      </motion.div>

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

// Premium Stat Card
const PremiumStatCard = ({ title, value, subtitle, icon: Icon, gradient, link, badge, trend }) => (
  <Link to={link}>
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="premium-stat-card"
      style={{ background: gradient }}
    >
      <div className="premium-card-glow"></div>
      <div className="premium-card-content">
        <div className="premium-card-header">
          <div className="premium-icon-wrapper">
            <Icon size={24} strokeWidth={2} />
          </div>
          {badge > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="premium-badge pulse"
            >
              {badge}
            </motion.span>
          )}
        </div>
        <div className="premium-card-body">
          <h3 className="premium-value">{value}</h3>
          <p className="premium-title">{title}</p>
          <p className="premium-subtitle">{subtitle}</p>
        </div>
        {trend && (
          <div className="premium-trend">
            <TrendingUp size={14} />
            <span>{trend}</span>
          </div>
        )}
      </div>
    </motion.div>
  </Link>
);

// Quick Action Modern
const QuickActionModern = ({ title, description, icon: Icon, link, gradient }) => (
  <Link to={link}>
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      className="quick-action-modern"
    >
      <div className="quick-action-glow" style={{ background: gradient }}></div>
      <div className="quick-action-icon-modern" style={{ background: gradient }}>
        <Icon size={24} strokeWidth={2} />
      </div>
      <div className="quick-action-content-modern">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <ArrowRight size={20} className="quick-action-arrow-modern" />
    </motion.div>
  </Link>
);

// Messages Modal (Keep the same as before)
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