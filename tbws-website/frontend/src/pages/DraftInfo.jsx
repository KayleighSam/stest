import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Clipboard, CheckCircle2, Calendar, Users, ChevronRight, Clock } from 'lucide-react';
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
    <div className="draft-info-page-pro">
      {/* Hero Banner */}
      <section className="draft-hero-pro">
        <div className="draft-hero-image">
          <img 
            src={
              getImageUrl(draftInfo?.featured_image) ||
              'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1920&q=80'
            } 
            alt="TBWS Draft"
          />
          <div className="draft-hero-overlay"></div>
        </div>
        
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="draft-hero-content-pro"
          >
            <div className="breadcrumb-pro">
              <span>Home</span>
              <ChevronRight size={16} />
              <span>Draft Process</span>
            </div>
            
            <h1 className="draft-page-title">
              {draftInfo?.title || 'TBWS DRAFT PROCESS'}
            </h1>
            
            <p className="draft-page-subtitle">
              Your pathway to becoming part of Kenya's premier basketball league
            </p>

            {/* Important Dates */}
            {(draftInfo?.registration_deadline || draftInfo?.draft_date) && (
              <div className="draft-dates-pro">
                {draftInfo.registration_deadline && (
                  <div className="date-card-pro">
                    <div className="date-icon-pro">
                      <Clock size={24} />
                    </div>
                    <div className="date-content-pro">
                      <span className="date-label-pro">REGISTRATION DEADLINE</span>
                      <span className="date-value-pro">
                        {formatDateTime(draftInfo.registration_deadline)}
                      </span>
                    </div>
                  </div>
                )}
                {draftInfo.draft_date && (
                  <div className="date-card-pro">
                    <div className="date-icon-pro">
                      <Users size={24} />
                    </div>
                    <div className="date-content-pro">
                      <span className="date-label-pro">DRAFT DATE</span>
                      <span className="date-value-pro">
                        {formatDateTime(draftInfo.draft_date)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Overview Section */}
      {draftInfo?.overview && (
        <section className="draft-overview-pro">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="overview-content-pro"
            >
              <div 
                className="overview-text-pro"
                dangerouslySetInnerHTML={{ __html: draftInfo.overview }}
              />
            </motion.div>
          </div>
        </section>
      )}

      {/* Info Sections */}
      <section className="draft-sections-pro">
        <div className="container">
          <div className="sections-grid-pro">
            {/* Eligibility */}
            {draftInfo?.eligibility_content && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="info-section-pro eligibility-section"
              >
                <div className="section-header-pro">
                  <div className="section-icon-pro eligibility-icon">
                    <CheckCircle2 size={32} strokeWidth={1.5} />
                  </div>
                  <h2 className="section-heading-pro">
                    {draftInfo.eligibility_title || 'ELIGIBILITY REQUIREMENTS'}
                  </h2>
                </div>
                <div 
                  className="section-content-pro"
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
                transition={{ delay: 0.1 }}
                className="info-section-pro process-section"
              >
                <div className="section-header-pro">
                  <div className="section-icon-pro process-icon">
                    <Clipboard size={32} strokeWidth={1.5} />
                  </div>
                  <h2 className="section-heading-pro">
                    {draftInfo.process_title || 'HOW IT WORKS'}
                  </h2>
                </div>
                <div 
                  className="section-content-pro"
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
                transition={{ delay: 0.2 }}
                className="info-section-pro timeline-section"
              >
                <div className="section-header-pro">
                  <div className="section-icon-pro timeline-icon">
                    <Calendar size={32} strokeWidth={1.5} />
                  </div>
                  <h2 className="section-heading-pro">
                    {draftInfo.timeline_title || 'DRAFT TIMELINE'}
                  </h2>
                </div>
                <div 
                  className="section-content-pro"
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
                transition={{ delay: 0.3 }}
                className="info-section-pro rules-section"
              >
                <div className="section-header-pro">
                  <div className="section-icon-pro rules-icon">
                    <CheckCircle2 size={32} strokeWidth={1.5} />
                  </div>
                  <h2 className="section-heading-pro">
                    {draftInfo.rules_title || 'DRAFT RULES'}
                  </h2>
                </div>
                <div 
                  className="section-content-pro"
                  dangerouslySetInnerHTML={{ __html: draftInfo.rules_content }}
                />
              </motion.div>
            )}
          </div>

          {/* FAQ Section - Full Width */}
          {draftInfo?.faq_content && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="faq-section-pro"
            >
              <h2 className="faq-title-pro">
                {draftInfo.faq_title || 'FREQUENTLY ASKED QUESTIONS'}
              </h2>
              <div 
                className="faq-content-pro"
                dangerouslySetInnerHTML={{ __html: draftInfo.faq_content }}
              />
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
};

export default DraftInfo;