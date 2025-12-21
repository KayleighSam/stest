import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Shield, BookOpen, Users, AlertCircle } from 'lucide-react';
import { pagesAPI } from '../api/pages';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import './LeagueRules.css';

const LeagueRules = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['league-rules-by-category'],
    queryFn: () => pagesAPI.getLeagueRulesByCategory(),
  });

  if (isLoading) return <Loading fullScreen />;
  if (error) return <ErrorMessage message="Failed to load league rules" />;

  const rulesByCategory = data?.data || data || {};

  const categoryIcons = {
    'Game Rules': <BookOpen size={24} />,
    'Player Rules': <Users size={24} />,
    'Team Rules': <Shield size={24} />,
    'Code of Conduct': <AlertCircle size={24} />,
    'Eligibility': <Users size={24} />,
    'Other': <BookOpen size={24} />,
  };

  return (
    <div className="league-rules-page">
      {/* Hero */}
      <section className="rules-hero">
        <div className="rules-hero-bg"></div>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="rules-hero-content"
          >
            <div className="rules-badge">
              <Shield size={20} />
              <span>League Rules</span>
            </div>
            <h1 className="rules-hero-title">TBWS League Rules & Regulations</h1>
            <p className="rules-hero-desc">
              Official rules and guidelines for all TBWS basketball league participants
            </p>
          </motion.div>
        </div>
      </section>

      {/* Rules Content */}
      <section className="rules-content-section">
        <div className="container">
          {Object.keys(rulesByCategory).length === 0 ? (
            <div className="no-rules">
              <Shield size={64} />
              <h3>No rules available</h3>
              <p>League rules will be published soon</p>
            </div>
          ) : (
            <div className="rules-categories">
              {Object.entries(rulesByCategory).map(([category, rules], index) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="rules-category-section"
                >
                  <div className="category-header">
                    <div className="category-icon">
                      {categoryIcons[category] || <BookOpen size={24} />}
                    </div>
                    <h2 className="category-title">{category}</h2>
                  </div>

                  <div className="rules-list">
                    {rules.map((rule, ruleIndex) => (
                      <motion.div
                        key={rule.id}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: ruleIndex * 0.05 }}
                        className="rule-item"
                      >
                        <div className="rule-number">{ruleIndex + 1}</div>
                        <div className="rule-content">
                          <h3 className="rule-title">{rule.title}</h3>
                          <div 
                            className="rule-text"
                            dangerouslySetInnerHTML={{ __html: rule.content }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default LeagueRules;