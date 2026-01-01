import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, Users, Target, Heart, Sparkles, TrendingUp, 
  CheckCircle, X, ArrowRight, Mail, Phone, Shield,
  Linkedin, Twitter, Facebook, Zap, Trophy, Star
} from 'lucide-react';
import pagesService from '../api/pages';
import { getImageUrl } from '../utils/formatters';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import './About.css';

const About = () => {
  const [selectedMember, setSelectedMember] = useState(null);
  const [activeValue, setActiveValue] = useState(0);

  // Fetch site settings - ✅ FIXED
  const { data: settingsData, isLoading: settingsLoading, error: settingsError } = useQuery({
    queryKey: ['public-site-settings'],
    queryFn: async () => {
      try {
        console.log('📤 About: Fetching site settings...');
        // ✅ CHANGED FROM getSiteSettings() TO getCurrentSettings()
        const response = await pagesService.getCurrentSettings();
        console.log('✅ About: Settings Response:', response.data);
        return response.data;
      } catch (error) {
        console.error('❌ About: Settings Error:', error);
        throw error;
      }
    },
  });

  // Fetch about page
  const { data: pageData, isLoading: pageLoading } = useQuery({
    queryKey: ['page', 'about'],
    queryFn: async () => {
      try {
        console.log('📤 About: Fetching about page...');
        const response = await pagesService.getPage('about');
        console.log('✅ About: Page Response:', response.data);
        return response.data;
      } catch (error) {
        console.error('❌ About: Page Error:', error);
        return null;
      }
    },
  });

  // Fetch core values
  const { data: coreValuesData, isLoading: valuesLoading } = useQuery({
    queryKey: ['public-core-values'],
    queryFn: async () => {
      try {
        console.log('📤 About: Fetching core values...');
        const response = await pagesService.getCoreValues();
        console.log('✅ About: Core Values Response:', response.data);
        return response.data;
      } catch (error) {
        console.error('❌ About: Core Values Error:', error);
        throw error;
      }
    },
  });

  // Fetch team members
  const { data: teamData, isLoading: teamLoading } = useQuery({
    queryKey: ['public-team-members'],
    queryFn: async () => {
      try {
        console.log('📤 About: Fetching team members...');
        const response = await pagesService.getTeamMembers();
        console.log('✅ About: Team Response:', response.data);
        return response.data;
      } catch (error) {
        console.error('❌ About: Team Error:', error);
        throw error;
      }
    },
  });

  // Extract data from responses
  const settings = Array.isArray(settingsData) 
    ? settingsData[0] 
    : settingsData;

  const page = Array.isArray(pageData) 
    ? pageData[0] 
    : pageData;

  const coreValues = Array.isArray(coreValuesData) 
    ? coreValuesData 
    : coreValuesData?.results || [];

  const teamMembers = Array.isArray(teamData) 
    ? teamData 
    : teamData?.results || [];

  console.log('📊 About Page Data:', { 
    settings, 
    page, 
    coreValuesCount: coreValues.length, 
    teamCount: teamMembers.length 
  });

  const iconMap = {
    award: Award,
    users: Users,
    target: Target,
    heart: Heart,
    sparkles: Sparkles,
    trending: TrendingUp,
  };

  const achievements = [
    { number: '500+', label: 'Active Players', icon: Users },
    { number: '50+', label: 'Championship Wins', icon: Trophy },
    { number: '100+', label: 'Tournaments', icon: Award },
    { number: '20', label: 'Years of Excellence', icon: Star },
  ];

  const openMemberModal = (member) => {
    setSelectedMember(member);
    document.body.style.overflow = 'hidden';
  };

  const closeMemberModal = () => {
    setSelectedMember(null);
    document.body.style.overflow = 'auto';
  };

  if (settingsLoading || pageLoading || valuesLoading || teamLoading) {
    return <Loading fullScreen />;
  }

  if (settingsError) {
    return <ErrorMessage message="Failed to load page data" />;
  }

  return (
    <div className="about-page-cool">
      {/* Hero Section - Epic */}
      <section className="about-hero-epic">
        <div className="hero-video-bg">
          <div className="hero-gradient-overlay"></div>
        </div>
        
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="about-hero-content-epic"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="hero-shield-badge"
            >
              <Shield size={40} />
            </motion.div>

            <h1 className="about-hero-title-epic">
              WHERE LEGENDS
              <span className="title-block">ARE MADE</span>
            </h1>
            
            <p className="about-hero-tagline">
              {settings?.tagline || 'Building Kenya\'s Premier Basketball Community'}
            </p>

            <div className="hero-cta-group">
              <motion.a
                href="#story"
                className="hero-btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Our Story</span>
                <ArrowRight size={20} />
              </motion.a>
              <motion.a
                href="#team"
                className="hero-btn-secondary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Meet The Team</span>
              </motion.a>
            </div>
          </motion.div>
        </div>

        {/* Floating Achievement Cards */}
        <div className="floating-achievements">
          {achievements.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
              className="achievement-float-card"
            >
              <item.icon size={32} />
              <div className="achievement-number">{item.number}</div>
              <div className="achievement-label">{item.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Story Section - Split Screen */}
      <section id="story" className="story-section-epic">
        <div className="container-full">
          <div className="story-split-layout">
            {/* Left - Image */}
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="story-image-side"
            >
              <div className="story-image-container">
                <img
                  src={getImageUrl(page?.featured_image || page?.hero_image || settings?.about_image) || 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200'}
                  alt="TBWS Story"
                />
                <div className="image-overlay-pattern"></div>
              </div>
              
              {/* Stats Overlay */}
              <div className="stats-overlay-box">
                <div className="stat-overlay-item">
                  <Zap size={24} />
                  <div>
                    <div className="stat-overlay-number">20+</div>
                    <div className="stat-overlay-label">Years Strong</div>
                  </div>
                </div>
                <div className="stat-overlay-divider"></div>
                <div className="stat-overlay-item">
                  <Users size={24} />
                  <div>
                    <div className="stat-overlay-number">500+</div>
                    <div className="stat-overlay-label">Members</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right - Content */}
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="story-content-side"
            >
              <div className="story-content-inner">
                <div className="story-tag">
                  <Sparkles size={16} />
                  <span>OUR JOURNEY</span>
                </div>

                <h2 className="story-heading-epic">
                  {settings?.about_title || 'BUILDING BASKETBALL'}
                  <span className="heading-highlight">EXCELLENCE</span>
                </h2>

                <div className="story-text-epic">
                  {settings?.about_content ? (
                    <div dangerouslySetInnerHTML={{ __html: settings.about_content }} />
                  ) : (
                    <>
                      <p>
                        For over two decades, TBWS has been the heartbeat of basketball in Kenya. 
                        We're more than just a league – we're a movement, a family, and a legacy.
                      </p>
                      <p>
                        From grassroots programs to championship tournaments, we've created a 
                        platform where talent thrives, champions are forged, and dreams become reality.
                      </p>
                    </>
                  )}
                </div>

                <div className="story-features">
                  <div className="feature-item-epic">
                    <CheckCircle size={24} />
                    <span>Premier Basketball League</span>
                  </div>
                  <div className="feature-item-epic">
                    <CheckCircle size={24} />
                    <span>Youth Development Programs</span>
                  </div>
                  <div className="feature-item-epic">
                    <CheckCircle size={24} />
                    <span>Community Impact Initiatives</span>
                  </div>
                </div>

                <motion.button
                  className="story-cta-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>Discover More</span>
                  <ArrowRight size={20} />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision - Bold Cards */}
      {(settings?.mission_content || settings?.vision_content) && (
        <section className="mission-vision-epic">
          <div className="mv-bg-shapes">
            <div className="shape-blob blob-1"></div>
            <div className="shape-blob blob-2"></div>
          </div>

          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="section-header-epic"
            >
              <div className="section-tag-epic">
                <Target size={18} />
                <span>WHAT DRIVES US</span>
              </div>
              <h2 className="section-title-epic">MISSION & VISION</h2>
            </motion.div>

            <div className="mv-grid-epic">
              {settings?.mission_content && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="mv-card-epic mission-card"
                >
                  <div className="mv-card-bg"></div>
                  <div className="mv-card-content-epic">
                    <div className="mv-icon-epic">
                      <Target size={48} />
                    </div>
                    <h3 className="mv-card-title">{settings?.mission_title || 'MISSION'}</h3>
                    <div 
                      className="mv-card-text"
                      dangerouslySetInnerHTML={{ __html: settings.mission_content }}
                    />
                  </div>
                  <div className="mv-card-shine"></div>
                </motion.div>
              )}

              {settings?.vision_content && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="mv-card-epic vision-card"
                >
                  <div className="mv-card-bg"></div>
                  <div className="mv-card-content-epic">
                    <div className="mv-icon-epic">
                      <Sparkles size={48} />
                    </div>
                    <h3 className="mv-card-title">{settings?.vision_title || 'VISION'}</h3>
                    <div 
                      className="mv-card-text"
                      dangerouslySetInnerHTML={{ __html: settings.vision_content }}
                    />
                  </div>
                  <div className="mv-card-shine"></div>
                </motion.div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Core Values - Animated Tabs */}
      {coreValues.length > 0 && (
        <section className="values-section-epic">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="section-header-epic"
            >
              <div className="section-tag-epic">
                <Heart size={18} />
                <span>OUR FOUNDATION</span>
              </div>
              <h2 className="section-title-epic">CORE VALUES</h2>
            </motion.div>

            {/* Values Tabs */}
            <div className="values-tabs-container">
              <div className="values-tabs">
                {coreValues.map((value, index) => {
                  const IconComponent = iconMap[value.icon] || Award;
                  return (
                    <motion.button
                      key={value.id}
                      onClick={() => setActiveValue(index)}
                      className={`value-tab ${activeValue === index ? 'value-tab-active' : ''}`}
                      whileHover={{ y: -5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <IconComponent size={24} />
                      <span>{value.title}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Active Value Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeValue}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="value-content-display"
                >
                  <div className="value-content-inner">
                    <h3 className="value-display-title">{coreValues[activeValue]?.title}</h3>
                    <p className="value-display-desc">{coreValues[activeValue]?.description}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>
      )}

      {/* Team Section - Grid with Hover Effects */}
      {teamMembers.length > 0 && (
        <section id="team" className="team-section-epic">
          <div className="team-bg-pattern"></div>
          
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="section-header-epic"
            >
              <div className="section-tag-epic">
                <Users size={18} />
                <span>LEADERSHIP</span>
              </div>
              <h2 className="section-title-epic">MEET THE TEAM</h2>
              <p className="section-subtitle-epic">The Champions Behind The Champions</p>
            </motion.div>

            <div className="team-grid-epic">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  onClick={() => openMemberModal(member)}
                  className="team-card-epic"
                  whileHover={{ y: -10 }}
                >
                  <div className="team-card-image-epic">
                    <img
                      src={getImageUrl(member.photo) || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&size=400&background=1e3c72&color=fff&bold=true`}
                      alt={member.name}
                    />
                    <div className="team-card-gradient"></div>
                    
                    <div className="team-card-overlay-epic">
                      <div className="overlay-content">
                        <h3>{member.name}</h3>
                        <p>{member.role_display || member.title}</p>
                        <div className="view-profile-link">
                          <span>View Profile</span>
                          <ArrowRight size={18} />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Team Member Modal */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="team-modal-epic"
            onClick={closeMemberModal}
          >
            <div className="modal-backdrop-epic"></div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="team-modal-content-epic"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={closeMemberModal} className="modal-close-epic">
                <X size={24} />
              </button>

              <div className="modal-layout-epic">
                <div className="modal-left-epic">
                  <img
                    src={getImageUrl(selectedMember.photo) || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedMember.name)}&size=600&background=1e3c72&color=fff&bold=true`}
                    alt={selectedMember.name}
                  />
                </div>

                <div className="modal-right-epic">
                  <div className="modal-content-scroll">
                    <h2 className="modal-member-name">{selectedMember.name}</h2>
                    <p className="modal-member-role">{selectedMember.role_display || selectedMember.title}</p>

                    {selectedMember.bio && (
                      <div 
                        className="modal-member-bio"
                        dangerouslySetInnerHTML={{ __html: selectedMember.bio }}
                      />
                    )}

                    {(selectedMember.email || selectedMember.phone) && (
                      <div className="modal-contact-info">
                        {selectedMember.email && (
                          <a href={`mailto:${selectedMember.email}`} className="modal-contact-link">
                            <Mail size={20} />
                            <span>{selectedMember.email}</span>
                          </a>
                        )}
                        {selectedMember.phone && (
                          <a href={`tel:${selectedMember.phone}`} className="modal-contact-link">
                            <Phone size={20} />
                            <span>{selectedMember.phone}</span>
                          </a>
                        )}
                      </div>
                    )}

                    {(selectedMember.linkedin_url || selectedMember.twitter_url || selectedMember.facebook_url) && (
                      <div className="modal-social-links">
                        {selectedMember.linkedin_url && (
                          <a href={selectedMember.linkedin_url} target="_blank" rel="noopener noreferrer" className="social-link-epic">
                            <Linkedin size={20} />
                          </a>
                        )}
                        {selectedMember.twitter_url && (
                          <a href={selectedMember.twitter_url} target="_blank" rel="noopener noreferrer" className="social-link-epic">
                            <Twitter size={20} />
                          </a>
                        )}
                        {selectedMember.facebook_url && (
                          <a href={selectedMember.facebook_url} target="_blank" rel="noopener noreferrer" className="social-link-epic">
                            <Facebook size={20} />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default About;