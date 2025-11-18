import React, { useState, useEffect } from 'react';
import { adminService, AdminComment, PaginatedResponse } from '../../services/adminService';
import './CommentModeration.css';

const CommentModeration: React.FC = () => {
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [selectedComment, setSelectedComment] = useState<AdminComment | null>(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, [currentPage, statusFilter, sortBy, sortDir]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response: PaginatedResponse<AdminComment> = await adminService.getAllComments(
        currentPage, 10, statusFilter, sortBy, sortDir
      );
      setComments(response.content);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError('Failed to load comments');
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentAction = async (commentId: string, action: string, reason?: string) => {
    try {
      setActionLoading(commentId);
      switch (action) {
        case 'approve':
          await adminService.approveComment(commentId);
          break;
        case 'reject':
          await adminService.rejectComment(commentId, reason || 'No reason provided');
          break;
      }
      await fetchComments();
      setShowCommentModal(false);
    } catch (err) {
      setError(`Failed to ${action} comment`);
      console.error(`Error ${action}ing comment:`, err);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      'APPROVED': 'status-badge approved',
      'REJECTED': 'status-badge rejected',
      'PENDING_REVIEW': 'status-badge pending'
    };
    return <span className={statusStyles[status as keyof typeof statusStyles] || 'status-badge'}>{status}</span>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (loading && comments.length === 0) {
    return (
      <div className="comment-moderation">
        <div className="loading-spinner">Loading comments...</div>
      </div>
    );
  }

  return (
    <div className="comment-moderation">
      <div className="management-header">
        <h1>Comment Moderation</h1>
        <div className="header-actions">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="PENDING_REVIEW">Pending Review</option>
          </select>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="createdAt">Created Date</option>
            <option value="authorName">Author</option>
            <option value="status">Status</option>
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

      <div className="comments-table-container">
        <table className="comments-table">
          <thead>
            <tr>
              <th>Comment</th>
              <th>Author</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {comments.map((comment) => (
              <tr key={comment.id}>
                <td>
                  <div className="comment-info">
                    <div className="comment-content">
                      {truncateContent(comment.content)}
                    </div>
                    <div className="comment-meta">
                      Paper ID: {comment.paperId} | Comment ID: {comment.id}
                    </div>
                    {comment.edited && (
                      <div className="comment-edited">(Edited)</div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="author-info">
                    <div className="author-name">{comment.authorName}</div>
                    <div className="author-id">ID: {comment.authorId}</div>
                  </div>
                </td>
                <td>{getStatusBadge(comment.status)}</td>
                <td>{formatDate(comment.createdAt)}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="action-btn view"
                      onClick={() => {
                        setSelectedComment(comment);
                        setShowCommentModal(true);
                      }}
                    >
                      Review
                    </button>
                    {comment.status !== 'REJECTED' && (
                      <>
                        <button 
                          className="action-btn approve"
                          onClick={() => handleCommentAction(comment.id, 'approve')}
                          disabled={actionLoading === comment.id}
                        >
                          {actionLoading === comment.id ? '...' : 'Approve'}
                        </button>
                        <button 
                          className="action-btn reject"
                          onClick={() => {
                            setSelectedComment(comment);
                            setShowCommentModal(true);
                          }}
                          disabled={actionLoading === comment.id}
                        >
                          {actionLoading === comment.id ? '...' : 'Reject'}
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

      {showCommentModal && selectedComment && (
        <CommentModal 
          comment={selectedComment}
          onClose={() => setShowCommentModal(false)}
          onAction={handleCommentAction}
          loading={actionLoading === selectedComment.id}
        />
      )}
    </div>
  );
};

interface CommentModalProps {
  comment: AdminComment;
  onClose: () => void;
  onAction: (commentId: string, action: string, reason?: string) => void;
  loading: boolean;
}

const CommentModal: React.FC<CommentModalProps> = ({ comment, onClose, onAction, loading }) => {
  const [reason, setReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const handleAction = (action: string) => {
    if (action === 'reject') {
      if (!reason.trim()) {
        alert('Please provide a reason for rejection');
        return;
      }
      onAction(comment.id, action, reason);
    } else {
      onAction(comment.id, action);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content comment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Comment Review</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="comment-details">
            <div className="detail-section">
              <h3>Comment Information</h3>
              <div className="detail-row">
                <label>Author:</label>
                <span>{comment.authorName} (ID: {comment.authorId})</span>
              </div>
              <div className="detail-row">
                <label>Paper ID:</label>
                <span className="paper-id">{comment.paperId}</span>
              </div>
              <div className="detail-row">
                <label>Status:</label>
                <span className={`status-badge ${comment.status.toLowerCase()}`}>{comment.status}</span>
              </div>
              <div className="detail-row">
                <label>Created:</label>
                <span>{new Date(comment.createdAt).toLocaleString()}</span>
              </div>
              {comment.edited && (
                <div className="detail-row">
                  <label>Edited:</label>
                  <span>Yes</span>
                </div>
              )}
            </div>

            <div className="detail-section">
              <h3>Comment Content</h3>
              <div className="comment-content-full">
                {comment.content}
              </div>
            </div>

            {comment.moderationReason && (
              <div className="detail-section">
                <h3>Moderation Reason</h3>
                <div className="moderation-reason">
                  {comment.moderationReason}
                </div>
              </div>
            )}

            <div className="detail-section">
              <h3>Comment ID</h3>
              <div className="comment-id">{comment.id}</div>
            </div>
          </div>
          
          {comment.status !== 'REJECTED' && (
            <div className="modal-actions">
              {!showRejectForm ? (
                <div className="action-buttons">
                  <button 
                    className="action-btn approve"
                    onClick={() => handleAction('approve')}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Approve Comment'}
                  </button>
                  <button 
                    className="action-btn reject"
                    onClick={() => setShowRejectForm(true)}
                    disabled={loading}
                  >
                    Reject Comment
                  </button>
                </div>
              ) : (
                <div className="reject-form">
                  <label>Reason for Rejection:</label>
                  <textarea 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Please provide a detailed reason for rejection..."
                    rows={4}
                    required
                  />
                  <div className="form-actions">
                    <button 
                      className="action-btn cancel"
                      onClick={() => {
                        setShowRejectForm(false);
                        setReason('');
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      className="action-btn reject"
                      onClick={() => handleAction('reject')}
                      disabled={loading || !reason.trim()}
                    >
                      {loading ? 'Processing...' : 'Reject Comment'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentModeration;
