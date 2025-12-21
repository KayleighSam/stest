import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { contentAPI } from '../../api/content';
import { formatDate, truncateText, getImageUrl } from '../../utils/formatters';
import Loading from '../common/Loading';
import './FeaturedPosts.css';

const FeaturedPosts = () => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['featured-posts'],
    queryFn: () => contentAPI.getFeaturedPosts(),
  });

  if (isLoading) return <Loading />;

  const featuredPosts = posts?.results || posts?.data || posts || [];

  if (featuredPosts.length === 0) return null;

  return (
    <section className="section featured-posts">
      <div className="container">
        <div className="section-title">
          <h2>Latest News & Updates</h2>
          <p>Stay informed with the latest happenings in the TBWS community</p>
        </div>

        <div className="posts-grid">
          {featuredPosts.slice(0, 6).map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link to={`/blog/${post.slug}`} className="post-card">
                <div className="post-image">
                  <img
                    src={getImageUrl(post.featured_image) || 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800'}
                    alt={post.title}
                  />
                  <div className="post-overlay">
                    <span className="post-type">{post.post_type}</span>
                  </div>
                </div>

                <div className="post-content">
                  <div className="post-meta">
                    <span className="meta-item">
                      <Calendar size={14} />
                      {formatDate(post.published_at)}
                    </span>
                    <span className="meta-item">
                      <User size={14} />
                      {post.author_name}
                    </span>
                    <span className="meta-item">
                      <Clock size={14} />
                      {post.reading_time} min read
                    </span>
                  </div>

                  <h3 className="post-title">{post.title}</h3>
                  <p className="post-excerpt">
                    {truncateText(post.excerpt, 120)}
                  </p>

                  <div className="post-footer">
                    <span className="read-more">
                      Read More <ArrowRight size={16} />
                    </span>
                    <span className="post-views">{post.views} views</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="section-cta">
          <Link to="/blog" className="btn btn-primary btn-lg">
            View All Posts
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedPosts;