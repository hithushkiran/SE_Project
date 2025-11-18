import React, { useState, useEffect } from 'react';
import { adminService, AdminPaper, PaginatedResponse } from '../../services/adminService';
import './PaperModeration.css';

const PaperModeration: React.FC = () => {
  const [papers, setPapers] = useState<AdminPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('uploadedAt');
  const [sortDir, setSortDir] = useState('desc');
  const [selectedPaper, setSelectedPaper] = useState<AdminPaper | null>(null);
  const [showPaperModal, setShowPaperModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchPapers();
  }, [currentPage, statusFilter, sortBy, sortDir]);

  const fetchPapers = async () => {
    try {
      setLoading(true);
      const response: PaginatedResponse<AdminPaper> = await adminService.getAllPapers(
        currentPage, 10, statusFilter, sortBy, sortDir
      );
      setPapers(response.content);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError('Failed to load papers');
      console.error('Error fetching papers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaperAction = async (paperId: string, action: string, reason?: string) => {
    try {
      setActionLoading(paperId);
      switch (action) {
        case 'approve':
          await adminService.approvePaper(paperId);
          break;
        case 'reject':
          await adminService.rejectPaper(paperId, reason || 'No reason provided');
          break;
      }
      await fetchPapers();
      setShowPaperModal(false);
    } catch (err) {
      setError(`Failed to ${action} paper`);
      console.error(`Error ${action}ing paper:`, err);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      'PENDING': 'status-badge pending',
      'APPROVED': 'status-badge approved',
      'REJECTED': 'status-badge rejected'
    };
    return <span className={statusStyles[status as keyof typeof statusStyles] || 'status-badge'}>{status}</span>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && papers.length === 0) {
    return (
      <div className="paper-moderation">
        <div className="loading-spinner">Loading papers...</div>
      </div>
    );
  }

  return (
    <div className="paper-moderation">
      <div className="management-header">
        <h1>Paper Moderation</h1>
        <div className="header-actions">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="uploadedAt">Upload Date</option>
            <option value="title">Title</option>
            <option value="author">Author</option>
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

      <div className="papers-table-container">
        <table className="papers-table">
          <thead>
            <tr>
              <th>Paper</th>
              <th>Author</th>
              <th>Status</th>
              <th>Uploaded</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {papers.map((paper) => (
              <tr key={paper.id}>
                <td>
                  <div className="paper-info">
                    <div className="paper-title">{paper.title}</div>
                    <div className="paper-abstract">
                      {paper.abstractText ? 
                        (paper.abstractText.length > 100 ? 
                          paper.abstractText.substring(0, 100) + '...' : 
                          paper.abstractText
                        ) : 
                        'No abstract available'
                      }
                    </div>
                    <div className="paper-meta">
                      Year: {paper.publicationYear} | ID: {paper.id}
                    </div>
                  </div>
                </td>
                <td>{paper.author || 'Unknown'}</td>
                <td>{getStatusBadge(paper.status)}</td>
                <td>{formatDate(paper.uploadedAt)}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="action-btn view"
                      onClick={() => {
                        setSelectedPaper(paper);
                        setShowPaperModal(true);
                      }}
                    >
                      Review
                    </button>
                    {paper.status === 'PENDING' && (
                      <>
                        <button 
                          className="action-btn approve"
                          onClick={() => handlePaperAction(paper.id, 'approve')}
                          disabled={actionLoading === paper.id}
                        >
                          {actionLoading === paper.id ? '...' : 'Approve'}
                        </button>
                        <button 
                          className="action-btn reject"
                          onClick={() => {
                            setSelectedPaper(paper);
                            setShowPaperModal(true);
                          }}
                          disabled={actionLoading === paper.id}
                        >
                          {actionLoading === paper.id ? '...' : 'Reject'}
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

      {showPaperModal && selectedPaper && (
        <PaperModal 
          paper={selectedPaper}
          onClose={() => setShowPaperModal(false)}
          onAction={handlePaperAction}
          loading={actionLoading === selectedPaper.id}
        />
      )}
    </div>
  );
};

interface PaperModalProps {
  paper: AdminPaper;
  onClose: () => void;
  onAction: (paperId: string, action: string, reason?: string) => void;
  loading: boolean;
}

const PaperModal: React.FC<PaperModalProps> = ({ paper, onClose, onAction, loading }) => {
  const [reason, setReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const handleAction = (action: string) => {
    if (action === 'reject') {
      if (!reason.trim()) {
        alert('Please provide a reason for rejection');
        return;
      }
      onAction(paper.id, action, reason);
    } else {
      onAction(paper.id, action);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content paper-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Paper Review</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="paper-details">
            <div className="detail-section">
              <h3>Paper Information</h3>
              <div className="detail-row">
                <label>Title:</label>
                <span>{paper.title}</span>
              </div>
              <div className="detail-row">
                <label>Author:</label>
                <span>{paper.author || 'Unknown'}</span>
              </div>
              <div className="detail-row">
                <label>Publication Year:</label>
                <span>{paper.publicationYear}</span>
              </div>
              <div className="detail-row">
                <label>Status:</label>
                <span className={`status-badge ${paper.status.toLowerCase()}`}>{paper.status}</span>
              </div>
              <div className="detail-row">
                <label>Uploaded:</label>
                <span>{new Date(paper.uploadedAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="detail-section">
              <h3>Abstract</h3>
              <div className="abstract-content">
                {paper.abstractText || 'No abstract provided'}
              </div>
            </div>

            {paper.rejectionReason && (
              <div className="detail-section">
                <h3>Rejection Reason</h3>
                <div className="rejection-reason">
                  {paper.rejectionReason}
                </div>
              </div>
            )}

            <div className="detail-section">
              <h3>File Information</h3>
              <div className="detail-row">
                <label>File Path:</label>
                <span className="file-path">{paper.filePath}</span>
              </div>
              <div className="detail-row">
                <label>Paper ID:</label>
                <span className="paper-id">{paper.id}</span>
              </div>
            </div>
          </div>
          
          {paper.status === 'PENDING' && (
            <div className="modal-actions">
              {!showRejectForm ? (
                <div className="action-buttons">
                  <button 
                    className="action-btn approve"
                    onClick={() => handleAction('approve')}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Approve Paper'}
                  </button>
                  <button 
                    className="action-btn reject"
                    onClick={() => setShowRejectForm(true)}
                    disabled={loading}
                  >
                    Reject Paper
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
                      {loading ? 'Processing...' : 'Reject Paper'}
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

export default PaperModeration;
