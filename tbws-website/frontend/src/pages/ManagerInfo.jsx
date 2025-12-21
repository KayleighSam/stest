import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, ClipboardList, Award, Mail, Phone } from 'lucide-react';
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
    <div className="manager-info-page">
      {/* Hero */}
      <section className="manager-hero">
        <div className="manager-hero-bg"></div>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="manager-hero-content"
          >
            <div className="manager-badge">
              <ClipboardList size={20} />
              <span>Team Managers</span>
            </div>
            <h1 className="manager-hero-title">
              {managerInfo?.title || 'Team Manager Information'}
            </h1>
            
            {/* Contact Info */}
            {(managerInfo?.contact_email || managerInfo?.contact_phone) && (
              <div className="manager-hero-contact">
                {managerInfo.contact_email && (
                  <a href={`mailto:${managerInfo.contact_email}`} className="contact-btn">
                    <Mail size={18} />
                    <span>{managerInfo.contact_email}</span>
                  </a>
                )}
                {managerInfo.contact_phone && (
                  <a href={`tel:${managerInfo.contact_phone}`} className="contact-btn">
                    <Phone size={18} />
                    <span>{managerInfo.contact_phone}</span>
                  </a>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="manager-content-section">
        <div className="container">
          <div className="manager-content-layout">
            {/* Overview */}
            {managerInfo?.overview && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="manager-section"
              >
                <div 
                  className="manager-text-content"
                  dangerouslySetInnerHTML={{ __html: managerInfo.overview }}
                />
              </motion.div>
            )}

            {/* Responsibilities */}
            {managerInfo?.responsibilities_content && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="manager-section"
              >
                <div className="section-icon">
                  <ClipboardList size={28} />
                </div>
                <h2 className="section-title">
                  {managerInfo.responsibilities_title || 'Manager Responsibilities'}
                </h2>
                <div 
                  className="manager-text-content"
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
                className="manager-section"
              >
                <div className="section-icon">
                  <ClipboardList size={28} />
                </div>
                <h2 className="section-title">
                  {managerInfo.requirements_title || 'Requirements'}
                </h2>
                <div 
                  className="manager-text-content"
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
                className="manager-section"
              >
                <div className="section-icon">
                  <Award size={28} />
                </div>
                <h2 className="section-title">
                  {managerInfo.benefits_title || 'Benefits'}
                </h2>
                <div 
                  className="manager-text-content"
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
                className="manager-section manager-cta-section"
              >
                <h2 className="section-title">
                  {managerInfo.how_to_become_title || 'How to Become a Manager'}
                </h2>
                <div 
                  className="manager-text-content"
                  dangerouslySetInnerHTML={{ __html: managerInfo.how_to_become_content }}
                />
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Current Managers */}
      {managers.length > 0 && (
        <section className="managers-list-section">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="managers-header"
            >
              <h2 className="managers-title">Our Team Managers</h2>
              <p className="managers-subtitle">Meet the dedicated individuals leading our teams</p>
            </motion.div>

            <div className="managers-grid">
              {managers.map((manager, index) => (
                <motion.div
                  key={manager.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="manager-card"
                >
                  <div className="manager-photo-wrapper">
                    <img
                      src={
                        getImageUrl(manager.photo) ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(manager.name)}&size=200&background=f97316&color=fff&bold=true`
                      }
                      alt={manager.name}
                      className="manager-photo"
                    />
                  </div>
                  <div className="manager-details">
                    <h3 className="manager-name">{manager.name}</h3>
                    {manager.team_name && (
                      <p className="manager-team">{manager.team_name}</p>
                    )}
                    {manager.years_experience && (
                      <p className="manager-experience">
                        {manager.years_experience} years experience
                      </p>
                    )}
                    {manager.bio && (
                      <p className="manager-bio">{manager.bio}</p>
                    )}
                    {(manager.email || manager.phone) && (
                      <div className="manager-contact-info">
                        {manager.email && (
                          <a href={`mailto:${manager.email}`} className="manager-contact-link">
                            <Mail size={16} />
                          </a>
                        )}
                        {manager.phone && (
                          <a href={`tel:${manager.phone}`} className="manager-contact-link">
                            <Phone size={16} />
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