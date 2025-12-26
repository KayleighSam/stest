import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { pagesAPI } from '../../api/pages';
import { getImageUrl } from '../../utils/formatters';
import './SponsorsSection.css';

const SponsorsSection = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['sponsors'],
    queryFn: () => pagesAPI.getSponsors(),
  });

  const sponsorsList = Array.isArray(data?.results)
    ? data.results
    : Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data)
    ? data
    : [];

  if (isLoading || error || sponsorsList.length === 0) return null;

  return (
    <section className="sponsors-section-modern">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="sponsors-header-modern"
        >
          <div className="sponsors-header-tag">
            <span className="tag-line-sponsors"></span>
            <span className="tag-text-sponsors">OUR PARTNERS</span>
          </div>
          <h2 className="sponsors-title-modern">Proudly Supported By</h2>
          <p className="sponsors-subtitle-modern">
            Working together to build basketball excellence
          </p>
        </motion.div>

        {/* Sponsors Grid */}
        <div className="sponsors-grid-modern">
          {sponsorsList.map((sponsor, index) => (
            <motion.a
              key={sponsor.id}
              href={sponsor.website_url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ y: -5 }}
              className="sponsor-card-modern"
            >
              <div className="sponsor-logo-wrapper">
                <img
                  src={getImageUrl(sponsor.logo)}
                  alt={sponsor.name}
                  className="sponsor-logo-modern"
                />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SponsorsSection;