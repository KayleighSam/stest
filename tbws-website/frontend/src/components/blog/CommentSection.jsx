import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, User as UserIcon, Clock, AlertCircle } from 'lucide-react';
import { contentService } from '../../api/content';
import toast from 'react-hot-toast';
import './CommentSection.css';

const CommentSection = ({ postSlug, postId }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    guest_name: '',
    guest_email: '',
    content: '',
  });

  // Fetch approved comments only (public view)
  const { data: commentsData, isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const response = await contentService.getComments({ post: postId, is_approved: true });
      return response.data;
    },
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: contentService.createComment,
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', postId]);
      setFormData({ guest_name: '', guest_email: '', content: '' });
      toast.success(
        '✅ Comment submitted! It will appear after admin approval.',
        { duration: 6000 }
      );
    },
    onError: (error) => {
      console.error('Comment error:', error);
      const errorMessage = 
        error.response?.data?.detail || 
        error.response?.data?.content?.[0] ||
        error.response?.data?.guest_email?.[0] ||
        error.response?.data?.guest_name?.[0] ||
        'Failed to submit comment. Please try again.';
      toast.error(errorMessage);
    },
  });

  const comments = commentsData?.results || commentsData || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.content.trim()) {
      toast.error('Please write a comment');
      return;
    }

    if (!formData.guest_name.trim()) {
      toast.error('Please provide your name');
      return;
    }

    if (!formData.guest_email.trim()) {
      toast.error('Please provide your email');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.guest_email)) {
      toast.error('Please provide a valid email address');
      return;
    }

    // Submit comment
    createCommentMutation.mutate({
      post: postId,
      guest_name: formData.guest_name.trim(),
      guest_email: formData.guest_email.trim(),
      content: formData.content.trim(),
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section className="comment-section-modern">
      <div className="comments-header">
        <MessageCircle size={28} />
        <h2>Comments ({comments.length})</h2>
      </div>

      {/* Comment Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="comment-form-card"
      >
        <h3>Leave a Comment</h3>
        <div className="comment-form-note">
          <AlertCircle size={16} />
          <span>Your comment will be reviewed by our team before being published</span>
        </div>
        <form onSubmit={handleSubmit} className="comment-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="guest_name">Name *</label>
              <input
                type="text"
                id="guest_name"
                name="guest_name"
                value={formData.guest_name}
                onChange={handleChange}
                placeholder="Your name"
                required
                maxLength={100}
              />
            </div>
            <div className="form-group">
              <label htmlFor="guest_email">Email *</label>
              <input
                type="email"
                id="guest_email"
                name="guest_email"
                value={formData.guest_email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
                maxLength={254}
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="content">Comment *</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Share your thoughts..."
              rows="5"
              required
              maxLength={1000}
            />
            <div className="character-count">
              {formData.content.length} / 1000 characters
            </div>
          </div>
          <button
            type="submit"
            className="submit-comment-btn"
            disabled={createCommentMutation.isPending}
          >
            {createCommentMutation.isPending ? (
              <>
                <div className="spinner-small"></div>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>Post Comment</span>
              </>
            )}
          </button>
        </form>
      </motion.div>

      {/* Comments List - Only Approved Comments */}
      <div className="comments-list-modern">
        {isLoading ? (
          <div className="comments-loading">
            <div className="loading-spinner"></div>
            <p>Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="no-comments">
            <MessageCircle size={48} />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <AnimatePresence>
            {comments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="comment-card-modern"
              >
                <div className="comment-avatar">
                  <UserIcon size={24} />
                </div>
                <div className="comment-content-wrapper">
                  <div className="comment-header">
                    <h4 className="comment-author">{comment.author_name}</h4>
                    <div className="comment-meta">
                      <Clock size={14} />
                      <span>
                        {new Date(comment.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                  <p className="comment-text">{comment.content}</p>
                  
                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="comment-replies">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="reply-card">
                          <div className="reply-avatar">
                            <UserIcon size={18} />
                          </div>
                          <div className="reply-content">
                            <div className="reply-header">
                              <h5>{reply.author_name}</h5>
                              <span className="reply-date">
                                {new Date(reply.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p>{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </section>
  );
};

export default CommentSection;