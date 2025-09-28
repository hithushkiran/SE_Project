import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PaperResponse, CategoryResponse } from '../types/explore';
import './PaperDetailsPage.css';

const API_BASE = 'http://localhost:8080';

const PaperDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [paper, setPaper] = useState<PaperResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaper = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/papers/${id}`);
        const data = await res.json();
        if (data.success) {
          setPaper(data.data);
        } else {
          setError(data.message || 'Failed to load paper');
        }
      } catch (err) {
        setError('Failed to load paper');
      } finally {
        setLoading(false);
      }
    };
    fetchPaper();
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleViewPdf = () => {
    if (paper && paper.filePath) {
      // Open PDF in new tab
      window.open(`${API_BASE}/${paper.filePath.replace(/^uploads\//, 'uploads/')}`, '_blank');
    }
  };

  if (loading) {
    return <div className="paper-details-loading">Loading...</div>;
  }
  if (error) {
    return <div className="paper-details-error">{error}</div>;
  }
  if (!paper) {
    return <div className="paper-details-error">Paper not found.</div>;
  }

  return (
    <div className="paper-details-page">
      <button className="back-button" onClick={handleBack}>&larr; Back</button>
      <div className="paper-details-card">
        <h1 className="paper-title">{paper.title}</h1>
        <div className="paper-meta">
          <span className="paper-author"><b>Author:</b> {paper.author}</span>
          {paper.publicationYear && (
            <span className="paper-year"><b>Year:</b> {paper.publicationYear}</span>
          )}
          <span className="paper-uploaded"><b>Uploaded:</b> {new Date(paper.uploadedAt).toLocaleDateString()}</span>
        </div>
        <div className="paper-categories">
          {paper.categories && paper.categories.length > 0 && (
            <>
              <b>Categories:</b>
              {paper.categories.map((cat: CategoryResponse) => (
                <span key={cat.id} className="category-tag">{cat.name}</span>
              ))}
            </>
          )}
        </div>
        <div className="paper-abstract">
          <b>Abstract:</b>
          <p>{paper.abstractSnippet || paper.abstractText || 'No abstract available.'}</p>
        </div>
        <button className="view-pdf-button" onClick={handleViewPdf}>
          View PDF
        </button>
      </div>
    </div>
  );
};

export default PaperDetailsPage;
