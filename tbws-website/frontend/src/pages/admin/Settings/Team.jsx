import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  Upload,
  Mail,
  Phone,
  Facebook,
  Twitter,
  Linkedin,
  User,
} from 'lucide-react';
import { pagesService } from '../../../api/pages';
import toast from 'react-hot-toast';
import './Team.css';

const Team = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    role: 'committee',
    title: '',
    bio: '',
    photo: null,
    email: '',
    phone: '',
    facebook_url: '',
    twitter_url: '',
    linkedin_url: '',
    order: 0,
    is_active: true,
    joined_date: '',
  });

  const roleOptions = [
    { value: 'president', label: 'President' },
    { value: 'vice_president', label: 'Vice President' },
    { value: 'secretary', label: 'Secretary' },
    { value: 'treasurer', label: 'Treasurer' },
    { value: 'committee', label: 'Committee Member' },
    { value: 'coach', label: 'Coach' },
    { value: 'staff', label: 'Staff' },
  ];

  // Fetch team members
  const { data: membersData, isLoading } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const response = await pagesService.getTeamMembers();
      console.log('✅ Team Members Response:', response.data);
      return response.data;
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: pagesService.createTeamMember,
    onSuccess: () => {
      queryClient.invalidateQueries(['team-members']);
      toast.success('✅ Team member added successfully');
      handleCloseModal();
    },
    onError: (error) => {
      console.error('❌ Create error:', error.response?.data);
      const message = error.response?.data?.detail || 'Failed to add team member';
      toast.error(message);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => pagesService.updateTeamMember(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['team-members']);
      toast.success('✅ Team member updated successfully');
      handleCloseModal();
    },
    onError: (error) => {
      console.error('❌ Update error:', error.response?.data);
      const message = error.response?.data?.detail || 'Failed to update team member';
      toast.error(message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: pagesService.deleteTeamMember,
    onSuccess: () => {
      queryClient.invalidateQueries(['team-members']);
      toast.success('🗑️ Team member removed successfully');
    },
    onError: (error) => {
      console.error('❌ Delete error:', error.response?.data);
      const message = error.response?.data?.detail || 'Failed to delete team member';
      toast.error(message);
    },
  });

  const members = Array.isArray(membersData) 
    ? membersData 
    : membersData?.results || [];

  const handleOpenModal = (member = null) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        name: member.name || '',
        role: member.role || 'committee',
        title: member.title || '',
        bio: member.bio || '',
        photo: null,
        email: member.email || '',
        phone: member.phone || '',
        facebook_url: member.facebook_url || '',
        twitter_url: member.twitter_url || '',
        linkedin_url: member.linkedin_url || '',
        order: member.order || 0,
        is_active: member.is_active !== undefined ? member.is_active : true,
        joined_date: member.joined_date || '',
      });
      setImagePreview(member.photo || null);
    } else {
      setEditingMember(null);
      setFormData({
        name: '',
        role: 'committee',
        title: '',
        bio: '',
        photo: null,
        email: '',
        phone: '',
        facebook_url: '',
        twitter_url: '',
        linkedin_url: '',
        order: members.length,
        is_active: true,
        joined_date: '',
      });
      setImagePreview(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMember(null);
    setImagePreview(null);
    setFormData({
      name: '',
      role: 'committee',
      title: '',
      bio: '',
      photo: null,
      email: '',
      phone: '',
      facebook_url: '',
      twitter_url: '',
      linkedin_url: '',
      order: 0,
      is_active: true,
      joined_date: '',
    });
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
      setFormData((prev) => ({
        ...prev,
        photo: file,
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
    
    console.log('📤 Submitting:', formData);
    
    if (editingMember) {
      console.log('🔄 Updating team member ID:', editingMember.id);
      updateMutation.mutate({ id: editingMember.id, data: formData });
    } else {
      console.log('➕ Creating new team member');
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Remove "${name}" from the team?\n\nThis action cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      president: '#ef4444',
      vice_president: '#f59e0b',
      secretary: '#3b82f6',
      treasurer: '#10b981',
      committee: '#6366f1',
      coach: '#8b5cf6',
      staff: '#64748b',
    };
    return colors[role] || '#64748b';
  };

  return (
    <div className="team-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Users size={32} />
            Team Members
          </h1>
          <p className="page-subtitle">
            Manage your organization's team • {members.length} members
          </p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-create">
          <Plus size={20} />
          <span>Add Team Member</span>
        </button>
      </div>

      {/* Team Grid */}
      <div className="team-container">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading team members...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="empty-state">
            <Users size={64} />
            <h3>No team members yet</h3>
            <p>Add your first team member to get started</p>
            <button onClick={() => handleOpenModal()} className="btn-create">
              <Plus size={20} />
              Add Team Member
            </button>
          </div>
        ) : (
          <div className="team-grid">
            {members.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="team-card"
              >
                <div className="team-card-header">
                  <div className="team-photo">
                    {member.photo ? (
                      <img src={member.photo} alt={member.name} />
                    ) : (
                      <div className="photo-placeholder">
                        <User size={48} />
                      </div>
                    )}
                  </div>
                  <div className="team-actions">
                    <button
                      onClick={() => handleOpenModal(member)}
                      className="action-btn edit"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(member.id, member.name)}
                      className="action-btn delete"
                      title="Delete"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="team-info">
                  <h3 className="member-name">{member.name}</h3>
                  <span 
                    className="member-role"
                    style={{ backgroundColor: getRoleColor(member.role) }}
                  >
                    {member.role_display}
                  </span>
                  {member.title && (
                    <p className="member-title">{member.title}</p>
                  )}
                  {member.bio && (
                    <p className="member-bio">{member.bio}</p>
                  )}

                  {/* Contact Info */}
                  {(member.email || member.phone) && (
                    <div className="member-contact">
                      {member.email && (
                        <a href={`mailto:${member.email}`} className="contact-link">
                          <Mail size={14} />
                          <span>{member.email}</span>
                        </a>
                      )}
                      {member.phone && (
                        <a href={`tel:${member.phone}`} className="contact-link">
                          <Phone size={14} />
                          <span>{member.phone}</span>
                        </a>
                      )}
                    </div>
                  )}

                  {/* Social Links */}
                  {(member.facebook_url || member.twitter_url || member.linkedin_url) && (
                    <div className="member-social">
                      {member.facebook_url && (
                        <a href={member.facebook_url} target="_blank" rel="noopener noreferrer" className="social-icon">
                          <Facebook size={16} />
                        </a>
                      )}
                      {member.twitter_url && (
                        <a href={member.twitter_url} target="_blank" rel="noopener noreferrer" className="social-icon">
                          <Twitter size={16} />
                        </a>
                      )}
                      {member.linkedin_url && (
                        <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" className="social-icon">
                          <Linkedin size={16} />
                        </a>
                      )}
                    </div>
                  )}

                  <div className="member-meta">
                    <span className="member-order">Order: {member.order}</span>
                    <span className={`member-status ${member.is_active ? 'active' : 'inactive'}`}>
                      {member.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
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
              className="modal-content modal-large"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>{editingMember ? 'Edit Team Member' : 'Add Team Member'}</h2>
                <button onClick={handleCloseModal} className="modal-close">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="modal-form">
                {/* Photo Upload */}
                <div className="form-group">
                  <label>Photo</label>
                  <div className="photo-upload-container">
                    <div className="photo-preview">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" />
                      ) : (
                        <div className="photo-placeholder">
                          <User size={64} />
                        </div>
                      )}
                    </div>
                    <label htmlFor="photo" className="upload-label">
                      <Upload size={20} />
                      <span>Choose Photo</span>
                      <input
                        type="file"
                        id="photo"
                        accept="image/*"
                        onChange={handleImageChange}
                        hidden
                      />
                    </label>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="e.g., John Doe"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="role">Role *</label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      required
                    >
                      {roleOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="title">Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Head of Operations"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="bio">Bio</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Brief biography..."
                  />
                </div>

                {/* Contact Info */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">
                      <Mail size={16} />
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="email@example.com"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">
                      <Phone size={16} />
                      Phone
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
                </div>

                {/* Social Media */}
                <div className="form-group">
                  <label htmlFor="facebook_url">
                    <Facebook size={16} />
                    Facebook URL
                  </label>
                  <input
                    type="url"
                    id="facebook_url"
                    name="facebook_url"
                    value={formData.facebook_url}
                    onChange={handleChange}
                    placeholder="https://facebook.com/username"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="twitter_url">
                    <Twitter size={16} />
                    Twitter URL
                  </label>
                  <input
                    type="url"
                    id="twitter_url"
                    name="twitter_url"
                    value={formData.twitter_url}
                    onChange={handleChange}
                    placeholder="https://twitter.com/username"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="linkedin_url">
                    <Linkedin size={16} />
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    id="linkedin_url"
                    name="linkedin_url"
                    value={formData.linkedin_url}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                {/* Meta Info */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="order">Display Order</label>
                    <input
                      type="number"
                      id="order"
                      name="order"
                      value={formData.order}
                      onChange={handleChange}
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="joined_date">Joined Date</label>
                    <input
                      type="date"
                      id="joined_date"
                      name="joined_date"
                      value={formData.joined_date}
                      onChange={handleChange}
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
                        <span>{editingMember ? 'Update' : 'Create'}</span>
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

export default Team;