import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar, User, Clock, ArrowLeft, Share2, Eye, MapPin, ExternalLink } from 'lucide-react';
import { contentAPI } from '../api/content';
import { formatDate, formatDateTime, getImageUrl } from '../utils/formatters';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import PostCard from '../components/blog/PostCard';
import './PostDetailPage.css';

const PostDetailPage = () => {
  const { slug } = useParams();

  // Fetch post details
  const { data: postData, isLoading, error } = useQuery({
    queryKey: ['post', slug],
    queryFn: () => contentAPI.getPostBySlug(slug),
  });

  // Fetch related posts
  const { data: relatedData } = useQuery({
    queryKey: ['related-posts', slug],
    queryFn: () => contentAPI.getRelatedPosts(slug),
    enabled: !!slug,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (isLoading) return <Loading fullScreen />;
  if (error) {
    console.error('Post Detail Error:', error);
    return <ErrorMessage message="Failed to load post. Please try again." />;
  }

  const post = postData?.data || postData;
  const relatedPosts = relatedData?.results || relatedData?.data || relatedData || [];

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  // Determine back link based on post type
  const getBackLink = () => {
    if (post.post_type === 'event') {
      return '/events';
    }
    return '/blog';
  };

  const getBackText = () => {
    if (post.post_type === 'event') {
      return 'Back to Events';
    }
    return 'Back to Blog';
  };

  const isEvent = post.post_type === 'event';

  return (
    <div className="post-detail-page">
      {/* Hero Section */}
      <section className="post-hero">
        <div className="post-hero-overlay"></div>
        <img
          src={getImageUrl(post.featured_image) || 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200'}
          alt={post.title}
          className="post-hero-image"
        />
        <div className="container">
          <div className="post-hero-content">
            <Link to={getBackLink()} className="back-link">
              <ArrowLeft size={20} />
              {getBackText()}
            </Link>
            <span className="post-type-badge">{post.post_type}</span>
            <h1>{post.title}</h1>
            
            {/* Event Info (if event) */}
            {isEvent && post.event_date && (
              <div className="event-info-hero">
                <div className="event-info-item">
                  <Calendar size={20} />
                  <span>{formatDateTime(post.event_date)}</span>
                </div>
                {post.event_location && (
                  <div className="event-info-item">
                    <MapPin size={20} />
                    <span>{post.event_location}</span>
                  </div>
                )}
              </div>
            )}

            {/* Regular Post Meta */}
            <div className="post-meta">
              <span className="meta-item">
                <User size={18} />
                {post.author_name}
              </span>
              <span className="meta-item">
                <Calendar size={18} />
                {formatDate(post.published_at)}
              </span>
              <span className="meta-item">
                <Clock size={18} />
                {post.reading_time} min read
              </span>
              <span className="meta-item">
                <Eye size={18} />
                {post.views} views
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Post Content */}
      <section className="section post-content-section">
        <div className="container">
          <div className="post-layout">
            <article className="post-article">
              {/* Event Registration CTA (if event with registration link) */}
              {isEvent && post.event_registration_link && (
                <div className="event-register-banner">
                  <h3>Ready to Join?</h3>
                  <p>Register now to secure your spot at this event</p>
                  <a 
                    href={post.event_registration_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-lg"
                  >
                    Register Now
                    <ExternalLink size={20} />
                  </a>
                </div>
              )}

              <div className="post-body">
                <div 
                  className="post-content-html"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </div>

              {/* Event Details Card (if event) */}
              {isEvent && (
                <div className="event-details-card">
                  <h3>Event Details</h3>
                  <div className="event-details-grid">
                    {post.event_date && (
                      <div className="event-detail-item">
                        <strong>Date & Time:</strong>
                        <span>{formatDateTime(post.event_date)}</span>
                      </div>
                    )}
                    {post.event_end_date && (
                      <div className="event-detail-item">
                        <strong>End Date:</strong>
                        <span>{formatDateTime(post.event_end_date)}</span>
                      </div>
                    )}
                    {post.event_location && (
                      <div className="event-detail-item">
                        <strong>Location:</strong>
                        <span>{post.event_location}</span>
                      </div>
                    )}
                    {post.event_venue && (
                      <div className="event-detail-item">
                        <strong>Venue:</strong>
                        <span>{post.event_venue}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="post-tags">
                  <h4>Tags:</h4>
                  <div className="tags-list">
                    {post.tags.map((tag) => (
                      <span key={tag.id} className="tag">
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Share Button */}
              <div className="post-actions">
                <button onClick={handleShare} className="share-btn">
                  <Share2 size={20} />
                  Share this {isEvent ? 'event' : 'post'}
                </button>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="post-sidebar">
              <div className="sidebar-card">
                <h3>About the Author</h3>
                <div className="author-info">
                  <div className="author-avatar">
                    {post.author_name?.charAt(0)}
                  </div>
                  <div>
                    <h4>{post.author_name}</h4>
                    <p>TBWS Contributor</p>
                  </div>
                </div>
              </div>

              {post.category && (
                <div className="sidebar-card">
                  <h3>Category</h3>
                  <div className="category-badge">
                    {post.category_name}
                  </div>
                </div>
              )}

              {/* Event Quick Info */}
              {isEvent && (
                <div className="sidebar-card event-quick-info">
                  <h3>Quick Info</h3>
                  <div className="quick-info-list">
                    {post.event_date && (
                      <div className="quick-info-item">
                        <Calendar size={18} />
                        <div>
                          <strong>When</strong>
                          <span>{formatDateTime(post.event_date)}</span>
                        </div>
                      </div>
                    )}
                    {post.event_location && (
                      <div className="quick-info-item">
                        <MapPin size={18} />
                        <div>
                          <strong>Where</strong>
                          <span>{post.event_location}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  {post.event_registration_link && (
                    <a 
                      href={post.event_registration_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-block"
                    >
                      Register Now
                    </a>
                  )}
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="section related-posts-section">
          <div className="container">
            <h2 className="section-heading">
              Related {isEvent ? 'Events' : 'Posts'}
            </h2>
            <div className="related-posts-grid">
              {relatedPosts.slice(0, 3).map((relatedPost) => (
                <PostCard key={relatedPost.id} post={relatedPost} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default PostDetailPage;