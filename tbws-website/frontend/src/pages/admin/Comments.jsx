import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  MessageCircle,
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  Filter,
  ExternalLink,
  Mail,
} from 'lucide-react';
import { contentService } from '../../api/content';
import toast from 'react-hot-toast';
import './Comments.css';

const Comments = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('all');

  // Fetch ALL comments - backend returns all for admin
  const { data: commentsData, isLoading, error } = useQuery({
    queryKey: ['admin-comments'],
    queryFn: async () => {
      const response = await contentService.getComments();
      console.log('📊 Comments fetched:', response.data);
      return response.data;
    },
  });

  // Approve comment mutation
  const approveMutation = useMutation({
    mutationFn: contentService.approveComment,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-comments']);
      toast.success('✅ Comment approved', { duration: 3000 });
    },
    onError: (error) => {
      console.error('Approve error:', error);
      toast.error('❌ Failed to approve comment');
    },
  });

  // Unapprove comment mutation
  const unapproveMutation = useMutation({
    mutationFn: contentService.unapproveComment,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-comments']);
      toast.success('⏳ Comment set to pending', { duration: 3000 });
    },
    onError: (error) => {
      console.error('Unapprove error:', error);
      toast.error('❌ Failed to change status');
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: contentService.deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-comments']);
      toast.success('🗑️ Comment deleted', { duration: 3000 });
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast.error('❌ Failed to delete');
    },
  });

  const allComments = commentsData?.results || commentsData || [];

  // Filter by approval status
  const filteredByApproval = 
    approvalFilter === 'all'
      ? allComments
      : approvalFilter === 'approved'
      ? allComments.filter(c => c.is_approved === true)
      : allComments.filter(c => c.is_approved === false);

  // Then filter by search query
  const filteredComments = filteredByApproval.filter((comment) =>
    comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    comment.author_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (comment.post_title && comment.post_title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDelete = (id, authorName) => {
    if (window.confirm(`Delete ${authorName}'s comment permanently?\n\nThis cannot be undone.`)) {
      deleteCommentMutation.mutate(id);
    }
  };

  const handleToggleApproval = (comment) => {
    if (comment.is_approved) {
      unapproveMutation.mutate(comment.id);
    } else {
      approveMutation.mutate(comment.id);
    }
  };

  // Calculate stats
  const totalComments = allComments.length;
  const approvedCount = allComments.filter(c => c.is_approved).length;
  const pendingCount = allComments.filter(c => !c.is_approved).length;

  return (
    <div className="admin-comments">
      {/* Header */}
      <div className="comments-header">
        <div>
          <h1 className="comments-title">Comments Moderation</h1>
          <p className="comments-subtitle">
            Manage all user comments • {totalComments} total
          </p>
        </div>
        <div className="comments-stats">
          <div className="stat-card total">
            <span className="stat-label">Total</span>
            <span className="stat-value">{totalComments}</span>
          </div>
          <div className="stat-card approved">
            <span className="stat-label">Approved</span>
            <span className="stat-value">{approvedCount}</span>
          </div>
          <div className="stat-card pending">
            <span className="stat-label">Pending</span>
            <span className="stat-value">{pendingCount}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="comments-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search comments, authors, or posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-item">
          <Filter size={16} />
          <select
            value={approvalFilter}
            onChange={(e) => setApprovalFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Comments ({totalComments})</option>
            <option value="approved">✓ Approved ({approvedCount})</option>
            <option value="pending">⏳ Pending ({pendingCount})</option>
          </select>
        </div>
      </div>

      {/* Comments List */}
      <div className="comments-list-container">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading comments...</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <MessageCircle size={64} />
            <h3>Error loading comments</h3>
            <p>{error.message}</p>
          </div>
        ) : filteredComments.length === 0 ? (
          <div className="empty-state">
            <MessageCircle size={64} />
            <h3>No comments found</h3>
            <p>
              {searchQuery || approvalFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Comments will appear here when users leave them on posts'}
            </p>
          </div>
        ) : (
          <div className="comments-grid">
            {filteredComments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`comment-card ${comment.is_approved ? 'approved' : 'pending'}`}
              >
                <div className="comment-card-header">
                  <div className="comment-author-info">
                    <div className="author-avatar-small">
                      {comment.author_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="author-name-small">{comment.author_name}</h4>
                      <p className="comment-date">
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
                  <div className={`approval-badge ${comment.is_approved ? 'approved' : 'pending'}`}>
                    {comment.is_approved ? '✓ Approved' : '⏳ Pending'}
                  </div>
                </div>

                {comment.post_title && (
                  <div className="comment-post-title">
                    <Eye size={14} />
                    <span>On: {comment.post_title}</span>
                    {comment.post_slug && (
                      <Link 
                        to={`/blog/${comment.post_slug}`} 
                        className="view-post-link"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View post"
                      >
                        <ExternalLink size={12} />
                      </Link>
                    )}
                  </div>
                )}

                <p className="comment-content-text">{comment.content}</p>

                {comment.guest_email && (
                  <p className="comment-email">
                    <Mail size={12} />
                    <span>{comment.guest_email}</span>
                  </p>
                )}

                <div className="comment-actions">
                  <button
                    onClick={() => handleToggleApproval(comment)}
                    className={`action-btn ${comment.is_approved ? 'unapprove' : 'approve'}`}
                    title={comment.is_approved ? 'Set to Pending' : 'Approve'}
                    disabled={approveMutation.isPending || unapproveMutation.isPending}
                  >
                    {comment.is_approved ? (
                      <>
                        <XCircle size={16} />
                        <span>Set Pending</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        <span>Approve</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(comment.id, comment.author_name)}
                    className="action-btn delete"
                    title="Delete Permanently"
                    disabled={deleteCommentMutation.isPending}
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

      {/* Results Summary */}
      {!isLoading && !error && filteredComments.length > 0 && (
        <div className="results-summary">
          Showing {filteredComments.length} of {totalComments} comments
        </div>
      )}
    </div>
  );
};

export default Comments;