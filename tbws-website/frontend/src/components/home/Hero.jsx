import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowRight, Users, Trophy, Target, Sparkles } from 'lucide-react';
import { pagesAPI } from '../../api/pages';
import { getImageUrl } from '../../utils/formatters';
import './Hero.css';

const Hero = () => {
  const { data: settingsData } = useQuery({
    queryKey: ['site-settings'],
    queryFn: () => pagesAPI.getSiteSettings(),
    staleTime: 1000 * 60 * 30,
  });

  const settings = settingsData?.data || settingsData;

  const stats = [
    { 
      icon: <Users size={28} />,
      number: '500+', 
      label: 'Active Members',
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      icon: <Trophy size={28} />,
      number: '100+', 
      label: 'Tournaments',
      color: 'from-orange-500 to-red-500'
    },
    { 
      icon: <Target size={28} />,
      number: '20+', 
      label: 'Years Legacy',
      color: 'from-purple-500 to-pink-500'
    },
  ];

  return (
    <section className="hero-section">
      {/* Animated Background */}
      <div className="hero-background">
        <div className="hero-gradient"></div>
        <div className="hero-pattern"></div>
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="hero-blob hero-blob-1"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="hero-blob hero-blob-2"
        />
      </div>

      <div className="container">
        <div className="hero-content">
          {/* Left Content */}
          <div className="hero-text">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="hero-badge"
            >
              <Sparkles size={16} />
              <span>Welcome to {settings?.site_name || 'TBWS'}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="hero-title"
            >
              {settings?.tagline ? (
                <>
                  {settings.tagline.split(' ').slice(0, -1).join(' ')}
                  <span className="hero-title-highlight">
                    {' ' + settings.tagline.split(' ').slice(-1)}
                  </span>
                </>
              ) : (
                <>
                  Building Basketball
                  <span className="hero-title-highlight"> Excellence</span>
                </>
              )}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hero-description"
            >
              {settings?.description || 
                "Join Kenya's premier basketball community. Compete, grow, and excel in a supportive environment dedicated to the love of the game."}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="hero-actions"
            >
              <Link to="/contact" className="btn btn-primary btn-lg hero-btn-primary">
                Join Our League
                <ArrowRight size={20} />
              </Link>
              <Link to="/about" className="btn btn-outline btn-lg hero-btn-outline">
                Learn More
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="hero-stats"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5 }}
                  className="hero-stat-card"
                >
                  <div className={`hero-stat-icon bg-gradient-to-br ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <div className="hero-stat-content">
                    <div className="hero-stat-number">{stat.number}</div>
                    <div className="hero-stat-label">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right Content - Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hero-visual"
          >
            <div className="hero-image-wrapper">
              <img
                src={
                  getImageUrl(settings?.hero_image) ||
                  getImageUrl(settings?.about_image) ||
                  'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800'
                }
                alt={`${settings?.site_name || 'TBWS'} Basketball`}
                className="hero-image"
              />
              
              <div className="hero-image-decoration hero-decoration-1"></div>
              <div className="hero-image-decoration hero-decoration-2"></div>
            </div>

            {/* Floating Achievement Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              whileHover={{ y: -5 }}
              className="hero-achievement-card"
            >
              <div className="achievement-icon">
                <Trophy size={32} />
              </div>
              <div className="achievement-content">
                <div className="achievement-number">100+</div>
                <div className="achievement-text">Tournaments Hosted</div>
              </div>
              <div className="achievement-sparkle">✨</div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="hero-scroll-indicator"
      >
        <div className="scroll-mouse">
          <div className="scroll-wheel"></div>
        </div>
        <span className="scroll-text">Scroll to explore</span>
      </motion.div>
    </section>
  );
};

export default Hero;