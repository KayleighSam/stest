import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  BookOpen,
  Users,
  AlertCircle,
  ChevronRight,
  FileText,
  Scale
} from 'lucide-react';
import { pagesAPI } from '../api/pages';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import './LeagueRules.css';

const LeagueRules = () => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [expandedRule, setExpandedRule] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['league-rules-by-category'],
    queryFn: () => pagesAPI.getLeagueRulesByCategory(),
  });

  const rulesByCategory = data?.data || data || {};
  const categories = Object.keys(rulesByCategory);

  const categoryConfig = {
    'Game Rules': { icon: BookOpen },
    'Player Rules': { icon: Users },
    'Team Rules': { icon: Shield },
    'Code of Conduct': { icon: AlertCircle },
    'Eligibility': { icon: FileText },
    'Other': { icon: Scale },
  };

  // ✅ ALWAYS RUNS – NO CONDITIONAL HOOKS
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  // ✅ SAFE EARLY RETURNS AFTER HOOKS
  if (isLoading) return <Loading fullScreen />;
  if (error) return <ErrorMessage message="Failed to load league rules" />;

  return (
    <div className="league-rules-page-pro">
      {/* Hero Section */}
      <section className="rules-hero-pro">
        <div className="rules-hero-image">
          <img
            src="https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1920&q=80"
            alt="League Rules"
          />
          <div className="rules-hero-overlay" />
        </div>

        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="rules-hero-content-pro"
          >
            <div className="breadcrumb-pro">
              <span>Home</span>
              <ChevronRight size={16} />
              <span>League Rules</span>
            </div>

            <h1 className="rules-page-title">LEAGUE RULES & REGULATIONS</h1>
            <p className="rules-page-subtitle">
              Official guidelines governing TBWS basketball competitions
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="rules-content-pro">
        <div className="container">
          {categories.length === 0 ? (
            <div className="no-rules-pro">
              <Shield size={64} strokeWidth={1.5} />
              <h3>League Rules Coming Soon</h3>
              <p>Official rules and regulations will be published here</p>
            </div>
          ) : (
            <div className="rules-layout-pro">
              {/* Sidebar */}
              <aside className="rules-sidebar-pro">
                <div className="sidebar-sticky">
                  <h3 className="sidebar-title">Categories</h3>
                  <nav className="rules-nav">
                    {categories.map((category) => {
                      const Icon =
                        categoryConfig[category]?.icon ||
                        categoryConfig.Other.icon;

                      return (
                        <button
                          key={category}
                          onClick={() => {
                            setActiveCategory(category);
                            setExpandedRule(null);
                          }}
                          className={`nav-item-pro ${
                            activeCategory === category ? 'nav-item-active' : ''
                          }`}
                        >
                          <Icon size={20} />
                          <span>{category}</span>
                          <span className="rule-count">
                            {rulesByCategory[category]?.length || 0}
                          </span>
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </aside>

              {/* Main */}
              <main className="rules-main-pro">
                <AnimatePresence mode="wait">
                  {activeCategory && (
                    <motion.div
                      key={activeCategory}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="rules-section-pro"
                    >
                      <div className="section-header-pro">
                        <h2>{activeCategory}</h2>
                        <p>
                          {rulesByCategory[activeCategory].length} Rules
                        </p>
                      </div>

                      <div className="rules-list-pro">
                        {rulesByCategory[activeCategory].map((rule, index) => {
                          const isExpanded = expandedRule === rule.id;

                          return (
                            <motion.div
                              key={rule.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="rule-card-pro"
                            >
                              <button
                                onClick={() =>
                                  setExpandedRule(isExpanded ? null : rule.id)
                                }
                                className="rule-header-pro"
                              >
                                <span className="rule-number-pro">
                                  {String(index + 1).padStart(2, '0')}
                                </span>
                                <h3>{rule.title}</h3>
                                <motion.span
                                  animate={{ rotate: isExpanded ? 90 : 0 }}
                                >
                                  <ChevronRight />
                                </motion.span>
                              </button>

                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="rule-content-pro"
                                  >
                                    <div
                                      dangerouslySetInnerHTML={{
                                        __html: rule.content,
                                      }}
                                    />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </main>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default LeagueRules;
