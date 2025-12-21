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

  // ✅ Normalize API response safely
  const sponsorsList = Array.isArray(data?.results)
    ? data.results
    : Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data)
    ? data
    : [];

  if (isLoading || error || sponsorsList.length === 0) return null;

  return (
    <section className="section sponsors-section">
      <div className="container">
        <div className="section-title">
          <h2>Our Partners & Sponsors</h2>
          <p>Proudly supported by these amazing organizations</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="sponsors-grid"
        >
          {sponsorsList.map((sponsor) => (
            <a
              key={sponsor.id}
              href={sponsor.website_url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="sponsor-card"
            >
              <img
                src={getImageUrl(sponsor.logo)}
                alt={sponsor.name}
                className="sponsor-logo"
              />
            </a>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default SponsorsSection;
