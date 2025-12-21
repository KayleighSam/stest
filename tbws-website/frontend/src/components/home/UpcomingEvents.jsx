import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, ArrowRight, Zap, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { contentAPI } from '../../api/content';
import { formatDateTime, getImageUrl } from '../../utils/formatters';
import Loading from '../common/Loading';
import './UpcomingEvents.css';

const UpcomingEvents = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['upcoming-events'],
    queryFn: () => contentAPI.getUpcomingEvents(),
  });

  if (isLoading) return <Loading />;

  const upcomingEvents = data?.results || data?.data || data || [];

  if (upcomingEvents.length === 0) return null;

  return (
    <section className="upcoming-events-section">
      <div className="container">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="events-section-header"
        >
          <div className="header-badge">
            <Zap size={16} />
            <span>Don't Miss Out</span>
          </div>

          <h2 className="events-section-title">Upcoming Events</h2>
          <p className="events-section-subtitle">
            Join us for exciting basketball action and community gatherings
          </p>
        </motion.div>

        {/* Events Grid */}
        <div className="events-showcase-grid">
          {upcomingEvents.slice(0, 3).map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="event-showcase-card"
            >
              <Link to={`/blog/${event.slug}`} className="event-card-link">

                {/* Image */}
                <div className="event-showcase-image">
                  <img
                    src={
                      getImageUrl(event.featured_image) ||
                      'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=800'
                    }
                    alt={event.title}
                    loading="lazy"
                  />

                  <div className="event-image-overlay" />

                  {/* Date Badge */}
                  <div className="event-showcase-date">
                    <div className="date-icon">
                      <Calendar size={20} />
                    </div>
                    <div className="date-content">
                      <span className="date-day">
                        {event.event_date
                          ? new Date(event.event_date).getDate()
                          : 'TBA'}
                      </span>
                      <span className="date-month">
                        {event.event_date
                          ? new Date(event.event_date).toLocaleString('default', { month: 'short' })
                          : 'TBA'}
                      </span>
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="event-quick-info">
                    <div className="quick-info-item">
                      <Users size={14} />
                      <span>Limited Spots</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="event-showcase-content">
                  <h3 className="event-showcase-title">{event.title}</h3>
                  <p className="event-showcase-excerpt">{event.excerpt}</p>

                  {/* Details */}
                  <div className="event-showcase-details">
                    {event.event_date && (
                      <div className="event-detail-item">
                        <Clock size={16} />
                        <span className="detail-text">
                          {formatDateTime(event.event_date)}
                        </span>
                      </div>
                    )}

                    {event.event_location && (
                      <div className="event-detail-item">
                        <MapPin size={16} />
                        <span className="detail-text">
                          {event.event_location}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="event-showcase-cta">
                    {event.event_registration_link ? (
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
                      <div className="event-learn-more">
                        <span>Learn More</span>
                        <ArrowRight size={18} />
                      </div>
                    )}
                  </div>

                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="events-section-footer"
        >
          <Link to="/events" className="view-all-events-btn">
            <span>View All Events</span>
            <ArrowRight size={20} />
          </Link>
        </motion.div>

      </div>
    </section>
  );
};

export default UpcomingEvents;
