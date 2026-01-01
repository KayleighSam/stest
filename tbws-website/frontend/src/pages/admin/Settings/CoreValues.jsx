import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
} from 'lucide-react';
import { pagesService } from '../../../api/pages';
import toast from 'react-hot-toast';
import './CoreValues.css';

const CoreValues = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingValue, setEditingValue] = useState(null);
  
  // Initialize with default values to prevent undefined
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: 'award',
    color_start: '#3b82f6',
    color_end: '#60a5fa',
    order: 0,
    is_active: true,
  });

  const iconOptions = [
    { value: 'award', label: 'Award' },
    { value: 'users', label: 'Users' },
    { value: 'target', label: 'Target' },
    { value: 'heart', label: 'Heart' },
    { value: 'sparkles', label: 'Sparkles' },
    { value: 'trending', label: 'Trending' },
  ];

  // Fetch core values
  const { data: valuesData, isLoading } = useQuery({
    queryKey: ['core-values'],
    queryFn: async () => {
      const response = await pagesService.getCoreValues();
      console.log('✅ Core Values Response:', response.data);
      return response.data;
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: pagesService.createCoreValue,
    onSuccess: () => {
      queryClient.invalidateQueries(['core-values']);
      toast.success('✅ Core value created successfully');
      handleCloseModal();
    },
    onError: (error) => {
      console.error('❌ Create error:', error.response?.data);
      const message = error.response?.data?.detail || 'Failed to create core value';
      toast.error(message);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => pagesService.updateCoreValue(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['core-values']);
      toast.success('✅ Core value updated successfully');
      handleCloseModal();
    },
    onError: (error) => {
      console.error('❌ Update error:', error.response?.data);
      const message = error.response?.data?.detail || 'Failed to update core value';
      toast.error(message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: pagesService.deleteCoreValue,
    onSuccess: () => {
      queryClient.invalidateQueries(['core-values']);
      toast.success('🗑️ Core value deleted successfully');
    },
    onError: (error) => {
      console.error('❌ Delete error:', error.response?.data);
      const message = error.response?.data?.detail || 'Failed to delete core value';
      toast.error(message);
    },
  });

  // Handle different response formats
  const values = Array.isArray(valuesData) 
    ? valuesData 
    : valuesData?.results || [];

  const handleOpenModal = (value = null) => {
    if (value) {
      setEditingValue(value);
      // Ensure all fields have values
      setFormData({
        title: value.title || '',
        description: value.description || '',
        icon: value.icon || 'award',
        color_start: value.color_start || '#3b82f6',
        color_end: value.color_end || '#60a5fa',
        order: value.order || 0,
        is_active: value.is_active !== undefined ? value.is_active : true,
      });
    } else {
      setEditingValue(null);
      setFormData({
        title: '',
        description: '',
        icon: 'award',
        color_start: '#3b82f6',
        color_end: '#60a5fa',
        order: values.length,
        is_active: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingValue(null);
    // Reset form
    setFormData({
      title: '',
      description: '',
      icon: 'award',
      color_start: '#3b82f6',
      color_end: '#60a5fa',
      order: 0,
      is_active: true,
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('📤 Submitting:', formData);
    
    if (editingValue) {
      console.log('🔄 Updating core value ID:', editingValue.id);
      updateMutation.mutate({ id: editingValue.id, data: formData });
    } else {
      console.log('➕ Creating new core value');
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Delete "${title}"?\n\nThis action cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="core-values-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Award size={32} />
            Core Values
          </h1>
          <p className="page-subtitle">
            Manage your organization's core values • {values.length} total
          </p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-create">
          <Plus size={20} />
          <span>Add Core Value</span>
        </button>
      </div>

      {/* Values Grid */}
      <div className="values-container">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading core values...</p>
          </div>
        ) : values.length === 0 ? (
          <div className="empty-state">
            <Award size={64} />
            <h3>No core values yet</h3>
            <p>Create your first core value to get started</p>
            <button onClick={() => handleOpenModal()} className="btn-create">
              <Plus size={20} />
              Add Core Value
            </button>
          </div>
        ) : (
          <div className="values-grid">
            {values.map((value, index) => (
              <motion.div
                key={value.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="value-card"
                style={{
                  background: `linear-gradient(135deg, ${value.color_start} 0%, ${value.color_end} 100%)`,
                }}
              >
                <div className="value-card-header">
                  <div className="value-icon">
                    <Award size={24} />
                  </div>
                  <div className="value-actions">
                    <button
                      onClick={() => handleOpenModal(value)}
                      className="action-btn-white edit"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(value.id, value.title)}
                      className="action-btn-white delete"
                      title="Delete"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <h3 className="value-title">{value.title}</h3>
                <p className="value-description">{value.description}</p>
                <div className="value-meta">
                  <span className="value-order">Order: {value.order}</span>
                  <span className={`value-status ${value.is_active ? 'active' : 'inactive'}`}>
                    {value.is_active ? 'Active' : 'Inactive'}
                  </span>
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
                <h2>{editingValue ? 'Edit Core Value' : 'Add Core Value'}</h2>
                <button onClick={handleCloseModal} className="modal-close">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                  <label htmlFor="title">Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Excellence"
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
                    placeholder="Describe this core value..."
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="icon">Icon</label>
                    <select
                      id="icon"
                      name="icon"
                      value={formData.icon}
                      onChange={handleChange}
                    >
                      {iconOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
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

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="color_start">Gradient Start Color</label>
                    <div className="color-picker-group">
                      <input
                        type="color"
                        id="color_start"
                        name="color_start"
                        value={formData.color_start}
                        onChange={handleChange}
                      />
                      <input
                        type="text"
                        value={formData.color_start}
                        onChange={handleChange}
                        name="color_start"
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="color_end">Gradient End Color</label>
                    <div className="color-picker-group">
                      <input
                        type="color"
                        id="color_end"
                        name="color_end"
                        value={formData.color_end}
                        onChange={handleChange}
                      />
                      <input
                        type="text"
                        value={formData.color_end}
                        onChange={handleChange}
                        name="color_end"
                        placeholder="#60a5fa"
                      />
                    </div>
                  </div>
                </div>

                {/* Color Preview */}
                <div className="form-group">
                  <label>Preview</label>
                  <div
                    className="gradient-preview"
                    style={{
                      background: `linear-gradient(135deg, ${formData.color_start} 0%, ${formData.color_end} 100%)`,
                    }}
                  >
                    <Award size={32} />
                    <h3>{formData.title || 'Title Preview'}</h3>
                    <p>{formData.description || 'Description preview...'}</p>
                  </div>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                    />
                    <span>Active</span>
                  </label>
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
                        <span>{editingValue ? 'Update' : 'Create'}</span>
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

export default CoreValues;