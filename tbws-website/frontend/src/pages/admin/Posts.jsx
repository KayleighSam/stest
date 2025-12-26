import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Tag as TagIcon,
  Star,
  Pin,
  Filter,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { contentService } from '../../api/content';
import toast from 'react-hot-toast';
import './Posts.css';

const Posts = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Fetch posts
  const { data: postsData, isLoading } = useQuery({
    queryKey: ['admin-posts', statusFilter, typeFilter],
    queryFn: async () => {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.post_type = typeFilter;
      const response = await contentService.getPosts(params);
      return response.data;
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: contentService.deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-posts']);
      toast.success('Post deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to delete post');
    },
  });

  // Publish/Unpublish mutation
  const publishMutation = useMutation({
    mutationFn: ({ slug, action }) =>
      action === 'publish'
        ? contentService.publishPost(slug)
        : contentService.unpublishPost(slug),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-posts']);
      toast.success('Post updated successfully');
    },
    onError: () => {
      toast.error('Failed to update post');
    },
  });

  const posts = postsData?.results || postsData || [];

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (slug) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      deletePostMutation.mutate(slug);
    }
  };

  const handlePublishToggle = (post) => {
    const action = post.status === 'published' ? 'unpublish' : 'publish';
    publishMutation.mutate({ slug: post.slug, action });
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: { color: '#64748b', label: 'Draft' },
      published: { color: '#10b981', label: 'Published' },
      archived: { color: '#f59e0b', label: 'Archived' },
    };
    const badge = badges[status] || badges.draft;
    return (
      <span className="status-badge" style={{ background: badge.color }}>
        {badge.label}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const types = {
      news: { color: '#3b82f6', label: 'News' },
      event: { color: '#8b5cf6', label: 'Event' },
      blog: { color: '#ec4899', label: 'Blog' },
      announcement: { color: '#f59e0b', label: 'Announcement' },
    };
    const typeInfo = types[type] || types.news;
    return (
      <span className="type-badge" style={{ background: typeInfo.color }}>
        {typeInfo.label}
      </span>
    );
  };

  return (
    <div className="admin-posts">
      {/* Header */}
      <div className="posts-header">
        <div>
          <h1 className="posts-title">Posts Management</h1>
          <p className="posts-subtitle">
            Manage blog posts, news, events, and announcements
          </p>
        </div>
        <Link to="/admin/posts/create" className="btn-create">
          <Plus size={20} />
          <span>New Post</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="posts-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Types</option>
          <option value="news">News</option>
          <option value="blog">Blog</option>
          <option value="event">Event</option>
          <option value="announcement">Announcement</option>
        </select>
      </div>

      {/* Posts Table */}
      <div className="posts-table-container">
        {isLoading ? (
          <div className="loading-state">Loading posts...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="empty-state">
            <FileText size={64} />
            <h3>No posts found</h3>
            <p>Create your first post to get started</p>
            <Link to="/admin/posts/create" className="btn-create">
              <Plus size={20} />
              Create Post
            </Link>
          </div>
        ) : (
          <table className="posts-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Category</th>
                <th>Status</th>
                <th>Author</th>
                <th>Published</th>
                <th>Views</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((post, index) => (
                <motion.tr
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <td>
                    <div className="post-title-cell">
                      {post.is_featured && (
                        <Star size={14} className="featured-icon" />
                      )}
                      {post.is_pinned && (
                        <Pin size={14} className="pinned-icon" />
                      )}
                      <span>{post.title}</span>
                    </div>
                  </td>
                  <td>{getTypeBadge(post.post_type)}</td>
                  <td>
                    <span className="category-name">
                      {post.category_name || 'Uncategorized'}
                    </span>
                  </td>
                  <td>{getStatusBadge(post.status)}</td>
                  <td>{post.author_name}</td>
                  <td>
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString()
                      : '-'}
                  </td>
                  <td>
                    <div className="views-cell">
                      <Eye size={14} />
                      {post.views}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() =>
                          navigate(`/admin/posts/edit/${post.slug}`)
                        }
                        className="action-btn edit"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handlePublishToggle(post)}
                        className={`action-btn ${
                          post.status === 'published' ? 'unpublish' : 'publish'
                        }`}
                        title={
                          post.status === 'published' ? 'Unpublish' : 'Publish'
                        }
                      >
                        {post.status === 'published' ? '✓' : '○'}
                      </button>
                      <button
                        onClick={() => handleDelete(post.slug)}
                        className="action-btn delete"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Posts;