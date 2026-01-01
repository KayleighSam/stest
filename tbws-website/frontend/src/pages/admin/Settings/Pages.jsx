import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Upload,
  Loader2,
  Search,
  Eye,
  EyeOff,
} from 'lucide-react';
import pagesService from '../../../api/pages';
import { getImageUrl } from '../../../utils/formatters';
import toast from 'react-hot-toast';
import './Pages.css';

const Pages = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [heroImagePreview, setHeroImagePreview] = useState(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    subtitle: '',
    content: '',
    hero_image: null,
    featured_image: null,
    status: 'published',
    meta_description: '',
    meta_keywords: '',
  });

  // Fetch pages
  const { data: pagesData, isLoading } = useQuery({
    queryKey: ['admin-pages'],
    queryFn: async () => {
      const response = await pagesService.getPages();
      console.log('✅ Pages Response:', response.data);

      if (response.data.results && Array.isArray(response.data.results)) {
        return response.data.results;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    },
  });

  const pages = pagesData || [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => pagesService.createPage(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-pages']);
      toast.success('✅ Page created successfully');
      closeModal();
    },
    onError: (error) => {
      toast.error(`❌ ${error.response?.data?.detail || 'Failed to create page'}`);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ slug, data }) => pagesService.updatePage(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-pages']);
      toast.success('✅ Page updated successfully');
      closeModal();
    },
    onError: (error) => {
      toast.error(`❌ ${error.response?.data?.detail || 'Failed to update page'}`);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (slug) => pagesService.deletePage(slug),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-pages']);
      toast.success('✅ Page deleted successfully');
    },
    onError: (error) => {
      toast.error(`❌ ${error.response?.data?.detail || 'Failed to delete page'}`);
    },
  });

  const openModal = (page = null) => {
    if (page) {
      setEditingPage(page);
      setFormData({
        title: page.title || '',
        slug: page.slug || '',
        subtitle: page.subtitle || '',
        content: page.content || '',
        hero_image: page.hero_image || null,
        featured_image: page.featured_image || null,
        status: page.status || 'published',
        meta_description: page.meta_description || '',
        meta_keywords: page.meta_keywords || '',
      });
      setHeroImagePreview(page.hero_image ? getImageUrl(page.hero_image) : null);
      setFeaturedImagePreview(page.featured_image ? getImageUrl(page.featured_image) : null);
    } else {
      setEditingPage(null);
      setFormData({
        title: '',
        slug: '',
        subtitle: '',
        content: '',
        hero_image: null,
        featured_image: null,
        status: 'published',
        meta_description: '',
        meta_keywords: '',
      });
      setHeroImagePreview(null);
      setFeaturedImagePreview(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPage(null);
    setFormData({
      title: '',
      slug: '',
      subtitle: '',
      content: '',
      hero_image: null,
      featured_image: null,
      status: 'published',
      meta_description: '',
      meta_keywords: '',
    });
    setHeroImagePreview(null);
    setFeaturedImagePreview(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-generate slug from title if creating new page
    if (name === 'title' && !editingPage) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData((prev) => ({
        ...prev,
        slug: slug,
      }));
    }
  };

  const handleImageChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('❌ File size must be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('❌ Please upload an image file');
        return;
      }

      setFormData((prev) => ({
        ...prev,
        [fieldName]: file,
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        if (fieldName === 'hero_image') {
          setHeroImagePreview(reader.result);
        } else if (fieldName === 'featured_image') {
          setFeaturedImagePreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('❌ Page title is required');
      return;
    }

    if (!formData.slug.trim()) {
      toast.error('❌ Page slug is required');
      return;
    }

    if (editingPage) {
      updateMutation.mutate({ slug: editingPage.slug, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (slug, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteMutation.mutate(slug);
    }
  };

  const filteredPages = pages.filter((page) =>
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="pages-admin-page">
        <div className="loading-state">
          <Loader2 className="loading-spinner" size={48} />
          <p>Loading pages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pages-admin-page">
      {/* Header */}
      <div className="pages-header">
        <div>
          <h1 className="pages-title">
            <FileText size={32} />
            Pages Management
          </h1>
          <p className="pages-subtitle">Manage static pages and content</p>
        </div>
        <button onClick={() => openModal()} className="btn-add-page">
          <Plus size={20} />
          <span>Add Page</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="pages-search-bar">
        <Search size={20} />
        <input
          type="text"
          placeholder="Search pages by title or slug..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Pages List */}
      {filteredPages.length === 0 ? (
        <div className="empty-state">
          <FileText size={64} />
          <h3>No Pages Found</h3>
          <p>
            {searchQuery
              ? 'Try adjusting your search terms'
              : 'Get started by adding your first page'}
          </p>
          {!searchQuery && (
            <button onClick={() => openModal()} className="btn-add-first">
              <Plus size={20} />
              <span>Add Your First Page</span>
            </button>
          )}
        </div>
      ) : (
        <div className="pages-list">
          {filteredPages.map((page) => (
            <div key={page.id} className="page-card">
              {/* Image */}
              <div className="page-image">
                {page.featured_image || page.hero_image ? (
                  <img
                    src={getImageUrl(page.featured_image || page.hero_image)}
                    alt={page.title}
                  />
                ) : (
                  <div className="page-no-image">
                    <FileText size={48} />
                  </div>
                )}

                {/* Status Badge */}
                <div className="page-status-badge">
                  {page.status === 'published' ? (
                    <span className="badge-published">
                      <Eye size={14} />
                      Published
                    </span>
                  ) : (
                    <span className="badge-draft">
                      <EyeOff size={14} />
                      Draft
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="page-content">
                <h3 className="page-title">{page.title}</h3>
                {page.subtitle && (
                  <p className="page-subtitle">{page.subtitle}</p>
                )}
                <p className="page-slug">/{page.slug}</p>

                {page.content && (
                  <div
                    className="page-excerpt"
                    dangerouslySetInnerHTML={{
                      __html: page.content.substring(0, 150) + '...',
                    }}
                  />
                )}

                <div className="page-meta">
                  <span className="meta-item">
                    Created: {new Date(page.created_at).toLocaleDateString()}
                  </span>
                  <span className="meta-item">
                    Updated: {new Date(page.updated_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Actions */}
                <div className="page-actions">
                  <button
                    onClick={() => openModal(page)}
                    className="btn-edit"
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(page.slug, page.title)}
                    className="btn-delete"
                    title="Delete"
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <FileText size={24} />
                {editingPage ? 'Edit Page' : 'Add New Page'}
              </h2>
              <button onClick={closeModal} className="btn-close">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {/* Basic Information */}
              <div className="form-section">
                <h3 className="section-title">Basic Information</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="title">
                      Page Title <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      placeholder="e.g., About Us"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="slug">
                      URL Slug <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="slug"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      required
                      placeholder="e.g., about-us"
                      disabled={editingPage}
                    />
                    {editingPage && (
                      <small className="help-text">
                        Slug cannot be changed after creation
                      </small>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subtitle">Subtitle</label>
                  <input
                    type="text"
                    id="subtitle"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleChange}
                    placeholder="Brief subtitle for the page"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="content">
                    Content <span className="required">*</span>
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    rows="10"
                    required
                    placeholder="Page content (supports HTML)"
                  />
                  <small className="help-text">
                    You can use HTML for formatting
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* Images */}
              <div className="form-section">
                <h3 className="section-title">Images</h3>

                <div className="form-group">
                  <label>Hero Image</label>
                  <div className="image-upload-container wide">
                    {(heroImagePreview || formData.hero_image) && (
                      <div className="image-preview wide">
                        <img
                          src={heroImagePreview || getImageUrl(formData.hero_image)}
                          alt="Hero preview"
                        />
                      </div>
                    )}
                    <label htmlFor="hero_image" className="upload-label">
                      <Upload size={20} />
                      <span>Choose Hero Image</span>
                      <input
                        type="file"
                        id="hero_image"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, 'hero_image')}
                        hidden
                      />
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Featured Image</label>
                  <div className="image-upload-container">
                    {(featuredImagePreview || formData.featured_image) && (
                      <div className="image-preview">
                        <img
                          src={
                            featuredImagePreview ||
                            getImageUrl(formData.featured_image)
                          }
                          alt="Featured preview"
                        />
                      </div>
                    )}
                    <label htmlFor="featured_image" className="upload-label">
                      <Upload size={20} />
                      <span>Choose Featured Image</span>
                      <input
                        type="file"
                        id="featured_image"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, 'featured_image')}
                        hidden
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* SEO */}
              <div className="form-section">
                <h3 className="section-title">SEO Settings</h3>

                <div className="form-group">
                  <label htmlFor="meta_description">Meta Description</label>
                  <textarea
                    id="meta_description"
                    name="meta_description"
                    value={formData.meta_description}
                    onChange={handleChange}
                    rows="3"
                    maxLength="160"
                    placeholder="Brief description for search engines (max 160 characters)"
                  />
                  <small className="char-counter">
                    {(formData.meta_description || '').length} / 160 characters
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="meta_keywords">Meta Keywords</label>
                  <input
                    type="text"
                    id="meta_keywords"
                    name="meta_keywords"
                    value={formData.meta_keywords}
                    onChange={handleChange}
                    placeholder="keywords, separated, by, commas"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-cancel"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  <X size={20} />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  className="btn-save"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <Loader2 className="spinner-small" size={20} />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      <span>{editingPage ? 'Update' : 'Create'} Page</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pages;