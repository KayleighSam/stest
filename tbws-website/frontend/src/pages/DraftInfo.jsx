import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Clipboard, CheckCircle2, Calendar, Users } from 'lucide-react';
import { pagesAPI } from '../api/pages';
import { formatDateTime, getImageUrl } from '../utils/formatters';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import './DraftInfo.css';

const DraftInfo = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['draft-info'],
    queryFn: () => pagesAPI.getDraftInfo(),
  });

  if (isLoading) return <Loading fullScreen />;
  if (error) return <ErrorMessage message="Failed to load draft information" />;

  const draftInfo = data?.data || data;

  return (
    <div className="draft-info-page">
      {/* Hero */}
      <section className="draft-hero">
        <div className="draft-hero-bg"></div>
        {draftInfo?.featured_image && (
          <div className="draft-hero-image-wrapper">
            <img
              src={getImageUrl(draftInfo.featured_image)}
              alt={draftInfo.title}
              className="draft-hero-image"
            />
            <div className="draft-hero-overlay"></div>
          </div>
        )}
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="draft-hero-content"
          >
            <div className="draft-badge">
              <Clipboard size={20} />
              <span>Draft Process</span>
            </div>
            <h1 className="draft-hero-title">{draftInfo?.title || 'TBWS Draft Process'}</h1>
            
            {/* Important Dates */}
            {(draftInfo?.registration_deadline || draftInfo?.draft_date) && (
              <div className="draft-dates">
                {draftInfo.registration_deadline && (
                  <div className="date-item">
                    <Calendar size={18} />
                    <div>
                      <strong>Registration Deadline</strong>
                      <span>{formatDateTime(draftInfo.registration_deadline)}</span>
                    </div>
                  </div>
                )}
                {draftInfo.draft_date && (
                  <div className="date-item">
                    <Users size={18} />
                    <div>
                      <strong>Draft Date</strong>
                      <span>{formatDateTime(draftInfo.draft_date)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="draft-content-section">
        <div className="container">
          <div className="draft-content-layout">
            {/* Overview */}
            {draftInfo?.overview && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="draft-section"
              >
                <div 
                  className="draft-text-content"
                  dangerouslySetInnerHTML={{ __html: draftInfo.overview }}
                />
              </motion.div>
            )}

            {/* Eligibility */}
            {draftInfo?.eligibility_content && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="draft-section"
              >
                <div className="section-icon">
                  <CheckCircle2 size={28} />
                </div>
                <h2 className="section-title">
                  {draftInfo.eligibility_title || 'Eligibility Requirements'}
                </h2>
                <div 
                  className="draft-text-content"
                  dangerouslySetInnerHTML={{ __html: draftInfo.eligibility_content }}
                />
              </motion.div>
            )}

            {/* Process */}
            {draftInfo?.process_content && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="draft-section"
              >
                <div className="section-icon">
                  <Clipboard size={28} />
                </div>
                <h2 className="section-title">
                  {draftInfo.process_title || 'How It Works'}
                </h2>
                <div 
                  className="draft-text-content"
                  dangerouslySetInnerHTML={{ __html: draftInfo.process_content }}
                />
              </motion.div>
            )}

            {/* Timeline */}
            {draftInfo?.timeline_content && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="draft-section"
              >
                <div className="section-icon">
                  <Calendar size={28} />
                </div>
                <h2 className="section-title">
                  {draftInfo.timeline_title || 'Draft Timeline'}
                </h2>
                <div 
                  className="draft-text-content"
                  dangerouslySetInnerHTML={{ __html: draftInfo.timeline_content }}
                />
              </motion.div>
            )}

            {/* Rules */}
            {draftInfo?.rules_content && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="draft-section draft-rules-section"
              >
                <h2 className="section-title">
                  {draftInfo.rules_title || 'Draft Rules'}
                </h2>
                <div 
                  className="draft-text-content"
                  dangerouslySetInnerHTML={{ __html: draftInfo.rules_content }}
                />
              </motion.div>
            )}

            {/* FAQ */}
            {draftInfo?.faq_content && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="draft-section"
              >
                <h2 className="section-title">
                  {draftInfo.faq_title || 'Frequently Asked Questions'}
                </h2>
                <div 
                  className="draft-text-content"
                  dangerouslySetInnerHTML={{ __html: draftInfo.faq_content }}
                />
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default DraftInfo;