import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Mail,
  Search,
  Trash2,
  Download,
  UserX,
  Users,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { contentService } from '../../api/content';
import toast from 'react-hot-toast';
import './Newsletter.css';

const Newsletter = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmails, setSelectedEmails] = useState([]);

  // Fetch subscribers
  const { data: subscribersData, isLoading } = useQuery({
    queryKey: ['newsletter-subscribers'],
    queryFn: async () => {
      const response = await contentService.getSubscribers();
      return response.data;
    },
  });

  // Delete subscriber mutation
  const deleteSubscriberMutation = useMutation({
    mutationFn: contentService.deleteSubscriber,
    onSuccess: () => {
      queryClient.invalidateQueries(['newsletter-subscribers']);
      toast.success('Subscriber removed');
    },
    onError: () => {
      toast.error('Failed to remove subscriber');
    },
  });

  // Unsubscribe mutation
  const unsubscribeMutation = useMutation({
    mutationFn: contentService.unsubscribeSubscriber,
    onSuccess: () => {
      queryClient.invalidateQueries(['newsletter-subscribers']);
      toast.success('Subscriber unsubscribed');
    },
    onError: () => {
      toast.error('Failed to unsubscribe');
    },
  });

  const subscribers = subscribersData?.results || subscribersData || [];

  const filteredSubscribers = subscribers.filter((subscriber) =>
    subscriber.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (subscriber.name && subscriber.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const activeSubscribers = subscribers.filter(s => s.is_active);
  const inactiveSubscribers = subscribers.filter(s => !s.is_active);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to permanently delete this subscriber?')) {
      deleteSubscriberMutation.mutate(id);
    }
  };

  const handleUnsubscribe = (id) => {
    if (window.confirm('Are you sure you want to unsubscribe this user?')) {
      unsubscribeMutation.mutate(id);
    }
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Email', 'Name', 'Status', 'Subscribed Date'],
      ...filteredSubscribers.map(s => [
        s.email,
        s.name || '',
        s.is_active ? 'Active' : 'Unsubscribed',
        new Date(s.subscribed_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('CSV exported successfully');
  };

  const handleSelectEmail = (email) => {
    setSelectedEmails(prev => 
      prev.includes(email) 
        ? prev.filter(e => e !== email)
        : [...prev, email]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmails.length === filteredSubscribers.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(filteredSubscribers.map(s => s.email));
    }
  };

  const copySelectedEmails = () => {
    const emailList = selectedEmails.join(', ');
    navigator.clipboard.writeText(emailList);
    toast.success(`${selectedEmails.length} emails copied to clipboard`);
  };

  return (
    <div className="admin-newsletter">
      {/* Header */}
      <div className="newsletter-header">
        <div>
          <h1 className="newsletter-title">Newsletter Subscribers</h1>
          <p className="newsletter-subtitle">
            Manage your newsletter subscriber list
          </p>
        </div>
        <div className="header-actions">
          <button onClick={handleExportCSV} className="btn-export">
            <Download size={20} />
            <span>Export CSV</span>
          </button>
          {selectedEmails.length > 0 && (
            <button onClick={copySelectedEmails} className="btn-copy">
              <Mail size={20} />
              <span>Copy {selectedEmails.length} Emails</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="newsletter-stats">
        <div className="stat-card-newsletter">
          <div className="stat-icon total">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Subscribers</span>
            <span className="stat-value">{subscribers.length}</span>
          </div>
        </div>
        <div className="stat-card-newsletter">
          <div className="stat-icon active">
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Active</span>
            <span className="stat-value">{activeSubscribers.length}</span>
          </div>
        </div>
        <div className="stat-card-newsletter">
          <div className="stat-icon inactive">
            <XCircle size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Unsubscribed</span>
            <span className="stat-value">{inactiveSubscribers.length}</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="newsletter-search">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by email or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="newsletter-table-container">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading subscribers...</p>
          </div>
        ) : filteredSubscribers.length === 0 ? (
          <div className="empty-state">
            <Mail size={64} />
            <h3>No subscribers found</h3>
            <p>Newsletter subscribers will appear here</p>
          </div>
        ) : (
          <table className="newsletter-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedEmails.length === filteredSubscribers.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Email</th>
                <th>Name</th>
                <th>Status</th>
                <th>Subscribed Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscribers.map((subscriber, index) => (
                <motion.tr
                  key={subscriber.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedEmails.includes(subscriber.email)}
                      onChange={() => handleSelectEmail(subscriber.email)}
                    />
                  </td>
                  <td className="email-cell">{subscriber.email}</td>
                  <td className="name-cell">{subscriber.name || '-'}</td>
                  <td>
                    <span className={`status-badge ${subscriber.is_active ? 'active' : 'inactive'}`}>
                      {subscriber.is_active ? 'Active' : 'Unsubscribed'}
                    </span>
                  </td>
                  <td className="date-cell">
                    {new Date(subscriber.subscribed_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td>
                    <div className="action-buttons">
                      {subscriber.is_active && (
                        <button
                          onClick={() => handleUnsubscribe(subscriber.id)}
                          className="action-btn unsubscribe"
                          title="Unsubscribe"
                          disabled={unsubscribeMutation.isPending}
                        >
                          <UserX size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(subscriber.id)}
                        className="action-btn delete"
                        title="Delete"
                        disabled={deleteSubscriberMutation.isPending}
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

export default Newsletter;