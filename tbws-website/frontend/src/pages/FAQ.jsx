import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, Search } from 'lucide-react';
import { pagesAPI } from '../api/pages';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import './FAQ.css';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: faqData, isLoading, error } = useQuery({
    queryKey: ['faq'],
    queryFn: pagesAPI.getFAQ,
  });

  if (isLoading) return <Loading fullScreen />;
  if (error) return <ErrorMessage message="Failed to load FAQ" />;

  /**
   * Normalize API response
   * Supports:
   * - { data: { results: [] } }
   * - { data: [] }
   * - []
   */
  const rawData = faqData?.data || faqData || [];
  const faqs = rawData?.results || rawData?.data || rawData || [];

  // Filter FAQs safely
  const filteredFAQs = faqs.filter((faq) => {
    const question = faq?.question?.toLowerCase() || '';
    const answer = faq?.answer?.toLowerCase() || '';

    return (
      question.includes(searchQuery.toLowerCase()) ||
      answer.includes(searchQuery.toLowerCase())
    );
  });

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-page">
      {/* Hero Section */}
      <section className="faq-hero">
        <div className="faq-hero-background">
          <div className="hero-gradient"></div>
        </div>

        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="faq-hero-content"
          >
            <div className="hero-icon">
              <HelpCircle size={64} />
            </div>

            <h1>Frequently Asked Questions</h1>
            <p>Find answers to common questions about TBWS</p>

            {/* Search Bar */}
            <div className="faq-search">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="section faq-section">
        <div className="container">
          {filteredFAQs.length === 0 ? (
            <div className="no-faqs">
              <HelpCircle size={64} />
              <h3>No questions found</h3>
              <p>Try a different search term</p>
            </div>
          ) : (
            <div className="faq-list">
              {filteredFAQs.map((faq, index) => (
                <motion.div
                  key={faq.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className={`faq-item ${
                    openIndex === index ? 'faq-item-open' : ''
                  }`}
                >
                  <button
                    className="faq-question"
                    onClick={() => toggleFAQ(index)}
                  >
                    <span className="question-text">
                      {faq.question}
                    </span>

                    <ChevronDown
                      size={24}
                      className={`chevron ${
                        openIndex === index ? 'chevron-rotate' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {openIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="faq-answer-wrapper"
                      >
                        <div
                          className="faq-answer"
                          dangerouslySetInnerHTML={{
                            __html: faq.answer,
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="faq-cta"
          >
            <h3>Still have questions?</h3>
            <p>
              Can’t find the answer you’re looking for? Please reach out to our
              friendly team.
            </p>
            <a href="/contact" className="btn btn-primary btn-lg">
              Contact Us
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default FAQ;
