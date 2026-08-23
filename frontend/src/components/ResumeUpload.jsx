import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, CheckCircle, Trash2, AlertCircle } from 'lucide-react';

export default function ResumeUpload({ selectedFile, onFileSelect, onFileRemove, disabled }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [fileError, setFileError] = useState(null);
  const fileInputRef = useRef(null);

  const validateAndProcessFile = (file) => {
    setFileError(null);

    if (!file) return;

    // Validate PDF type
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setFileError('Only PDF files are supported.');
      return;
    }

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setFileError('Resume must be smaller than 5 MB.');
      return;
    }

    onFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="form-section">
      <label className="form-label" id="resume-upload-label">
        Upload Resume
      </label>

      {fileError && (
        <div className="alert-box alert-danger" role="alert">
          <AlertCircle size={16} />
          <span>{fileError}</span>
        </div>
      )}

      {selectedFile ? (
        <div className="selected-file-card" aria-labelledby="resume-upload-label">
          <div className="file-info">
            <CheckCircle className="file-icon" size={24} />
            <div className="file-details">
              <div className="file-name" title={selectedFile.name}>
                ✓ {selectedFile.name}
              </div>
              <div className="file-meta">
                {formatFileSize(selectedFile.size)} • PDF Ready for screening
              </div>
            </div>
          </div>
          <button
            type="button"
            className="file-remove-btn"
            onClick={onFileRemove}
            disabled={disabled}
            title="Remove selected resume"
            aria-label="Remove resume"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ) : (
        <div
          className={`dropzone ${isDragActive ? 'drag-active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              fileInputRef.current?.click();
            }
          }}
          aria-label="Upload PDF resume by clicking or dragging and dropping"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleInputChange}
            accept=".pdf,application/pdf"
            style={{ display: 'none' }}
            disabled={disabled}
          />
          <div className="dropzone-icon-wrap" aria-hidden="true">
            <UploadCloud size={28} />
          </div>
          <div className="dropzone-title">Drag & drop your resume here</div>
          <div className="dropzone-subtitle">or click to browse your computer</div>
          <button
            type="button"
            className="dropzone-btn"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            <FileText size={14} />
            Choose PDF
          </button>
          <div className="dropzone-limits">
            Supported format: PDF • Maximum size: 5 MB
          </div>
        </div>
      )}
    </div>
  );
}
