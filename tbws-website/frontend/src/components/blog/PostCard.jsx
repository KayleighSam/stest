import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight, MapPin } from 'lucide-react';
import { formatDate, formatDateTime, getImageUrl } from '../../utils/formatters';
import './PostCard.css';

const PostCard = ({ post }) => {
  const isEvent = post.post_type === 'event';
  
  // Determine the correct link
  const postLink = `/post/${post.slug}`;

  return (
    <Link to={postLink} className="post-card">
      <div className="post-card-image">
        <img
          src={getImageUrl(post.featured_image) || 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600'}
          alt={post.title}
        />
        <div className="post-card-overlay"></div>
        <span className="post-type-label">{post.post_type}</span>
      </div>

      <div className="post-card-content">
        {post.category_name && (
          <span className="post-category">{post.category_name}</span>
        )}
        
        <h3 className="post-card-title">{post.title}</h3>
        
        <p className="post-card-excerpt">
          {post.excerpt || 'Click to read more...'}
        </p>

        <div className="post-card-meta">
          {isEvent && post.event_date ? (
            <>
              <div className="meta-item">
                <Calendar size={16} />
                <span>{formatDateTime(post.event_date)}</span>
              </div>
              {post.event_location && (
                <div className="meta-item">
                  <MapPin size={16} />
                  <span>{post.event_location}</span>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="meta-item">
                <Calendar size={16} />
                <span>{formatDate(post.published_at)}</span>
              </div>
              {post.reading_time && (
                <div className="meta-item">
                  <Clock size={16} />
                  <span>{post.reading_time} min read</span>
                </div>
              )}
            </>
          )}
        </div>

        <div className="post-card-footer">
          <span className="read-more">
            Read More <ArrowRight size={16} />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default PostCard;