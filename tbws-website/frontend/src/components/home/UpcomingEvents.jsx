import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { contentService } from '../../api/content';
import { formatDateTime, getImageUrl } from '../../utils/formatters';
import Loading from '../common/Loading';
import './UpcomingEvents.css';

const UpcomingEvents = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['upcoming-events'],
    queryFn: () => contentService.getUpcomingEvents(),
  });

  if (isLoading) return <Loading />;

  const upcomingEvents = data?.results || data?.data || data || [];

  if (!Array.isArray(upcomingEvents) || upcomingEvents.length === 0) return null;

  return (
    <section className="upcoming-events-premium">
      <div className="events-bg-pattern"></div>

      <div className="container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="events-header-premium"
        >
          <div className="events-tag-premium">
            <Trophy size={18} />
            <span>UPCOMING EVENTS</span>
          </div>
          <h2 className="events-title-premium">Don't Miss Out</h2>
          <p className="events-desc-premium">
            Join us for exciting basketball action and community gatherings
          </p>
        </motion.div>

        {/* Events Grid */}
        <div className="events-grid-premium">
          {upcomingEvents.slice(0, 3).map((event, index) => (
            <motion.div
              key={event.id || index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="event-card-premium"
            >
              <Link to={`/post/${event.slug}`} className="event-link-premium">
                {/* Image */}
                <div className="event-image-premium">
                  <img
                    src={
                      getImageUrl(event.featured_image) ||
                      'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=800'
                    }
                    alt={event.title}
                  />
                  <div className="event-gradient-overlay"></div>

                  {event.event_date && (
                    <div className="event-date-badge-premium">
                      <span className="badge-day-premium">
                        {new Date(event.event_date).getDate()}
                      </span>
                      <span className="badge-month-premium">
                        {new Date(event.event_date)
                          .toLocaleString('default', { month: 'short' })
                          .toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="event-content-premium">
                  <h3 className="event-title-premium">{event.title}</h3>

                  {event.excerpt && (
                    <p className="event-excerpt-premium">
                      {event.excerpt.length > 100
                        ? `${event.excerpt.substring(0, 100)}...`
                        : event.excerpt}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="event-meta-premium">
                    {event.event_location && (
                      <div className="event-meta-item-premium">
                        <MapPin size={16} />
                        <span>{event.event_location}</span>
                      </div>
                    )}
                    {event.event_date && (
                      <div className="event-meta-item-premium">
                        <Calendar size={16} />
                        <span>{formatDateTime(event.event_date)}</span>
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="event-action-premium">
                    {event.event_registration_link ? (
                      <a
                        href={event.event_registration_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="event-btn-premium event-btn-primary"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>Register Now</span>
                        <ArrowRight size={18} />
                      </a>
                    ) : (
                      <div className="event-btn-premium event-btn-secondary">
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

        {/* View All */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="events-footer-premium"
        >
          <Link to="/events" className="btn-view-all-premium">
            View All Events
            <ArrowRight size={20} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default UpcomingEvents;
