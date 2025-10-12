import React from 'react';
import './ViewPdfButton.css';

interface ViewPdfButtonProps {
  filePath: string; // May be absolute (e.g., C:\\path\\to\\uploads\\abc.pdf) or relative (uploads/abc.pdf)
}

const ViewPdfButton: React.FC<ViewPdfButtonProps> = ({ filePath }) => {
  const handleViewPdf = () => {
    if (!filePath) return;

    // Extract filename from possible absolute path. Handles both Windows and POSIX separators.
    const raw = filePath.split(/[/\\\\]/).pop() || '';
    if (!raw.toLowerCase().endsWith('.pdf')) {
      // If stored file lacks extension (edge case), still attempt.
    }
    const pdfUrl = `http://localhost:8080/uploads/${raw}`;
    window.open(pdfUrl, '_blank');
  };

  const isPdfAvailable = Boolean(filePath && filePath.trim() !== '');

  return (
    <button
      className={`view-pdf-button ${!isPdfAvailable ? 'disabled' : ''}`}
      onClick={handleViewPdf}
      disabled={!isPdfAvailable}
      title={isPdfAvailable ? 'Open PDF in new tab' : 'PDF not available'}
    >
      📄 View PDF
    </button>
  );
};

export default ViewPdfButton;
