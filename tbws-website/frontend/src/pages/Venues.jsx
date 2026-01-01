import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  MapPin, Phone, Mail, Globe, Users, Search, 
  Filter, X, Star, Navigation, ChevronRight 
} from 'lucide-react';
import pagesService from '../api/pages';
import { getImageUrl } from '../utils/formatters';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import './Venues.css';

const Venues = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['venues'],
    queryFn: async () => {
      try {
        console.log('📤 Venues: Fetching venues...');
        const response = await pagesService.getVenues();
        console.log('✅ Venues: Response:', response.data);
        return response.data;
      } catch (error) {
        console.error('❌ Venues: Error:', error);
        throw error;
      }
    },
  });

  const rawData = data;
  const allVenues = Array.isArray(rawData) 
    ? rawData 
    : rawData?.results || rawData?.data || [];

  console.log('📊 Venues Data:', allVenues);

  const courtTypes = useMemo(() => {
    const types = new Set(allVenues.map(v => v.court_type).filter(Boolean));
    return ['all', ...Array.from(types)];
  }, [allVenues]);

  const venues = useMemo(() => {
    return allVenues.filter(venue => {
      const matchesSearch = searchQuery === '' || 
        venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (venue.address && venue.address.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesType = selectedType === 'all' || venue.court_type === selectedType;
      
      return matchesSearch && matchesType;
    });
  }, [allVenues, searchQuery, selectedType]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
  };

  if (isLoading) return <Loading fullScreen />;
  if (error) return <ErrorMessage message="Failed to load venues" />;

  return (
    <div className="venues-page-pro">
      {/* Hero Banner */}
      <section className="venues-hero-pro">
        <div className="venues-hero-image">
          <img 
            src="https://images.unsplash.com/photo-1519766304817-4f37bda74a26?w=1920&q=80" 
            alt="TBWS Venues"
          />
          <div className="venues-hero-overlay"></div>
        </div>
        
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="venues-hero-content-pro"
          >
            <div className="breadcrumb-pro">
              <span>Home</span>
              <ChevronRight size={16} />
              <span>Venues</span>
            </div>
            
            <h1 className="venues-page-title">WHERE WE PLAY</h1>
            
            <p className="venues-page-subtitle">
              Premium basketball facilities across Kenya
            </p>

            {/* Search & Filter */}
            <div className="venues-search-bar">
              <div className="search-input-group">
                <Search size={20} className="search-icon-pro" />
                <input
                  type="text"
                  placeholder="Search venues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input-pro"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="search-clear-pro">
                    <X size={18} />
                  </button>
                )}
              </div>
              
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`filter-btn-pro ${showFilters ? 'filter-btn-active' : ''}`}
              >
                <Filter size={20} />
                <span>Filter</span>
              </button>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="filter-options-pro"
              >
                {courtTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`filter-option-btn ${selectedType === type ? 'filter-option-active' : ''}`}
                  >
                    {type === 'all' ? 'All Courts' : type}
                  </button>
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Venues Content */}
      <section className="venues-content-pro">
        <div className="container">
          {/* Results Info */}
          <div className="results-info-pro">
            <p className="results-count-pro">
              {venues.length} {venues.length === 1 ? 'venue' : 'venues'} found
            </p>
            {(searchQuery || selectedType !== 'all') && (
              <button onClick={clearFilters} className="clear-filters-pro">
                <X size={16} />
                <span>Clear filters</span>
              </button>
            )}
          </div>

          {/* Venues Grid */}
          {venues.length === 0 ? (
            <div className="no-venues-pro">
              <MapPin size={64} strokeWidth={1.5} />
              <h3>No venues found</h3>
              <p>Try adjusting your search or filters</p>
              <button onClick={clearFilters} className="btn-clear-all">
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="venues-grid-pro">
              {venues.map((venue, index) => (
                <motion.div
                  key={venue.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="venue-card-pro"
                >
                  {/* Image */}
                  <div className="venue-image-pro">
                    <div className="venue-image-wrapper-pro">
                      <img
                        src={
                          getImageUrl(venue.featured_image) ||
                          'https://images.unsplash.com/photo-1519766304817-4f37bda74a26?w=800'
                        }
                        alt={venue.name}
                      />
                    </div>
                    
                    {/* Badges */}
                    {venue.is_primary && (
                      <div className="primary-venue-badge">
                        <Star size={14} />
                        <span>PRIMARY</span>
                      </div>
                    )}

                    {venue.court_type && (
                      <div className="court-type-badge-pro">
                        {venue.court_type}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="venue-content-pro">
                    <h3 className="venue-name-pro">{venue.name}</h3>
                    
                    <div className="venue-location-pro">
                      <MapPin size={16} strokeWidth={1.5} />
                      <span>{venue.address}</span>
                    </div>

                    {venue.description && (
                      <div 
                        className="venue-description-pro"
                        dangerouslySetInnerHTML={{ __html: venue.description }}
                      />
                    )}

                    {/* Specs */}
                    {(venue.surface_type || venue.capacity) && (
                      <div className="venue-specs-pro">
                        {venue.surface_type && (
                          <div className="spec-item-pro">
                            <span className="spec-label">Surface:</span>
                            <span className="spec-value">{venue.surface_type}</span>
                          </div>
                        )}
                        {venue.capacity && (
                          <div className="spec-item-pro">
                            <Users size={14} />
                            <span className="spec-value">{venue.capacity}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Facilities */}
                    {venue.facilities && (
                      <div className="venue-facilities-pro">
                        <h4>Facilities</h4>
                        <div dangerouslySetInnerHTML={{ __html: venue.facilities }} />
                      </div>
                    )}

                    {/* Actions */}
                    <div className="venue-actions-pro">
                      {venue.phone && (
                        <a href={`tel:${venue.phone}`} className="venue-action-icon">
                          <Phone size={18} strokeWidth={1.5} />
                        </a>
                      )}
                      {venue.email && (
                        <a href={`mailto:${venue.email}`} className="venue-action-icon">
                          <Mail size={18} strokeWidth={1.5} />
                        </a>
                      )}
                      {venue.website && (
                        <a 
                          href={venue.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="venue-action-icon"
                        >
                          <Globe size={18} strokeWidth={1.5} />
                        </a>
                      )}
                      {(venue.latitude && venue.longitude) && (
                        <a 
                          href={`https://www.google.com/maps/dir/?api=1&destination=${venue.latitude},${venue.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="venue-directions-btn"
                        >
                          <Navigation size={18} strokeWidth={1.5} />
                          <span>Directions</span>
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Venues;