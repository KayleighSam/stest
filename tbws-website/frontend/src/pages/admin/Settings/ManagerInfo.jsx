import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Save,
  X,
  RefreshCw,
  Loader2,
  CheckCircle,
  Star,
  Award,
  Phone,
  Mail,
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Search,
  UserCircle,
} from 'lucide-react';
import pagesService from '../../../api/pages';
import { getImageUrl } from '../../../utils/formatters';
import toast from 'react-hot-toast';
import './ManagerInfo.css';

const ManagerInfo = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('info'); // 'info' or 'managers'
  const [formData, setFormData] = useState({
    title: '',
    overview: '',
    responsibilities_title: '',
    responsibilities_content: '',
    requirements_title: '',
    requirements_content: '',
    benefits_title: '',
    benefits_content: '',
    how_to_become_title: '',
    how_to_become_content: '',
    contact_email: '',
    contact_phone: '',
  });
  const [hasChanges, setHasChanges] = useState(false);

  // Manager Modal State
  const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);
  const [editingManager, setEditingManager] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [managerImagePreview, setManagerImagePreview] = useState(null);
  const [managerFormData, setManagerFormData] = useState({
    name: '',
    team_name: '',
    bio: '',
    photo: null,
    email: '',
    phone: '',
    facebook_url: '',
    twitter_url: '',
    linkedin_url: '',
    years_experience: '',
    is_active: true,
    order: 0,
    joined_date: '',
  });

  // Fetch manager info
  const { data: managerInfoData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-manager-info'],
    queryFn: async () => {
      try {
        console.log('📤 Admin: Fetching manager info...');
        const response = await pagesService.getCurrentManagerInfo();
        console.log('✅ Admin: Manager Info Response:', response.data);
        return response.data;
      } catch (error) {
        console.error('❌ Admin: Manager Info Error:', error);
        throw error;
      }
    },
  });

  // Fetch managers list
  const { data: managersData, isLoading: managersLoading } = useQuery({
    queryKey: ['admin-managers'],
    queryFn: async () => {
      const response = await pagesService.getManagers();
      console.log('✅ Managers Response:', response.data);

      if (response.data.results && Array.isArray(response.data.results)) {
        return response.data.results;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    },
  });

  const managers = managersData || [];

  // Initialize form data when manager info is loaded
  useEffect(() => {
    if (managerInfoData) {
      console.log('🔄 Initializing form with manager info:', managerInfoData);
      setFormData({
        title: managerInfoData.title || '',
        overview: managerInfoData.overview || '',
        responsibilities_title: managerInfoData.responsibilities_title || '',
        responsibilities_content: managerInfoData.responsibilities_content || '',
        requirements_title: managerInfoData.requirements_title || '',
        requirements_content: managerInfoData.requirements_content || '',
        benefits_title: managerInfoData.benefits_title || '',
        benefits_content: managerInfoData.benefits_content || '',
        how_to_become_title: managerInfoData.how_to_become_title || '',
        how_to_become_content: managerInfoData.how_to_become_content || '',
        contact_email: managerInfoData.contact_email || '',
        contact_phone: managerInfoData.contact_phone || '',
      });
      setHasChanges(false);
    }
  }, [managerInfoData]);

  // Update manager info mutation
  const updateInfoMutation = useMutation({
    mutationFn: async (data) => {
      try {
        console.log('📤 Admin: Updating manager info with data:', data);
        const managerId = managerInfoData?.id || 1;
        console.log('📝 Using manager info ID:', managerId);

        const response = await pagesService.updateManagerInfo(managerId, data);
        console.log('✅ Admin: Update Response:', response.data);
        return response.data;
      } catch (error) {
        console.error('❌ Admin: Update Error:', error);
        console.error('Error details:', error.response?.data);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['admin-manager-info']);
      queryClient.invalidateQueries(['public-manager-info']);
      toast.success('✅ Manager Info updated successfully');

      setFormData({
        title: data.title || '',
        overview: data.overview || '',
        responsibilities_title: data.responsibilities_title || '',
        responsibilities_content: data.responsibilities_content || '',
        requirements_title: data.requirements_title || '',
        requirements_content: data.requirements_content || '',
        benefits_title: data.benefits_title || '',
        benefits_content: data.benefits_content || '',
        how_to_become_title: data.how_to_become_title || '',
        how_to_become_content: data.how_to_become_content || '',
        contact_email: data.contact_email || '',
        contact_phone: data.contact_phone || '',
      });
      setHasChanges(false);
    },
    onError: (error) => {
      const errorData = error.response?.data;
      let errorMessage = 'Failed to update manager info';

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

  // Create manager mutation
  const createManagerMutation = useMutation({
    mutationFn: (data) => pagesService.createManager(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-managers']);
      toast.success('✅ Manager created successfully');
      closeManagerModal();
    },
    onError: (error) => {
      toast.error(`❌ ${error.response?.data?.detail || 'Failed to create manager'}`);
    },
  });

  // Update manager mutation
  const updateManagerMutation = useMutation({
    mutationFn: ({ id, data }) => pagesService.updateManager(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-managers']);
      toast.success('✅ Manager updated successfully');
      closeManagerModal();
    },
    onError: (error) => {
      toast.error(`❌ ${error.response?.data?.detail || 'Failed to update manager'}`);
    },
  });

  // Delete manager mutation
  const deleteManagerMutation = useMutation({
    mutationFn: (id) => pagesService.deleteManager(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-managers']);
      toast.success('✅ Manager deleted successfully');
    },
    onError: (error) => {
      toast.error(`❌ ${error.response?.data?.detail || 'Failed to delete manager'}`);
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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('❌ Title is required');
      return;
    }

    updateInfoMutation.mutate(formData);
  };

  const handleRefresh = () => {
    refetch();
    toast.success('🔄 Manager info refreshed');
  };

  const handleReset = () => {
    if (hasChanges && !window.confirm('Discard all unsaved changes?')) {
      return;
    }
    if (managerInfoData) {
      setFormData({
        title: managerInfoData.title || '',
        overview: managerInfoData.overview || '',
        responsibilities_title: managerInfoData.responsibilities_title || '',
        responsibilities_content: managerInfoData.responsibilities_content || '',
        requirements_title: managerInfoData.requirements_title || '',
        requirements_content: managerInfoData.requirements_content || '',
        benefits_title: managerInfoData.benefits_title || '',
        benefits_content: managerInfoData.benefits_content || '',
        how_to_become_title: managerInfoData.how_to_become_title || '',
        how_to_become_content: managerInfoData.how_to_become_content || '',
        contact_email: managerInfoData.contact_email || '',
        contact_phone: managerInfoData.contact_phone || '',
      });
    }
    setHasChanges(false);
    toast.info('↩️ Changes discarded');
  };

  // Manager Modal Functions
  const openManagerModal = (manager = null) => {
    if (manager) {
      setEditingManager(manager);
      setManagerFormData({
        name: manager.name || '',
        team_name: manager.team_name || '',
        bio: manager.bio || '',
        photo: manager.photo || null,
        email: manager.email || '',
        phone: manager.phone || '',
        facebook_url: manager.facebook_url || '',
        twitter_url: manager.twitter_url || '',
        linkedin_url: manager.linkedin_url || '',
        years_experience: manager.years_experience || '',
        is_active: manager.is_active ?? true,
        order: manager.order || 0,
        joined_date: manager.joined_date || '',
      });
      setManagerImagePreview(manager.photo ? getImageUrl(manager.photo) : null);
    } else {
      setEditingManager(null);
      setManagerFormData({
        name: '',
        team_name: '',
        bio: '',
        photo: null,
        email: '',
        phone: '',
        facebook_url: '',
        twitter_url: '',
        linkedin_url: '',
        years_experience: '',
        is_active: true,
        order: 0,
        joined_date: '',
      });
      setManagerImagePreview(null);
    }
    setIsManagerModalOpen(true);
  };

  const closeManagerModal = () => {
    setIsManagerModalOpen(false);
    setEditingManager(null);
    setManagerFormData({
      name: '',
      team_name: '',
      bio: '',
      photo: null,
      email: '',
      phone: '',
      facebook_url: '',
      twitter_url: '',
      linkedin_url: '',
      years_experience: '',
      is_active: true,
      order: 0,
      joined_date: '',
    });
    setManagerImagePreview(null);
  };

  const handleManagerChange = (e) => {
    const { name, value, type, checked } = e.target;
    setManagerFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleManagerImageChange = (e) => {
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

      setManagerFormData((prev) => ({
        ...prev,
        photo: file,
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setManagerImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleManagerSubmit = (e) => {
    e.preventDefault();

    if (!managerFormData.name.trim()) {
      toast.error('❌ Manager name is required');
      return;
    }

    if (editingManager) {
      updateManagerMutation.mutate({ id: editingManager.id, data: managerFormData });
    } else {
      createManagerMutation.mutate(managerFormData);
    }
  };

  const handleDeleteManager = (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteManagerMutation.mutate(id);
    }
  };

  const filteredManagers = managers.filter((manager) =>
    manager.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (manager.team_name && manager.team_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // LOADING STATE
  if (isLoading) {
    return (
      <div className="manager-info-page">
        <div className="loading-state">
          <Loader2 className="loading-spinner" size={48} />
          <p>Loading manager info...</p>
        </div>
      </div>
    );
  }

  // ERROR STATE
  if (error) {
    return (
      <div className="manager-info-page">
        <div className="error-state">
          <h3>Failed to load manager info</h3>
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
    <div className="manager-info-page">
      {/* Header */}
      <div className="manager-info-header">
        <div>
          <h1 className="manager-info-title">
            <Users size={32} />
            Team Manager Management
          </h1>
          <p className="manager-info-subtitle">
            {activeTab === 'info'
              ? hasChanges
                ? '⚠️ You have unsaved changes'
                : 'Manage team manager information and guidelines'
              : 'Manage individual team managers'}
          </p>
        </div>
        <div className="manager-info-header-actions">
          {activeTab === 'info' ? (
            <>
              <button
                onClick={handleRefresh}
                className="btn-refresh"
                disabled={updateInfoMutation.isPending}
              >
                <RefreshCw size={20} />
                <span>Refresh</span>
              </button>
              {hasChanges && (
                <button
                  onClick={handleReset}
                  className="btn-cancel"
                  disabled={updateInfoMutation.isPending}
                >
                  <X size={20} />
                  <span>Reset</span>
                </button>
              )}
              <button
                onClick={handleSubmit}
                className="btn-save"
                disabled={updateInfoMutation.isPending || !hasChanges}
              >
                {updateInfoMutation.isPending ? (
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
            </>
          ) : (
            <button onClick={() => openManagerModal()} className="btn-add-manager">
              <Plus size={20} />
              <span>Add Manager</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="manager-tabs">
        <button
          className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          <Briefcase size={20} />
          <span>Manager Information</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'managers' ? 'active' : ''}`}
          onClick={() => setActiveTab('managers')}
        >
          <Users size={20} />
          <span>Managers List ({managers.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'info' ? (
        <form onSubmit={handleSubmit} className="manager-info-form">
          {/* Basic Information */}
          <div className="manager-info-card">
            <h2 className="card-title">
              <Briefcase size={20} />
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
                placeholder="e.g., Team Manager Information"
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
                placeholder="What is a team manager? (supports HTML)"
              />
            </div>
          </div>

          {/* Responsibilities Section */}
          <div className="manager-info-card">
            <h2 className="card-title">
              <CheckCircle size={20} />
              Manager Responsibilities
            </h2>

            <div className="form-group">
              <label htmlFor="responsibilities_title">Section Title</label>
              <input
                type="text"
                id="responsibilities_title"
                name="responsibilities_title"
                value={formData.responsibilities_title}
                onChange={handleChange}
                placeholder="e.g., Manager Responsibilities"
              />
            </div>

            <div className="form-group">
              <label htmlFor="responsibilities_content">Content</label>
              <textarea
                id="responsibilities_content"
                name="responsibilities_content"
                value={formData.responsibilities_content}
                onChange={handleChange}
                rows="8"
                placeholder="Describe manager responsibilities and duties (supports HTML)"
              />
            </div>
          </div>

          {/* Requirements Section */}
          <div className="manager-info-card">
            <h2 className="card-title">
              <Award size={20} />
              Requirements
            </h2>

            <div className="form-group">
              <label htmlFor="requirements_title">Section Title</label>
              <input
                type="text"
                id="requirements_title"
                name="requirements_title"
                value={formData.requirements_title}
                onChange={handleChange}
                placeholder="e.g., Requirements"
              />
            </div>

            <div className="form-group">
              <label htmlFor="requirements_content">Content</label>
              <textarea
                id="requirements_content"
                name="requirements_content"
                value={formData.requirements_content}
                onChange={handleChange}
                rows="8"
                placeholder="What qualifications and skills are needed? (supports HTML)"
              />
            </div>
          </div>

          {/* Benefits Section */}
          <div className="manager-info-card">
            <h2 className="card-title">
              <Star size={20} />
              Benefits
            </h2>

            <div className="form-group">
              <label htmlFor="benefits_title">Section Title</label>
              <input
                type="text"
                id="benefits_title"
                name="benefits_title"
                value={formData.benefits_title}
                onChange={handleChange}
                placeholder="e.g., Benefits"
              />
            </div>

            <div className="form-group">
              <label htmlFor="benefits_content">Content</label>
              <textarea
                id="benefits_content"
                name="benefits_content"
                value={formData.benefits_content}
                onChange={handleChange}
                rows="8"
                placeholder="What benefits do managers receive? (supports HTML)"
              />
            </div>
          </div>

          {/* How to Become Section */}
          <div className="manager-info-card">
            <h2 className="card-title">
              <Users size={20} />
              How to Become a Manager
            </h2>

            <div className="form-group">
              <label htmlFor="how_to_become_title">Section Title</label>
              <input
                type="text"
                id="how_to_become_title"
                name="how_to_become_title"
                value={formData.how_to_become_title}
                onChange={handleChange}
                placeholder="e.g., How to Become a Manager"
              />
            </div>

            <div className="form-group">
              <label htmlFor="how_to_become_content">Content</label>
              <textarea
                id="how_to_become_content"
                name="how_to_become_content"
                value={formData.how_to_become_content}
                onChange={handleChange}
                rows="8"
                placeholder="Application process and steps to become a manager (supports HTML)"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="manager-info-card">
            <h2 className="card-title">
              <Mail size={20} />
              Contact Information
            </h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contact_email">
                  <Mail size={16} />
                  Contact Email
                </label>
                <input
                  type="email"
                  id="contact_email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleChange}
                  placeholder="managers@tbws.org"
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact_phone">
                  <Phone size={16} />
                  Contact Phone
                </label>
                <input
                  type="tel"
                  id="contact_phone"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleChange}
                  placeholder="+254 123 456 789"
                />
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="managers-list-section">
          {/* Search Bar */}
          <div className="managers-search-bar">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search managers by name or team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Managers Grid */}
          {managersLoading ? (
            <div className="loading-state">
              <Loader2 className="loading-spinner" size={48} />
              <p>Loading managers...</p>
            </div>
          ) : filteredManagers.length === 0 ? (
            <div className="empty-state">
              <UserCircle size={64} />
              <h3>No Managers Found</h3>
              <p>
                {searchQuery
                  ? 'Try adjusting your search terms'
                  : 'Get started by adding your first manager'}
              </p>
              {!searchQuery && (
                <button onClick={() => openManagerModal()} className="btn-add-first">
                  <Plus size={20} />
                  <span>Add Your First Manager</span>
                </button>
              )}
            </div>
          ) : (
            <div className="managers-grid">
              {filteredManagers.map((manager) => (
                <div key={manager.id} className="manager-card">
                  {/* Photo */}
                  <div className="manager-photo">
                    {manager.photo ? (
                      <img src={getImageUrl(manager.photo)} alt={manager.name} />
                    ) : (
                      <div className="manager-no-photo">
                        <UserCircle size={48} />
                      </div>
                    )}
                    {!manager.is_active && (
                      <div className="manager-inactive-badge">Inactive</div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="manager-content">
                    <h3 className="manager-name">{manager.name}</h3>
                    {manager.team_name && (
                      <p className="manager-team">{manager.team_name}</p>
                    )}

                    {manager.years_experience && (
                      <p className="manager-experience">
                        <Award size={14} />
                        {manager.years_experience} years experience
                      </p>
                    )}

                    {manager.bio && (
                      <p className="manager-bio">{manager.bio}</p>
                    )}

                    {/* Contact */}
                    <div className="manager-contact">
                      {manager.email && (
                        <div className="contact-item">
                          <Mail size={14} />
                          <span>{manager.email}</span>
                        </div>
                      )}
                      {manager.phone && (
                        <div className="contact-item">
                          <Phone size={14} />
                          <span>{manager.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="manager-actions">
                      <button
                        onClick={() => openManagerModal(manager)}
                        className="btn-edit"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteManager(manager.id, manager.name)}
                        className="btn-delete"
                        title="Delete"
                        disabled={deleteManagerMutation.isPending}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Manager Modal */}
      {isManagerModalOpen && (
        <div className="modal-overlay" onClick={closeManagerModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <UserCircle size={24} />
                {editingManager ? 'Edit Manager' : 'Add New Manager'}
              </h2>
              <button onClick={closeManagerModal} className="btn-close">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleManagerSubmit} className="modal-form">
              {/* Basic Information */}
              <div className="form-section">
                <h3 className="section-title">Basic Information</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="manager_name">
                      Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="manager_name"
                      name="name"
                      value={managerFormData.name}
                      onChange={handleManagerChange}
                      required
                      placeholder="Manager's full name"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="team_name">Team Name</label>
                    <input
                      type="text"
                      id="team_name"
                      name="team_name"
                      value={managerFormData.team_name}
                      onChange={handleManagerChange}
                      placeholder="Team they manage"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="manager_bio">Bio</label>
                  <textarea
                    id="manager_bio"
                    name="bio"
                    value={managerFormData.bio}
                    onChange={handleManagerChange}
                    rows="4"
                    placeholder="Brief biography"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="years_experience">Years Experience</label>
                    <input
                      type="number"
                      id="years_experience"
                      name="years_experience"
                      value={managerFormData.years_experience}
                      onChange={handleManagerChange}
                      min="0"
                      placeholder="Years as manager"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="joined_date">Joined Date</label>
                    <input
                      type="date"
                      id="joined_date"
                      name="joined_date"
                      value={managerFormData.joined_date}
                      onChange={handleManagerChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="manager_order">Display Order</label>
                  <input
                    type="number"
                    id="manager_order"
                    name="order"
                    value={managerFormData.order}
                    onChange={handleManagerChange}
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Photo Upload */}
              <div className="form-section">
                <h3 className="section-title">Manager Photo</h3>
                <div className="image-upload-section">
                  {(managerImagePreview || managerFormData.photo) && (
                    <div className="image-preview-large">
                      <img
                        src={
                          managerImagePreview ||
                          getImageUrl(managerFormData.photo)
                        }
                        alt="Manager preview"
                      />
                    </div>
                  )}
                  <label htmlFor="manager_photo" className="upload-label-large">
                    <Upload size={20} />
                    <span>Choose Photo</span>
                    <input
                      type="file"
                      id="manager_photo"
                      accept="image/*"
                      onChange={handleManagerImageChange}
                      hidden
                    />
                  </label>
                </div>
              </div>

              {/* Contact Information */}
              <div className="form-section">
                <h3 className="section-title">Contact Information</h3>

                <div className="form-group">
                  <label htmlFor="manager_email">
                    <Mail size={16} />
                    Email
                  </label>
                  <input
                    type="email"
                    id="manager_email"
                    name="email"
                    value={managerFormData.email}
                    onChange={handleManagerChange}
                    placeholder="manager@example.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="manager_phone">
                    <Phone size={16} />
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="manager_phone"
                    name="phone"
                    value={managerFormData.phone}
                    onChange={handleManagerChange}
                    placeholder="+254 123 456 789"
                  />
                </div>
              </div>

              {/* Social Media */}
              <div className="form-section">
                <h3 className="section-title">Social Media (Optional)</h3>

                <div className="form-group">
                  <label htmlFor="facebook_url">Facebook URL</label>
                  <input
                    type="url"
                    id="facebook_url"
                    name="facebook_url"
                    value={managerFormData.facebook_url}
                    onChange={handleManagerChange}
                    placeholder="https://facebook.com/..."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="twitter_url">Twitter/X URL</label>
                  <input
                    type="url"
                    id="twitter_url"
                    name="twitter_url"
                    value={managerFormData.twitter_url}
                    onChange={handleManagerChange}
                    placeholder="https://twitter.com/..."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="linkedin_url">LinkedIn URL</label>
                  <input
                    type="url"
                    id="linkedin_url"
                    name="linkedin_url"
                    value={managerFormData.linkedin_url}
                    onChange={handleManagerChange}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
              </div>

              {/* Status */}
              <div className="form-section">
                <h3 className="section-title">Status</h3>

                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={managerFormData.is_active}
                      onChange={handleManagerChange}
                    />
                    <span>Active (visible to public)</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={closeManagerModal}
                  className="btn-cancel"
                  disabled={createManagerMutation.isPending || updateManagerMutation.isPending}
                >
                  <X size={20} />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  className="btn-save"
                  disabled={createManagerMutation.isPending || updateManagerMutation.isPending}
                >
                  {createManagerMutation.isPending || updateManagerMutation.isPending ? (
                    <>
                      <Loader2 className="spinner-small" size={20} />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      <span>{editingManager ? 'Update' : 'Create'} Manager</span>
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

export default ManagerInfo;