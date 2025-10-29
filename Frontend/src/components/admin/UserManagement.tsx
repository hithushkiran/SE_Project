import React, { useState, useEffect } from 'react';
import { adminService, AdminUser, PaginatedResponse } from '../../services/adminService';
import './UserManagement.css';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, sortBy, sortDir]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response: PaginatedResponse<AdminUser> = await adminService.getAllUsers(
        currentPage, 10, sortBy, sortDir
      );
      setUsers(response.content);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError('Failed to load users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: string, reason?: string) => {
    try {
      setActionLoading(userId);
      switch (action) {
        case 'suspend':
          await adminService.suspendUser(userId, reason);
          break;
        case 'activate':
          await adminService.activateUser(userId);
          break;
        case 'delete':
          if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            await adminService.deleteUser(userId);
          }
          break;
      }
      await fetchUsers();
      setShowUserModal(false);
    } catch (err) {
      setError(`Failed to ${action} user`);
      console.error(`Error ${action}ing user:`, err);
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleBadge = (role: string) => {
    const roleStyles = {
      'ADMIN': 'role-badge admin',
      'RESEARCHER': 'role-badge researcher',
      'USER': 'role-badge user'
    };
    return <span className={roleStyles[role as keyof typeof roleStyles] || 'role-badge'}>{role}</span>;
  };

  const getStatusBadge = (user: AdminUser) => {
    if (user.role === 'ADMIN') {
      return <span className="status-badge active">Active</span>;
    }
    return <span className="status-badge active">Active</span>;
  };

  if (loading && users.length === 0) {
    return (
      <div className="user-management">
        <div className="loading-spinner">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="management-header">
        <h1>User Management</h1>
        <div className="header-actions">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="createdAt">Created Date</option>
            <option value="email">Email</option>
            <option value="role">Role</option>
          </select>
          <select 
            value={sortDir} 
            onChange={(e) => setSortDir(e.target.value)}
            className="sort-select"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="user-info">
                    <div className="user-email">{user.email}</div>
                    <div className="user-id">ID: {user.id}</div>
                  </div>
                </td>
                <td>{getRoleBadge(user.role)}</td>
                <td>{getStatusBadge(user)}</td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="action-btn view"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowUserModal(true);
                      }}
                    >
                      View
                    </button>
                    {user.role !== 'ADMIN' && (
                      <>
                        <button 
                          className="action-btn suspend"
                          onClick={() => handleUserAction(user.id, 'suspend')}
                          disabled={actionLoading === user.id}
                        >
                          {actionLoading === user.id ? '...' : 'Suspend'}
                        </button>
                        <button 
                          className="action-btn activate"
                          onClick={() => handleUserAction(user.id, 'activate')}
                          disabled={actionLoading === user.id}
                        >
                          {actionLoading === user.id ? '...' : 'Activate'}
                        </button>
                        <button 
                          className="action-btn delete"
                          onClick={() => handleUserAction(user.id, 'delete')}
                          disabled={actionLoading === user.id}
                        >
                          {actionLoading === user.id ? '...' : 'Delete'}
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button 
          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
          className="pagination-btn"
        >
          Previous
        </button>
        <span className="pagination-info">
          Page {currentPage + 1} of {totalPages}
        </span>
        <button 
          onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
          disabled={currentPage >= totalPages - 1}
          className="pagination-btn"
        >
          Next
        </button>
      </div>

      {showUserModal && selectedUser && (
        <UserModal 
          user={selectedUser}
          onClose={() => setShowUserModal(false)}
          onAction={handleUserAction}
          loading={actionLoading === selectedUser.id}
        />
      )}
    </div>
  );
};

interface UserModalProps {
  user: AdminUser;
  onClose: () => void;
  onAction: (userId: string, action: string, reason?: string) => void;
  loading: boolean;
}

const UserModal: React.FC<UserModalProps> = ({ user, onClose, onAction, loading }) => {
  const [reason, setReason] = useState('');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>User Details</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="user-details">
            <div className="detail-row">
              <label>Email:</label>
              <span>{user.email}</span>
            </div>
            <div className="detail-row">
              <label>Role:</label>
              <span>{user.role}</span>
            </div>
            <div className="detail-row">
              <label>Email Verified:</label>
              <span>{user.emailVerified ? 'Yes' : 'No'}</span>
            </div>
            <div className="detail-row">
              <label>Created:</label>
              <span>{new Date(user.createdAt).toLocaleString()}</span>
            </div>
          </div>
          
          {user.role !== 'ADMIN' && (
            <div className="modal-actions">
              <div className="action-group">
                <label>Reason (for suspension):</label>
                <textarea 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter reason for suspension..."
                  rows={3}
                />
                <button 
                  className="action-btn suspend"
                  onClick={() => onAction(user.id, 'suspend', reason)}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Suspend User'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
