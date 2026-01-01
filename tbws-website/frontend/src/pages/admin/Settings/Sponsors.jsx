import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  Upload,
  ExternalLink,
  Award,
} from 'lucide-react';
import { pagesService } from '../../../api/pages';
import toast from 'react-hot-toast';
import './Sponsors.css';

const Sponsors = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [filterTier, setFilterTier] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    logo: null,
    website_url: '',
    tier: 'partner',
    description: '',
    is_active: true,
    order: 0,
    started_date: '',
  });

  const tierOptions = [
    { value: 'platinum', label: 'Platinum', color: '#e5e7eb', icon: '💎' },
    { value: 'gold', label: 'Gold', color: '#fbbf24', icon: '🥇' },
    { value: 'silver', label: 'Silver', color: '#94a3b8', icon: '🥈' },
    { value: 'bronze', label: 'Bronze', color: '#d97706', icon: '🥉' },
    { value: 'partner', label: 'Partner', color: '#3b82f6', icon: '🤝' },
  ];

  // Fetch sponsors
  const { data: sponsorsData, isLoading } = useQuery({
    queryKey: ['sponsors'],
    queryFn: async () => {
      const response = await pagesService.getSponsors();
      console.log('✅ Sponsors Response:', response.data);
      return response.data;
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: pagesService.createSponsor,
    onSuccess: () => {
      queryClient.invalidateQueries(['sponsors']);
      toast.success('✅ Sponsor added successfully');
      handleCloseModal();
    },
    onError: (error) => {
      console.error('❌ Create error:', error.response?.data);
      const message = error.response?.data?.detail || 'Failed to add sponsor';
      toast.error(message);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => pagesService.updateSponsor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['sponsors']);
      toast.success('✅ Sponsor updated successfully');
      handleCloseModal();
    },
    onError: (error) => {
      console.error('❌ Update error:', error.response?.data);
      const message = error.response?.data?.detail || 'Failed to update sponsor';
      toast.error(message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: pagesService.deleteSponsor,
    onSuccess: () => {
      queryClient.invalidateQueries(['sponsors']);
      toast.success('🗑️ Sponsor removed successfully');
    },
    onError: (error) => {
      console.error('❌ Delete error:', error.response?.data);
      const message = error.response?.data?.detail || 'Failed to delete sponsor';
      toast.error(message);
    },
  });

  const sponsors = Array.isArray(sponsorsData) 
    ? sponsorsData 
    : sponsorsData?.results || [];

  // Filter sponsors by tier
  const filteredSponsors = filterTier 
    ? sponsors.filter(s => s.tier === filterTier)
    : sponsors;

  // Group by tier
  const sponsorsByTier = tierOptions.reduce((acc, tier) => {
    acc[tier.value] = filteredSponsors.filter(s => s.tier === tier.value);
    return acc;
  }, {});

  const handleOpenModal = (sponsor = null) => {
    if (sponsor) {
      setEditingSponsor(sponsor);
      setFormData({
        name: sponsor.name || '',
        logo: null,
        website_url: sponsor.website_url || '',
        tier: sponsor.tier || 'partner',
        description: sponsor.description || '',
        is_active: sponsor.is_active !== undefined ? sponsor.is_active : true,
        order: sponsor.order || 0,
        started_date: sponsor.started_date || '',
      });
      setLogoPreview(sponsor.logo || null);
    } else {
      setEditingSponsor(null);
      setFormData({
        name: '',
        logo: null,
        website_url: '',
        tier: 'partner',
        description: '',
        is_active: true,
        order: sponsors.length,
        started_date: '',
      });
      setLogoPreview(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSponsor(null);
    setLogoPreview(null);
    setFormData({
      name: '',
      logo: null,
      website_url: '',
      tier: 'partner',
      description: '',
      is_active: true,
      order: 0,
      started_date: '',
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        logo: file,
      }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('📤 Submitting:', formData);
    
    if (editingSponsor) {
      console.log('🔄 Updating sponsor ID:', editingSponsor.id);
      updateMutation.mutate({ id: editingSponsor.id, data: formData });
    } else {
      console.log('➕ Creating new sponsor');
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Remove "${name}" from sponsors?\n\nThis action cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const getTierColor = (tier) => {
    const colors = {
      platinum: '#e5e7eb',
      gold: '#fbbf24',
      silver: '#94a3b8',
      bronze: '#d97706',
      partner: '#3b82f6',
    };
    return colors[tier] || '#3b82f6';
  };

  return (
    <div className="sponsors-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <DollarSign size={32} />
            Sponsors
          </h1>
          <p className="page-subtitle">
            Manage your organization's sponsors • {sponsors.length} total
          </p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-create">
          <Plus size={20} />
          <span>Add Sponsor</span>
        </button>
      </div>

      {/* Tier Filter */}
      <div className="tier-filters">
        <button
          onClick={() => setFilterTier('')}
          className={`tier-filter-btn ${!filterTier ? 'active' : ''}`}
        >
          All Tiers ({sponsors.length})
        </button>
        {tierOptions.map((tier) => {
          const count = sponsors.filter(s => s.tier === tier.value).length;
          return (
            <button
              key={tier.value}
              onClick={() => setFilterTier(tier.value)}
              className={`tier-filter-btn ${filterTier === tier.value ? 'active' : ''}`}
            >
              {tier.icon} {tier.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Sponsors Grid */}
      <div className="sponsors-container">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading sponsors...</p>
          </div>
        ) : filteredSponsors.length === 0 ? (
          <div className="empty-state">
            <DollarSign size={64} />
            <h3>No sponsors found</h3>
            <p>
              {filterTier 
                ? 'No sponsors in this tier yet'
                : 'Add your first sponsor to get started'}
            </p>
            {!filterTier && (
              <button onClick={() => handleOpenModal()} className="btn-create">
                <Plus size={20} />
                Add Sponsor
              </button>
            )}
          </div>
        ) : (
          <div className="tiers-list">
            {tierOptions.map((tierOption) => {
              const tierSponsors = sponsorsByTier[tierOption.value];
              if (tierSponsors.length === 0) return null;

              return (
                <div key={tierOption.value} className="tier-section">
                  <div className="tier-header">
                    <h2 className="tier-title">
                      <span className="tier-icon">{tierOption.icon}</span>
                      {tierOption.label} Tier
                      <span className="tier-count">({tierSponsors.length})</span>
                    </h2>
                  </div>

                  <div className="sponsors-grid">
                    {tierSponsors.map((sponsor, index) => (
                      <motion.div
                        key={sponsor.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="sponsor-card"
                        style={{
                          borderColor: getTierColor(sponsor.tier),
                        }}
                      >
                        <div className="sponsor-card-header">
                          <span 
                            className="sponsor-tier-badge"
                            style={{ backgroundColor: getTierColor(sponsor.tier) }}
                          >
                            {tierOptions.find(t => t.value === sponsor.tier)?.icon} 
                            {tierOptions.find(t => t.value === sponsor.tier)?.label}
                          </span>
                          <div className="sponsor-actions">
                            <button
                              onClick={() => handleOpenModal(sponsor)}
                              className="action-btn edit"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(sponsor.id, sponsor.name)}
                              className="action-btn delete"
                              title="Delete"
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <div className="sponsor-logo">
                          {sponsor.logo ? (
                            <img src={sponsor.logo} alt={sponsor.name} />
                          ) : (
                            <div className="logo-placeholder">
                              <Award size={48} />
                            </div>
                          )}
                        </div>

                        <div className="sponsor-info">
                          <h3 className="sponsor-name">{sponsor.name}</h3>
                          
                          {sponsor.description && (
                            <p className="sponsor-description">{sponsor.description}</p>
                          )}

                          {sponsor.website_url && (
                            <a 
                              href={sponsor.website_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="sponsor-website"
                            >
                              <ExternalLink size={14} />
                              Visit Website
                            </a>
                          )}

                          <div className="sponsor-meta">
                            <span className="sponsor-order">Order: {sponsor.order}</span>
                            <span className={`sponsor-status ${sponsor.is_active ? 'active' : 'inactive'}`}>
                              {sponsor.is_active ? 'Active' : 'Inactive'}
                            </span>
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
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>{editingSponsor ? 'Edit Sponsor' : 'Add Sponsor'}</h2>
                <button onClick={handleCloseModal} className="modal-close">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="modal-form">
                {/* Logo Upload */}
                <div className="form-group">
                  <label>Sponsor Logo *</label>
                  <div className="logo-upload-container">
                    <div className="logo-preview">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo preview" />
                      ) : (
                        <div className="logo-placeholder">
                          <Award size={48} />
                        </div>
                      )}
                    </div>
                    <label htmlFor="logo" className="upload-label">
                      <Upload size={20} />
                      <span>Choose Logo</span>
                      <input
                        type="file"
                        id="logo"
                        accept="image/*"
                        onChange={handleLogoChange}
                        hidden
                      />
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="name">Sponsor Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Acme Corporation"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="tier">Tier *</label>
                    <select
                      id="tier"
                      name="tier"
                      value={formData.tier}
                      onChange={handleChange}
                      required
                    >
                      {tierOptions.map((option) => (
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
                  <label htmlFor="website_url">
                    <ExternalLink size={16} />
                    Website URL
                  </label>
                  <input
                    type="url"
                    id="website_url"
                    name="website_url"
                    value={formData.website_url}
                    onChange={handleChange}
                    placeholder="https://example.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Brief description of the sponsor..."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="started_date">Partnership Started</label>
                  <input
                    type="date"
                    id="started_date"
                    name="started_date"
                    value={formData.started_date}
                    onChange={handleChange}
                  />
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
                        <span>{editingSponsor ? 'Update' : 'Create'}</span>
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

export default Sponsors;