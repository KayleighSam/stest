import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Award, Users, Target, Heart, Sparkles, TrendingUp, CheckCircle } from 'lucide-react';
import { pagesAPI } from '../api/pages';
import { getImageUrl } from '../utils/formatters';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import './About.css';

const About = () => {
  const { data: settingsData, isLoading: settingsLoading, error: settingsError } = useQuery({
    queryKey: ['site-settings'],
    queryFn: () => pagesAPI.getSiteSettings(),
  });

  const { data: pageData, isLoading: pageLoading } = useQuery({
    queryKey: ['page', 'about'],
    queryFn: () => pagesAPI.getPage('about'),
  });

  const { data: coreValuesData, isLoading: valuesLoading } = useQuery({
    queryKey: ['core-values'],
    queryFn: () => pagesAPI.getCoreValues(),
  });

  const { data: teamData, isLoading: teamLoading } = useQuery({
    queryKey: ['team-members'],
    queryFn: () => pagesAPI.getTeamMembers(),
  });

  if (settingsLoading || pageLoading || valuesLoading || teamLoading) return <Loading fullScreen />;
  if (settingsError) return <ErrorMessage message="Failed to load settings" />;

  const settings = settingsData?.data || settingsData;
  const page = pageData?.data || pageData;
  const coreValues = coreValuesData?.results || coreValuesData?.data || coreValuesData || [];
  const teamMembers = teamData?.results || teamData?.data || teamData || [];

  // Icon mapping
  const iconMap = {
    award: Award,
    users: Users,
    target: Target,
    heart: Heart,
    sparkles: Sparkles,
    trending: TrendingUp,
  };

  const stats = [
    { number: '500+', label: 'Active Members', icon: <Users size={20} /> },
    { number: '50+', label: 'Teams', icon: <TrendingUp size={20} /> },
    { number: '100+', label: 'Tournaments', icon: <Award size={20} /> },
    { number: '20+', label: 'Years Legacy', icon: <Sparkles size={20} /> },
  ];

  return (
    <div className="about-page">
      {/* Compact Hero Section */}
      <section className="about-hero">
        <div className="about-hero-bg"></div>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="about-hero-content"
          >
            <span className="hero-label">About TBWS</span>
            <h1 className="about-hero-title">
              {page?.title || 'Building Basketball Excellence'}
            </h1>
            <p className="about-hero-subtitle">
              {page?.subtitle || settings?.tagline || 'Empowering Kenya\'s basketball community'}
            </p>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="about-stats-bar"
          >
            {stats.map((stat, index) => (
              <div key={index} className="about-stat-item">
                <div className="about-stat-icon">{stat.icon}</div>
                <div className="about-stat-info">
                  <div className="about-stat-number">{stat.number}</div>
                  <div className="about-stat-label">{stat.label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* About Content Section */}
      {page?.content && (
        <section className="about-story-section">
          <div className="container">
            <div className="about-story-grid">
              {/* Text Content */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="about-story-text"
              >
                <span className="section-tag">Who We Are</span>
                <div 
                  className="about-story-content"
                  dangerouslySetInnerHTML={{ __html: page.content }}
                />
              </motion.div>

              {/* Image */}
              {(page?.featured_image || page?.hero_image) && (
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="about-story-image"
                >
                  <div className="about-image-container">
                    <img
                      src={getImageUrl(page.featured_image || page.hero_image)}
                      alt={page.title}
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Mission & Vision */}
      {(settings?.mission_content || settings?.vision_content) && (
        <section className="mission-vision-section">
          <div className="container">
            <div className="mission-vision-grid">
              {/* Mission */}
              {settings?.mission_content && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mission-card"
                >
                  <div className="mission-icon">
                    <Target size={32} />
                  </div>
                  <h3 className="mission-card-title">
                    {settings.mission_title || 'Our Mission'}
                  </h3>
                  <div 
                    className="mission-card-text"
                    dangerouslySetInnerHTML={{ __html: settings.mission_content }}
                  />
                </motion.div>
              )}

              {/* Vision */}
              {settings?.vision_content && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="mission-card"
                >
                  <div className="mission-icon">
                    <Sparkles size={32} />
                  </div>
                  <h3 className="mission-card-title">
                    {settings.vision_title || 'Our Vision'}
                  </h3>
                  <div 
                    className="mission-card-text"
                    dangerouslySetInnerHTML={{ __html: settings.vision_content }}
                  />
                </motion.div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Core Values - List Style */}
      {coreValues.length > 0 && (
        <section className="values-section">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="section-header-center"
            >
              <span className="section-tag">Our Principles</span>
              <h2 className="section-title-large">Core Values</h2>
              <p className="section-desc">The foundation of everything we do</p>
            </motion.div>

            <div className="values-list">
              {coreValues.map((value, index) => {
                const IconComponent = iconMap[value.icon] || Award;
                return (
                  <motion.div
                    key={value.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="value-list-item"
                  >
                    <div 
                      className="value-list-icon"
                      style={{
                        background: `linear-gradient(135deg, ${value.color_start}, ${value.color_end})`
                      }}
                    >
                      <IconComponent size={24} />
                    </div>
                    <div className="value-list-content">
                      <h3 className="value-list-title">{value.title}</h3>
                      <p className="value-list-desc">{value.description}</p>
                    </div>
                    <div className="value-list-check">
                      <CheckCircle size={20} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Team Section */}
      {teamMembers.length > 0 && (
        <section className="team-section">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="section-header-center"
            >
              <span className="section-tag">Leadership</span>
              <h2 className="section-title-large">Meet Our Team</h2>
              <p className="section-desc">The dedicated people behind TBWS</p>
            </motion.div>

            <div className="team-grid">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="team-member-card"
                >
                  <div className="team-member-photo">
                    <img
                      src={getImageUrl(member.photo) || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&size=200&background=ff6b35&color=fff&bold=true`}
                      alt={member.name}
                    />
                  </div>
                  <div className="team-member-info">
                    <h3 className="team-member-name">{member.name}</h3>
                    <p className="team-member-role">{member.role_display || member.title}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default About;