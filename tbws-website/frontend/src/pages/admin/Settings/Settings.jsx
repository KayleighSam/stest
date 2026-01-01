import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Settings as SettingsIcon,
  Users,
  History,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Loader2,
  Search,
  Shield,
  UserCheck,
  UserX,
  Ban,
  Clock,
  Mail,
  Phone,
} from 'lucide-react';
import usersService from '../../../api/users';
import toast from 'react-hot-toast';
import './settings2.css';

const Settings = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('users');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userFormData, setUserFormData] = useState({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'player',
    password: '',
    password_confirm: '',
  });

  // Fetch users
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await usersService.getUsers();
      console.log('✅ Users Response:', response.data);
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    },
  });

  // Fetch login history
  const { data: loginHistoryData, isLoading: historyLoading } = useQuery({
    queryKey: ['admin-login-history'],
    queryFn: async () => {
      const response = await usersService.getLoginHistory();
      console.log('✅ Login History Response:', response.data);
      return response.data.results || [];
    },
    enabled: activeTab === 'history',
  });

  const users = usersData || [];
  const loginHistory = loginHistoryData || [];

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (data) => usersService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      toast.success('✅ User created successfully');
      closeUserModal();
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.email?.[0] || 
                       error.response?.data?.username?.[0] ||
                       error.response?.data?.detail || 
                       'Failed to create user';
      toast.error(`❌ ${errorMsg}`);
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }) => usersService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      toast.success('✅ User updated successfully');
      closeUserModal();
    },
    onError: (error) => {
      toast.error(`❌ ${error.response?.data?.detail || 'Failed to update user'}`);
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (id) => usersService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      toast.success('✅ User deleted successfully');
    },
    onError: (error) => {
      toast.error(`❌ ${error.response?.data?.detail || 'Failed to delete user'}`);
    },
  });

  // Change role mutation
  const changeRoleMutation = useMutation({
    mutationFn: ({ id, role }) => usersService.changeUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      toast.success('✅ User role updated');
    },
    onError: (error) => {
      toast.error(`❌ ${error.response?.data?.detail || 'Failed to change role'}`);
    },
  });

  // Status mutations
  const activateUserMutation = useMutation({
    mutationFn: (id) => usersService.activateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      toast.success('✅ User activated');
    },
  });

  const deactivateUserMutation = useMutation({
    mutationFn: (id) => usersService.deactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      toast.success('✅ User deactivated');
    },
  });

  const suspendUserMutation = useMutation({
    mutationFn: (id) => usersService.suspendUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      toast.success('✅ User suspended');
    },
  });

  const openUserModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setUserFormData({
        email: user.email || '',
        username: user.username || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        role: user.role || 'player',
        password: '',
        password_confirm: '',
      });
    } else {
      setEditingUser(null);
      setUserFormData({
        email: '',
        username: '',
        first_name: '',
        last_name: '',
        phone: '',
        role: 'player',
        password: '',
        password_confirm: '',
      });
    }
    setIsUserModalOpen(true);
  };

  const closeUserModal = () => {
    setIsUserModalOpen(false);
    setEditingUser(null);
    setUserFormData({
      email: '',
      username: '',
      first_name: '',
      last_name: '',
      phone: '',
      role: 'player',
      password: '',
      password_confirm: '',
    });
  };

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUserSubmit = (e) => {
    e.preventDefault();

    if (!userFormData.email.trim()) {
      toast.error('❌ Email is required');
      return;
    }

    if (!editingUser && !userFormData.password) {
      toast.error('❌ Password is required for new users');
      return;
    }

    if (!editingUser && userFormData.password !== userFormData.password_confirm) {
      toast.error('❌ Passwords do not match');
      return;
    }

    const submitData = { ...userFormData };
    if (editingUser) {
      delete submitData.password;
      delete submitData.password_confirm;
      delete submitData.email; // Cannot change email
    }

    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser.id, data: submitData });
    } else {
      createUserMutation.mutate(submitData);
    }
  };

  const handleDeleteUser = (id, email) => {
    if (window.confirm(`Are you sure you want to delete user "${email}"?`)) {
      deleteUserMutation.mutate(id);
    }
  };

  const handleChangeRole = (id, currentRole) => {
    const newRole = prompt(
      `Change role for user (current: ${currentRole})\nOptions: player, manager, admin, super_admin`,
      currentRole
    );
    
    if (newRole && newRole !== currentRole) {
      changeRoleMutation.mutate({ id, role: newRole });
    }
  };

  const getStatusBadge = (user) => {
    if (user.status === 'suspended') {
      return <span className="badge-suspended"><Ban size={14} />Suspended</span>;
    }
    if (user.status === 'inactive' || !user.is_active) {
      return <span className="badge-inactive"><UserX size={14} />Inactive</span>;
    }
    return <span className="badge-active"><UserCheck size={14} />Active</span>;
  };

  const getRoleBadge = (role) => {
    const badges = {
      player: <span className="role-badge role-player">Player</span>,
      manager: <span className="role-badge role-manager">Manager</span>,
      admin: <span className="role-badge role-admin">Admin</span>,
      super_admin: <span className="role-badge role-super-admin">Super Admin</span>,
    };
    return badges[role] || <span className="role-badge">Unknown</span>;
  };

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="settings-page">
      {/* Header */}
      <div className="settings-header">
        <div>
          <h1 className="settings-title">
            <SettingsIcon size={32} />
            System Settings
          </h1>
          <p className="settings-subtitle">Manage users and view system activity</p>
        </div>
        {activeTab === 'users' && (
          <button onClick={() => openUserModal()} className="btn-add-user">
            <Plus size={20} />
            <span>Add User</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="settings-tabs">
        <button
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={20} />
          <span>Users Management ({users.length})</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <History size={20} />
          <span>Login History</span>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'users' ? (
        <div className="users-section">
          {/* Search Bar */}
          <div className="users-search-bar">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search users by email, name, or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Users Table */}
          {usersLoading ? (
            <div className="loading-state">
              <Loader2 className="loading-spinner" size={48} />
              <p>Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="empty-state">
              <Users size={64} />
              <h3>No Users Found</h3>
              <p>
                {searchQuery
                  ? 'Try adjusting your search terms'
                  : 'Get started by adding your first user'}
              </p>
            </div>
          ) : (
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-info">
                          <div className="user-avatar">
                            {user.first_name?.[0]}{user.last_name?.[0]}
                          </div>
                          <div>
                            <div className="user-name">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="user-username">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="user-email">
                          <Mail size={14} />
                          {user.email}
                        </div>
                      </td>
                      <td>{getRoleBadge(user.role)}</td>
                      <td>{getStatusBadge(user)}</td>
                      <td>
                        <div className="user-date">
                          <Clock size={14} />
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <div className="user-actions">
                          <button
                            onClick={() => openUserModal(user)}
                            className="btn-action btn-edit"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleChangeRole(user.id, user.role)}
                            className="btn-action btn-role"
                            title="Change Role"
                          >
                            <Shield size={16} />
                          </button>
                          {user.status === 'active' ? (
                            <button
                              onClick={() => deactivateUserMutation.mutate(user.id)}
                              className="btn-action btn-deactivate"
                              title="Deactivate"
                            >
                              <UserX size={16} />
                            </button>
                          ) : (
                            <button
                              onClick={() => activateUserMutation.mutate(user.id)}
                              className="btn-action btn-activate"
                              title="Activate"
                            >
                              <UserCheck size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteUser(user.id, user.email)}
                            className="btn-action btn-delete"
                            title="Delete"
                            disabled={deleteUserMutation.isPending}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="history-section">
          {historyLoading ? (
            <div className="loading-state">
              <Loader2 className="loading-spinner" size={48} />
              <p>Loading login history...</p>
            </div>
          ) : loginHistory.length === 0 ? (
            <div className="empty-state">
              <History size={64} />
              <h3>No Login History</h3>
              <p>Login history will appear here</p>
            </div>
          ) : (
            <div className="history-list">
              {loginHistory.map((entry, index) => (
                <div key={index} className="history-item">
                  <div className="history-icon">
                    <UserCheck size={20} />
                  </div>
                  <div className="history-details">
                    <div className="history-time">
                      {new Date(entry.login_time).toLocaleString()}
                    </div>
                    <div className="history-info">
                      <span>IP: {entry.ip_address || 'Unknown'}</span>
                      {entry.location && <span>• {entry.location}</span>}
                    </div>
                    {entry.user_agent && (
                      <div className="history-agent">{entry.user_agent}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* User Modal */}
      {isUserModalOpen && (
        <div className="modal-overlay" onClick={closeUserModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <Users size={24} />
                {editingUser ? 'Edit User' : 'Add New User'}
              </h2>
              <button onClick={closeUserModal} className="btn-close">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUserSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="first_name">
                    First Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={userFormData.first_name}
                    onChange={handleUserChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="last_name">
                    Last Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={userFormData.last_name}
                    onChange={handleUserChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">
                    Email <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={userFormData.email}
                    onChange={handleUserChange}
                    required
                    disabled={editingUser}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="username">
                    Username <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={userFormData.username}
                    onChange={handleUserChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={userFormData.phone}
                    onChange={handleUserChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="role">Role</label>
                  <select
                    id="role"
                    name="role"
                    value={userFormData.role}
                    onChange={handleUserChange}
                  >
                    <option value="player">Player</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
              </div>

              {!editingUser && (
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="password">
                      Password <span className="required">*</span>
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={userFormData.password}
                      onChange={handleUserChange}
                      required={!editingUser}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="password_confirm">
                      Confirm Password <span className="required">*</span>
                    </label>
                    <input
                      type="password"
                      id="password_confirm"
                      name="password_confirm"
                      value={userFormData.password_confirm}
                      onChange={handleUserChange}
                      required={!editingUser}
                    />
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={closeUserModal}
                  className="btn-cancel"
                  disabled={createUserMutation.isPending || updateUserMutation.isPending}
                >
                  <X size={20} />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  className="btn-save"
                  disabled={createUserMutation.isPending || updateUserMutation.isPending}
                >
                  {createUserMutation.isPending || updateUserMutation.isPending ? (
                    <>
                      <Loader2 className="spinner-small" size={20} />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      <span>{editingUser ? 'Update' : 'Create'} User</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;