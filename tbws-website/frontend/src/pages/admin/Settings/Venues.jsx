import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Upload,
  Star,
  Loader2,
  Search,
  Building2,
  Phone,
  Mail,
  Globe,
} from 'lucide-react';
import pagesService from '../../../api/pages';
import { getImageUrl } from '../../../utils/formatters';
import toast from 'react-hot-toast';
import './Venues.css';

const Venues = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    court_type: '',
    court_dimensions: '',
    surface_type: '',
    facilities: '',
    capacity: '',
    featured_image: null,
    latitude: '',
    longitude: '',
    map_embed_code: '',
    phone: '',
    email: '',
    website: '',
    is_active: true,
    is_primary: false,
    order: 0,
  });

  // Fetch venues
  const { data: venuesData, isLoading } = useQuery({
    queryKey: ['admin-venues'],
    queryFn: async () => {
      const response = await pagesService.getVenues();
      console.log('✅ Venues Response:', response.data);
      
      if (response.data.results && Array.isArray(response.data.results)) {
        return response.data.results;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    },
  });

  const venues = venuesData || [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => pagesService.createVenue(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-venues']);
      toast.success('✅ Venue created successfully');
      closeModal();
    },
    onError: (error) => {
      toast.error(`❌ ${error.response?.data?.detail || 'Failed to create venue'}`);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => pagesService.updateVenue(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-venues']);
      toast.success('✅ Venue updated successfully');
      closeModal();
    },
    onError: (error) => {
      toast.error(`❌ ${error.response?.data?.detail || 'Failed to update venue'}`);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => pagesService.deleteVenue(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-venues']);
      toast.success('✅ Venue deleted successfully');
    },
    onError: (error) => {
      toast.error(`❌ ${error.response?.data?.detail || 'Failed to delete venue'}`);
    },
  });

  const openModal = (venue = null) => {
    if (venue) {
      setEditingVenue(venue);
      setFormData({
        name: venue.name || '',
        address: venue.address || '',
        description: venue.description || '',
        court_type: venue.court_type || '',
        court_dimensions: venue.court_dimensions || '',
        surface_type: venue.surface_type || '',
        facilities: venue.facilities || '',
        capacity: venue.capacity || '',
        featured_image: venue.featured_image || null,
        latitude: venue.latitude || '',
        longitude: venue.longitude || '',
        map_embed_code: venue.map_embed_code || '',
        phone: venue.phone || '',
        email: venue.email || '',
        website: venue.website || '',
        is_active: venue.is_active ?? true,
        is_primary: venue.is_primary ?? false,
        order: venue.order || 0,
      });
      setImagePreview(venue.featured_image ? getImageUrl(venue.featured_image) : null);
    } else {
      setEditingVenue(null);
      setFormData({
        name: '',
        address: '',
        description: '',
        court_type: '',
        court_dimensions: '',
        surface_type: '',
        facilities: '',
        capacity: '',
        featured_image: null,
        latitude: '',
        longitude: '',
        map_embed_code: '',
        phone: '',
        email: '',
        website: '',
        is_active: true,
        is_primary: false,
        order: 0,
      });
      setImagePreview(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingVenue(null);
    setFormData({
      name: '',
      address: '',
      description: '',
      court_type: '',
      court_dimensions: '',
      surface_type: '',
      facilities: '',
      capacity: '',
      featured_image: null,
      latitude: '',
      longitude: '',
      map_embed_code: '',
      phone: '',
      email: '',
      website: '',
      is_active: true,
      is_primary: false,
      order: 0,
    });
    setImagePreview(null);
  };

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
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('❌ Venue name is required');
      return;
    }

    if (!formData.address.trim()) {
      toast.error('❌ Address is required');
      return;
    }

    if (editingVenue) {
      updateMutation.mutate({ id: editingVenue.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const filteredVenues = venues.filter((venue) =>
    venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    venue.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="venues-page">
        <div className="loading-state">
          <Loader2 className="loading-spinner" size={48} />
          <p>Loading venues...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="venues-page">
      {/* Header */}
      <div className="venues-header">
        <div>
          <h1 className="venues-title">
            <MapPin size={32} />
            Venues Management
          </h1>
          <p className="venues-subtitle">Manage basketball courts and facilities</p>
        </div>
        <button onClick={() => openModal()} className="btn-add-venue">
          <Plus size={20} />
          <span>Add Venue</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="venues-search-bar">
        <Search size={20} />
        <input
          type="text"
          placeholder="Search venues by name or address..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Venues Grid */}
      <div className="venues-grid">
        {filteredVenues.length === 0 ? (
          <div className="empty-state">
            <MapPin size={64} />
            <h3>No Venues Found</h3>
            <p>
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'Get started by adding your first venue'}
            </p>
            {!searchQuery && (
              <button onClick={() => openModal()} className="btn-add-first">
                <Plus size={20} />
                <span>Add Your First Venue</span>
              </button>
            )}
          </div>
        ) : (
          filteredVenues.map((venue) => (
            <div key={venue.id} className="venue-card">
              {/* Image */}
              <div className="venue-image">
                {venue.featured_image ? (
                  <img src={getImageUrl(venue.featured_image)} alt={venue.name} />
                ) : (
                  <div className="venue-no-image">
                    <Building2 size={48} />
                  </div>
                )}
                
                {/* Badges */}
                <div className="venue-badges">
                  {venue.is_primary && (
                    <span className="badge-primary">
                      <Star size={14} />
                      Primary
                    </span>
                  )}
                  {!venue.is_active && (
                    <span className="badge-inactive">Inactive</span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="venue-content">
                <h3 className="venue-name">{venue.name}</h3>
                <p className="venue-address">
                  <MapPin size={16} />
                  {venue.address}
                </p>

                {/* Specs */}
                <div className="venue-specs">
                  {venue.court_type && (
                    <span className="spec-tag">{venue.court_type}</span>
                  )}
                  {venue.surface_type && (
                    <span className="spec-tag">{venue.surface_type}</span>
                  )}
                  {venue.capacity && (
                    <span className="spec-tag">Cap: {venue.capacity}</span>
                  )}
                </div>

                {/* Contact */}
                <div className="venue-contact">
                  {venue.phone && (
                    <div className="contact-item">
                      <Phone size={14} />
                      <span>{venue.phone}</span>
                    </div>
                  )}
                  {venue.email && (
                    <div className="contact-item">
                      <Mail size={14} />
                      <span>{venue.email}</span>
                    </div>
                  )}
                  {venue.website && (
                    <div className="contact-item">
                      <Globe size={14} />
                      <a href={venue.website} target="_blank" rel="noopener noreferrer">
                        Website
                      </a>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="venue-actions">
                  <button
                    onClick={() => openModal(venue)}
                    className="btn-edit"
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(venue.id, venue.name)}
                    className="btn-delete"
                    title="Delete"
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <MapPin size={24} />
                {editingVenue ? 'Edit Venue' : 'Add New Venue'}
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
                    <label htmlFor="name">
                      Venue Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="e.g., Nyayo National Stadium"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="order">Display Order</label>
                    <input
                      type="number"
                      id="order"
                      name="order"
                      value={formData.order}
                      onChange={handleChange}
                      min="0"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="address">
                    Address <span className="required">*</span>
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    rows="2"
                    placeholder="Full address of the venue"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Describe the venue, its features, and amenities"
                  />
                </div>
              </div>

              {/* Court Specifications */}
              <div className="form-section">
                <h3 className="section-title">Court Specifications</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="court_type">Court Type</label>
                    <input
                      type="text"
                      id="court_type"
                      name="court_type"
                      value={formData.court_type}
                      onChange={handleChange}
                      placeholder="e.g., Indoor, Outdoor"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="surface_type">Surface Type</label>
                    <input
                      type="text"
                      id="surface_type"
                      name="surface_type"
                      value={formData.surface_type}
                      onChange={handleChange}
                      placeholder="e.g., Hardwood, Concrete"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="court_dimensions">Court Dimensions</label>
                    <input
                      type="text"
                      id="court_dimensions"
                      name="court_dimensions"
                      value={formData.court_dimensions}
                      onChange={handleChange}
                      placeholder="e.g., Full court, Half court"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="capacity">Capacity</label>
                    <input
                      type="number"
                      id="capacity"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleChange}
                      min="0"
                      placeholder="Spectator capacity"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="facilities">Facilities</label>
                  <textarea
                    id="facilities"
                    name="facilities"
                    value={formData.facilities}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Locker rooms, parking, seating, etc."
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="form-section">
                <h3 className="section-title">Venue Image</h3>
                <div className="image-upload-section">
                  {imagePreview && (
                    <div className="image-preview-large">
                      <img src={imagePreview} alt="Preview" />
                    </div>
                  )}
                  <label htmlFor="featured_image" className="upload-label-large">
                    <Upload size={20} />
                    <span>Choose Venue Image</span>
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

              {/* Location */}
              <div className="form-section">
                <h3 className="section-title">Location (Optional)</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="latitude">Latitude</label>
                    <input
                      type="text"
                      id="latitude"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleChange}
                      placeholder="e.g., -1.2921"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="longitude">Longitude</label>
                    <input
                      type="text"
                      id="longitude"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleChange}
                      placeholder="e.g., 36.8219"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="map_embed_code">Map Embed Code</label>
                  <textarea
                    id="map_embed_code"
                    name="map_embed_code"
                    value={formData.map_embed_code}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Paste Google Maps iframe embed code here"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="form-section">
                <h3 className="section-title">Contact Information</h3>

                <div className="form-group">
                  <label htmlFor="phone">
                    <Phone size={16} />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+254 123 456 789"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    <Mail size={16} />
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="venue@example.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="website">
                    <Globe size={16} />
                    Website URL
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://example.com"
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
                      checked={formData.is_active}
                      onChange={handleChange}
                    />
                    <span>Active (visible to public)</span>
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="is_primary"
                      checked={formData.is_primary}
                      onChange={handleChange}
                    />
                    <span>Set as primary venue</span>
                  </label>
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
                      <span>{editingVenue ? 'Update' : 'Create'} Venue</span>
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

export default Venues;