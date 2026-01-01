import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  Upload,
  Award,
  Calendar,
} from 'lucide-react';
import { pagesService } from '../../../api/pages';
import toast from 'react-hot-toast';
import './HistoryTimeline.css';

const HistoryTimeline = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    title: '',
    description: '',
    image: null,
    is_milestone: false,
    order: 0,
  });

  // Fetch history timeline
  const { data: timelineData, isLoading } = useQuery({
    queryKey: ['history-timeline'],
    queryFn: async () => {
      const response = await pagesService.getHistoryTimeline();
      console.log('✅ History Timeline Response:', response.data);
      return response.data;
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: pagesService.createHistoryEvent,
    onSuccess: () => {
      queryClient.invalidateQueries(['history-timeline']);
      toast.success('✅ History event created successfully');
      handleCloseModal();
    },
    onError: (error) => {
      console.error('❌ Create error:', error.response?.data);
      const message = error.response?.data?.detail || 'Failed to create history event';
      toast.error(message);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => pagesService.updateHistoryEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['history-timeline']);
      toast.success('✅ History event updated successfully');
      handleCloseModal();
    },
    onError: (error) => {
      console.error('❌ Update error:', error.response?.data);
      const message = error.response?.data?.detail || 'Failed to update history event';
      toast.error(message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: pagesService.deleteHistoryEvent,
    onSuccess: () => {
      queryClient.invalidateQueries(['history-timeline']);
      toast.success('🗑️ History event deleted successfully');
    },
    onError: (error) => {
      console.error('❌ Delete error:', error.response?.data);
      const message = error.response?.data?.detail || 'Failed to delete history event';
      toast.error(message);
    },
  });

  const events = Array.isArray(timelineData) 
    ? timelineData 
    : timelineData?.results || [];

  const handleOpenModal = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        year: event.year || new Date().getFullYear(),
        title: event.title || '',
        description: event.description || '',
        image: null,
        is_milestone: event.is_milestone !== undefined ? event.is_milestone : false,
        order: event.order || 0,
      });
      setImagePreview(event.image || null);
    } else {
      setEditingEvent(null);
      setFormData({
        year: new Date().getFullYear(),
        title: '',
        description: '',
        image: null,
        is_milestone: false,
        order: events.length,
      });
      setImagePreview(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEvent(null);
    setImagePreview(null);
    setFormData({
      year: new Date().getFullYear(),
      title: '',
      description: '',
      image: null,
      is_milestone: false,
      order: 0,
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('📤 Submitting:', formData);
    
    if (editingEvent) {
      console.log('🔄 Updating history event ID:', editingEvent.id);
      updateMutation.mutate({ id: editingEvent.id, data: formData });
    } else {
      console.log('➕ Creating new history event');
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Delete history event:\n"${title}"\n\nThis action cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="history-timeline-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <History size={32} />
            History Timeline
          </h1>
          <p className="page-subtitle">
            Manage your organization's history • {events.length} events
          </p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-create">
          <Plus size={20} />
          <span>Add Event</span>
        </button>
      </div>

      {/* Timeline */}
      <div className="timeline-container">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading timeline...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <History size={64} />
            <h3>No history events yet</h3>
            <p>Create your first history event to build your timeline</p>
            <button onClick={() => handleOpenModal()} className="btn-create">
              <Plus size={20} />
              Add Event
            </button>
          </div>
        ) : (
          <div className="timeline">
            <div className="timeline-line"></div>
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'} ${
                  event.is_milestone ? 'milestone' : ''
                }`}
              >
                <div className="timeline-marker">
                  {event.is_milestone ? (
                    <Award size={20} />
                  ) : (
                    <Calendar size={20} />
                  )}
                </div>

                <div className="timeline-card">
                  <div className="timeline-card-header">
                    <div className="timeline-year-badge">{event.year}</div>
                    {event.is_milestone && (
                      <span className="milestone-badge">
                        <Award size={14} />
                        Milestone
                      </span>
                    )}
                  </div>

                  {event.image && (
                    <div className="timeline-image">
                      <img src={event.image} alt={event.title} />
                    </div>
                  )}

                  <div className="timeline-content">
                    <h3 className="timeline-title">{event.title}</h3>
                    <p className="timeline-description">{event.description}</p>
                  </div>

                  <div className="timeline-meta">
                    <span className="timeline-order">Order: {event.order}</span>
                  </div>

                  <div className="timeline-actions">
                    <button
                      onClick={() => handleOpenModal(event)}
                      className="action-btn edit"
                    >
                      <Edit size={16} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(event.id, event.title)}
                      className="action-btn delete"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 size={16} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>{editingEvent ? 'Edit History Event' : 'Add History Event'}</h2>
                <button onClick={handleCloseModal} className="modal-close">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="year">Year *</label>
                    <input
                      type="number"
                      id="year"
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      required
                      min="1900"
                      max="2100"
                      placeholder="e.g., 2020"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="order">Order</label>
                    <input
                      type="number"
                      id="order"
                      name="order"
                      value={formData.order}
                      onChange={handleChange}
                      min="0"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="title">Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Organization Founded"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description *</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows="4"
                    placeholder="Describe what happened this year..."
                  />
                </div>

                {/* Image Upload */}
                <div className="form-group">
                  <label>Event Image</label>
                  <div className="image-upload-container">
                    {imagePreview && (
                      <div className="image-preview-large">
                        <img src={imagePreview} alt="Preview" />
                      </div>
                    )}
                    <label htmlFor="image" className="upload-label">
                      <Upload size={20} />
                      <span>Choose Image</span>
                      <input
                        type="file"
                        id="image"
                        accept="image/*"
                        onChange={handleImageChange}
                        hidden
                      />
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label className="checkbox-label milestone-checkbox">
                    <input
                      type="checkbox"
                      name="is_milestone"
                      checked={formData.is_milestone}
                      onChange={handleChange}
                    />
                    <Award size={16} />
                    <span>Mark as Milestone</span>
                  </label>
                  <small>Milestones are highlighted with a special badge</small>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="btn-cancel"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-save"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <>
                        <div className="spinner-small"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save size={20} />
                        <span>{editingEvent ? 'Update' : 'Create'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HistoryTimeline;