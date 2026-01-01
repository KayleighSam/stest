import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileSignature,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  List,
} from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { pagesService } from '../../../api/pages';
import toast from 'react-hot-toast';
import './LeagueRules.css';

const LeagueRules = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  
  const [formData, setFormData] = useState({
    category: 'game_rules',
    title: '',
    content: '',
    order: 0,
    is_active: true,
  });

  const categoryOptions = [
    { value: 'game_rules', label: 'Game Rules', icon: '🏀', color: '#3b82f6' },
    { value: 'player_rules', label: 'Player Rules', icon: '👤', color: '#8b5cf6' },
    { value: 'team_rules', label: 'Team Rules', icon: '👥', color: '#ec4899' },
    { value: 'conduct', label: 'Code of Conduct', icon: '⚖️', color: '#f59e0b' },
    { value: 'eligibility', label: 'Eligibility', icon: '✅', color: '#10b981' },
    { value: 'other', label: 'Other', icon: '📋', color: '#64748b' },
  ];

  // Quill modules configuration
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link'],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ],
  };

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'link', 'align', 'color', 'background'
  ];

  // Fetch league rules
  const { data: rulesData, isLoading } = useQuery({
    queryKey: ['league-rules'],
    queryFn: async () => {
      const response = await pagesService.getLeagueRules();
      console.log('✅ League Rules Response:', response.data);
      return response.data;
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: pagesService.createLeagueRule,
    onSuccess: () => {
      queryClient.invalidateQueries(['league-rules']);
      toast.success('✅ League rule created successfully');
      handleCloseModal();
    },
    onError: (error) => {
      console.error('❌ Create error:', error.response?.data);
      const message = error.response?.data?.detail || 'Failed to create league rule';
      toast.error(message);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => pagesService.updateLeagueRule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['league-rules']);
      toast.success('✅ League rule updated successfully');
      handleCloseModal();
    },
    onError: (error) => {
      console.error('❌ Update error:', error.response?.data);
      const message = error.response?.data?.detail || 'Failed to update league rule';
      toast.error(message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: pagesService.deleteLeagueRule,
    onSuccess: () => {
      queryClient.invalidateQueries(['league-rules']);
      toast.success('🗑️ League rule deleted successfully');
    },
    onError: (error) => {
      console.error('❌ Delete error:', error.response?.data);
      const message = error.response?.data?.detail || 'Failed to delete league rule';
      toast.error(message);
    },
  });

  const rules = Array.isArray(rulesData) 
    ? rulesData 
    : rulesData?.results || [];

  // Filter rules by category
  const filteredRules = categoryFilter 
    ? rules.filter(r => r.category === categoryFilter)
    : rules;

  // Group by category
  const rulesByCategory = categoryOptions.reduce((acc, cat) => {
    acc[cat.value] = filteredRules.filter(r => r.category === cat.value);
    return acc;
  }, {});

  const handleOpenModal = (rule = null) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        category: rule.category || 'game_rules',
        title: rule.title || '',
        content: rule.content || '',
        order: rule.order || 0,
        is_active: rule.is_active !== undefined ? rule.is_active : true,
      });
    } else {
      setEditingRule(null);
      setFormData({
        category: 'game_rules',
        title: '',
        content: '',
        order: rules.length,
        is_active: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRule(null);
    setFormData({
      category: 'game_rules',
      title: '',
      content: '',
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

  const handleContentChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      content: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('📤 Submitting:', formData);
    
    if (editingRule) {
      console.log('🔄 Updating league rule ID:', editingRule.id);
      updateMutation.mutate({ id: editingRule.id, data: formData });
    } else {
      console.log('➕ Creating new league rule');
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Delete league rule:\n"${title}"\n\nThis action cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const getCategoryColor = (category) => {
    return categoryOptions.find(c => c.value === category)?.color || '#64748b';
  };

  const getCategoryIcon = (category) => {
    return categoryOptions.find(c => c.value === category)?.icon || '📋';
  };

  return (
    <div className="league-rules-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FileSignature size={32} />
            League Rules
          </h1>
          <p className="page-subtitle">
            Manage league rules and regulations • {rules.length} total
          </p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-create">
          <Plus size={20} />
          <span>Add Rule</span>
        </button>
      </div>

      {/* Category Filter */}
      <div className="category-filters">
        <button
          onClick={() => setCategoryFilter('')}
          className={`category-filter-btn ${!categoryFilter ? 'active' : ''}`}
        >
          <List size={16} />
          All Categories ({rules.length})
        </button>
        {categoryOptions.map((cat) => {
          const count = rules.filter(r => r.category === cat.value).length;
          return (
            <button
              key={cat.value}
              onClick={() => setCategoryFilter(cat.value)}
              className={`category-filter-btn ${categoryFilter === cat.value ? 'active' : ''}`}
              style={{
                borderColor: categoryFilter === cat.value ? cat.color : '#e2e8f0',
                backgroundColor: categoryFilter === cat.value ? cat.color : 'white',
                color: categoryFilter === cat.value ? 'white' : '#64748b',
              }}
            >
              <span>{cat.icon}</span>
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Rules List */}
      <div className="rules-container">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading league rules...</p>
          </div>
        ) : filteredRules.length === 0 ? (
          <div className="empty-state">
            <FileSignature size={64} />
            <h3>No league rules found</h3>
            <p>
              {categoryFilter 
                ? 'No rules in this category yet'
                : 'Create your first league rule to get started'}
            </p>
            {!categoryFilter && (
              <button onClick={() => handleOpenModal()} className="btn-create">
                <Plus size={20} />
                Add Rule
              </button>
            )}
          </div>
        ) : (
          <div className="categories-list">
            {categoryOptions.map((catOption) => {
              const catRules = rulesByCategory[catOption.value];
              if (catRules.length === 0) return null;

              return (
                <div key={catOption.value} className="category-section">
                  <div 
                    className="category-header"
                    style={{ borderLeftColor: catOption.color }}
                  >
                    <h2 className="category-title">
                      <span className="category-icon">{catOption.icon}</span>
                      {catOption.label}
                      <span className="category-count">({catRules.length})</span>
                    </h2>
                  </div>

                  <div className="rules-list">
                    {catRules.map((rule, index) => (
                      <motion.div
                        key={rule.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="rule-card"
                        style={{ borderLeftColor: getCategoryColor(rule.category) }}
                      >
                        <div className="rule-header">
                          <div className="rule-title-area">
                            <h3 className="rule-title">{rule.title}</h3>
                            <span 
                              className="rule-category-badge"
                              style={{ 
                                backgroundColor: getCategoryColor(rule.category),
                                color: 'white'
                              }}
                            >
                              {getCategoryIcon(rule.category)} {rule.category_display}
                            </span>
                          </div>
                          <span className={`rule-status ${rule.is_active ? 'active' : 'inactive'}`}>
                            {rule.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        <div className="rule-content">
                          <div dangerouslySetInnerHTML={{ __html: rule.content }} />
                        </div>

                        <div className="rule-footer">
                          <span className="rule-order">Order: {rule.order}</span>
                          <div className="rule-actions">
                            <button
                              onClick={() => handleOpenModal(rule)}
                              className="action-btn edit"
                            >
                              <Edit size={16} />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(rule.id, rule.title)}
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
                </div>
              );
            })}
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
              className="modal-content modal-large"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>{editingRule ? 'Edit League Rule' : 'Add League Rule'}</h2>
                <button onClick={handleCloseModal} className="modal-close">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="category">Category *</label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    >
                      {categoryOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.icon} {option.label}
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

                <div className="form-group">
                  <label htmlFor="title">Rule Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Game Duration"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="content">Rule Content *</label>
                  <div className="editor-container">
                    <ReactQuill
                      theme="snow"
                      value={formData.content}
                      onChange={handleContentChange}
                      modules={quillModules}
                      formats={quillFormats}
                      placeholder="Write the rule content here..."
                    />
                  </div>
                  <small>Use the toolbar to format your content like in Microsoft Word</small>
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
                        <span>{editingRule ? 'Update' : 'Create'}</span>
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

export default LeagueRules;