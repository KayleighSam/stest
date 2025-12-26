import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, Plus, Edit, Trash2, X } from 'lucide-react';
import { contentService } from '../../api/content';
import toast from 'react-hot-toast';
import './Categories.css';

const Categories = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#007bff',
    icon: '',
  });

  // Fetch categories
  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const response = await contentService.getCategories();
      return response.data;
    },
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: (data) =>
      editingCategory
        ? contentService.updateCategory(editingCategory.slug, data)
        : contentService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-categories']);
      toast.success(
        editingCategory
          ? 'Category updated successfully'
          : 'Category created successfully'
      );
      handleCloseModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to save category');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: contentService.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-categories']);
      toast.success('Category deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to delete category');
    },
  });

  const categories = categoriesData?.results || categoriesData || [];

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        color: category.color || '#007bff',
        icon: category.icon || '',
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        color: '#007bff',
        icon: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      color: '#007bff',
      icon: '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleDelete = (slug) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteMutation.mutate(slug);
    }
  };

  return (
    <div className="admin-categories">
      {/* Header */}
      <div className="categories-header">
        <div>
          <h1 className="categories-title">Categories</h1>
          <p className="categories-subtitle">Organize your content with categories</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-create">
          <Plus size={20} />
          <span>New Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="categories-grid">
        {isLoading ? (
          <div className="loading-state">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="empty-state">
            <Folder size={64} />
            <h3>No categories yet</h3>
            <p>Create your first category to get started</p>
            <button onClick={() => handleOpenModal()} className="btn-create">
              <Plus size={20} />
              Create Category
            </button>
          </div>
        ) : (
          categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="category-card"
            >
              <div
                className="category-color"
                style={{ background: category.color }}
              />
              <div className="category-content">
                <h3 className="category-name">{category.name}</h3>
                <p className="category-description">
                  {category.description || 'No description'}
                </p>
                <div className="category-meta">
                  <span className="post-count">
                    {category.post_count || 0} posts
                  </span>
                </div>
              </div>
              <div className="category-actions">
                <button
                  onClick={() => handleOpenModal(category)}
                  className="action-btn edit"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(category.slug)}
                  className="action-btn delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
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
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>{editingCategory ? 'Edit Category' : 'New Category'}</h2>
                <button onClick={handleCloseModal} className="modal-close">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="modal-body">
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter category name..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter description..."
                    rows={3}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Color</label>
                    <input
                      type="color"
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                      className="color-picker"
                    />
                  </div>

                  <div className="form-group">
                    <label>Icon (optional)</label>
                    <input
                      type="text"
                      name="icon"
                      value={formData.icon}
                      onChange={handleChange}
                      placeholder="fa-icon-name"
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saveMutation.isPending}
                    className="btn-primary"
                  >
                    {saveMutation.isPending
                      ? 'Saving...'
                      : editingCategory
                      ? 'Update'
                      : 'Create'}
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

export default Categories;