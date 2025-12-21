import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar, Award, Star, Zap, TrendingUp } from 'lucide-react';
import { pagesAPI } from '../api/pages';
import { getImageUrl } from '../utils/formatters';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import './History.css';

const History = () => {
  const { data: timelineData, isLoading, error } = useQuery({
    queryKey: ['history-timeline'],
    queryFn: pagesAPI.getHistory,
  });

  if (isLoading) return <Loading fullScreen />;
  if (error) return <ErrorMessage message="Failed to load history" />;

  // Handle both wrapped and unwrapped responses
  const rawData = timelineData?.data || timelineData;
  const timeline = rawData?.results || rawData?.data || rawData || [];

  // Get milestone icon based on index
  const getMilestoneIcon = (index) => {
    const icons = [Award, Star, Zap, TrendingUp];
    const Icon = icons[index % icons.length];
    return <Icon size={20} />;
  };

  return (
    <div className="history-page">
      {/* Premium Hero Section */}
      <section className="history-hero">
        <div className="history-hero-background">
          <div className="hero-gradient-overlay"></div>
          <div className="hero-particles"></div>
        </div>

        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="history-hero-content"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hero-badge"
            >
              <Calendar size={18} />
              <span>Our Journey</span>
            </motion.div>

            <h1 className="history-hero-title">
              Our
              <span className="title-highlight"> Legacy</span>
            </h1>

            <p className="history-hero-description">
              From humble beginnings to basketball excellence - discover the milestones
              that shaped TBWS into Kenya's premier basketball community
            </p>

            <div className="hero-stats-row">
              <div className="hero-stat">
                <div className="hero-stat-number">{timeline.length}+</div>
                <div className="hero-stat-label">Milestones</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-number">20+</div>
                <div className="hero-stat-label">Years</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-number">500+</div>
                <div className="hero-stat-label">Members</div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="hero-wave">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 80C1200 80 1320 70 1380 65L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="timeline-section">
        <div className="container">
          {timeline.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="empty-timeline"
            >
              <div className="empty-icon">
                <Calendar size={80} />
              </div>
              <h3>No Timeline Yet</h3>
              <p>Our story is being written. Check back soon for exciting updates!</p>
            </motion.div>
          ) : (
            <div className="timeline-container">
              {timeline.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`timeline-card ${index % 2 === 0 ? 'timeline-left' : 'timeline-right'} ${
                    event.is_milestone ? 'timeline-milestone' : ''
                  }`}
                >
                  {/* Year Badge */}
                  <div className="timeline-year-badge">
                    <div className="year-icon">
                      {event.is_milestone ? getMilestoneIcon(index) : <Calendar size={20} />}
                    </div>
                    <span className="year-text">{event.year}</span>
                  </div>

                  {/* Card Content */}
                  <div className="timeline-card-content">
                    {event.image && (
                      <div className="timeline-image-wrapper">
                        <img
                          src={getImageUrl(event.image)}
                          alt={event.title}
                          className="timeline-image"
                        />
                        <div className="timeline-image-overlay">
                          {event.is_milestone && (
                            <div className="milestone-badge">
                              <Award size={24} />
                              <span>Milestone</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="timeline-card-body">
                      <h3 className="timeline-event-title">{event.title}</h3>
                      <p className="timeline-event-description">{event.description}</p>
                    </div>
                  </div>

                  {/* Connector Line */}
                  <div className="timeline-connector"></div>
                </motion.div>
              ))}

              {/* Timeline Line */}
              <div className="timeline-center-line">
                <div className="timeline-line-gradient"></div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default History;