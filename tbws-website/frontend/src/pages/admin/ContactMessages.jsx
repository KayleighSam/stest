import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Phone,
  Clock,
  Check,
  Trash2,
  Search,
  AlertCircle,
  X,
  Send,
  MessageSquare,
  Edit3,
} from 'lucide-react';
import { contentService } from '../../api/content';
import toast from 'react-hot-toast';
import './ContactMessages.css';

const ContactMessages = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyNotes, setReplyNotes] = useState('');

  // Fetch messages
  const { data: messagesData, isLoading, error } = useQuery({
    queryKey: ['admin-messages', statusFilter, typeFilter],
    queryFn: async () => {
      const params = {};
      if (statusFilter === 'unread') params.is_read = false;
      if (statusFilter === 'read') params.is_read = true;
      if (statusFilter === 'replied') params.is_replied = true;
      if (typeFilter) params.inquiry_type = typeFilter;
      
      const response = await contentService.getMessages(params);
      return response.data;
    },
  });

  // Mark as read mutation
  const markReadMutation = useMutation({
    mutationFn: contentService.markMessageRead,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-messages']);
      toast.success('Message marked as read');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to mark as read');
    },
  });

  // Mark as replied mutation
  const markRepliedMutation = useMutation({
    mutationFn: ({ id, notes }) => contentService.markMessageReplied(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-messages']);
      toast.success('Message marked as replied');
      setShowReplyModal(false);
      setSelectedMessage(null);
      setReplyNotes('');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to mark as replied');
    },
  });

  // Update notes mutation
  const updateNotesMutation = useMutation({
    mutationFn: ({ id, notes }) => contentService.updateMessageNotes(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-messages']);
      toast.success('Notes updated successfully');
      setShowReplyModal(false);
      setSelectedMessage(null);
      setReplyNotes('');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to update notes');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: contentService.deleteMessage,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-messages']);
      toast.success('Message deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to delete message');
    },
  });

  const messages = messagesData?.results || messagesData || [];

  const filteredMessages = messages.filter((msg) =>
    msg.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleOpenReplyModal = (message) => {
    setSelectedMessage(message);
    setReplyNotes(message.notes || '');
    setShowReplyModal(true);
  };

  const handleReply = () => {
    if (!selectedMessage) return;
    
    markRepliedMutation.mutate({
      id: selectedMessage.id,
      notes: replyNotes,
    });
  };

  const handleUpdateNotes = () => {
    if (!selectedMessage) return;
    
    updateNotesMutation.mutate({
      id: selectedMessage.id,
      notes: replyNotes,
    });
  };

  const getStatusBadge = (message) => {
    if (message.is_replied) {
      return <span className="status-badge replied">Replied</span>;
    }
    if (message.is_read) {
      return <span className="status-badge read">Read</span>;
    }
    return <span className="status-badge new">New</span>;
  };

  const getTypeBadge = (type) => {
    const types = {
      general: { color: '#64748b', label: 'General' },
      membership: { color: '#3b82f6', label: 'Membership' },
      sponsorship: { color: '#10b981', label: 'Sponsorship' },
      media: { color: '#8b5cf6', label: 'Media' },
      other: { color: '#f59e0b', label: 'Other' },
    };
    const typeInfo = types[type] || types.general;
    return (
      <span className="type-badge" style={{ background: typeInfo.color }}>
        {typeInfo.label}
      </span>
    );
  };

  if (error) {
    return (
      <div className="admin-messages">
        <div className="error-state">
          <AlertCircle size={64} />
          <h3>Failed to load messages</h3>
          <p>{error.response?.data?.detail || error.message}</p>
          <button onClick={() => window.location.reload()} className="btn-retry">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-messages">
      {/* Header */}
      <div className="messages-header">
        <div>
          <h1 className="messages-title">Contact Messages</h1>
          <p className="messages-subtitle">
            Manage inquiries from your website ({messages.length} total)
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="messages-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search messages..."
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
          <option value="unread">Unread</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Types</option>
          <option value="general">General</option>
          <option value="membership">Membership</option>
          <option value="sponsorship">Sponsorship</option>
          <option value="media">Media</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Messages List */}
      <div className="messages-list">
        {isLoading ? (
          <div className="loading-state">Loading messages...</div>
        ) : filteredMessages.length === 0 ? (
          <div className="empty-state">
            <Mail size={64} />
            <h3>No messages found</h3>
            <p>Contact messages will appear here when visitors submit the contact form</p>
          </div>
        ) : (
          filteredMessages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`message-card ${!message.is_read ? 'unread' : ''}`}
            >
              <div className="message-header-row">
                <div className="message-sender">
                  <h3>{message.name}</h3>
                  <div className="message-meta">
                    <span className="email">
                      <Mail size={14} />
                      {message.email}
                    </span>
                    {message.phone && (
                      <span className="phone">
                        <Phone size={14} />
                        {message.phone}
                      </span>
                    )}
                  </div>
                </div>
                <div className="message-badges">
                  {getTypeBadge(message.inquiry_type)}
                  {getStatusBadge(message)}
                </div>
              </div>

              <div className="message-subject">
                <strong>Subject:</strong> {message.subject}
              </div>

              <div className="message-body">{message.message}</div>

              {message.notes && (
                <div className="message-notes">
                  <MessageSquare size={14} />
                  <strong>Internal Notes:</strong> {message.notes}
                </div>
              )}

              {message.is_replied && message.replied_at && (
                <div className="reply-info">
                  <Check size={14} />
                  Replied by {message.replied_by_name} on{' '}
                  {new Date(message.replied_at).toLocaleString()}
                </div>
              )}

              <div className="message-footer">
                <div className="message-time">
                  <Clock size={14} />
                  {new Date(message.created_at).toLocaleString()}
                </div>

                <div className="message-actions">
                  {!message.is_read && (
                    <button
                      onClick={() => markReadMutation.mutate(message.id)}
                      className="action-btn read"
                      title="Mark as read"
                      disabled={markReadMutation.isPending}
                    >
                      <Check size={16} />
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleOpenReplyModal(message)}
                    className={`action-btn ${message.is_replied ? 'edit-notes' : 'reply'}`}
                    title={message.is_replied ? 'Edit notes' : 'Reply & add notes'}
                  >
                    {message.is_replied ? <Edit3 size={16} /> : <Send size={16} />}
                  </button>

                  <button
                    onClick={() => handleDelete(message.id)}
                    className="action-btn delete"
                    title="Delete"
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Reply Modal */}
      <AnimatePresence>
        {showReplyModal && selectedMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => {
              setShowReplyModal(false);
              setSelectedMessage(null);
              setReplyNotes('');
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="modal-content reply-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>
                  {selectedMessage.is_replied ? 'Edit Notes' : 'Reply to Message'}
                </h2>
                <button
                  onClick={() => {
                    setShowReplyModal(false);
                    setSelectedMessage(null);
                    setReplyNotes('');
                  }}
                  className="modal-close"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="modal-body">
                {/* Message Details */}
                <div className="message-details">
                  <div className="detail-row">
                    <strong>From:</strong> {selectedMessage.name} ({selectedMessage.email})
                  </div>
                  <div className="detail-row">
                    <strong>Subject:</strong> {selectedMessage.subject}
                  </div>
                  <div className="detail-row">
                    <strong>Type:</strong> {selectedMessage.inquiry_type}
                  </div>
                  <div className="detail-row message-text">
                    <strong>Message:</strong>
                    <p>{selectedMessage.message}</p>
                  </div>
                </div>

                {/* Reply Instructions */}
                <div className="reply-instructions">
                  <p>
                    <strong>Note:</strong> After clicking "Mark as Replied", make sure to 
                    respond to <strong>{selectedMessage.email}</strong> via your email client.
                  </p>
                </div>

                {/* Internal Notes */}
                <div className="form-group">
                  <label>Internal Notes (Optional)</label>
                  <textarea
                    value={replyNotes}
                    onChange={(e) => setReplyNotes(e.target.value)}
                    placeholder="Add any internal notes about this message or your response..."
                    rows={4}
                    className="notes-textarea"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  onClick={() => {
                    setShowReplyModal(false);
                    setSelectedMessage(null);
                    setReplyNotes('');
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                
                {selectedMessage.is_replied ? (
                  <button
                    onClick={handleUpdateNotes}
                    disabled={updateNotesMutation.isPending}
                    className="btn-primary"
                  >
                    {updateNotesMutation.isPending ? 'Updating...' : 'Update Notes'}
                  </button>
                ) : (
                  <button
                    onClick={handleReply}
                    disabled={markRepliedMutation.isPending}
                    className="btn-primary"
                  >
                    {markRepliedMutation.isPending ? 'Marking...' : 'Mark as Replied'}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContactMessages;