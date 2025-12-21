import React from 'react';
import { Link } from 'react-router-dom';
import { Award, Users, Target, Heart, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { pagesAPI } from '../../api/pages';
import { getImageUrl } from '../../utils/formatters';
import './AboutSection.css';

const AboutSection = () => {
  const { data: settingsData } = useQuery({
    queryKey: ['site-settings'],
    queryFn: () => pagesAPI.getSiteSettings(),
  });

  const settings = settingsData?.data || settingsData;

  // Icon mapping
  const iconMap = {
    award: <Award size={32} />,
    users: <Users size={32} />,
    target: <Target size={32} />,
    heart: <Heart size={32} />,
  };

  // Get core values from settings or use defaults
  const coreValues = settings?.core_values || [];

  return (
    <section className="section about-section">
      <div className="container">
        <div className="about-content">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="about-text"
          >
            <span className="section-badge">About TBWS</span>
            <h2 className="about-title">
              {settings?.about_title || 'More Than Just Basketball'}
            </h2>
            
            {settings?.about_content ? (
              <div 
                className="about-description-html"
                dangerouslySetInnerHTML={{ __html: settings.about_content }}
              />
            ) : (
              <>
                <p className="about-description">
                  The Tusker Basketball Welfare Society (TBWS) is Kenya's premier
                  basketball community organization, dedicated to promoting the sport
                  and developing talent at all levels.
                </p>
                <p className="about-description">
                  We organize competitive tournaments, provide training programs, and
                  foster a sense of community among basketball enthusiasts across Kenya.
                </p>
              </>
            )}

            {coreValues.length > 0 && (
              <div className="features-grid">
                {coreValues.slice(0, 3).map((value, index) => (
                  <motion.div
                    key={value.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="feature-card"
                  >
                    <div 
                      className="feature-icon"
                      style={{
                        background: `linear-gradient(135deg, ${value.color_start} 0%, ${value.color_end} 100%)`
                      }}
                    >
                      {iconMap[value.icon] || <Award size={32} />}
                    </div>
                    <h3 className="feature-title">{value.title}</h3>
                    <p className="feature-description">{value.description}</p>
                  </motion.div>
                ))}
              </div>
            )}

            <Link to="/about" className="btn btn-primary btn-lg">
              Learn More About Us
              <ArrowRight size={20} />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="about-image"
          >
            <div className="image-wrapper">
              <img
                src={
                  getImageUrl(settings?.about_image) ||
                  'https://images.unsplash.com/photo-1577223625816-7546f9257fe9?w=800'
                }
                alt="Basketball team"
                className="main-image"
              />
              <div className="image-decoration"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;