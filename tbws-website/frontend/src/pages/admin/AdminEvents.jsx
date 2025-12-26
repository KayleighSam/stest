import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Search,
  MapPin,
  Clock,
  X,
  Link as LinkIcon,
  Upload,
} from 'lucide-react';
import { contentService } from '../../api/content';
import toast from 'react-hot-toast';
import './AdminEvents.css';

const AdminEvents = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  
  const [eventFormData, setEventFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    featured_image: null,
    event_date: '',
    event_end_date: '',
    event_location: '',
    event_venue: '',
    event_registration_link: '',
    status: 'draft',
    is_featured: false,
    category: '',
  });
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch events
  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['admin-events', filterStatus],
    queryFn: async () => {
      const params = { post_type: 'event' };
      if (filterStatus !== 'all') params.status = filterStatus;
      const response = await contentService.getPosts(params);
      return response.data;
    },
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await contentService.getCategories();
      return response.data;
    },
  });

  const events = eventsData?.results || eventsData || [];
  const categories = categoriesData?.results || categoriesData || [];

  // Create/Update Event Mutation
  const saveEventMutation = useMutation({
    mutationFn: (data) =>
      editingEvent
        ? contentService.updatePost(editingEvent.slug, data)
        : contentService.createPost({ ...data, post_type: 'event' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-events']);
      toast.success(
        editingEvent ? 'Event updated successfully' : 'Event created successfully'
      );
      handleCloseModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to save event');
    },
  });

  // Delete Event Mutation
  const deleteEventMutation = useMutation({
    mutationFn: contentService.deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-events']);
      toast.success('Event deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to delete event');
    },
  });

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setEventFormData({
        title: event.title,
        excerpt: event.excerpt || '',
        content: event.content || '',
        featured_image: null,
        event_date: event.event_date ? event.event_date.substring(0, 16) : '',
        event_end_date: event.event_end_date ? event.event_end_date.substring(0, 16) : '',
        event_location: event.event_location || '',
        event_venue: event.event_venue || '',
        event_registration_link: event.event_registration_link || '',
        status: event.status || 'draft',
        is_featured: event.is_featured || false,
        category: event.category?.id || '',
      });
      if (event.featured_image) {
        setImagePreview(event.featured_image);
      }
    } else {
      setEditingEvent(null);
      setEventFormData({
        title: '',
        excerpt: '',
        content: '',
        featured_image: null,
        event_date: '',
        event_end_date: '',
        event_location: '',
        event_venue: '',
        event_registration_link: '',
        status: 'draft',
        is_featured: false,
        category: '',
      });
      setImagePreview(null);
    }
    setShowEventModal(true);
  };

  const handleCloseModal = () => {
    setShowEventModal(false);
    setEditingEvent(null);
    setEventFormData({
      title: '',
      excerpt: '',
      content: '',
      featured_image: null,
      event_date: '',
      event_end_date: '',
      event_location: '',
      event_venue: '',
      event_registration_link: '',
      status: 'draft',
      is_featured: false,
      category: '',
    });
    setImagePreview(null);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      const file = files[0];
      setEventFormData((prev) => ({ ...prev, [name]: file }));
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else if (type === 'checkbox') {
      setEventFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setEventFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveEventMutation.mutate(eventFormData);
  };

  const handleDelete = (slug) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteEventMutation.mutate(slug);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: { color: '#64748b', label: 'Draft' },
      published: { color: '#10b981', label: 'Published' },
      archived: { color: '#f59e0b', label: 'Archived' },
    };
    const badge = badges[status] || badges.draft;
    return (
      <span className="status-badge" style={{ background: badge.color }}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="admin-events">
      {/* Header */}
      <div className="events-header">
        <div>
          <h1 className="events-title">Events Management</h1>
          <p className="events-subtitle">
            Manage basketball events and tournaments
          </p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-create">
          <Plus size={20} />
          <span>New Event</span>
        </button>
      </div>

      {/* Filters */}
      <div className="events-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Events Grid */}
      <div className="events-grid">
        {isLoading ? (
          <div className="loading-state">Loading events...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="empty-state">
            <Calendar size={64} />
            <h3>No events found</h3>
            <p>Create your first event to get started</p>
            <button onClick={() => handleOpenModal()} className="btn-create">
              <Plus size={20} />
              Create Event
            </button>
          </div>
        ) : (
          filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="event-card"
            >
              {event.featured_image && (
                <div className="event-image">
                  <img src={event.featured_image} alt={event.title} />
                </div>
              )}

              <div className="event-content">
                <div className="event-header-row">
                  <h3 className="event-title">{event.title}</h3>
                  {getStatusBadge(event.status)}
                </div>

                {event.excerpt && (
                  <p className="event-excerpt">{event.excerpt}</p>
                )}

                <div className="event-meta">
                  {event.event_date && (
                    <div className="meta-item">
                      <Calendar size={14} />
                      {new Date(event.event_date).toLocaleDateString()}
                    </div>
                  )}
                  {event.event_location && (
                    <div className="meta-item">
                      <MapPin size={14} />
                      {event.event_location}
                    </div>
                  )}
                </div>

                <div className="event-actions">
                  <button
                    onClick={() => handleOpenModal(event)}
                    className="action-btn edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(event.slug)}
                    className="action-btn delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Event Modal */}
      <AnimatePresence>
        {showEventModal && (
          <EventModal
            isOpen={showEventModal}
            isEditing={!!editingEvent}
            formData={eventFormData}
            imagePreview={imagePreview}
            categories={categories}
            onChange={handleFormChange}
            onSubmit={handleSubmit}
            onClose={handleCloseModal}
            isSaving={saveEventMutation.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Event Modal Component
const EventModal = ({
  isOpen,
  isEditing,
  formData,
  imagePreview,
  categories,
  onChange,
  onSubmit,
  onClose,
  isSaving,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal-overlay"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="modal-content event-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Event' : 'Create New Event'}</h2>
          <button onClick={onClose} className="modal-close">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label>Event Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={onChange}
                placeholder="Enter event title..."
                required
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={onChange}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Excerpt *</label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={onChange}
              placeholder="Brief summary (max 300 characters)..."
              maxLength={300}
              rows={2}
              required
            />
            <span className="char-count">{formData.excerpt.length}/300</span>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={onChange}
              placeholder="Full event description..."
              rows={4}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Event Date *</label>
              <input
                type="datetime-local"
                name="event_date"
                value={formData.event_date}
                onChange={onChange}
                required
              />
            </div>

            <div className="form-group">
              <label>End Date</label>
              <input
                type="datetime-local"
                name="event_end_date"
                value={formData.event_end_date}
                onChange={onChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                name="event_location"
                value={formData.event_location}
                onChange={onChange}
                placeholder="City, Country"
              />
            </div>

            <div className="form-group">
              <label>Venue</label>
              <input
                type="text"
                name="event_venue"
                value={formData.event_venue}
                onChange={onChange}
                placeholder="Venue name"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Registration Link</label>
            <input
              type="url"
              name="event_registration_link"
              value={formData.event_registration_link}
              onChange={onChange}
              placeholder="https://..."
            />
          </div>

          <div className="form-group">
            <label>Featured Image</label>
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
            <input
              type="file"
              name="featured_image"
              accept="image/*"
              onChange={onChange}
              id="event-image-upload"
              className="file-input"
            />
            <label htmlFor="event-image-upload" className="file-label">
              <Upload size={18} />
              {imagePreview ? 'Change Image' : 'Choose Image'}
            </label>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={formData.status} onChange={onChange}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={onChange}
                />
                <span>Featured Event</span>
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="btn-primary">
              {isSaving ? 'Saving...' : isEditing ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AdminEvents;