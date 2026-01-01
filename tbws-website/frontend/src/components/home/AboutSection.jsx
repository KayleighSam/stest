import React from 'react';
import { Link } from 'react-router-dom';
import { Award, Users, Target, Heart, ArrowRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import pagesService from '../../api/pages';
import { getImageUrl } from '../../utils/formatters';
import './AboutSection.css';

const AboutSection = () => {
  // ✅ FIXED - Fetch site settings correctly
  const { data: settingsData } = useQuery({
    queryKey: ['public-site-settings'],
    queryFn: async () => {
      try {
        console.log('📤 AboutSection: Fetching site settings...');
        const response = await pagesService.getCurrentSettings();
        console.log('✅ AboutSection: Settings Response:', response.data);
        return response.data;
      } catch (error) {
        console.error('❌ AboutSection: Settings Error:', error);
        return null;
      }
    },
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  });

  // ✅ FIXED - Fetch core values
  const { data: coreValuesData } = useQuery({
    queryKey: ['public-core-values'],
    queryFn: async () => {
      try {
        console.log('📤 AboutSection: Fetching core values...');
        const response = await pagesService.getCoreValues();
        console.log('✅ AboutSection: Core Values Response:', response.data);
        
        // Handle paginated or array response
        if (response.data.results && Array.isArray(response.data.results)) {
          return response.data.results;
        } else if (Array.isArray(response.data)) {
          return response.data;
        }
        return [];
      } catch (error) {
        console.error('❌ AboutSection: Core Values Error:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 30,
  });

  const settings = settingsData;
  const coreValues = coreValuesData || [];

  const iconMap = {
    award: Award,
    users: Users,
    target: Target,
    heart: Heart,
    sparkles: Heart,
    trending: Target,
  };

  const highlights = [
    'Professional coaching staff',
    'State-of-the-art facilities',
    'Competitive league structure',
    'Youth development programs'
  ];

  return (
    <section className="about-section-modern">
      <div className="container">
        <div className="about-grid-modern">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="about-image-side"
          >
            <div className="about-image-wrapper-modern">
              <img
                src={
                  getImageUrl(settings?.about_image) ||
                  'https://images.unsplash.com/photo-1577223625816-7546f9257fe9?w=800'
                }
                alt="TBWS Basketball"
                className="about-main-image"
              />
              <div className="about-image-overlay-shape"></div>
            </div>

            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="about-stats-card"
            >
              <div className="stats-card-item">
                <div className="stats-card-number">20+</div>
                <div className="stats-card-label">Years of Excellence</div>
              </div>
              <div className="stats-card-divider"></div>
              <div className="stats-card-item">
                <div className="stats-card-number">500+</div>
                <div className="stats-card-label">Active Members</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="about-content-side"
          >
            <div className="about-section-tag">
              <span className="tag-line"></span>
              <span className="tag-text">ABOUT TBWS</span>
            </div>

            <h2 className="about-section-title">
              {settings?.about_title || 'Kenya\'s Premier Basketball Community'}
            </h2>

            {settings?.about_content ? (
              <div 
                className="about-text-content"
                dangerouslySetInnerHTML={{ __html: settings.about_content }}
              />
            ) : (
              <div className="about-text-content">
                <p>
                  The Tusker Basketball Welfare Society (TBWS) is Kenya's premier
                  basketball community organization, dedicated to promoting the sport
                  and developing talent at all levels.
                </p>
                <p>
                  We organize competitive tournaments, provide training programs, and
                  foster a sense of community among basketball enthusiasts across Kenya.
                </p>
              </div>
            )}

            {/* Highlights List */}
            <div className="about-highlights">
              {highlights.map((highlight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  className="highlight-item"
                >
                  <CheckCircle size={20} className="highlight-icon" />
                  <span>{highlight}</span>
                </motion.div>
              ))}
            </div>

            {/* Core Values Pills */}
            {coreValues.length > 0 && (
              <div className="about-values-pills">
                {coreValues.slice(0, 4).map((value, index) => {
                  const IconComponent = iconMap[value.icon] || Award;
                  return (
                    <motion.div
                      key={value.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                      className="value-pill"
                      style={{
                        background: `linear-gradient(135deg, ${value.color_start}15, ${value.color_end}15)`
                      }}
                    >
                      <div 
                        className="value-pill-icon"
                        style={{ color: value.color_start }}
                      >
                        <IconComponent size={20} />
                      </div>
                      <span className="value-pill-text">{value.title}</span>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* CTA Button */}
            <Link to="/about" className="btn-about-cta">
              <span>Learn More About Us</span>
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;