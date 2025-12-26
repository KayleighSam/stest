import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  User, 
  ArrowRight, 
  TrendingUp,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { contentService } from '../../api/content';
import './FeaturedPosts.css';

const FeaturedPosts = () => {
  const { data: postsData, isLoading } = useQuery({
    queryKey: ['featured-posts'],
    queryFn: async () => {
      const response = await contentService.getFeaturedPosts();
      return response.data;
    },
  });

  const posts = postsData?.results || postsData || [];
  const featuredPosts = posts.slice(0, 3);

  if (isLoading) {
    return (
      <section className="featured-posts-modern">
        <div className="container">
          <div className="loading-featured">
            <div className="loading-spinner-featured"></div>
            <p>Loading latest stories...</p>
          </div>
        </div>
      </section>
    );
  }

  if (featuredPosts.length === 0) {
    return null;
  }

  return (
    <section className="featured-posts-modern">
      <div className="featured-background">
        <div className="bg-pattern-left"></div>
        <div className="bg-pattern-right"></div>
      </div>

      <div className="container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="featured-header"
        >
          <div className="header-content">
            <div className="header-badge">
              <Sparkles size={18} />
              <span>Featured Stories</span>
            </div>
            <h2 className="featured-title">Latest Basketball News</h2>
            <p className="featured-subtitle">
              Stay updated with the latest happenings in the TBWS community
            </p>
          </div>
          <Link to="/blog" className="view-all-btn-modern">
            <span>View All Articles</span>
            <ArrowRight size={20} />
          </Link>
        </motion.div>

        {/* Posts Grid */}
        <div className="featured-grid">
          {featuredPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              className="featured-card"
            >
              <Link to={`/blog/${post.slug}`} className="card-wrapper">
                {/* Image Section */}
                <div className="card-image-wrapper">
                  {post.featured_image ? (
                    <div 
                      className="card-image"
                      style={{ backgroundImage: `url(${post.featured_image})` }}
                    >
                      <div className="image-overlay"></div>
                    </div>
                  ) : (
                    <div className="card-image-placeholder">
                      <div className="placeholder-icon">📰</div>
                    </div>
                  )}
                  
                  {/* Floating Badge */}
                  <div className="floating-badge">
                    <TrendingUp size={14} />
                    <span>Featured</span>
                  </div>

                  {/* Category Badge */}
                  {post.category_name && (
                    <div className="category-badge-featured">
                      {post.category_name}
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="card-content-featured">
                  {/* Meta Info */}
                  <div className="card-meta-featured">
                    <div className="meta-item-featured">
                      <Calendar size={14} />
                      <span>
                        {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="meta-divider">•</div>
                    <div className="meta-item-featured">
                      <User size={14} />
                      <span>{post.author_name}</span>
                    </div>
                    {post.reading_time && (
                      <>
                        <div className="meta-divider">•</div>
                        <div className="meta-item-featured">
                          <Clock size={14} />
                          <span>{post.reading_time} min</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="card-title-featured">
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="card-excerpt-featured">
                      {post.excerpt.length > 120 
                        ? `${post.excerpt.substring(0, 120)}...` 
                        : post.excerpt}
                    </p>
                  )}

                  {/* Read More CTA */}
                  <div className="card-footer-featured">
                    <span className="read-more-featured">
                      Read Full Story
                      <ArrowRight size={16} className="arrow-icon" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="featured-bottom-cta"
        >
          <p>Want to read more amazing stories?</p>
          <Link to="/blog" className="cta-button-featured">
            Explore All Articles
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedPosts;