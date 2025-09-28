import React from 'react';
import './ViewPdfButton.css';

interface ViewPdfButtonProps {
  filePath: string;
}

const ViewPdfButton: React.FC<ViewPdfButtonProps> = ({ filePath }) => {
  const handleViewPdf = () => {
    if (filePath) {
      // Normalize the file path to ensure it starts with uploads/
      const normalizedPath = filePath.startsWith('uploads/') ? filePath : `uploads/${filePath}`;
      const pdfUrl = `http://localhost:8081/${normalizedPath}`;
      window.open(pdfUrl, '_blank');
    }
  };

  const isPdfAvailable = filePath && filePath.trim() !== '';

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
