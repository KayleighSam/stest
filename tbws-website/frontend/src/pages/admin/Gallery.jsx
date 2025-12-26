import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image as ImageIcon,
  FolderOpen,
  Upload,
  Trash2,
  Edit,
  Plus,
  X,
  Star,
  Camera,
  Search,
} from 'lucide-react';
import { galleryService } from '../../api/gallery';
import { useAdminAuth } from '../../context/AdminAuthContext';
import toast from 'react-hot-toast';
import './Gallery.css';

const AdminGallery = () => {
  const { user } = useAdminAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('albums');
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  
  const [albumFormData, setAlbumFormData] = useState({
    title: '',
    description: '',
    cover_image: null,
    is_featured: false,
  });
  const [coverImagePreview, setCoverImagePreview] = useState(null);

  // Fetch albums
  const { data: albumsData, isLoading: albumsLoading } = useQuery({
    queryKey: ['admin-albums'],
    queryFn: async () => {
      const response = await galleryService.getAlbums();
      return response.data;
    },
  });

  // Fetch images
  const { data: imagesData, isLoading: imagesLoading } = useQuery({
    queryKey: ['admin-images', selectedAlbum],
    queryFn: async () => {
      const response = await galleryService.getImages(
        selectedAlbum ? { album: selectedAlbum } : {}
      );
      return response.data;
    },
  });

  const albums = albumsData?.results || albumsData || [];
  const images = imagesData?.results || imagesData || [];

  // Create/Update Album Mutation
  const saveAlbumMutation = useMutation({
    mutationFn: (data) =>
      editingAlbum
        ? galleryService.updateAlbum(editingAlbum.id, data)
        : galleryService.createAlbum(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-albums']);
      toast.success(
        editingAlbum ? 'Album updated successfully' : 'Album created successfully'
      );
      handleCloseAlbumModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to save album');
    },
  });

  // Delete album mutation
  const deleteAlbumMutation = useMutation({
    mutationFn: galleryService.deleteAlbum,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-albums']);
      toast.success('Album deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to delete album');
    },
  });

  // Delete image mutation
  const deleteImageMutation = useMutation({
    mutationFn: galleryService.deleteImage,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-images']);
      queryClient.invalidateQueries(['admin-albums']);
      toast.success('Image deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to delete image');
    },
  });

  // Upload images mutation
  const uploadImagesMutation = useMutation({
    mutationFn: ({ files, albumId }) =>
      galleryService.uploadImages(files, albumId),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-images']);
      queryClient.invalidateQueries(['admin-albums']);
      toast.success('Images uploaded successfully');
      setShowUploadModal(false);
      setSelectedImages([]);
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.detail || 'Failed to upload images');
    },
  });

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(files);
  };

  const handleUpload = () => {
    if (selectedImages.length === 0) {
      toast.error('Please select images to upload');
      return;
    }
    if (!selectedAlbum) {
      toast.error('Please select an album');
      return;
    }
    uploadImagesMutation.mutate({
      files: selectedImages,
      albumId: selectedAlbum,
    });
  };

  const handleDeleteAlbum = (id) => {
    if (window.confirm('Are you sure? This will delete all images in this album.')) {
      deleteAlbumMutation.mutate(id);
    }
  };

  const handleDeleteImage = (id) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      deleteImageMutation.mutate(id);
    }
  };

  const handleOpenAlbumModal = (album = null) => {
    if (album) {
      setEditingAlbum(album);
      setAlbumFormData({
        title: album.title,
        description: album.description || '',
        cover_image: null,
        is_featured: album.is_featured,
      });
      if (album.cover_image) {
        setCoverImagePreview(album.cover_image);
      }
    } else {
      setEditingAlbum(null);
      setAlbumFormData({
        title: '',
        description: '',
        cover_image: null,
        is_featured: false,
      });
      setCoverImagePreview(null);
    }
    setShowAlbumModal(true);
  };

  const handleCloseAlbumModal = () => {
    setShowAlbumModal(false);
    setEditingAlbum(null);
    setAlbumFormData({
      title: '',
      description: '',
      cover_image: null,
      is_featured: false,
    });
    setCoverImagePreview(null);
  };

  const handleAlbumFormChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      const file = files[0];
      setAlbumFormData((prev) => ({ ...prev, [name]: file }));
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setCoverImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else if (type === 'checkbox') {
      setAlbumFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setAlbumFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAlbumSubmit = (e) => {
    e.preventDefault();
    saveAlbumMutation.mutate(albumFormData);
  };

  const filteredImages = images.filter((image) =>
    image.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-gallery">
      {/* Header */}
      <div className="gallery-header">
        <div>
          <h1 className="gallery-title">Gallery Management</h1>
          <p className="gallery-subtitle">
            Manage photo albums and images for your website
          </p>
        </div>

        <div className="gallery-actions">
          <button
            onClick={() => handleOpenAlbumModal()}
            className="btn-create-album"
          >
            <Plus size={20} />
            <span>New Album</span>
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-upload"
          >
            <Upload size={20} />
            <span>Upload Images</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="gallery-tabs">
        <button
          onClick={() => setActiveTab('albums')}
          className={`tab-btn ${activeTab === 'albums' ? 'tab-active' : ''}`}
        >
          <FolderOpen size={20} />
          <span>Albums ({albums.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('images')}
          className={`tab-btn ${activeTab === 'images' ? 'tab-active' : ''}`}
        >
          <ImageIcon size={20} />
          <span>All Images ({images.length})</span>
        </button>
      </div>

      {/* Albums View */}
      {activeTab === 'albums' && (
        <div className="albums-grid">
          {albumsLoading ? (
            <div className="loading-state">Loading albums...</div>
          ) : albums.length === 0 ? (
            <div className="empty-state">
              <FolderOpen size={64} />
              <h3>No albums yet</h3>
              <p>Create your first album to organize your photos</p>
              <button
                onClick={() => handleOpenAlbumModal()}
                className="btn-create-album"
              >
                <Plus size={20} />
                Create Album
              </button>
            </div>
          ) : (
            albums.map((album, index) => (
              <motion.div
                key={album.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="album-card"
              >
                <div
                  className="album-cover"
                  onClick={() => {
                    setSelectedAlbum(album.id);
                    setActiveTab('images');
                  }}
                >
                  {album.cover_image ? (
                    <img src={album.cover_image} alt={album.title} />
                  ) : (
                    <div className="album-placeholder">
                      <FolderOpen size={48} />
                    </div>
                  )}
                  {album.is_featured && (
                    <div className="featured-badge">
                      <Star size={16} />
                    </div>
                  )}
                </div>

                <div className="album-info">
                  <h3 className="album-title">{album.title}</h3>
                  <p className="album-count">{album.image_count} images</p>
                </div>

                <div className="album-actions">
                  <button
                    onClick={() => handleOpenAlbumModal(album)}
                    className="action-btn edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteAlbum(album.id)}
                    className="action-btn delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Images View */}
      {activeTab === 'images' && (
        <>
          {/* Filter Bar */}
          <div className="images-filter-bar">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              value={selectedAlbum || ''}
              onChange={(e) => setSelectedAlbum(e.target.value || null)}
              className="album-filter"
            >
              <option value="">All Albums</option>
              {albums.map((album) => (
                <option key={album.id} value={album.id}>
                  {album.title}
                </option>
              ))}
            </select>
          </div>

          {/* Images Grid */}
          <div className="images-grid">
            {imagesLoading ? (
              <div className="loading-state">Loading images...</div>
            ) : filteredImages.length === 0 ? (
              <div className="empty-state">
                <ImageIcon size={64} />
                <h3>No images found</h3>
                <p>Upload images to get started</p>
              </div>
            ) : (
              filteredImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="image-card"
                >
                  <div className="image-wrapper">
                    <img
                      src={image.thumbnail || image.image}
                      alt={image.title}
                    />
                    {image.is_featured && (
                      <div className="featured-badge">
                        <Star size={14} />
                      </div>
                    )}
                    <div className="image-overlay">
                      <button
                        onClick={() => handleDeleteImage(image.id)}
                        className="overlay-btn delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="image-meta">
                    <h4>{image.title}</h4>
                    {image.photographer && (
                      <p>
                        <Camera size={12} /> {image.photographer}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </>
      )}

      {/* Album Create/Edit Modal */}
      <AnimatePresence>
        {showAlbumModal && (
          <AlbumModal
            isOpen={showAlbumModal}
            isEditing={!!editingAlbum}
            formData={albumFormData}
            coverImagePreview={coverImagePreview}
            onChange={handleAlbumFormChange}
            onSubmit={handleAlbumSubmit}
            onClose={handleCloseAlbumModal}
            isSaving={saveAlbumMutation.isPending}
          />
        )}
      </AnimatePresence>

      {/* Upload Images Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <UploadModal
            albums={albums}
            selectedAlbum={selectedAlbum}
            onSelectAlbum={setSelectedAlbum}
            selectedImages={selectedImages}
            onFileSelect={handleFileSelect}
            onUpload={handleUpload}
            onClose={() => {
              setShowUploadModal(false);
              setSelectedImages([]);
            }}
            isUploading={uploadImagesMutation.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Album Modal Component
const AlbumModal = ({
  isOpen,
  isEditing,
  formData,
  coverImagePreview,
  onChange,
  onSubmit,
  onClose,
  isSaving,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal-overlay"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="modal-content album-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Album' : 'Create New Album'}</h2>
          <button onClick={onClose} className="modal-close">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="modal-body">
          <div className="form-group">
            <label>Album Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={onChange}
              placeholder="Enter album title..."
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={onChange}
              placeholder="Enter album description..."
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Cover Image</label>
            {coverImagePreview && (
              <div className="image-preview">
                <img src={coverImagePreview} alt="Cover preview" />
              </div>
            )}
            <input
              type="file"
              name="cover_image"
              accept="image/*"
              onChange={onChange}
              id="cover-image-upload"
              className="file-input"
            />
            <label htmlFor="cover-image-upload" className="file-label">
              {coverImagePreview ? 'Change Cover Image' : 'Choose Cover Image'}
            </label>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_featured"
                checked={formData.is_featured}
                onChange={onChange}
              />
              <span>Featured Album</span>
            </label>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="btn-primary">
              {isSaving ? 'Saving...' : isEditing ? 'Update Album' : 'Create Album'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Upload Modal Component (unchanged but included for completeness)
const UploadModal = ({
  albums,
  selectedAlbum,
  onSelectAlbum,
  selectedImages,
  onFileSelect,
  onUpload,
  onClose,
  isUploading,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal-overlay"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Upload Images</h2>
          <button onClick={onClose} className="modal-close">
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Select Album *</label>
            <select
              value={selectedAlbum || ''}
              onChange={(e) => onSelectAlbum(e.target.value)}
              required
            >
              <option value="">Choose an album...</option>
              {albums.map((album) => (
                <option key={album.id} value={album.id}>
                  {album.title}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Choose Images *</label>
            <div className="file-upload-area">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={onFileSelect}
                id="image-upload"
              />
              <label htmlFor="image-upload" className="file-upload-label">
                <Upload size={48} />
                <p>Click to select images or drag and drop</p>
                <span>PNG, JPG, GIF up to 10MB each</span>
              </label>
            </div>
          </div>

          {selectedImages.length > 0 && (
            <div className="selected-files">
              <h4>{selectedImages.length} images selected</h4>
              <div className="file-list">
                {selectedImages.map((file, index) => (
                  <div key={index} className="file-item">
                    <ImageIcon size={16} />
                    <span>{file.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={onUpload}
            disabled={isUploading || selectedImages.length === 0}
            className="btn-primary"
          >
            {isUploading
              ? 'Uploading...'
              : `Upload ${selectedImages.length} Images`}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminGallery;