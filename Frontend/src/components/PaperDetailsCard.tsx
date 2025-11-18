import React, { useState } from 'react';
import { PaperResponse } from '../types/explore';
import CategoryChips from './CategoryChips';
import PaperMeta from './PaperMeta';
import ViewPdfButton from './ViewPdfButton';
import { api } from '../services/api';
import './PaperDetailsCard.css';

interface PaperDetailsCardProps {
  paper: PaperResponse;
}

const PaperDetailsCard: React.FC<PaperDetailsCardProps> = ({ paper }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAbstractText = () => {
    if (paper.abstractSnippet) {
      return paper.abstractSnippet;
    }
    return 'No abstract available.';
  };

  const [summary, setSummary] = useState<string>("");
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSummarize = async () => {
    setLoading(true);
    setError("");
    try {
  const res = await fetch(`http://localhost:8082/api/papers/${paper.id}/summarize`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  }
});
const data = await res.json();

      console.log(res)
      if (data && data.summary) {
        setSummary(data.summary);
        setGeneratedAt(data.generatedAt || null);
      } else {
        setError('Unable to generate summary. Please try again later or read the abstract below.');
      }
    } catch (e) {
      setError('Unable to generate summary. Please try again later or read the abstract below.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
    } catch {
      // no-op if clipboard not available
    }
  };

  return (
    <div className="paper-details-card">
      <div className="paper-header">
        <h1 className="paper-title">{paper.title}</h1>
        <div className="paper-actions">
          <ViewPdfButton filePath={paper.filePath} />
          <button className="ai-summary-button" onClick={handleSummarize} disabled={loading}>
            {loading ? 'Generating Summary...' : '🤖 AI Summary'}
          </button>
        </div>
      </div>

      <PaperMeta 
        author={paper.author}
        publicationYear={paper.publicationYear}
        uploadedAt={formatDate(paper.uploadedAt)}
      />

      {paper.categories && paper.categories.length > 0 && (
        <div className="paper-categories-section">
          <h3>Categories</h3>
          <CategoryChips categories={paper.categories} />
        </div>
      )}

      <div className="paper-abstract-section">
        <h3>Abstract</h3>
        <div className="abstract-content">
          {getAbstractText()}
        </div>
      </div>

      {error && (
        <div className="summary-error" role="alert">{error}</div>
      )}

      {summary && (
        <div className="summary-box">
          <div className="summary-header">🤖 AI-generated summary</div>
          {generatedAt && (
            <div className="summary-timestamp">Generated on {new Date(generatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
          )}
          <p className="summary-text">{summary}</p>
          <div className="summary-footer">
            <small className="summary-disclaimer">AI-generated summary — may not capture all nuances</small>
            <button className="summary-copy-btn" onClick={handleCopy} title="Copy summary">Copy</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaperDetailsCard;
