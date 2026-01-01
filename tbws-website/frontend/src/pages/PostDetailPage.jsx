import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  User, 
  ArrowLeft,
  Clock,
  Eye,
  Tag as TagIcon,
  Share2,
  Bookmark,
} from 'lucide-react';
import { contentService } from '../api/content';
import CommentSection from '../components/blog/CommentSection';
import './PostDetailPage.css';

const PostDetailPage = () => {
  const { slug } = useParams();

  const { data: postData, isLoading, error } = useQuery({
    queryKey: ['post', slug],
    queryFn: async () => {
      const response = await contentService.getPost(slug);
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="post-detail-modern">
        <div className="container-detail">
          <div className="loading-detail">
            <div className="loading-spinner-detail"></div>
            <p>Loading amazing content...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="post-detail-modern">
        <div className="container-detail">
          <div className="error-detail">
            <div className="error-icon">😕</div>
            <h2>Oops! Post not found</h2>
            <p>The article you're looking for doesn't exist or has been removed.</p>
            <Link to="/blog" className="back-button-modern">
              <ArrowLeft size={20} />
              <span>Back to Blog</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const post = postData;

  return (
    <div className="post-detail-modern">
      {/* Hero Section */}
      <section className="post-hero-modern">
        <div className="hero-overlay"></div>
        {post.featured_image && (
          <div 
            className="hero-background-image"
            style={{ backgroundImage: `url(${post.featured_image})` }}
          ></div>
        )}
        <div className="container-detail">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="hero-content-detail"
          >
            <Link to="/blog" className="back-link-modern">
              <ArrowLeft size={18} />
              <span>Back to Blog</span>
            </Link>

            {post.category && (
              <div className="category-badge-modern">
                {post.category.name}
              </div>
            )}

            <h1 className="post-title-hero">{post.title}</h1>

            <div className="post-meta-hero">
              <div className="meta-group">
                <div className="meta-item-hero">
                  <Calendar size={18} />
                  <span>
                    {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="meta-divider-hero">•</div>
                <div className="meta-item-hero">
                  <User size={18} />
                  <span>
                    {post.author?.first_name} {post.author?.last_name}
                  </span>
                </div>
                <div className="meta-divider-hero">•</div>
                <div className="meta-item-hero">
                  <Clock size={18} />
                  <span>{post.reading_time || 5} min read</span>
                </div>
                {post.views && (
                  <>
                    <div className="meta-divider-hero">•</div>
                    <div className="meta-item-hero">
                      <Eye size={18} />
                      <span>{post.views} views</span>
                    </div>
                  </>
                )}
              </div>

              <div className="post-actions">
                <button className="action-btn" title="Share">
                  <Share2 size={20} />
                </button>
                <button className="action-btn" title="Bookmark">
                  <Bookmark size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="post-content-section">
        <div className="container-detail">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="post-article-modern"
          >
            {/* Excerpt */}
            {post.excerpt && (
              <div className="post-excerpt-detail">
                <p>{post.excerpt}</p>
              </div>
            )}

            {/* Content */}
            <div
              className="post-content-detail"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="post-tags-detail">
                <div className="tags-header">
                  <TagIcon size={20} />
                  <h4>Related Topics</h4>
                </div>
                <div className="tags-list">
                  {post.tags.map((tag) => (
                    <span key={tag.id} className="tag-item-modern">
                      #{tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Author Info */}
            <div className="author-card-modern">
              <div className="author-avatar">
                {post.author?.first_name?.charAt(0) || 'A'}
              </div>
              <div className="author-info">
                <h4 className="author-name">
                  {post.author?.first_name} {post.author?.last_name}
                </h4>
                <p className="author-role">Content Writer</p>
              </div>
            </div>

            {/* Comments Section */}
            {post.allow_comments && (
              <CommentSection postSlug={slug} postId={post.id} />
            )}
          </motion.article>
        </div>
      </section>

      {/* Related Posts CTA */}
      <section className="related-cta-section">
        <div className="container-detail">
          <div className="related-cta-card">
            <h3>Explore More Stories</h3>
            <p>Discover more insights, news, and updates from TBWS</p>
            <Link to="/blog" className="cta-button-modern">
              View All Articles
              <ArrowLeft size={18} style={{ transform: 'rotate(180deg)' }} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PostDetailPage;