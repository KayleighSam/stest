import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
} from 'lucide-react';
import { pagesService } from '../../../api/pages';
import toast from 'react-hot-toast';
import './FAQs.css';

const FAQs = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '',
    order: 0,
    is_active: true,
  });

  // Fetch FAQs
  const { data: faqsData, isLoading } = useQuery({
    queryKey: ['faqs'],
    queryFn: async () => {
      const response = await pagesService.getFAQs();
      console.log('✅ FAQs Response:', response.data);
      return response.data;
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: pagesService.createFAQ,
    onSuccess: () => {
      queryClient.invalidateQueries(['faqs']);
      toast.success('✅ FAQ created successfully');
      handleCloseModal();
    },
    onError: (error) => {
      console.error('❌ Create error:', error.response?.data);
      const message = error.response?.data?.detail || 'Failed to create FAQ';
      toast.error(message);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => pagesService.updateFAQ(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['faqs']);
      toast.success('✅ FAQ updated successfully');
      handleCloseModal();
    },
    onError: (error) => {
      console.error('❌ Update error:', error.response?.data);
      const message = error.response?.data?.detail || 'Failed to update FAQ';
      toast.error(message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: pagesService.deleteFAQ,
    onSuccess: () => {
      queryClient.invalidateQueries(['faqs']);
      toast.success('🗑️ FAQ deleted successfully');
    },
    onError: (error) => {
      console.error('❌ Delete error:', error.response?.data);
      const message = error.response?.data?.detail || 'Failed to delete FAQ';
      toast.error(message);
    },
  });

  const faqs = Array.isArray(faqsData) 
    ? faqsData 
    : faqsData?.results || [];

  // Get unique categories
  const categories = [...new Set(faqs.map(faq => faq.category).filter(Boolean))];

  // Filter FAQs
  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !categoryFilter || faq.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const handleOpenModal = (faq = null) => {
    if (faq) {
      setEditingFAQ(faq);
      setFormData({
        question: faq.question || '',
        answer: faq.answer || '',
        category: faq.category || '',
        order: faq.order || 0,
        is_active: faq.is_active !== undefined ? faq.is_active : true,
      });
    } else {
      setEditingFAQ(null);
      setFormData({
        question: '',
        answer: '',
        category: '',
        order: faqs.length,
        is_active: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingFAQ(null);
    setFormData({
      question: '',
      answer: '',
      category: '',
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
    
    if (editingFAQ) {
      console.log('🔄 Updating FAQ ID:', editingFAQ.id);
      updateMutation.mutate({ id: editingFAQ.id, data: formData });
    } else {
      console.log('➕ Creating new FAQ');
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id, question) => {
    if (window.confirm(`Delete FAQ:\n"${question}"\n\nThis action cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="faqs-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <HelpCircle size={32} />
            FAQs
          </h1>
          <p className="page-subtitle">
            Manage frequently asked questions • {faqs.length} total
          </p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-create">
          <Plus size={20} />
          <span>Add FAQ</span>
        </button>
      </div>

      {/* Filters */}
      <div className="faqs-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {categories.length > 0 && (
          <div className="filter-item">
            <Filter size={16} />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* FAQs List */}
      <div className="faqs-container">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading FAQs...</p>
          </div>
        ) : filteredFAQs.length === 0 ? (
          <div className="empty-state">
            <HelpCircle size={64} />
            <h3>No FAQs found</h3>
            <p>
              {searchQuery || categoryFilter
                ? 'Try adjusting your filters'
                : 'Create your first FAQ to get started'}
            </p>
            {!searchQuery && !categoryFilter && (
              <button onClick={() => handleOpenModal()} className="btn-create">
                <Plus size={20} />
                Add FAQ
              </button>
            )}
          </div>
        ) : (
          <div className="faqs-list">
            {filteredFAQs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`faq-card ${expandedId === faq.id ? 'expanded' : ''}`}
              >
                <div className="faq-header" onClick={() => toggleExpand(faq.id)}>
                  <div className="faq-question-area">
                    {faq.category && (
                      <span className="faq-category">{faq.category}</span>
                    )}
                    <h3 className="faq-question">{faq.question}</h3>
                  </div>
                  <div className="faq-header-actions">
                    <span className={`faq-status ${faq.is_active ? 'active' : 'inactive'}`}>
                      {faq.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      className="expand-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(faq.id);
                      }}
                    >
                      {expandedId === faq.id ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedId === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="faq-content"
                    >
                      <div className="faq-answer">
                        <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
                      </div>
                      
                      <div className="faq-meta">
                        <span className="faq-order">Order: {faq.order}</span>
                      </div>

                      <div className="faq-actions">
                        <button
                          onClick={() => handleOpenModal(faq)}
                          className="action-btn edit"
                        >
                          <Edit size={16} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(faq.id, faq.question)}
                          className="action-btn delete"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 size={16} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
                <h2>{editingFAQ ? 'Edit FAQ' : 'Add FAQ'}</h2>
                <button onClick={handleCloseModal} className="modal-close">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                  <label htmlFor="question">Question *</label>
                  <input
                    type="text"
                    id="question"
                    name="question"
                    value={formData.question}
                    onChange={handleChange}
                    required
                    placeholder="What is your question?"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="answer">Answer *</label>
                  <textarea
                    id="answer"
                    name="answer"
                    value={formData.answer}
                    onChange={handleChange}
                    required
                    rows="6"
                    placeholder="Provide a detailed answer..."
                  />
                  <small>Supports basic HTML for formatting</small>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <input
                      type="text"
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      placeholder="e.g., General, Registration, Rules"
                      list="categories-list"
                    />
                    {categories.length > 0 && (
                      <datalist id="categories-list">
                        {categories.map((cat) => (
                          <option key={cat} value={cat} />
                        ))}
                      </datalist>
                    )}
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
                        <span>{editingFAQ ? 'Update' : 'Create'}</span>
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

export default FAQs;