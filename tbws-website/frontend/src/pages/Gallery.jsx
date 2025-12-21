import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image as ImageIcon, Calendar, User, ZoomIn } from 'lucide-react';
import { galleryAPI } from '../api/gallery';
import { getImageUrl, formatDate } from '../utils/formatters';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import './Gallery.css';

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  // Fetch albums
  const { data: albumsData, isLoading: albumsLoading, error: albumsError } = useQuery({
    queryKey: ['gallery-albums'],
    queryFn: () => galleryAPI.getAlbums(),
  });

  // Fetch images
  const { data: imagesData, isLoading: imagesLoading, error: imagesError } = useQuery({
    queryKey: ['gallery-images', selectedAlbum],
    queryFn: () => galleryAPI.getImages({ album: selectedAlbum }),
  });

  if (albumsLoading || imagesLoading) return <Loading fullScreen />;
  if (albumsError || imagesError) return <ErrorMessage message="Failed to load gallery" />;

  // Handle paginated response
  const albums = albumsData?.results || albumsData?.data || albumsData || [];
  const images = imagesData?.results || imagesData?.data || imagesData || [];

  const handleImageClick = (image) => {
    setSelectedImage(image);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'auto';
  };

  const handleAlbumClick = (albumId) => {
    setSelectedAlbum(albumId);
    setActiveTab('all');
  };

  return (
    <div className="gallery-page">
      {/* Hero Section */}
      <section className="page-hero">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="page-hero-content"
          >
            <h1>Gallery</h1>
            <p>Capturing the spirit and passion of TBWS basketball</p>
          </motion.div>
        </div>
      </section>

      {/* Tabs */}
      <section className="section gallery-tabs-section">
        <div className="container">
          <div className="gallery-tabs">
            <button
              onClick={() => {
                setActiveTab('all');
                setSelectedAlbum(null);
              }}
              className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            >
              <ImageIcon size={20} />
              All Images
            </button>
            <button
              onClick={() => setActiveTab('albums')}
              className={`tab-btn ${activeTab === 'albums' ? 'active' : ''}`}
            >
              Albums ({albums.length})
            </button>
          </div>
        </div>
      </section>

      {/* Albums Grid */}
      {activeTab === 'albums' && (
        <section className="section albums-section">
          <div className="container">
            {albums.length === 0 ? (
              <div className="empty-state">
                <ImageIcon size={64} />
                <h3>No albums yet</h3>
                <p>Check back later for photo albums</p>
              </div>
            ) : (
              <div className="albums-grid">
                {albums.map((album, index) => (
                  <motion.div
                    key={album.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    onClick={() => handleAlbumClick(album.id)}
                    className="album-card"
                  >
                    <div className="album-cover">
                      <img
                        src={getImageUrl(album.cover_image) || 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800'}
                        alt={album.title}
                      />
                      <div className="album-overlay">
                        <span className="album-count">
                          <ImageIcon size={16} />
                          {album.image_count} photos
                        </span>
                      </div>
                    </div>
                    <div className="album-info">
                      <h3>{album.title}</h3>
                      <p>{album.description}</p>
                      <span className="album-date">
                        <Calendar size={14} />
                        {formatDate(album.created_at)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Images Grid */}
      {activeTab === 'all' && (
        <section className="section images-section">
          <div className="container">
            {selectedAlbum && (
              <div className="breadcrumb">
                <button onClick={() => setSelectedAlbum(null)} className="breadcrumb-link">
                  All Images
                </button>
                <span className="breadcrumb-separator">/</span>
                <span className="breadcrumb-current">
                  {albums.find(a => a.id === selectedAlbum)?.title}
                </span>
              </div>
            )}

            {images.length === 0 ? (
              <div className="empty-state">
                <ImageIcon size={64} />
                <h3>No images yet</h3>
                <p>Check back later for photos</p>
              </div>
            ) : (
              <div className="images-grid">
                {images.map((image, index) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: (index % 12) * 0.05 }}
                    onClick={() => handleImageClick(image)}
                    className="image-card"
                  >
                    <div className="image-wrapper">
                      <img
                        src={getImageUrl(image.thumbnail || image.image)}
                        alt={image.title}
                        loading="lazy"
                      />
                      <div className="image-overlay">
                        <ZoomIn size={32} />
                      </div>
                    </div>
                    <div className="image-info">
                      <h4>{image.title}</h4>
                      {image.photographer && (
                        <span className="image-meta">
                          <User size={12} />
                          {image.photographer}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="image-modal"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={closeModal} className="modal-close">
                <X size={24} />
              </button>

              <div className="modal-image">
                <img
                  src={getImageUrl(selectedImage.image)}
                  alt={selectedImage.title}
                />
              </div>

              <div className="modal-info">
                <h3>{selectedImage.title}</h3>
                {selectedImage.description && <p>{selectedImage.description}</p>}
                <div className="modal-meta">
                  {selectedImage.photographer && (
                    <span>
                      <User size={16} />
                      {selectedImage.photographer}
                    </span>
                  )}
                  {selectedImage.location && (
                    <span>
                      <Calendar size={16} />
                      {selectedImage.location}
                    </span>
                  )}
                  {selectedImage.event_date && (
                    <span>
                      <Calendar size={16} />
                      {formatDate(selectedImage.event_date)}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;