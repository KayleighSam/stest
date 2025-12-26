import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Search, 
  Calendar, 
  User, 
  Tag as TagIcon,
  TrendingUp,
  Clock,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { contentService } from '../api/content';
import './Blog.css';

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Fetch posts
  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['posts', selectedType, selectedCategory],
    queryFn: async () => {
      const params = { status: 'published' };
      if (selectedType) params.post_type = selectedType;
      if (selectedCategory) params.category = selectedCategory;
      const response = await contentService.getPosts(params);
      return response.data;
    },
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await contentService.getCategories();
      return response.data;
    },
  });

  const posts = postsData?.results || postsData || [];
  const categories = categoriesData?.results || categoriesData || [];

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (post.excerpt && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const featuredPost = filteredPosts.find((post) => post.is_featured);
  const regularPosts = filteredPosts.filter(
    (post) => !post.is_featured || post.id !== featuredPost?.id
  );

  return (
    <div className="blog-page-modern">
      {/* Hero Section */}
      <section className="blog-hero-modern">
        <div className="hero-background">
          <div className="hero-pattern"></div>
          <div className="hero-gradient"></div>
        </div>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="hero-content"
          >
            <div className="hero-badge">
              <TrendingUp size={16} />
              <span>Latest Updates</span>
            </div>
            <h1 className="hero-title">
              Basketball Stories, News & Insights
            </h1>
            <p className="hero-subtitle">
              Discover the latest from TBWS - your premier source for basketball
              excellence in Kenya
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="filters-section-modern">
        <div className="container">
          <div className="filters-container">
            <div className="search-input-modern">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search articles, news, events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filter-dropdowns">
              <div className="filter-item">
                <Filter size={16} />
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="filter-select-modern"
                >
                  <option value="">All Types</option>
                  <option value="news">📰 News</option>
                  <option value="blog">✍️ Blog</option>
                  <option value="event">📅 Events</option>
                  <option value="announcement">📢 Announcements</option>
                </select>
              </div>

              <div className="filter-item">
                <TagIcon size={16} />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="filter-select-modern"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="blog-content-modern">
        <div className="container">
          {postsLoading ? (
            <div className="loading-modern">
              <div className="loading-spinner"></div>
              <p>Loading amazing content...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="empty-modern">
              <div className="empty-icon">📭</div>
              <h3>No posts found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              {/* Featured Post */}
              {featuredPost && (
                <motion.article
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="featured-card-modern"
                >
                  <Link to={`/blog/${featuredPost.slug}`} className="featured-link">
                    <div className="featured-image-modern">
                      {featuredPost.featured_image ? (
                        <img src={featuredPost.featured_image} alt={featuredPost.title} />
                      ) : (
                        <div className="featured-placeholder">
                          <div className="placeholder-icon">📰</div>
                        </div>
                      )}
                      <div className="featured-badge">⭐ Featured</div>
                    </div>
                    <div className="featured-content-modern">
                      <div className="featured-meta">
                        <span className="meta-item">
                          <Calendar size={14} />
                          {new Date(
                            featuredPost.published_at || featuredPost.created_at
                          ).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="meta-divider">•</span>
                        <span className="meta-item">
                          <User size={14} />
                          {featuredPost.author_name}
                        </span>
                        <span className="meta-divider">•</span>
                        <span className="meta-item">
                          <Clock size={14} />
                          {featuredPost.reading_time || 5} min read
                        </span>
                      </div>
                      <h2 className="featured-title">{featuredPost.title}</h2>
                      <p className="featured-excerpt">{featuredPost.excerpt}</p>
                      <div className="featured-cta">
                        <span>Read Full Story</span>
                        <ArrowRight size={20} />
                      </div>
                    </div>
                  </Link>
                </motion.article>
              )}

              {/* Posts Grid */}
              <div className="posts-grid-modern">
                {regularPosts.map((post, index) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="post-card-modern"
                  >
                    <Link to={`/blog/${post.slug}`} className="post-card-link">
                      <div className="post-image-modern">
                        {post.featured_image ? (
                          <img src={post.featured_image} alt={post.title} />
                        ) : (
                          <div className="post-placeholder">
                            <div className="placeholder-icon-small">
                              {post.post_type === 'event' ? '📅' : 
                               post.post_type === 'news' ? '📰' : '✍️'}
                            </div>
                          </div>
                        )}
                        {post.category_name && (
                          <div className="post-category-badge">
                            {post.category_name}
                          </div>
                        )}
                      </div>
                      <div className="post-card-content">
                        <div className="post-meta-modern">
                          <span className="meta-date">
                            <Calendar size={12} />
                            {new Date(
                              post.published_at || post.created_at
                            ).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                          <span className="meta-divider">•</span>
                          <span className="meta-author">{post.author_name}</span>
                        </div>
                        <h3 className="post-title-modern">{post.title}</h3>
                        {post.excerpt && (
                          <p className="post-excerpt-modern">{post.excerpt}</p>
                        )}
                        <div className="post-footer-modern">
                          <span className="read-more-modern">
                            Read More
                            <ArrowRight size={16} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Blog;