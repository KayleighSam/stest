import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, ClipboardList, Award, Mail, Phone, ChevronRight, CheckCircle, Target } from 'lucide-react';
import { pagesAPI } from '../api/pages';
import { getImageUrl } from '../utils/formatters';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import './ManagerInfo.css';

const ManagerInfo = () => {
  const { data: infoData, isLoading: infoLoading, error: infoError } = useQuery({
    queryKey: ['manager-info'],
    queryFn: () => pagesAPI.getManagerInfo(),
  });

  const { data: managersData, isLoading: managersLoading } = useQuery({
    queryKey: ['managers'],
    queryFn: () => pagesAPI.getManagers(),
  });

  if (infoLoading || managersLoading) return <Loading fullScreen />;
  if (infoError) return <ErrorMessage message="Failed to load manager information" />;

  const managerInfo = infoData?.data || infoData;
  const rawManagers = managersData?.data || managersData || [];
  const managers = rawManagers?.results || rawManagers?.data || rawManagers || [];

  return (
    <div className="manager-info-page-pro">
      {/* Hero Banner */}
      <section className="manager-hero-pro">
        <div className="manager-hero-image">
          <img 
            src="https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1920&q=80" 
            alt="Team Managers"
          />
          <div className="manager-hero-overlay"></div>
        </div>
        
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="manager-hero-content-pro"
          >
            <div className="breadcrumb-pro">
              <span>Home</span>
              <ChevronRight size={16} />
              <span>Team Managers</span>
            </div>
            
            <h1 className="manager-page-title">
              {managerInfo?.title || 'TEAM MANAGER INFORMATION'}
            </h1>
            
            <p className="manager-page-subtitle">
              Leadership, dedication, and excellence in team management
            </p>

            {/* Contact Buttons */}
            {(managerInfo?.contact_email || managerInfo?.contact_phone) && (
              <div className="manager-hero-actions">
                {managerInfo.contact_email && (
                  <a href={`mailto:${managerInfo.contact_email}`} className="hero-action-btn">
                    <Mail size={20} />
                    <span>Email Us</span>
                  </a>
                )}
                {managerInfo.contact_phone && (
                  <a href={`tel:${managerInfo.contact_phone}`} className="hero-action-btn">
                    <Phone size={20} />
                    <span>Call Us</span>
                  </a>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Overview Section */}
      {managerInfo?.overview && (
        <section className="manager-overview-pro">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="overview-content-pro"
            >
              <div 
                className="overview-text-pro"
                dangerouslySetInnerHTML={{ __html: managerInfo.overview }}
              />
            </motion.div>
          </div>
        </section>
      )}

      {/* Info Sections */}
      <section className="manager-sections-pro">
        <div className="container">
          <div className="sections-grid-pro">
            {/* Responsibilities */}
            {managerInfo?.responsibilities_content && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="info-section-pro"
              >
                <div className="section-icon-pro">
                  <ClipboardList size={32} strokeWidth={1.5} />
                </div>
                <h2 className="section-heading-pro">
                  {managerInfo.responsibilities_title || 'RESPONSIBILITIES'}
                </h2>
                <div 
                  className="section-content-pro"
                  dangerouslySetInnerHTML={{ __html: managerInfo.responsibilities_content }}
                />
              </motion.div>
            )}

            {/* Requirements */}
            {managerInfo?.requirements_content && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="info-section-pro"
              >
                <div className="section-icon-pro">
                  <CheckCircle size={32} strokeWidth={1.5} />
                </div>
                <h2 className="section-heading-pro">
                  {managerInfo.requirements_title || 'REQUIREMENTS'}
                </h2>
                <div 
                  className="section-content-pro"
                  dangerouslySetInnerHTML={{ __html: managerInfo.requirements_content }}
                />
              </motion.div>
            )}

            {/* Benefits */}
            {managerInfo?.benefits_content && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="info-section-pro"
              >
                <div className="section-icon-pro">
                  <Award size={32} strokeWidth={1.5} />
                </div>
                <h2 className="section-heading-pro">
                  {managerInfo.benefits_title || 'BENEFITS'}
                </h2>
                <div 
                  className="section-content-pro"
                  dangerouslySetInnerHTML={{ __html: managerInfo.benefits_content }}
                />
              </motion.div>
            )}

            {/* How to Become */}
            {managerInfo?.how_to_become_content && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="info-section-pro"
              >
                <div className="section-icon-pro">
                  <Target size={32} strokeWidth={1.5} />
                </div>
                <h2 className="section-heading-pro">
                  {managerInfo.how_to_become_title || 'HOW TO BECOME A MANAGER'}
                </h2>
                <div 
                  className="section-content-pro"
                  dangerouslySetInnerHTML={{ __html: managerInfo.how_to_become_content }}
                />
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Current Managers */}
      {managers.length > 0 && (
        <section className="managers-roster-pro">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="roster-header-pro"
            >
              <h2 className="roster-title-pro">OUR TEAM MANAGERS</h2>
              <p className="roster-subtitle-pro">
                Meet the dedicated leaders guiding our teams to excellence
              </p>
            </motion.div>

            <div className="managers-grid-pro">
              {managers.map((manager, index) => (
                <motion.div
                  key={manager.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="manager-card-pro"
                >
                  {/* Photo */}
                  <div className="manager-photo-container">
                    <div className="manager-photo-wrapper">
                      <img
                        src={
                          getImageUrl(manager.photo) ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(manager.name)}&size=400&background=0f172a&color=fff&bold=true`
                        }
                        alt={manager.name}
                        className="manager-photo-pro"
                      />
                    </div>
                    
                    {/* Experience Badge */}
                    {manager.years_experience && (
                      <div className="experience-badge-pro">
                        <span className="experience-number">{manager.years_experience}</span>
                        <span className="experience-label">Years</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="manager-details-pro">
                    <h3 className="manager-name-pro">{manager.name}</h3>
                    
                    {manager.team_name && (
                      <p className="manager-team-pro">{manager.team_name}</p>
                    )}

                    {manager.bio && (
                      <p className="manager-bio-pro">{manager.bio}</p>
                    )}

                    {/* Contact Links */}
                    {(manager.email || manager.phone) && (
                      <div className="manager-contact-pro">
                        {manager.email && (
                          <a 
                            href={`mailto:${manager.email}`} 
                            className="contact-link-pro"
                            title="Email"
                          >
                            <Mail size={18} strokeWidth={1.5} />
                          </a>
                        )}
                        {manager.phone && (
                          <a 
                            href={`tel:${manager.phone}`} 
                            className="contact-link-pro"
                            title="Phone"
                          >
                            <Phone size={18} strokeWidth={1.5} />
                          </a>
                        )}
                      </div>
                    )}
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

export default ManagerInfo;