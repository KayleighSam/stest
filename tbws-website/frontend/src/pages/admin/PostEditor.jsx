import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Save,
  X,
  Upload,
  Eye,
  Calendar,
  MapPin,
  Link as LinkIcon,
  Tag as TagIcon,
  Folder,
} from 'lucide-react';
import { contentService } from '../../api/content';
import toast from 'react-hot-toast';
import './PostEditor.css';

const PostEditor = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!slug;

  const [formData, setFormData] = useState({
    title: '',
    post_type: 'news',
    category: '',
    tags: [],
    excerpt: '',
    content: '',
    featured_image: null,
    image_caption: '',
    event_date: '',
    event_end_date: '',
    event_location: '',
    event_venue: '',
    event_registration_link: '',
    status: 'draft',
    is_featured: false,
    is_pinned: false,
    allow_comments: true,
    meta_description: '',
    meta_keywords: '',
  });

  const [imagePreview, setImagePreview] = useState(null);

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await contentService.getCategories();
      return response.data;
    },
  });

  // Fetch tags
  const { data: tagsData } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const response = await contentService.getTags();
      return response.data;
    },
  });

  // Fetch post if editing
  const { data: postData } = useQuery({
    queryKey: ['post', slug],
    queryFn: async () => {
      const response = await contentService.getPost(slug);
      return response.data;
    },
    enabled: isEditMode,
  });

  useEffect(() => {
    if (postData) {
      setFormData({
        title: postData.title || '',
        post_type: postData.post_type || 'news',
        category: postData.category?.id || '',
        tags: postData.tags?.map((t) => t.id) || [],
        excerpt: postData.excerpt || '',
        content: postData.content || '',
        featured_image: null,
        image_caption: postData.image_caption || '',
        event_date: postData.event_date
          ? postData.event_date.substring(0, 16)
          : '',
        event_end_date: postData.event_end_date
          ? postData.event_end_date.substring(0, 16)
          : '',
        event_location: postData.event_location || '',
        event_venue: postData.event_venue || '',
        event_registration_link: postData.event_registration_link || '',
        status: postData.status || 'draft',
        is_featured: postData.is_featured || false,
        is_pinned: postData.is_pinned || false,
        allow_comments: postData.allow_comments ?? true,
        meta_description: postData.meta_description || '',
        meta_keywords: postData.meta_keywords || '',
      });
      if (postData.featured_image) {
        setImagePreview(postData.featured_image);
      }
    }
  }, [postData]);

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: (data) =>
      isEditMode
        ? contentService.updatePost(slug, data)
        : contentService.createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-posts']);
      queryClient.invalidateQueries(['post', slug]);
      toast.success(
        isEditMode
          ? 'Post updated successfully'
          : 'Post created successfully'
      );
      navigate('/admin/posts');
    },
    onError: (error) => {
      console.error('Save error:', error);
      toast.error(error.response?.data?.detail || 'Failed to save post');
    },
  });

  const categories = categoriesData?.results || categoriesData || [];
  const tags = tagsData?.results || tagsData || [];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, featured_image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTagToggle = (tagId) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter((id) => id !== tagId)
        : [...prev.tags, tagId],
    }));
  };

  const handleSubmit = (e, publishNow = false) => {
    e.preventDefault();

    const submitData = { ...formData };
    if (publishNow) {
      submitData.status = 'published';
    }

    saveMutation.mutate(submitData);
  };

  const isEvent = formData.post_type === 'event';

  return (
    <div className="post-editor">
      {/* Header */}
      <div className="editor-header">
        <div>
          <h1 className="editor-title">
            {isEditMode ? 'Edit Post' : 'Create New Post'}
          </h1>
          <p className="editor-subtitle">
            {isEditMode ? `Editing: ${formData.title}` : 'Write your content'}
          </p>
        </div>
        <div className="editor-actions">
          <button
            onClick={() => navigate('/admin/posts')}
            className="btn-cancel"
          >
            <X size={20} />
            Cancel
          </button>
          <button
            onClick={(e) => handleSubmit(e, false)}
            disabled={saveMutation.isPending}
            className="btn-save"
          >
            <Save size={20} />
            {formData.status === 'draft' ? 'Save Draft' : 'Save'}
          </button>
          {formData.status !== 'published' && (
            <button
              onClick={(e) => handleSubmit(e, true)}
              disabled={saveMutation.isPending}
              className="btn-publish"
            >
              <Eye size={20} />
              Publish Now
            </button>
          )}
        </div>
      </div>

      <form className="editor-form">
        <div className="editor-grid">
          {/* Main Content */}
          <div className="editor-main">
            {/* Title */}
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter post title..."
                required
                className="input-title"
              />
            </div>

            {/* Excerpt */}
            <div className="form-group">
              <label>Excerpt *</label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                placeholder="Brief summary (max 300 characters)..."
                maxLength={300}
                rows={3}
                required
                className="input-excerpt"
              />
              <span className="char-count">
                {formData.excerpt.length}/300
              </span>
            </div>

            {/* Content */}
            <div className="form-group">
              <label>Content *</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Write your content here..."
                rows={15}
                required
                className="input-content"
              />
            </div>

            {/* Event Fields */}
            {isEvent && (
              <div className="event-fields">
                <h3>Event Details</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <Calendar size={16} />
                      Event Date *
                    </label>
                    <input
                      type="datetime-local"
                      name="event_date"
                      value={formData.event_date}
                      onChange={handleChange}
                      required={isEvent}
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <Calendar size={16} />
                      End Date
                    </label>
                    <input
                      type="datetime-local"
                      name="event_end_date"
                      value={formData.event_end_date}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <MapPin size={16} />
                      Location
                    </label>
                    <input
                      type="text"
                      name="event_location"
                      value={formData.event_location}
                      onChange={handleChange}
                      placeholder="City, Country"
                    />
                  </div>
                  <div className="form-group">
                    <label>Venue</label>
                    <input
                      type="text"
                      name="event_venue"
                      value={formData.event_venue}
                      onChange={handleChange}
                      placeholder="Venue name"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    <LinkIcon size={16} />
                    Registration Link
                  </label>
                  <input
                    type="url"
                    name="event_registration_link"
                    value={formData.event_registration_link}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                </div>
              </div>
            )}

            {/* SEO */}
            <div className="seo-section">
              <h3>SEO Settings</h3>
              <div className="form-group">
                <label>Meta Description</label>
                <textarea
                  name="meta_description"
                  value={formData.meta_description}
                  onChange={handleChange}
                  placeholder="SEO description (max 160 characters)..."
                  maxLength={160}
                  rows={2}
                />
                <span className="char-count">
                  {formData.meta_description.length}/160
                </span>
              </div>
              <div className="form-group">
                <label>Meta Keywords</label>
                <input
                  type="text"
                  name="meta_keywords"
                  value={formData.meta_keywords}
                  onChange={handleChange}
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="editor-sidebar">
            {/* Post Type */}
            <div className="sidebar-card">
              <h3>Post Type</h3>
              <select
                name="post_type"
                value={formData.post_type}
                onChange={handleChange}
                className="select-full"
              >
                <option value="news">News</option>
                <option value="blog">Blog Post</option>
                <option value="event">Event</option>
                <option value="announcement">Announcement</option>
              </select>
            </div>

            {/* Category */}
            <div className="sidebar-card">
              <h3>
                <Folder size={16} />
                Category
              </h3>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="select-full"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="sidebar-card">
              <h3>
                <TagIcon size={16} />
                Tags
              </h3>
              <div className="tags-list">
                {tags.map((tag) => (
                  <label key={tag.id} className="tag-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.tags.includes(tag.id)}
                      onChange={() => handleTagToggle(tag.id)}
                    />
                    <span>{tag.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Featured Image */}
            <div className="sidebar-card">
              <h3>
                <Upload size={16} />
                Featured Image
              </h3>
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                id="featured-image"
                className="file-input"
              />
              <label htmlFor="featured-image" className="file-label">
                Choose Image
              </label>
              <input
                type="text"
                name="image_caption"
                value={formData.image_caption}
                onChange={handleChange}
                placeholder="Image caption..."
                className="input-caption"
              />
            </div>

            {/* Options */}
            <div className="sidebar-card">
              <h3>Options</h3>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleChange}
                />
                <span>Featured Post</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_pinned"
                  checked={formData.is_pinned}
                  onChange={handleChange}
                />
                <span>Pin to Top</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="allow_comments"
                  checked={formData.allow_comments}
                  onChange={handleChange}
                />
                <span>Allow Comments</span>
              </label>
            </div>

            {/* Status */}
            <div className="sidebar-card">
              <h3>Status</h3>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="select-full"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PostEditor;