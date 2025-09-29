import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { multipartApi } from '../api/axios';
import './PublishPage.css';

const PublishPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id: '',
    bookId: '',
    title: '',
    author: '',
    date: '',
    file: null
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedPaper, setUploadedPaper] = useState(null);
  const [error, setError] = useState('');

  // Generate UUID and set today's date on component mount
  useEffect(() => {
    const generateUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };

    const today = new Date().toISOString().split('T')[0];
    
    setFormData(prev => ({
      ...prev,
      id: generateUUID(),
      date: today
    }));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setFormData(prev => ({
        ...prev,
        file: file
      }));
      setError('');
    } else {
      setError('Please select a valid PDF file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.file) {
      setError('Please select a PDF file to upload');
      return;
    }

    if (!formData.title || !formData.author) {
      setError('Please fill in all required fields');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      const uploadData = new FormData();
      uploadData.append('file', formData.file);
      uploadData.append('title', formData.title);
      uploadData.append('author', formData.author);
      
      if (formData.bookId) {
        uploadData.append('bookId', formData.bookId);
      }

      const response = await multipartApi.post('/api/papers/upload', uploadData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        },
      });

      setUploadedPaper(response.data);
      setUploadSuccess(true);
      setIsUploading(false);
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data?.message || 'Upload failed. Please try again.');
      setIsUploading(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  if (uploadSuccess && uploadedPaper) {
    return (
      <div className="publish-page">
        <div className="publish-container">
          <div className="success-message">
            <h2>✅ Upload Successful!</h2>
            <p>Your research paper has been successfully uploaded.</p>
            
            <div className="paper-details">
              <h3>Paper Details:</h3>
              <div className="detail-item">
                <strong>ID:</strong> {uploadedPaper.id || formData.id}
              </div>
              <div className="detail-item">
                <strong>Title:</strong> {uploadedPaper.title || formData.title}
              </div>
              <div className="detail-item">
                <strong>Author:</strong> {uploadedPaper.author || formData.author}
              </div>
              {uploadedPaper.bookId && (
                <div className="detail-item">
                  <strong>Book ID:</strong> {uploadedPaper.bookId}
                </div>
              )}
              <div className="detail-item">
                <strong>Upload Date:</strong> {uploadedPaper.uploadDate || formData.date}
              </div>
            </div>
            
            <button 
              className="back-btn"
              onClick={handleBackToDashboard}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="publish-page">
      <div className="publish-container">
        <div className="publish-header">
          <h1>Publish Research Paper</h1>
          <p>Upload your research paper to the platform</p>
        </div>

        <form onSubmit={handleSubmit} className="publish-form">
          <div className="form-group">
            <label htmlFor="id">Paper ID:</label>
            <input
              type="text"
              id="id"
              name="id"
              value={formData.id}
              readOnly
              className="readonly-input"
            />
            <small>Auto-generated unique identifier</small>
          </div>

          <div className="form-group">
            <label htmlFor="bookId">Book ID (Optional):</label>
            <input
              type="text"
              id="bookId"
              name="bookId"
              value={formData.bookId}
              onChange={handleInputChange}
              placeholder="Enter book ID if applicable"
            />
          </div>

          <div className="form-group">
            <label htmlFor="title">Title *:</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter paper title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="author">Author *:</label>
            <input
              type="text"
              id="author"
              name="author"
              value={formData.author}
              onChange={handleInputChange}
              placeholder="Enter author name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">Date:</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              readOnly
              className="readonly-input"
            />
            <small>Auto-filled with today's date</small>
          </div>

          <div className="form-group">
            <label htmlFor="file">PDF File *:</label>
            <input
              type="file"
              id="file"
              name="file"
              accept=".pdf"
              onChange={handleFileChange}
              required
            />
            <small>Only PDF files are accepted</small>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {isUploading && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p>Uploading... {uploadProgress}%</p>
            </div>
          )}

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={handleBackToDashboard}
              disabled={isUploading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload Paper'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublishPage;
