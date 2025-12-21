import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { contentAPI } from '../api/content';
import PostCard from '../components/blog/PostCard';
import PostFilters from '../components/blog/PostFilters';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import './Blog.css';

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [postType, setPostType] = useState('');

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => contentAPI.getCategories(),
  });

  // Fetch posts with filters
  const { data: postsData, isLoading: postsLoading, error: postsError } = useQuery({
    queryKey: ['posts', searchQuery, selectedCategory, postType],
    queryFn: () => contentAPI.getPosts({
      search: searchQuery,
      category: selectedCategory,
      post_type: postType,
    }),
  });

  if (postsLoading || categoriesLoading) return <Loading fullScreen />;
  if (postsError) {
    console.error('Error fetching posts:', postsError);
    return <ErrorMessage message="Failed to load blog posts" />;
  }

  // Handle paginated response - Check for 'results' first (DRF pagination)
  const categories = categoriesData?.results || categoriesData?.data || categoriesData || [];
  const posts = postsData?.results || postsData?.data || postsData || [];

  return (
    <div className="blog-page">
      {/* Hero Section */}
      <section className="page-hero">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="page-hero-content"
          >
            <h1>News & Blog</h1>
            <p>Stay updated with the latest from TBWS basketball community</p>
          </motion.div>
        </div>
      </section>

      {/* Blog Content */}
      <section className="section blog-section">
        <div className="container">
          <div className="blog-layout">
            {/* Sidebar Filters */}
            <aside className="blog-sidebar">
              <PostFilters
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                postType={postType}
                setPostType={setPostType}
              />
            </aside>

            {/* Posts Grid */}
            <div className="blog-content">
              {posts.length === 0 ? (
                <div className="no-posts">
                  <h3>No posts found</h3>
                  <p>Try adjusting your filters or search query</p>
                </div>
              ) : (
                <>
                  <div className="blog-header">
                    <h2>
                      {searchQuery ? `Search results for "${searchQuery}"` : 'All Posts'}
                    </h2>
                    <p className="post-count">{posts.length} posts found</p>
                  </div>

                  <div className="blog-grid">
                    {posts.map((post, index) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <PostCard post={post} />
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog;