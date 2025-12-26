import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Image as ImageIcon, Calendar, User, ZoomIn, 
  ChevronLeft, ChevronRight, Download, Share2, Grid, 
  Layers, Search, Camera
} from 'lucide-react';
import { galleryAPI } from '../api/gallery';
import { getImageUrl, formatDate } from '../utils/formatters';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import './Gallery.css';

const Gallery = () => {
  // ALL HOOKS MUST BE AT THE TOP
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');

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

  // Extract data
  const albums = albumsData?.results || albumsData?.data || albumsData || [];
  const allImages = imagesData?.results || imagesData?.data || imagesData || [];

  // Filter images by search
  const images = allImages.filter(img => 
    searchQuery === '' || 
    img.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    img.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Navigation callback
  const navigateImage = useCallback((direction) => {
    const newIndex = direction === 'next' 
      ? (currentImageIndex + 1) % images.length
      : (currentImageIndex - 1 + images.length) % images.length;
    
    setCurrentImageIndex(newIndex);
    setSelectedImage(images[newIndex]);
  }, [currentImageIndex, images]);

  // Keyboard navigation effect
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!selectedImage) return;
      
      if (e.key === 'ArrowRight') navigateImage('next');
      if (e.key === 'ArrowLeft') navigateImage('prev');
      if (e.key === 'Escape') closeModal();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedImage, navigateImage]);

  // Functions
  const handleImageClick = (image, index) => {
    setSelectedImage(image);
    setCurrentImageIndex(index);
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

  const handleShare = () => {
    if (navigator.share && selectedImage) {
      navigator.share({
        title: selectedImage.title,
        text: selectedImage.description,
        url: window.location.href,
      }).catch(console.log);
    }
  };

  // NOW CHECK FOR LOADING/ERROR AFTER ALL HOOKS
  if (albumsLoading || imagesLoading) return <Loading fullScreen />;
  if (albumsError || imagesError) return <ErrorMessage message="Failed to load gallery" />;

  return (
    <div className="gallery-page-premium">
      {/* Hero Section */}
      <section className="gallery-hero-premium">
        <div className="gallery-hero-overlay"></div>
        
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="gallery-hero-content"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="gallery-hero-tag"
            >
              <Camera size={18} />
              <span>PHOTO GALLERY</span>
            </motion.div>

            <h1 className="gallery-hero-title-premium">
              CAPTURING THE GAME
            </h1>
            
            <p className="gallery-hero-desc-premium">
              Explore moments of passion, skill, and community in TBWS basketball
            </p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="gallery-search-premium"
            >
              <div className="search-container-premium">
                <Search size={20} className="search-icon-premium" />
                <input
                  type="text"
                  placeholder="Search photos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input-premium"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="search-clear-premium">
                    <X size={18} />
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Controls Bar */}
      <section className="gallery-controls-premium">
        <div className="container">
          <div className="controls-wrapper-premium">
            {/* Tabs */}
            <div className="gallery-tabs-premium">
              <button
                onClick={() => {
                  setActiveTab('all');
                  setSelectedAlbum(null);
                }}
                className={`tab-btn-premium ${activeTab === 'all' ? 'tab-active' : ''}`}
              >
                <Grid size={18} />
                <span>All Photos</span>
                <span className="tab-count-premium">{images.length}</span>
              </button>
              <button
                onClick={() => setActiveTab('albums')}
                className={`tab-btn-premium ${activeTab === 'albums' ? 'tab-active' : ''}`}
              >
                <Layers size={18} />
                <span>Albums</span>
                <span className="tab-count-premium">{albums.length}</span>
              </button>
            </div>

            {/* View Mode Toggle */}
            {activeTab === 'all' && (
              <div className="view-toggle-premium">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`view-btn-premium ${viewMode === 'grid' ? 'view-active' : ''}`}
                  title="Grid View"
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('masonry')}
                  className={`view-btn-premium ${viewMode === 'masonry' ? 'view-active' : ''}`}
                  title="Masonry View"
                >
                  <Layers size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Albums Grid */}
      <AnimatePresence mode="wait">
        {activeTab === 'albums' && (
          <motion.section
            key="albums"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="albums-section-premium"
          >
            <div className="container">
              {albums.length === 0 ? (
                <div className="empty-state-premium">
                  <div className="empty-icon-premium">
                    <Layers size={64} />
                  </div>
                  <h3>No albums yet</h3>
                  <p>Photo albums will appear here</p>
                </div>
              ) : (
                <div className="albums-grid-premium">
                  {albums.map((album, index) => (
                    <motion.div
                      key={album.id}
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      onClick={() => handleAlbumClick(album.id)}
                      className="album-card-premium"
                      whileHover={{ y: -8 }}
                    >
                      <div className="album-cover-premium">
                        <img
                          src={getImageUrl(album.cover_image) || 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800'}
                          alt={album.title}
                        />
                        <div className="album-overlay-premium">
                          <div className="album-count-premium">
                            <ImageIcon size={20} />
                            <span>{album.image_count || 0} PHOTOS</span>
                          </div>
                        </div>
                      </div>
                      <div className="album-info-premium">
                        <h3>{album.title}</h3>
                        {album.description && <p>{album.description}</p>}
                        {album.created_at && (
                          <div className="album-meta-premium">
                            <Calendar size={14} />
                            <span>{formatDate(album.created_at)}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.section>
        )}

        {/* Images Grid */}
        {activeTab === 'all' && (
          <motion.section
            key="images"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="images-section-premium"
          >
            <div className="container">
              {selectedAlbum && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="breadcrumb-premium"
                >
                  <button onClick={() => setSelectedAlbum(null)} className="breadcrumb-link-premium">
                    All Images
                  </button>
                  <ChevronRight size={16} />
                  <span className="breadcrumb-current-premium">
                    {albums.find(a => a.id === selectedAlbum)?.title}
                  </span>
                </motion.div>
              )}

              {images.length === 0 ? (
                <div className="empty-state-premium">
                  <div className="empty-icon-premium">
                    <ImageIcon size={64} />
                  </div>
                  <h3>No images found</h3>
                  <p>Try adjusting your search</p>
                </div>
              ) : (
                <div className={`images-grid-premium ${viewMode === 'masonry' ? 'masonry-view' : 'grid-view'}`}>
                  {images.map((image, index) => (
                    <motion.div
                      key={image.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: (index % 20) * 0.02 }}
                      onClick={() => handleImageClick(image, index)}
                      className="image-card-premium"
                    >
                      <div className="image-wrapper-premium">
                        <img
                          src={getImageUrl(image.thumbnail || image.image)}
                          alt={image.title}
                          loading="lazy"
                        />
                        <motion.div
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                          className="image-overlay-premium"
                        >
                          <div className="zoom-icon-premium">
                            <ZoomIn size={32} />
                          </div>
                        </motion.div>
                      </div>
                      {image.title && (
                        <div className="image-info-premium">
                          <h4>{image.title}</h4>
                          {image.photographer && (
                            <span className="image-meta-premium">
                              <User size={12} />
                              {image.photographer}
                            </span>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="image-modal-premium"
            onClick={closeModal}
          >
            <div className="modal-backdrop-premium"></div>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateImage('prev');
                  }}
                  className="modal-nav-premium modal-nav-prev"
                >
                  <ChevronLeft size={32} />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateImage('next');
                  }}
                  className="modal-nav-premium modal-nav-next"
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )}

            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="modal-content-premium"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button onClick={closeModal} className="modal-close-premium">
                <X size={24} />
              </button>

              {/* Action Buttons */}
              <div className="modal-actions-premium">
                <button onClick={handleShare} className="modal-action-btn-premium">
                  <Share2 size={18} />
                </button>
                <a 
                  href={getImageUrl(selectedImage.image)}
                  download
                  className="modal-action-btn-premium"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download size={18} />
                </a>
              </div>

              {/* Image Counter */}
              {images.length > 1 && (
                <div className="image-counter-premium">
                  {currentImageIndex + 1} / {images.length}
                </div>
              )}

              {/* Main Image */}
              <div className="modal-image-container">
                <motion.img
                  key={selectedImage.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  src={getImageUrl(selectedImage.image)}
                  alt={selectedImage.title}
                  className="modal-image-premium"
                />
              </div>

              {/* Image Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="modal-info-premium"
              >
                <h3>{selectedImage.title}</h3>
                {selectedImage.description && <p>{selectedImage.description}</p>}
                <div className="modal-meta-premium">
                  {selectedImage.photographer && (
                    <span className="modal-meta-item">
                      <User size={16} />
                      {selectedImage.photographer}
                    </span>
                  )}
                  {selectedImage.event_date && (
                    <span className="modal-meta-item">
                      <Calendar size={16} />
                      {formatDate(selectedImage.event_date)}
                    </span>
                  )}
                  {selectedImage.location && (
                    <span className="modal-meta-item">
                      📍 {selectedImage.location}
                    </span>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;