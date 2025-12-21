import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';
import { contentAPI } from '../api/content';
import { formatDateTime, getImageUrl } from '../utils/formatters';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import { Link } from 'react-router-dom';
import './Events.css';

const Events = () => {
  const [filter, setFilter] = useState('upcoming');

  // Fetch events based on filter
  const { data, isLoading, error } = useQuery({
    queryKey: ['events', filter],
    queryFn: () =>
      filter === 'upcoming'
        ? contentAPI.getUpcomingEvents()
        : contentAPI.getPastEvents(),
  });

  if (isLoading) return <Loading fullScreen />;

  if (error) {
    console.error('Events Error:', error);
    return <ErrorMessage message="Failed to load events" />;
  }

  // Normalize API response
  const rawData = data?.data || data || [];
  const events = rawData?.results || rawData?.data || rawData || [];

  return (
    <div className="events-page">
      {/* Hero */}
      <section className="page-hero">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="page-hero-content"
          >
            <h1>Events & Tournaments</h1>
            <p>Join us for exciting basketball action and community events</p>
          </motion.div>
        </div>
      </section>

      {/* Events */}
      <section className="section events-section">
        <div className="container">
          {/* Filters */}
          <div className="events-filters">
            <button
              onClick={() => setFilter('upcoming')}
              className={`filter-tab ${
                filter === 'upcoming' ? 'filter-tab-active' : ''
              }`}
            >
              Upcoming Events
            </button>

            <button
              onClick={() => setFilter('past')}
              className={`filter-tab ${
                filter === 'past' ? 'filter-tab-active' : ''
              }`}
            >
              Past Events
            </button>
          </div>

          {/* Grid */}
          {events.length === 0 ? (
            <div className="no-events">
              <Calendar size={64} />
              <h3>No {filter} events</h3>
              <p>Check back later for new events and tournaments</p>
            </div>
          ) : (
            <div className="events-grid">
              {events.map((event, index) => (
                <motion.div
                  key={event.id || index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link to={`/post/${event.slug}`} className="event-card">
                    <div className="event-card-image">
                      <img
                        src={
                          getImageUrl(event.featured_image) ||
                          'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=800'
                        }
                        alt={event.title}
                      />

                      {event.event_date && (
                        <div className="event-date-badge">
                          <span className="date-month">
                            {new Date(event.event_date).toLocaleString('default', {
                              month: 'short',
                            })}
                          </span>
                          <span className="date-day">
                            {new Date(event.event_date).getDate()}
                          </span>
                        </div>
                      )}

                      {filter === 'past' && (
                        <div className="event-past-badge">Past Event</div>
                      )}
                    </div>

                    <div className="event-card-content">
                      <h3 className="event-card-title">{event.title}</h3>

                      <p className="event-card-excerpt">
                        {event.excerpt || 'Click to view event details'}
                      </p>

                      <div className="event-card-details">
                        {event.event_date && (
                          <div className="event-detail">
                            <Calendar size={18} />
                            <span>{formatDateTime(event.event_date)}</span>
                          </div>
                        )}

                        {event.event_location && (
                          <div className="event-detail">
                            <MapPin size={18} />
                            <span>{event.event_location}</span>
                          </div>
                        )}

                        {event.event_venue && (
                          <div className="event-detail">
                            <Clock size={18} />
                            <span>{event.event_venue}</span>
                          </div>
                        )}
                      </div>

                      <div className="event-card-footer">
                        {event.event_registration_link &&
                        filter === 'upcoming' ? (
                          <a
                            href={event.event_registration_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Register Now
                          </a>
                        ) : (
                          <span className="event-cta">
                            View Details <ArrowRight size={16} />
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
