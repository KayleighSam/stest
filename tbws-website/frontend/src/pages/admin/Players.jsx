import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Upload,
  Loader2,
  Search,
  UserCircle,
  Award,
  Hash,
  MapPin,
} from 'lucide-react';
import usersService from '../../api/users';
import { getImageUrl } from '../../utils/formatters';
import toast from 'react-hot-toast';
import './Players.css';

const Players = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [formData, setFormData] = useState({
    jersey_number: '',
    position: '',
    height: '',
    weight: '',
    hometown: '',
    bio: '',
    profile_photo: null,
    years_active: '',
    status: 'active',
  });

  // Fetch players
  const { data: playersData, isLoading } = useQuery({
    queryKey: ['admin-players'],
    queryFn: async () => {
      const response = await usersService.getPlayers();
      console.log('✅ Players Response:', response.data);

      if (response.data.results && Array.isArray(response.data.results)) {
        return response.data.results;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    },
  });

  const players = playersData || [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => usersService.createPlayer(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-players']);
      toast.success('✅ Player created successfully');
      closeModal();
    },
    onError: (error) => {
      toast.error(`❌ ${error.response?.data?.detail || 'Failed to create player'}`);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => usersService.updatePlayer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-players']);
      toast.success('✅ Player updated successfully');
      closeModal();
    },
    onError: (error) => {
      toast.error(`❌ ${error.response?.data?.detail || 'Failed to update player'}`);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => usersService.deletePlayer(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-players']);
      toast.success('✅ Player deleted successfully');
    },
    onError: (error) => {
      toast.error(`❌ ${error.response?.data?.detail || 'Failed to delete player'}`);
    },
  });

  const openModal = (player = null) => {
    if (player) {
      setEditingPlayer(player);
      setFormData({
        jersey_number: player.jersey_number || '',
        position: player.position || '',
        height: player.height || '',
        weight: player.weight || '',
        hometown: player.hometown || '',
        bio: player.bio || '',
        profile_photo: player.profile_photo || null,
        years_active: player.years_active || '',
        status: player.status || 'active',
      });
      setPhotoPreview(player.profile_photo ? getImageUrl(player.profile_photo) : null);
    } else {
      setEditingPlayer(null);
      setFormData({
        jersey_number: '',
        position: '',
        height: '',
        weight: '',
        hometown: '',
        bio: '',
        profile_photo: null,
        years_active: '',
        status: 'active',
      });
      setPhotoPreview(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPlayer(null);
    setFormData({
      jersey_number: '',
      position: '',
      height: '',
      weight: '',
      hometown: '',
      bio: '',
      profile_photo: null,
      years_active: '',
      status: 'active',
    });
    setPhotoPreview(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e) => {
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
        profile_photo: file,
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingPlayer) {
      updateMutation.mutate({ id: editingPlayer.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const filteredPlayers = players.filter((player) => {
    const fullName = player.full_name || '';
    const email = player.user?.email || '';
    const position = player.position || '';
    
    return (
      fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      position.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getPositionBadge = (position) => {
    const badges = {
      PG: <span className="position-badge pos-pg">PG</span>,
      SG: <span className="position-badge pos-sg">SG</span>,
      SF: <span className="position-badge pos-sf">SF</span>,
      PF: <span className="position-badge pos-pf">PF</span>,
      C: <span className="position-badge pos-c">C</span>,
    };
    return badges[position] || <span className="position-badge">-</span>;
  };

  if (isLoading) {
    return (
      <div className="players-page">
        <div className="loading-state">
          <Loader2 className="loading-spinner" size={48} />
          <p>Loading players...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="players-page">
      {/* Header */}
      <div className="players-header">
        <div>
          <h1 className="players-title">
            <Users size={32} />
            Players Management
          </h1>
          <p className="players-subtitle">Manage player profiles and information</p>
        </div>
        <button onClick={() => openModal()} className="btn-add-player">
          <Plus size={20} />
          <span>Add Player</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="players-search-bar">
        <Search size={20} />
        <input
          type="text"
          placeholder="Search players by name, email, or position..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Players Grid */}
      {filteredPlayers.length === 0 ? (
        <div className="empty-state">
          <UserCircle size={64} />
          <h3>No Players Found</h3>
          <p>
            {searchQuery
              ? 'Try adjusting your search terms'
              : 'Get started by adding your first player'}
          </p>
          {!searchQuery && (
            <button onClick={() => openModal()} className="btn-add-first">
              <Plus size={20} />
              <span>Add Your First Player</span>
            </button>
          )}
        </div>
      ) : (
        <div className="players-grid">
          {filteredPlayers.map((player) => (
            <div key={player.id} className="player-card">
              {/* Photo */}
              <div className="player-photo">
                {player.profile_photo ? (
                  <img src={getImageUrl(player.profile_photo)} alt={player.full_name} />
                ) : (
                  <div className="player-no-photo">
                    <UserCircle size={48} />
                  </div>
                )}
                {player.status !== 'active' && (
                  <div className="player-status-badge">
                    {player.status === 'retired' ? 'Retired' : 'Inactive'}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="player-content">
                <div className="player-header">
                  {player.jersey_number && (
                    <div className="player-jersey">#{player.jersey_number}</div>
                  )}
                  {player.position && getPositionBadge(player.position)}
                </div>

                <h3 className="player-name">{player.full_name || 'Unknown'}</h3>
                
                {player.user?.email && (
                  <p className="player-email">{player.user.email}</p>
                )}

                {/* Stats */}
                <div className="player-stats">
                  {player.height && (
                    <div className="stat-item">
                      <span className="stat-label">Height:</span>
                      <span className="stat-value">{player.height}</span>
                    </div>
                  )}
                  {player.weight && (
                    <div className="stat-item">
                      <span className="stat-label">Weight:</span>
                      <span className="stat-value">{player.weight}</span>
                    </div>
                  )}
                  {player.hometown && (
                    <div className="stat-item">
                      <MapPin size={14} />
                      <span className="stat-value">{player.hometown}</span>
                    </div>
                  )}
                </div>

                {player.years_active && (
                  <div className="player-years">
                    <Award size={14} />
                    {player.years_active}
                  </div>
                )}

                {/* Actions */}
                <div className="player-actions">
                  <button
                    onClick={() => openModal(player)}
                    className="btn-edit"
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(player.id, player.full_name)}
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
                <UserCircle size={24} />
                {editingPlayer ? 'Edit Player' : 'Add New Player'}
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
                    <label htmlFor="jersey_number">
                      <Hash size={16} />
                      Jersey Number
                    </label>
                    <input
                      type="number"
                      id="jersey_number"
                      name="jersey_number"
                      value={formData.jersey_number}
                      onChange={handleChange}
                      min="0"
                      max="99"
                      placeholder="e.g., 23"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="position">Position</label>
                    <select
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                    >
                      <option value="">Select Position</option>
                      <option value="PG">Point Guard (PG)</option>
                      <option value="SG">Shooting Guard (SG)</option>
                      <option value="SF">Small Forward (SF)</option>
                      <option value="PF">Power Forward (PF)</option>
                      <option value="C">Center (C)</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="height">Height</label>
                    <input
                      type="text"
                      id="height"
                      name="height"
                      value={formData.height}
                      onChange={handleChange}
                      placeholder="e.g., 6'2&quot;"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="weight">Weight</label>
                    <input
                      type="text"
                      id="weight"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      placeholder="e.g., 180 lbs"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="hometown">
                      <MapPin size={16} />
                      Hometown
                    </label>
                    <input
                      type="text"
                      id="hometown"
                      name="hometown"
                      value={formData.hometown}
                      onChange={handleChange}
                      placeholder="e.g., Nairobi, Kenya"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="years_active">Years Active</label>
                    <input
                      type="text"
                      id="years_active"
                      name="years_active"
                      value={formData.years_active}
                      onChange={handleChange}
                      placeholder="e.g., 2020-Present"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="bio">Bio</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Player biography..."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>
              </div>

              {/* Photo Upload */}
              <div className="form-section">
                <h3 className="section-title">Player Photo</h3>
                <div className="image-upload-section">
                  {(photoPreview || formData.profile_photo) && (
                    <div className="image-preview-large">
                      <img
                        src={photoPreview || getImageUrl(formData.profile_photo)}
                        alt="Player preview"
                      />
                    </div>
                  )}
                  <label htmlFor="profile_photo" className="upload-label-large">
                    <Upload size={20} />
                    <span>Choose Photo</span>
                    <input
                      type="file"
                      id="profile_photo"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      hidden
                    />
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
                      <span>{editingPlayer ? 'Update' : 'Create'} Player</span>
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

export default Players;