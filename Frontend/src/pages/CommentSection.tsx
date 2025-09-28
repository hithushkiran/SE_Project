import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { commentService } from '../services/commentService';
import { CommentResponse, CommentRequest, ApiResponse } from '../types/comment';
import { PaperResponse } from '../types/explore';
import './CommentSection.css';

const CommentSection: React.FC = () => {
  const { paperId } = useParams<{ paperId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [paper, setPaper] = useState<PaperResponse | null>(null);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [commentCount, setCommentCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Comment form state
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Edit state
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    if (paperId) {
      loadData();
    }
  }, [paperId]);

  // Debug: Log authentication status
  useEffect(() => {
    console.log('Comment Section - Auth Status:', {
      isAuthenticated,
      user: user?.email,
      userId: user?.id
    });
  }, [isAuthenticated, user]);

  const loadData = async () => {
    if (!paperId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Load paper details from explore API
      const paperResponse = await fetch(`http://localhost:8081/api/explore?paperId=${paperId}`, {
        credentials: 'include'
      });
      
      if (paperResponse.ok) {
        const paperData = await paperResponse.json();
        if (paperData.success && paperData.data.length > 0) {
          setPaper(paperData.data[0]);
        } else {
          // Fallback to placeholder if paper not found
          const paperData: PaperResponse = {
            id: paperId,
            title: 'Research Paper',
            author: 'Author Name',
            abstractSnippet: 'This paper discusses important research findings...',
            uploadedAt: new Date().toISOString(),
            publicationYear: 2024,
            filePath: '',
            categories: []
          };
          setPaper(paperData);
        }
      } else {
        // Fallback to placeholder
        const paperData: PaperResponse = {
          id: paperId,
          title: 'Research Paper',
          author: 'Author Name',
          abstractSnippet: 'This paper discusses important research findings...',
          uploadedAt: new Date().toISOString(),
          publicationYear: 2024,
          filePath: '',
          categories: []
        };
        setPaper(paperData);
      }
      
      // Load comments and count
      const [commentsResponse, countResponse] = await Promise.all([
        commentService.getPaperComments(paperId),
        commentService.getCommentCount(paperId)
      ]);
      
      if (commentsResponse.success) {
        setComments(commentsResponse.data);
      }
      
      if (countResponse.success) {
        setCommentCount(countResponse.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !paperId) return;
    
    // Check authentication
    if (!isAuthenticated) {
      setError('You must be logged in to post comments');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const request: CommentRequest = { content: newComment.trim() };
      console.log('Submitting comment:', { paperId, request, user: user?.email });
      const response = await commentService.createComment(paperId, request);
      console.log('Comment response:', response);
      
      if (response.success && response.data) {
        // Add the new comment to the list
        setComments(prev => [response.data!, ...prev]);
        // Update comment count
        setCommentCount(prev => prev + 1);
        // Clear the form
        setNewComment('');
        // Clear any previous errors
        setError(null);
        // Show success message
        setSuccessMessage('Comment posted successfully!');
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.error || 'Failed to create comment');
      }
    } catch (err: any) {
      console.error('Comment creation error:', err);
      console.error('Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message
      });
      
      if (err.response?.status === 401) {
        setError('You must be logged in to post comments. Please log in and try again.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to post comments.');
      } else {
        setError(err.response?.data?.error || err.message || 'Failed to create comment');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim() || !paperId) return;
    
    if (!isAuthenticated) {
      setError('You must be logged in to edit comments');
      return;
    }
    
    try {
      const request: CommentRequest = { content: editContent.trim() };
      const response = await commentService.updateComment(paperId, commentId, request);
      
      if (response.success && response.data) {
        setComments(prev => prev.map(comment => 
          comment.id === commentId ? response.data! : comment
        ));
        setEditingComment(null);
        setEditContent('');
        setError(null);
      } else {
        setError(response.error || 'Failed to update comment');
      }
    } catch (err: any) {
      console.error('Edit comment error:', err);
      if (err.response?.status === 401) {
        setError('You must be logged in to edit comments.');
      } else if (err.response?.status === 403) {
        setError('You can only edit your own comments.');
      } else {
        setError(err.response?.data?.error || err.message || 'Failed to update comment');
      }
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!paperId) return;
    
    if (!isAuthenticated) {
      setError('You must be logged in to delete comments');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      const response = await commentService.deleteComment(paperId, commentId);
      
      if (response.success) {
        setComments(prev => prev.filter(comment => comment.id !== commentId));
        setCommentCount(prev => prev - 1);
        setError(null);
      } else {
        setError(response.error || 'Failed to delete comment');
      }
    } catch (err: any) {
      console.error('Delete comment error:', err);
      if (err.response?.status === 401) {
        setError('You must be logged in to delete comments.');
      } else if (err.response?.status === 403) {
        setError('You can only delete your own comments.');
      } else {
        setError(err.response?.data?.error || err.message || 'Failed to delete comment');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="comment-section">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading comments...</p>
        </div>
      </div>
    );
  }

  if (error && loading) {
    return (
      <div className="comment-section">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={loadData} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="comment-section">
      {/* Header */}
      <div className="comment-header">
        <button className="back-button" onClick={() => navigate('/explore')}>
          ← Back to Explore
        </button>
        <div className="paper-info">
          <h1>{paper?.title}</h1>
          <p className="paper-author">by {paper?.author}</p>
        </div>
      </div>

      {/* Comment Form */}
      <div className="comment-form-container">
        <h3>Add a Comment</h3>
        <form onSubmit={handleSubmitComment} className="comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts about this paper..."
            rows={4}
            maxLength={1000}
            className="comment-textarea"
            required
          />
          <div className="comment-form-footer">
            <span className="character-count">
              {newComment.length}/1000 characters
            </span>
            <button 
              type="submit" 
              className="submit-button"
              disabled={submitting || !newComment.trim()}
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
        
        {error && (
          <div className="inline-error-message">
            <div className="error-text">{error}</div>
          </div>
        )}
        
        {successMessage && (
          <div className="inline-success-message">
            <div className="success-text">{successMessage}</div>
          </div>
        )}
      </div>

      {/* Comments List */}
      <div className="comments-container">
        <div className="comments-header">
          <h3>Comments ({commentCount})</h3>
        </div>
        
        {comments.length === 0 ? (
          <div className="no-comments">
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className="comment-item">
                {editingComment === comment.id ? (
                  <div className="comment-edit">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                      maxLength={1000}
                      className="edit-textarea"
                    />
                    <div className="edit-actions">
                      <button
                        onClick={() => handleEditComment(comment.id)}
                        className="save-button"
                        disabled={!editContent.trim()}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingComment(null);
                          setEditContent('');
                        }}
                        className="cancel-button"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="comment-header">
                      <div className="comment-author">
                        <span className="author-name">{comment.author.displayName}</span>
                        <span className="author-email">({comment.author.email})</span>
                        {comment.edited && (
                          <span className="edited-badge">edited</span>
                        )}
                      </div>
                      <div className="comment-actions">
                        {comment.author.id === user?.id && (
                          <>
                            <button
                              onClick={() => {
                                setEditingComment(comment.id);
                                setEditContent(comment.content);
                              }}
                              className="edit-button"
                              title="Edit comment"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="delete-button"
                              title="Delete comment"
                            >
                              🗑️
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="comment-content">
                      {comment.content}
                    </div>
                    <div className="comment-footer">
                      <span className="comment-date">
                        {formatDate(comment.createdAt)}
                        {comment.updatedAt !== comment.createdAt && (
                          <span className="updated-date">
                            (updated {formatDate(comment.updatedAt)})
                          </span>
                        )}
                      </span>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
