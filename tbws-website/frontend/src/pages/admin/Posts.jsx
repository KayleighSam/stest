import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Star,
  Pin,
  CheckCircle,
  Circle,
  MessageCircle,
  X,
  Mail,
  Clock,
  Filter,
  XCircle,
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
  const [selectedPost, setSelectedPost] = useState(null);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [commentSearchQuery, setCommentSearchQuery] = useState('');
  const [commentApprovalFilter, setCommentApprovalFilter] = useState('all');

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

  // Fetch comments for selected post
  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ['post-comments', selectedPost?.id],
    queryFn: async () => {
      if (!selectedPost) return [];
      const response = await contentService.getComments({ post: selectedPost.id });
      return response.data;
    },
    enabled: !!selectedPost,
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
    onError: (error) => {
      console.error('Publish error:', error);
      toast.error('Failed to update post status');
    },
  });

  // Approve comment mutation
  const approveCommentMutation = useMutation({
    mutationFn: contentService.approveComment,
    onSuccess: () => {
      queryClient.invalidateQueries(['post-comments', selectedPost?.id]);
      queryClient.invalidateQueries(['admin-posts']);
      toast.success('✅ Comment approved');
    },
    onError: () => {
      toast.error('❌ Failed to approve comment');
    },
  });

  // Unapprove comment mutation
  const unapproveCommentMutation = useMutation({
    mutationFn: contentService.unapproveComment,
    onSuccess: () => {
      queryClient.invalidateQueries(['post-comments', selectedPost?.id]);
      queryClient.invalidateQueries(['admin-posts']);
      toast.success('⏳ Comment set to pending');
    },
    onError: () => {
      toast.error('❌ Failed to change status');
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: contentService.deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries(['post-comments', selectedPost?.id]);
      queryClient.invalidateQueries(['admin-posts']);
      toast.success('🗑️ Comment deleted');
    },
    onError: () => {
      toast.error('❌ Failed to delete comment');
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

  const handleViewComments = (post) => {
    setSelectedPost(post);
    setShowCommentsModal(true);
    setCommentSearchQuery('');
    setCommentApprovalFilter('all');
  };

  const handleCloseCommentsModal = () => {
    setShowCommentsModal(false);
    setSelectedPost(null);
  };

  const handleToggleCommentApproval = (comment) => {
    if (comment.is_approved) {
      unapproveCommentMutation.mutate(comment.id);
    } else {
      approveCommentMutation.mutate(comment.id);
    }
  };

  const handleDeleteComment = (id, authorName) => {
    if (window.confirm(`Delete ${authorName}'s comment permanently?\n\nThis cannot be undone.`)) {
      deleteCommentMutation.mutate(id);
    }
  };

  // Filter comments
  const allComments = commentsData?.results || commentsData || [];
  const filteredCommentsByApproval =
    commentApprovalFilter === 'all'
      ? allComments
      : commentApprovalFilter === 'approved'
      ? allComments.filter(c => c.is_approved === true)
      : allComments.filter(c => c.is_approved === false);

  const filteredComments = filteredCommentsByApproval.filter((comment) =>
    comment.content.toLowerCase().includes(commentSearchQuery.toLowerCase()) ||
    comment.author_name.toLowerCase().includes(commentSearchQuery.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const badges = {
      draft: { color: '#64748b', label: 'Draft' },
      published: { color: '#10b981', label: 'Published' },
      archived: { color: '#f59e0b', label: 'Archived' },
    };
    const badge = badges[status] || badges.draft;
    return (
      <span className="status-badge" style={{ backgroundColor: badge.color }}>
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
      <span className="type-badge" style={{ backgroundColor: typeInfo.color }}>
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

      {/* Posts Cards */}
      <div className="posts-cards-container">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading posts...</p>
          </div>
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
          <div className="posts-grid">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="post-card"
              >
                {/* Card Header */}
                <div className="post-card-header">
                  <div className="post-badges">
                    {getTypeBadge(post.post_type)}
                    {getStatusBadge(post.status)}
                  </div>
                  <div className="post-icons">
                    {post.is_featured && (
                      <Star size={16} fill="#fbbf24" color="#fbbf24" title="Featured" />
                    )}
                    {post.is_pinned && (
                      <Pin size={16} fill="#ef4444" color="#ef4444" title="Pinned" />
                    )}
                  </div>
                </div>

                {/* Card Image */}
                {post.featured_image && (
                  <div className="post-card-image">
                    <img src={post.featured_image} alt={post.title} />
                  </div>
                )}

                {/* Card Content */}
                <div className="post-card-content">
                  <h3 className="post-card-title">{post.title}</h3>
                  {post.excerpt && (
                    <p className="post-card-excerpt">{post.excerpt}</p>
                  )}

                  {/* Meta Info */}
                  <div className="post-card-meta">
                    <div className="meta-item">
                      <span className="meta-label">Category:</span>
                      <span className="meta-value">
                        {post.category?.name || post.category_name || 'Uncategorized'}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Author:</span>
                      <span className="meta-value">
                        {post.author?.first_name || post.author_name || 'Unknown'}
                      </span>
                    </div>
                    {post.published_at && (
                      <div className="meta-item">
                        <span className="meta-label">Published:</span>
                        <span className="meta-value">
                          {new Date(post.published_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="post-card-stats">
                    <div className="stat-item">
                      <Eye size={16} />
                      <span>{post.views || 0} views</span>
                    </div>
                    <button
                      className="stat-item stat-button"
                      onClick={() => handleViewComments(post)}
                    >
                      <MessageCircle size={16} />
                      <span>{post.comment_count || 0} comments</span>
                    </button>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="post-card-actions">
                  <button
                    onClick={() => navigate(`/admin/posts/edit/${post.slug}`)}
                    className="card-action-btn edit"
                    title="Edit"
                  >
                    <Edit size={16} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handlePublishToggle(post)}
                    className={`card-action-btn ${
                      post.status === 'published' ? 'published' : 'draft'
                    }`}
                    title={post.status === 'published' ? 'Unpublish' : 'Publish'}
                    disabled={publishMutation.isPending}
                  >
                    {post.status === 'published' ? (
                      <CheckCircle size={16} />
                    ) : (
                      <Circle size={16} />
                    )}
                    <span>{post.status === 'published' ? 'Published' : 'Publish'}</span>
                  </button>
                  <button
                    onClick={() => handleDelete(post.slug)}
                    className="card-action-btn delete"
                    title="Delete"
                    disabled={deletePostMutation.isPending}
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Comments Modal */}
      <AnimatePresence>
        {showCommentsModal && selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={handleCloseCommentsModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="modal-content comments-modal"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="modal-header">
                <div>
                  <h2>Comments on "{selectedPost.title}"</h2>
                  <p className="modal-subtitle">
                    {allComments.length} total • {allComments.filter(c => c.is_approved).length} approved • {allComments.filter(c => !c.is_approved).length} pending
                  </p>
                </div>
                <button onClick={handleCloseCommentsModal} className="modal-close">
                  <X size={24} />
                </button>
              </div>

              {/* Modal Filters */}
              <div className="modal-filters">
                <div className="search-box-small">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search comments..."
                    value={commentSearchQuery}
                    onChange={(e) => setCommentSearchQuery(e.target.value)}
                  />
                </div>
                <div className="filter-item-small">
                  <Filter size={14} />
                  <select
                    value={commentApprovalFilter}
                    onChange={(e) => setCommentApprovalFilter(e.target.value)}
                    className="filter-select-small"
                  >
                    <option value="all">All ({allComments.length})</option>
                    <option value="approved">✓ Approved ({allComments.filter(c => c.is_approved).length})</option>
                    <option value="pending">⏳ Pending ({allComments.filter(c => !c.is_approved).length})</option>
                  </select>
                </div>
              </div>

              {/* Modal Body */}
              <div className="modal-body">
                {commentsLoading ? (
                  <div className="loading-state-small">
                    <div className="loading-spinner-small"></div>
                    <p>Loading comments...</p>
                  </div>
                ) : filteredComments.length === 0 ? (
                  <div className="empty-state-small">
                    <MessageCircle size={48} />
                    <h3>No comments found</h3>
                    <p>
                      {commentSearchQuery || commentApprovalFilter !== 'all'
                        ? 'Try adjusting your filters'
                        : 'No comments on this post yet'}
                    </p>
                  </div>
                ) : (
                  <div className="comments-list-modal">
                    {filteredComments.map((comment) => (
                      <div
                        key={comment.id}
                        className={`comment-card-modal ${comment.is_approved ? 'approved' : 'pending'}`}
                      >
                        <div className="comment-modal-header">
                          <div className="comment-author-info-modal">
                            <div className="author-avatar-modal">
                              {comment.author_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4>{comment.author_name}</h4>
                              <p className="comment-date-modal">
                                <Clock size={12} />
                                {new Date(comment.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                          <div className={`approval-badge-modal ${comment.is_approved ? 'approved' : 'pending'}`}>
                            {comment.is_approved ? '✓ Approved' : '⏳ Pending'}
                          </div>
                        </div>

                        <p className="comment-content-modal">{comment.content}</p>

                        {comment.guest_email && (
                          <p className="comment-email-modal">
                            <Mail size={12} />
                            {comment.guest_email}
                          </p>
                        )}

                        <div className="comment-actions-modal">
                          <button
                            onClick={() => handleToggleCommentApproval(comment)}
                            className={`action-btn-modal ${comment.is_approved ? 'unapprove' : 'approve'}`}
                            disabled={
                              approveCommentMutation.isPending ||
                              unapproveCommentMutation.isPending
                            }
                          >
                            {comment.is_approved ? (
                              <>
                                <XCircle size={14} />
                                <span>Set Pending</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle size={14} />
                                <span>Approve</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id, comment.author_name)}
                            className="action-btn-modal delete"
                            disabled={deleteCommentMutation.isPending}
                          >
                            <Trash2 size={14} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Posts;