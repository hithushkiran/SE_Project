import React, { useState } from 'react';
import { FileText, Upload, Loader2, AlertCircle } from 'lucide-react';
import './PDFSummarizer.css';

export default function PDFSummarizer() {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
      setSummary('');
    } else {
      setError('Please select a valid PDF file');
      setFile(null);
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove the data:application/pdf;base64, prefix
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const generateSummary = async () => {
    if (!file) {
      setError('Please upload a PDF file first');
      return;
    }

    setLoading(true);
    setError('');
    setSummary('');

    try {
      // Convert PDF to base64
      const base64PDF = await fileToBase64(file);

      // Send PDF directly to Gemini API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=AIzaSyBOxYof-oezl6LcnW_c1evnxVQs3wMYakE`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [
                {
                  text: "Please provide a comprehensive and well-structured summary of this PDF document. Include the main points, key information, and important details."
                },
                {
                  inline_data: {
                    mime_type: "application/pdf",
                    data: base64PDF
                  }
                }
              ]
            }]
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${errorData.error?.message || response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        setSummary(data.candidates[0].content.parts[0].text);
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(`Failed to generate summary: ${err.message}`);
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

          <div className="upload-section">
            <label className="upload-label">
              <div className="upload-box">
                <Upload className="upload-icon" />
                <p className="upload-text">
                  {file ? file.name : 'Click to upload or drag and drop'}
                </p>
                <p className="upload-hint">PDF files only</p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="file-input"
                />
              </div>
            </label>

            <button
              onClick={generateSummary}
              disabled={!file || loading}
              className="generate-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="btn-icon spin" />
                  Generating Summary...
                </>
              ) : (
                'Generate Summary'
              )}
            </button>
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle className="error-icon" />
              <p className="error-text">{error}</p>
            </div>
          )}

          {summary && (
            <div className="summary-section">
              <h2 className="summary-title">Summary</h2>
              <div className="summary-content">
                <p className="summary-text">{summary}</p>
              </div>
            </div>
          )}
        </div>

        <div className="footer">
          <p>Powered by Google Gemini AI</p>
        </div>
      </div>
    </div>
  );
}