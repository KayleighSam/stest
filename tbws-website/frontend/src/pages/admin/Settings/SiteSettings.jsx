import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Settings,
  Save,
  Upload,
  X,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import pagesService from '../../../api/pages';
import { getImageUrl } from '../../../utils/formatters';
import toast from 'react-hot-toast';
import './Settings.css';

const SiteSettings = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({});
  const [imagePreview, setImagePreview] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch settings
  const { data: settingsData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-site-settings'],
    queryFn: async () => {
      try {
        console.log('📤 Admin: Fetching site settings...');
        const response = await pagesService.getSettings();
        console.log('✅ Admin: Settings Response:', response.data);
        
        // ✅ Handle paginated response from DRF
        let settings;
        if (response.data.results && Array.isArray(response.data.results)) {
          // Paginated response: {count, next, previous, results: [...]}
          settings = response.data.results[0];
        } else if (Array.isArray(response.data)) {
          // Array response: [...]
          settings = response.data[0];
        } else {
          // Direct object response: {...}
          settings = response.data;
        }
        
        console.log('📊 Admin: Processed Settings:', settings);
        return settings;
      } catch (error) {
        console.error('❌ Admin: Settings Error:', error);
        throw error;
      }
    },
  });

  // Initialize form data when settings are loaded
  useEffect(() => {
    if (settingsData) {
      console.log('🔄 Initializing form with settings:', settingsData);
      setFormData(settingsData);
      setHasChanges(false);
    }
  }, [settingsData]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data) => {
      try {
        console.log('📤 Admin: Updating settings with data:', data);
        
        const settingsId = settingsData?.id || 1;
        console.log('📝 Using settings ID:', settingsId);
        
        const response = await pagesService.updateSettings(settingsId, data);
        console.log('✅ Admin: Update Response:', response.data);
        return response.data;
      } catch (error) {
        console.error('❌ Admin: Update Error:', error);
        console.error('Error details:', error.response?.data);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['admin-site-settings']);
      queryClient.invalidateQueries(['public-site-settings']);
      toast.success('✅ Settings updated successfully');
      
      setFormData(data);
      setImagePreview({});
      setHasChanges(false);
    },
    onError: (error) => {
      const errorData = error.response?.data;
      let errorMessage = 'Failed to update settings';
      
      if (typeof errorData === 'object') {
        const errors = Object.entries(errorData)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('\n');
        errorMessage = errors || errorMessage;
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      }
      
      toast.error(`❌ ${errorMessage}`);
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setHasChanges(true);
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
        setImagePreview((prev) => ({
          ...prev,
          [fieldName]: reader.result,
        }));
      };
      reader.readAsDataURL(file);
      
      setHasChanges(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.site_name) {
      toast.error('❌ Site name is required');
      return;
    }

    updateMutation.mutate(formData);
  };

  const handleRefresh = () => {
    refetch();
    toast.success('🔄 Settings refreshed');
  };

  const handleReset = () => {
    if (hasChanges && !window.confirm('Discard all unsaved changes?')) {
      return;
    }
    setFormData(settingsData);
    setImagePreview({});
    setHasChanges(false);
    toast.info('↩️ Changes discarded');
  };

  if (isLoading) {
    return (
      <div className="admin-settings-page">
        <div className="loading-state">
          <Loader2 className="loading-spinner" size={48} />
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-settings-page">
        <div className="error-state">
          <h3>Failed to load settings</h3>
          <p>{error.message}</p>
          <button onClick={handleRefresh} className="btn-retry">
            <RefreshCw size={20} />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  if (!settingsData) {
    return (
      <div className="admin-settings-page">
        <div className="error-state">
          <h3>No Settings Found</h3>
          <p>Please create settings in Django admin first.</p>
          <a href="http://localhost:8000/admin/pages/sitesettings/" target="_blank" rel="noopener noreferrer" className="btn-retry">
            Open Django Admin
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-settings-page">
      {/* Header */}
      <div className="settings-header">
        <div>
          <h1 className="settings-title">
            <Settings size={32} />
            Site Settings
          </h1>
          <p className="settings-subtitle">
            {hasChanges ? '⚠️ You have unsaved changes' : 'Configure your website\'s global settings'}
          </p>
        </div>
        <div className="settings-header-actions">
          <button onClick={handleRefresh} className="btn-refresh" disabled={updateMutation.isPending}>
            <RefreshCw size={20} />
            <span>Refresh</span>
          </button>
          {hasChanges && (
            <button onClick={handleReset} className="btn-cancel" disabled={updateMutation.isPending}>
              <X size={20} />
              <span>Reset</span>
            </button>
          )}
          <button
            onClick={handleSubmit}
            className="btn-save"
            disabled={updateMutation.isPending || !hasChanges}
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="spinner-small" size={20} />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={20} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="settings-form">
        {/* Basic Information */}
        <div className="settings-card">
          <h2 className="card-title">Basic Information</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="site_name">
                Site Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="site_name"
                name="site_name"
                value={formData.site_name || ''}
                onChange={handleChange}
                required
                placeholder="Enter site name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="tagline">Tagline</label>
              <input
                type="text"
                id="tagline"
                name="tagline"
                value={formData.tagline || ''}
                onChange={handleChange}
                placeholder="Brief site description"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows="4"
              placeholder="Full site description"
            />
          </div>
        </div>

        {/* Branding */}
        <div className="settings-card">
          <h2 className="card-title">Branding</h2>
          
          <div className="form-row">
            {/* Logo */}
            <div className="form-group">
              <label>Site Logo</label>
              <div className="image-upload-container">
                {(imagePreview.logo || formData.logo) && (
                  <div className="image-preview">
                    <img
                      src={imagePreview.logo || getImageUrl(formData.logo)}
                      alt="Logo preview"
                    />
                  </div>
                )}
                <label htmlFor="logo" className="upload-label">
                  <Upload size={20} />
                  <span>Choose Logo</span>
                  <input
                    type="file"
                    id="logo"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 'logo')}
                    hidden
                  />
                </label>
              </div>
            </div>

            {/* Favicon */}
            <div className="form-group">
              <label>Favicon</label>
              <div className="image-upload-container">
                {(imagePreview.favicon || formData.favicon) && (
                  <div className="image-preview small">
                    <img
                      src={imagePreview.favicon || getImageUrl(formData.favicon)}
                      alt="Favicon preview"
                    />
                  </div>
                )}
                <label htmlFor="favicon" className="upload-label">
                  <Upload size={20} />
                  <span>Choose Favicon</span>
                  <input
                    type="file"
                    id="favicon"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 'favicon')}
                    hidden
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="form-group">
            <label>Hero Section Image</label>
            <div className="image-upload-container wide">
              {(imagePreview.hero_image || formData.hero_image) && (
                <div className="image-preview wide">
                  <img
                    src={imagePreview.hero_image || getImageUrl(formData.hero_image)}
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
        </div>

        {/* About Section */}
        <div className="settings-card">
          <h2 className="card-title">About Section</h2>
          
          <div className="form-group">
            <label htmlFor="about_title">About Title</label>
            <input
              type="text"
              id="about_title"
              name="about_title"
              value={formData.about_title || ''}
              onChange={handleChange}
              placeholder="e.g., About TBWS"
            />
          </div>

          <div className="form-group">
            <label htmlFor="about_content">About Content</label>
            <textarea
              id="about_content"
              name="about_content"
              value={formData.about_content || ''}
              onChange={handleChange}
              rows="6"
              placeholder="Main about content (supports HTML)"
            />
          </div>

          <div className="form-group">
            <label>About Image</label>
            <div className="image-upload-container">
              {(imagePreview.about_image || formData.about_image) && (
                <div className="image-preview">
                  <img
                    src={imagePreview.about_image || getImageUrl(formData.about_image)}
                    alt="About preview"
                  />
                </div>
              )}
              <label htmlFor="about_image" className="upload-label">
                <Upload size={20} />
                <span>Choose Image</span>
                <input
                  type="file"
                  id="about_image"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, 'about_image')}
                  hidden
                />
              </label>
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="settings-card">
          <h2 className="card-title">Mission & Vision</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="mission_title">Mission Title</label>
              <input
                type="text"
                id="mission_title"
                name="mission_title"
                value={formData.mission_title || ''}
                onChange={handleChange}
                placeholder="e.g., Our Mission"
              />
            </div>

            <div className="form-group">
              <label htmlFor="vision_title">Vision Title</label>
              <input
                type="text"
                id="vision_title"
                name="vision_title"
                value={formData.vision_title || ''}
                onChange={handleChange}
                placeholder="e.g., Our Vision"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="mission_content">Mission Statement</label>
            <textarea
              id="mission_content"
              name="mission_content"
              value={formData.mission_content || ''}
              onChange={handleChange}
              rows="4"
              placeholder="Enter your mission statement"
            />
          </div>

          <div className="form-group">
            <label htmlFor="vision_content">Vision Statement</label>
            <textarea
              id="vision_content"
              name="vision_content"
              value={formData.vision_content || ''}
              onChange={handleChange}
              rows="4"
              placeholder="Enter your vision statement"
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="settings-card">
          <h2 className="card-title">Contact Information</h2>
          
          <div className="form-group">
            <label htmlFor="email">
              <Mail size={16} />
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              placeholder="info@tbws.org"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">
              <Phone size={16} />
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone || ''}
              onChange={handleChange}
              placeholder="+254 123 456 789"
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">
              <MapPin size={16} />
              Address
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address || ''}
              onChange={handleChange}
              rows="3"
              placeholder="Physical address"
            />
          </div>
        </div>

        {/* Social Media */}
        <div className="settings-card">
          <h2 className="card-title">Social Media</h2>
          
          <div className="form-group">
            <label htmlFor="facebook_url">
              <Facebook size={16} />
              Facebook URL
            </label>
            <input
              type="url"
              id="facebook_url"
              name="facebook_url"
              value={formData.facebook_url || ''}
              onChange={handleChange}
              placeholder="https://facebook.com/tbws"
            />
          </div>

          <div className="form-group">
            <label htmlFor="twitter_url">
              <Twitter size={16} />
              Twitter/X URL
            </label>
            <input
              type="url"
              id="twitter_url"
              name="twitter_url"
              value={formData.twitter_url || ''}
              onChange={handleChange}
              placeholder="https://twitter.com/tbws"
            />
          </div>

          <div className="form-group">
            <label htmlFor="instagram_url">
              <Instagram size={16} />
              Instagram URL
            </label>
            <input
              type="url"
              id="instagram_url"
              name="instagram_url"
              value={formData.instagram_url || ''}
              onChange={handleChange}
              placeholder="https://instagram.com/tbws"
            />
          </div>

          <div className="form-group">
            <label htmlFor="youtube_url">
              <Youtube size={16} />
              YouTube URL
            </label>
            <input
              type="url"
              id="youtube_url"
              name="youtube_url"
              value={formData.youtube_url || ''}
              onChange={handleChange}
              placeholder="https://youtube.com/tbws"
            />
          </div>
        </div>

        {/* SEO Settings */}
        <div className="settings-card">
          <h2 className="card-title">SEO Settings</h2>
          
          <div className="form-group">
            <label htmlFor="meta_description">Meta Description</label>
            <textarea
              id="meta_description"
              name="meta_description"
              value={formData.meta_description || ''}
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
              value={formData.meta_keywords || ''}
              onChange={handleChange}
              placeholder="basketball, kenya, sports, league (comma-separated)"
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default SiteSettings;