import React, { useState } from 'react';
import { FileText, Upload, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import './PDFSummarizer.css';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const PDFSummarizer = () => {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (selectedFile.type !== 'application/pdf') {
      setError('Please select a valid PDF file');
      setFile(null);
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('PDF is larger than 10MB. Please upload a smaller file.');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError('');
    setSummary('');
  };

  const fileToBase64 = (pdfFile) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        resolve(result.split(',')[1]);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('Unable to read file'));
    reader.readAsDataURL(pdfFile);
  });

  const generateSummary = async () => {
    if (!file) {
      setError('Please upload a PDF file first');
      return;
    }

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setError('Gemini API key is missing. Set VITE_GEMINI_API_KEY in your frontend env file.');
      return;
    }

    setLoading(true);
    setError('');
    setSummary('');

    try {
      const base64PDF = await fileToBase64(file);
      const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: 'Provide a well-structured summary of this research PDF. Highlight main contributions, results, and notable figures.always provide the response as a single paragraph.'
                },
                {
                  inline_data: {
                    mime_type: 'application/pdf',
                    data: base64PDF
                  }
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Request failed (${response.status})`);
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.find((part) => part.text)?.text;

      if (!text) {
        throw new Error('Model returned an empty response. Try a different PDF.');
      }

      setSummary(text.trim());
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to summarize PDF', err);
      setError(err.message || 'Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pdf-summarizer-container">
      <div className="pdf-summarizer-wrapper">
        <div className="pdf-summarizer-card">
          <div className="header">
            <FileText className="header-icon" />
            <h1 className="header-title">PDF Summarizer</h1>
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle className="error-icon" />
              <p className="error-text">{error}</p>
            </div>
          )}

          <div className="upload-section">
            <label className="upload-label">
              <div className={`upload-box ${file ? 'upload-box--active' : ''}`}>
                {file ? (
                  <CheckCircle2 className="upload-icon" style={{ color: '#4f46e5' }} />
                ) : (
                  <Upload className="upload-icon" />
                )}
                <p className="upload-text">
                  {file ? file.name : 'Click to upload or drag and drop'}
                </p>
                <p className="upload-hint">PDF files only (Max 10MB)</p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="file-input"
                />
              </div>
            </label>

            <button
              type="button"
              onClick={generateSummary}
              disabled={!file || loading}
              className="generate-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="btn-icon spin" />
                  Analyzing Document...
                </>
              ) : (
                'Generate Summary'
              )}
            </button>
          </div>

          {summary && (
            <div className="summary-section">
              <h2 className="summary-title">
                <FileText size={24} />
                Summary
              </h2>
              <div className="summary-content">
                <p className="summary-text">{summary}</p>
              </div>
            </div>
          )}

          <div className="footer">
            <p>Powered by Google Gemini AI</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFSummarizer;
