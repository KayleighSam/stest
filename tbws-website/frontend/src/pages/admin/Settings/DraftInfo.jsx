import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  Save,
  Upload,
  X,
  RefreshCw,
  Loader2,
  Calendar,
  Users,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import pagesService from '../../../api/pages';
import { getImageUrl } from '../../../utils/formatters';
import toast from 'react-hot-toast';
import './DraftInfo.css';

const DraftInfo = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    overview: '',
    eligibility_title: '',
    eligibility_content: '',
    process_title: '',
    process_content: '',
    timeline_title: '',
    timeline_content: '',
    rules_title: '',
    rules_content: '',
    faq_title: '',
    faq_content: '',
    registration_deadline: '',
    draft_date: '',
    featured_image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch draft info
  const { data: draftInfoData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-draft-info'],
    queryFn: async () => {
      try {
        console.log('📤 Admin: Fetching draft info...');
        const response = await pagesService.getCurrentDraftInfo();
        console.log('✅ Admin: Draft Info Response:', response.data);
        return response.data;
      } catch (error) {
        console.error('❌ Admin: Draft Info Error:', error);
        throw error;
      }
    },
  });

  // Initialize form data when draft info is loaded
  useEffect(() => {
    if (draftInfoData) {
      console.log('🔄 Initializing form with draft info:', draftInfoData);
      setFormData({
        title: draftInfoData.title || '',
        overview: draftInfoData.overview || '',
        eligibility_title: draftInfoData.eligibility_title || '',
        eligibility_content: draftInfoData.eligibility_content || '',
        process_title: draftInfoData.process_title || '',
        process_content: draftInfoData.process_content || '',
        timeline_title: draftInfoData.timeline_title || '',
        timeline_content: draftInfoData.timeline_content || '',
        rules_title: draftInfoData.rules_title || '',
        rules_content: draftInfoData.rules_content || '',
        faq_title: draftInfoData.faq_title || '',
        faq_content: draftInfoData.faq_content || '',
        registration_deadline: draftInfoData.registration_deadline || '',
        draft_date: draftInfoData.draft_date || '',
        featured_image: draftInfoData.featured_image || null,
      });
      setImagePreview(
        draftInfoData.featured_image
          ? getImageUrl(draftInfoData.featured_image)
          : null
      );
      setHasChanges(false);
    }
  }, [draftInfoData]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data) => {
      try {
        console.log('📤 Admin: Updating draft info with data:', data);
        const draftId = draftInfoData?.id || 1;
        console.log('📝 Using draft info ID:', draftId);

        const response = await pagesService.updateDraftInfo(draftId, data);
        console.log('✅ Admin: Update Response:', response.data);
        return response.data;
      } catch (error) {
        console.error('❌ Admin: Update Error:', error);
        console.error('Error details:', error.response?.data);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['admin-draft-info']);
      queryClient.invalidateQueries(['public-draft-info']);
      toast.success('✅ Draft Info updated successfully');

      setFormData({
        title: data.title || '',
        overview: data.overview || '',
        eligibility_title: data.eligibility_title || '',
        eligibility_content: data.eligibility_content || '',
        process_title: data.process_title || '',
        process_content: data.process_content || '',
        timeline_title: data.timeline_title || '',
        timeline_content: data.timeline_content || '',
        rules_title: data.rules_title || '',
        rules_content: data.rules_content || '',
        faq_title: data.faq_title || '',
        faq_content: data.faq_content || '',
        registration_deadline: data.registration_deadline || '',
        draft_date: data.draft_date || '',
        featured_image: data.featured_image || null,
      });
      setImagePreview(null);
      setHasChanges(false);
    },
    onError: (error) => {
      const errorData = error.response?.data;
      let errorMessage = 'Failed to update draft info';

      if (typeof errorData === 'object') {
        const errors = Object.entries(errorData)
          .map(
            ([key, value]) =>
              `${key}: ${Array.isArray(value) ? value.join(', ') : value}`
          )
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

  const handleImageChange = (e) => {
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
        featured_image: file,
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      setHasChanges(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('❌ Title is required');
      return;
    }

    updateMutation.mutate(formData);
  };

  const handleRefresh = () => {
    refetch();
    toast.success('🔄 Draft info refreshed');
  };

  const handleReset = () => {
    if (hasChanges && !window.confirm('Discard all unsaved changes?')) {
      return;
    }
    if (draftInfoData) {
      setFormData({
        title: draftInfoData.title || '',
        overview: draftInfoData.overview || '',
        eligibility_title: draftInfoData.eligibility_title || '',
        eligibility_content: draftInfoData.eligibility_content || '',
        process_title: draftInfoData.process_title || '',
        process_content: draftInfoData.process_content || '',
        timeline_title: draftInfoData.timeline_title || '',
        timeline_content: draftInfoData.timeline_content || '',
        rules_title: draftInfoData.rules_title || '',
        rules_content: draftInfoData.rules_content || '',
        faq_title: draftInfoData.faq_title || '',
        faq_content: draftInfoData.faq_content || '',
        registration_deadline: draftInfoData.registration_deadline || '',
        draft_date: draftInfoData.draft_date || '',
        featured_image: draftInfoData.featured_image || null,
      });
      setImagePreview(
        draftInfoData.featured_image
          ? getImageUrl(draftInfoData.featured_image)
          : null
      );
    }
    setHasChanges(false);
    toast.info('↩️ Changes discarded');
  };

  // LOADING STATE
  if (isLoading) {
    return (
      <div className="draft-info-page">
        <div className="loading-state">
          <Loader2 className="loading-spinner" size={48} />
          <p>Loading draft info...</p>
        </div>
      </div>
    );
  }

  // ERROR STATE
  if (error) {
    return (
      <div className="draft-info-page">
        <div className="error-state">
          <h3>Failed to load draft info</h3>
          <p>{error.message}</p>
          <button onClick={handleRefresh} className="btn-retry">
            <RefreshCw size={20} />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="draft-info-page">
      {/* Header */}
      <div className="draft-info-header">
        <div>
          <h1 className="draft-info-title">
            <FileText size={32} />
            Draft Process Information
          </h1>
          <p className="draft-info-subtitle">
            {hasChanges
              ? '⚠️ You have unsaved changes'
              : 'Manage draft process information and guidelines'}
          </p>
        </div>
        <div className="draft-info-header-actions">
          <button
            onClick={handleRefresh}
            className="btn-refresh"
            disabled={updateMutation.isPending}
          >
            <RefreshCw size={20} />
            <span>Refresh</span>
          </button>
          {hasChanges && (
            <button
              onClick={handleReset}
              className="btn-cancel"
              disabled={updateMutation.isPending}
            >
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

      <form onSubmit={handleSubmit} className="draft-info-form">
        {/* Basic Information */}
        <div className="draft-info-card">
          <h2 className="card-title">
            <FileText size={20} />
            Basic Information
          </h2>

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
              placeholder="e.g., TBWS Draft Process"
            />
          </div>

          <div className="form-group">
            <label htmlFor="overview">Overview</label>
            <textarea
              id="overview"
              name="overview"
              value={formData.overview}
              onChange={handleChange}
              rows="6"
              placeholder="General overview of the draft process (supports HTML)"
            />
          </div>

          {/* Featured Image */}
          <div className="form-group">
            <label>Featured Image</label>
            <div className="image-upload-container wide">
              {(imagePreview || formData.featured_image) && (
                <div className="image-preview wide">
                  <img
                    src={
                      imagePreview ||
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
                  onChange={handleImageChange}
                  hidden
                />
              </label>
            </div>
          </div>
        </div>

        {/* Important Dates */}
        <div className="draft-info-card">
          <h2 className="card-title">
            <Calendar size={20} />
            Important Dates
          </h2>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="registration_deadline">
                Registration Deadline
              </label>
              <input
                type="datetime-local"
                id="registration_deadline"
                name="registration_deadline"
                value={formData.registration_deadline}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="draft_date">Draft Date</label>
              <input
                type="datetime-local"
                id="draft_date"
                name="draft_date"
                value={formData.draft_date}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Eligibility Section */}
        <div className="draft-info-card">
          <h2 className="card-title">
            <CheckCircle size={20} />
            Eligibility Requirements
          </h2>

          <div className="form-group">
            <label htmlFor="eligibility_title">Section Title</label>
            <input
              type="text"
              id="eligibility_title"
              name="eligibility_title"
              value={formData.eligibility_title}
              onChange={handleChange}
              placeholder="e.g., Eligibility Requirements"
            />
          </div>

          <div className="form-group">
            <label htmlFor="eligibility_content">Content</label>
            <textarea
              id="eligibility_content"
              name="eligibility_content"
              value={formData.eligibility_content}
              onChange={handleChange}
              rows="8"
              placeholder="Describe eligibility requirements (supports HTML)"
            />
          </div>
        </div>

        {/* Process Section */}
        <div className="draft-info-card">
          <h2 className="card-title">
            <Users size={20} />
            Draft Process
          </h2>

          <div className="form-group">
            <label htmlFor="process_title">Section Title</label>
            <input
              type="text"
              id="process_title"
              name="process_title"
              value={formData.process_title}
              onChange={handleChange}
              placeholder="e.g., How It Works"
            />
          </div>

          <div className="form-group">
            <label htmlFor="process_content">Content</label>
            <textarea
              id="process_content"
              name="process_content"
              value={formData.process_content}
              onChange={handleChange}
              rows="8"
              placeholder="Step-by-step draft process (supports HTML)"
            />
          </div>
        </div>

        {/* Timeline Section */}
        <div className="draft-info-card">
          <h2 className="card-title">
            <Calendar size={20} />
            Draft Timeline
          </h2>

          <div className="form-group">
            <label htmlFor="timeline_title">Section Title</label>
            <input
              type="text"
              id="timeline_title"
              name="timeline_title"
              value={formData.timeline_title}
              onChange={handleChange}
              placeholder="e.g., Draft Timeline"
            />
          </div>

          <div className="form-group">
            <label htmlFor="timeline_content">Content</label>
            <textarea
              id="timeline_content"
              name="timeline_content"
              value={formData.timeline_content}
              onChange={handleChange}
              rows="8"
              placeholder="Draft timeline and important dates (supports HTML)"
            />
          </div>
        </div>

        {/* Rules Section */}
        <div className="draft-info-card">
          <h2 className="card-title">
            <AlertCircle size={20} />
            Draft Rules
          </h2>

          <div className="form-group">
            <label htmlFor="rules_title">Section Title</label>
            <input
              type="text"
              id="rules_title"
              name="rules_title"
              value={formData.rules_title}
              onChange={handleChange}
              placeholder="e.g., Draft Rules"
            />
          </div>

          <div className="form-group">
            <label htmlFor="rules_content">Content</label>
            <textarea
              id="rules_content"
              name="rules_content"
              value={formData.rules_content}
              onChange={handleChange}
              rows="8"
              placeholder="Draft rules and regulations (supports HTML)"
            />
          </div>
        </div>

        {/* FAQ Section */}
        <div className="draft-info-card">
          <h2 className="card-title">
            <FileText size={20} />
            Frequently Asked Questions
          </h2>

          <div className="form-group">
            <label htmlFor="faq_title">Section Title</label>
            <input
              type="text"
              id="faq_title"
              name="faq_title"
              value={formData.faq_title}
              onChange={handleChange}
              placeholder="e.g., Draft FAQ"
            />
          </div>

          <div className="form-group">
            <label htmlFor="faq_content">Content</label>
            <textarea
              id="faq_content"
              name="faq_content"
              value={formData.faq_content}
              onChange={handleChange}
              rows="10"
              placeholder="Frequently asked questions and answers (supports HTML)"
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default DraftInfo;