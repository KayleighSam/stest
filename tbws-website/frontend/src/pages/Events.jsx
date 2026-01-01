import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, ArrowRight, ChevronRight, Sparkles } from 'lucide-react';
import { contentService } from '../api/content';
import { Link } from 'react-router-dom';
import './Events.css';

const Events = () => {
  const [filter, setFilter] = useState('upcoming');

  const { data, isLoading, error } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await contentService.getPosts({ post_type: 'event' });
      return response.data;
    },
  });

  // Helper function to get image URL
  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${url}`;
  };

  // Helper function to format date/time
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter events based on date
  const now = new Date();
  const rawEvents = data?.results || data || [];
  
  const upcomingEvents = rawEvents.filter(event => {
    if (!event.event_date) return false;
    const eventDate = new Date(event.event_date);
    return eventDate >= now;
  }).sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

  const pastEvents = rawEvents.filter(event => {
    if (!event.event_date) return false;
    const eventDate = new Date(event.event_date);
    return eventDate < now;
  }).sort((a, b) => new Date(b.event_date) - new Date(a.event_date));

  const events = filter === 'upcoming' ? upcomingEvents : pastEvents;

  if (isLoading) {
    return (
      <div className="events-page-pro">
        <div className="container">
          <div className="loading-state-modern">
            <div className="loading-spinner-modern"></div>
            <p>Loading amazing events...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="events-page-pro">
        <div className="container">
          <div className="error-state-modern">
            <h3>Oops! Failed to load events</h3>
            <p>{error.message}</p>
            <button onClick={() => window.location.reload()} className="retry-btn">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="events-page-pro">
      {/* Hero Banner */}
      <section className="events-hero-pro">
        <div className="events-hero-background">
          <div className="gradient-orb-events orb-1"></div>
          <div className="gradient-orb-events orb-2"></div>
          <div className="gradient-orb-events orb-3"></div>
        </div>

        <div className="events-hero-image">
          <img 
            src="https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=1920&q=80" 
            alt="TBWS Events"
          />
          <div className="events-hero-overlay"></div>
        </div>
        
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="events-hero-content-pro"
          >
            <div className="hero-badge-events">
              <Sparkles size={16} />
              <span>Basketball Events</span>
            </div>
            
            <h1 className="events-page-title">EVENTS & TOURNAMENTS</h1>
            
            <p className="events-page-subtitle">
              Join us for exciting basketball action, tournaments, and community gatherings
            </p>

            <div className="events-stats-mini">
              <div className="stat-mini-item">
                <span className="stat-mini-value">{upcomingEvents.length}</span>
                <span className="stat-mini-label">Upcoming</span>
              </div>
              <div className="stat-mini-divider"></div>
              <div className="stat-mini-item">
                <span className="stat-mini-value">{pastEvents.length}</span>
                <span className="stat-mini-label">Past Events</span>
              </div>
              <div className="stat-mini-divider"></div>
              <div className="stat-mini-item">
                <span className="stat-mini-value">{rawEvents.length}</span>
                <span className="stat-mini-label">Total</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Events Content */}
      <section className="events-content-pro">
        <div className="container">
          {/* Filter Tabs */}
          <div className="events-filters-pro">
            <button
              onClick={() => setFilter('upcoming')}
              className={`filter-tab-pro ${filter === 'upcoming' ? 'filter-tab-active' : ''}`}
            >
              <Calendar size={20} />
              <span>Upcoming Events ({upcomingEvents.length})</span>
              {filter === 'upcoming' && <div className="tab-indicator"></div>}
            </button>

            <button
              onClick={() => setFilter('past')}
              className={`filter-tab-pro ${filter === 'past' ? 'filter-tab-active' : ''}`}
            >
              <Clock size={20} />
              <span>Past Events ({pastEvents.length})</span>
              {filter === 'past' && <div className="tab-indicator"></div>}
            </button>
          </div>

          {/* Events Grid */}
          {events.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="no-events-pro"
            >
              <div className="no-events-icon">
                <Calendar size={64} strokeWidth={1.5} />
              </div>
              <h3>No {filter} events</h3>
              <p>Check back later for new exciting events and tournaments</p>
            </motion.div>
          ) : (
            <div className="events-grid-pro">
              {events.map((event, index) => (
                <motion.div
                  key={event.id || index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Link to={`/blog/${event.slug}`} className="event-card-pro">
                    {/* Image */}
                    <div className="event-image-pro">
                      <div className="event-image-wrapper-pro">
                        <img
                          src={
                            getImageUrl(event.featured_image) ||
                            'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=800'
                          }
                          alt={event.title}
                          loading="lazy"
                        />
                        <div className="event-image-overlay"></div>
                      </div>

                      {/* Date Badge */}
                      {event.event_date && (
                        <div className="event-date-badge-pro">
                          <span className="date-month-pro">
                            {new Date(event.event_date).toLocaleString('default', {
                              month: 'short',
                            }).toUpperCase()}
                          </span>
                          <span className="date-day-pro">
                            {new Date(event.event_date).getDate()}
                          </span>
                        </div>
                      )}

                      {/* Status Badge */}
                      {filter === 'past' ? (
                        <div className="event-status-badge past">
                          <Clock size={14} />
                          PAST EVENT
                        </div>
                      ) : (
                        <div className="event-status-badge upcoming">
                          <Sparkles size={14} />
                          UPCOMING
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="event-content-pro">
                      <h3 className="event-title-pro">{event.title}</h3>

                      {event.excerpt && (
                        <p className="event-excerpt-pro">
                          {event.excerpt.length > 120
                            ? `${event.excerpt.substring(0, 120)}...`
                            : event.excerpt}
                        </p>
                      )}

                      {/* Meta Info */}
                      <div className="event-meta-pro">
                        {event.event_date && (
                          <div className="event-meta-item">
                            <Calendar size={16} strokeWidth={1.5} />
                            <span>{formatDateTime(event.event_date)}</span>
                          </div>
                        )}

                        {event.event_location && (
                          <div className="event-meta-item">
                            <MapPin size={16} strokeWidth={1.5} />
                            <span>{event.event_location}</span>
                          </div>
                        )}
                      </div>

                      {/* CTA */}
                      <div className="event-cta-pro">
                        {event.event_registration_link && filter === 'upcoming' ? (
                          <a 
                            href={event.event_registration_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="event-register-btn"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span>Register Now</span>
                            <ArrowRight size={18} />
                          </a>
                        ) : (
                          <span className="event-view-details">
                            View Details
                            <ArrowRight size={18} />
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Events;