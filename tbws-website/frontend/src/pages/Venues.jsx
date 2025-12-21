import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Globe, Users, Maximize2 } from 'lucide-react';
import { pagesAPI } from '../api/pages';
import { getImageUrl } from '../utils/formatters';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import './Venues.css';

const Venues = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['venues'],
    queryFn: () => pagesAPI.getVenues(),
  });

  if (isLoading) return <Loading fullScreen />;
  if (error) return <ErrorMessage message="Failed to load venues" />;

  const rawData = data?.data || data || [];
  const venues = rawData?.results || rawData?.data || rawData || [];

  return (
    <div className="venues-page">
      {/* Hero */}
      <section className="venues-hero">
        <div className="venues-hero-bg"></div>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="venues-hero-content"
          >
            <div className="venues-badge">
              <MapPin size={20} />
              <span>Our Venues</span>
            </div>
            <h1 className="venues-hero-title">Where We Play</h1>
            <p className="venues-hero-desc">
              Explore the courts and facilities where TBWS basketball happens
            </p>
          </motion.div>
        </div>
      </section>

      {/* Venues Grid */}
      <section className="venues-content-section">
        <div className="container">
          {venues.length === 0 ? (
            <div className="no-venues">
              <MapPin size={64} />
              <h3>No venues available</h3>
              <p>Venue information will be added soon</p>
            </div>
          ) : (
            <div className="venues-grid">
              {venues.map((venue, index) => (
                <motion.div
                  key={venue.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="venue-card"
                >
                  {/* Venue Image */}
                  <div className="venue-image-wrapper">
                    <img
                      src={
                        getImageUrl(venue.featured_image) ||
                        'https://images.unsplash.com/photo-1519766304817-4f37bda74a26?w=800'
                      }
                      alt={venue.name}
                      className="venue-image"
                    />
                    {venue.is_primary && (
                      <div className="primary-badge">Primary Venue</div>
                    )}
                  </div>

                  {/* Venue Content */}
                  <div className="venue-content">
                    <h3 className="venue-name">{venue.name}</h3>
                    
                    <div className="venue-address">
                      <MapPin size={18} />
                      <span>{venue.address}</span>
                    </div>

                    {venue.description && (
                      <div 
                        className="venue-description"
                        dangerouslySetInnerHTML={{ __html: venue.description }}
                      />
                    )}

                    {/* Specifications */}
                    <div className="venue-specs">
                      {venue.court_type && (
                        <div className="spec-item">
                          <strong>Court Type:</strong>
                          <span>{venue.court_type}</span>
                        </div>
                      )}
                      {venue.surface_type && (
                        <div className="spec-item">
                          <strong>Surface:</strong>
                          <span>{venue.surface_type}</span>
                        </div>
                      )}
                      {venue.capacity && (
                        <div className="spec-item">
                          <Users size={16} />
                          <span>{venue.capacity} capacity</span>
                        </div>
                      )}
                    </div>

                    {/* Facilities */}
                    {venue.facilities && (
                      <div className="venue-facilities">
                        <h4>Facilities</h4>
                        <div 
                          className="facilities-list"
                          dangerouslySetInnerHTML={{ __html: venue.facilities }}
                        />
                      </div>
                    )}

                    {/* Contact */}
                    <div className="venue-contact">
                      {venue.phone && (
                        <a href={`tel:${venue.phone}`} className="contact-link">
                          <Phone size={16} />
                          <span>{venue.phone}</span>
                        </a>
                      )}
                      {venue.email && (
                        <a href={`mailto:${venue.email}`} className="contact-link">
                          <Mail size={16} />
                          <span>{venue.email}</span>
                        </a>
                      )}
                      {venue.website && (
                        <a 
                          href={venue.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="contact-link"
                        >
                          <Globe size={16} />
                          <span>Visit Website</span>
                        </a>
                      )}
                    </div>

                    {/* Map */}
                    {venue.map_embed_code && (
                      <div className="venue-map">
                        <div dangerouslySetInnerHTML={{ __html: venue.map_embed_code }} />
                      </div>
                    )}
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