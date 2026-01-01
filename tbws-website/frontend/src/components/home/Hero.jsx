import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Shield, Users, Calendar } from 'lucide-react';
import pagesService from '../../api/pages';
import { getImageUrl } from '../../utils/formatters';
import './Hero.css';

const Hero = () => {
  // ✅ FIXED - Fetch site settings correctly
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['public-site-settings'],
    queryFn: async () => {
      try {
        console.log('📤 Hero: Fetching site settings...');
        const response = await pagesService.getCurrentSettings();
        console.log('✅ Hero: Settings Response:', response.data);
        return response.data;
      } catch (error) {
        console.error('❌ Hero: Settings Error:', error);
        // Return default values if fetch fails
        return null;
      }
    },
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  });

  const settings = settingsData;

  const quickLinks = [
    { icon: <Calendar size={20} />, label: 'Upcoming Events', path: '/events' },
    { icon: <Users size={20} />, label: 'Join League', path: '/contact' },
    { icon: <Shield size={20} />, label: 'League Rules', path: '/league-rules' },
  ];

  return (
    <section className="hero-section-modern">
      {/* Large Background Image */}
      <div className="hero-bg-image">
        <img
          src={
            getImageUrl(settings?.hero_image) ||
            getImageUrl(settings?.about_image) ||
            'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1920'
          }
          alt="TBWS Basketball"
          className="hero-bg-img"
        />
        <div className="hero-overlay"></div>
        <div className="hero-overlay-gradient"></div>
      </div>

      <div className="container">
        <div className="hero-content-modern">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-main-content"
          >
            {/* Season Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="hero-season-badge"
            >
              <span className="badge-dot"></span>
              <span>2024/2025 Season</span>
            </motion.div>

            {/* Main Heading */}
            <h1 className="hero-title-modern">
              <span className="title-line-1">
                {settings?.site_name?.split(' ').slice(0, 2).join(' ').toUpperCase() || 'TUSKER BASKETBALL'}
              </span>
              <span className="title-line-2">
                {settings?.site_name?.split(' ').slice(2).join(' ').toUpperCase() || 'WELFARE SOCIETY'}
              </span>
            </h1>

            {/* Tagline */}
            <p className="hero-tagline-modern">
              {settings?.tagline || 'Building Basketball Excellence in Kenya'}
            </p>

            {/* Description */}
            <p className="hero-description-modern">
              {settings?.description || 
                "Join Kenya's premier basketball community. Compete at the highest level, develop your skills, and be part of our rich basketball legacy."}
            </p>

            {/* Action Buttons */}
            <div className="hero-actions-modern">
              <Link to="/contact" className="btn-hero-primary">
                <span>Join TBWS</span>
                <ArrowRight size={20} />
              </Link>
              <Link to="/events" className="btn-hero-secondary">
                <Play size={20} />
                <span>Watch Highlights</span>
              </Link>
            </div>

            {/* Quick Links */}
            <div className="hero-quick-links">
              {quickLinks.map((link, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                >
                  <Link to={link.path} className="quick-link-item">
                    <div className="quick-link-icon">{link.icon}</div>
                    <span>{link.label}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hero-stats-bar"
          >
            <div className="stat-item-modern">
              <div className="stat-number-modern">500+</div>
              <div className="stat-label-modern">Active Members</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item-modern">
              <div className="stat-number-modern">50+</div>
              <div className="stat-label-modern">Teams</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item-modern">
              <div className="stat-number-modern">100+</div>
              <div className="stat-label-modern">Tournaments</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item-modern">
              <div className="stat-number-modern">20+</div>
              <div className="stat-label-modern">Years Legacy</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Featured Banner */}
      <div className="hero-featured-banner">
        <div className="container">
          <div className="banner-content">
            <div className="banner-icon">
              <Shield size={24} />
            </div>
            <div className="banner-text">
              <strong>2024 Championship Finals</strong> - Registration Now Open
            </div>
            <Link to="/events" className="banner-link">
              Register Now <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;