import React, { useRef, useState } from 'react';
import {
  FileText,
  UploadCloud,
  CheckCircle,
  Trash2,
  AlertCircle,
  FileCode
} from 'lucide-react';

const SAMPLES = [
  {
    label: 'Full Stack',
    text: `Job Title: Senior Full Stack Developer

Requirements:
- 3+ years of experience with React, JavaScript, TypeScript, and HTML/CSS.
- Strong proficiency in Node.js, Express.js, and REST API development.
- Working knowledge of SQL, PostgreSQL, or MongoDB databases.
- Familiarity with Git, GitHub, Docker, and CI/CD pipelines.
- Solid understanding of Data Structures and Algorithms.`
  },
  {
    label: 'Backend Java',
    text: `Job Title: Backend Java Engineer

Requirements:
- Strong core Java expertise with Spring Boot and Microservices architecture.
- Experience with SQL, MySQL, and DBMS design.
- Hands-on experience with REST APIs and Git version control.
- Experience with Docker, Kubernetes, and AWS cloud deployments is a plus.
- Bachelor's in Computer Science with knowledge of Operating Systems and Algorithms.`
  },
  {
    label: 'Data / AI',
    text: `Job Title: Machine Learning & Python Engineer

Requirements:
- Proficient in Python, SQL, and data analysis tools like Excel, Tableau, or Power BI.
- Hands-on experience in Machine Learning, Deep Learning, and Artificial Intelligence models.
- Strong foundation in Data Structures, Algorithms, and Mathematics.
- Experience deploying ML models with Flask, FastAPI, or Docker on Azure/AWS.`
  }
];

export default function JobDescription({
  mode = 'text',
  onModeChange,
  textValue = '',
  onTextChange,
  fileValue = null,
  onFileSelect,
  onFileRemove,
  disabled
}) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [fileError, setFileError] = useState(null);
  const jdFileInputRef = useRef(null);

  const charCount = textValue ? textValue.length : 0;
  const wordCount = textValue ? textValue.trim().split(/\s+/).filter(Boolean).length : 0;

  const validateAndProcessFile = (file) => {
    setFileError(null);
    if (!file) return;

    // Validate PDF type
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setFileError('Only PDF job descriptions are supported.');
      return;
    }

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setFileError('Job Description PDF must be smaller than 5 MB.');
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
      <div className="jd-header-nav">
        <label className="form-label" style={{ marginBottom: 0 }}>
          Job Description
        </label>

        {/* Input Mode Selector Tabs */}
        <div className="jd-mode-tabs" role="tablist" aria-label="Job Description Input Mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'text'}
            className={`jd-tab-btn ${mode === 'text' ? 'active' : ''}`}
            onClick={() => onModeChange('text')}
            disabled={disabled}
          >
            <FileText size={13} />
            <span>Paste Text</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={mode === 'pdf'}
            className={`jd-tab-btn ${mode === 'pdf' ? 'active' : ''}`}
            onClick={() => onModeChange('pdf')}
            disabled={disabled}
          >
            <FileCode size={13} />
            <span>Upload PDF</span>
          </button>
        </div>
      </div>

      {mode === 'text' ? (
        /* TEXT MODE */
        <div className="jd-text-mode-wrap">
          <div className="jd-header-actions" style={{ marginTop: '0.625rem' }}>
            <div className="sample-pills">
              <span className="sample-label">Load sample:</span>
              {SAMPLES.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="sample-pill-btn"
                  disabled={disabled}
                  onClick={() => onTextChange(s.text)}
                  title={`Load sample ${s.label} job description`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <textarea
            id="job-description-input"
            className="jd-textarea"
            placeholder="Paste the job description here..."
            value={textValue}
            onChange={(e) => onTextChange(e.target.value)}
            disabled={disabled}
            rows={7}
          />

          <div className="jd-footer">
            <span>
              {wordCount} words • {charCount} characters
            </span>
          </div>
        </div>
      ) : (
        /* PDF MODE */
        <div className="jd-pdf-mode-wrap" style={{ marginTop: '0.625rem' }}>
          {fileError && (
            <div className="alert-box alert-danger" role="alert">
              <AlertCircle size={16} />
              <span>{fileError}</span>
            </div>
          )}

          {fileValue ? (
            <div className="selected-file-card" aria-label="Selected job description file">
              <div className="file-info">
                <CheckCircle className="file-icon" size={24} />
                <div className="file-details">
                  <div className="file-name" title={fileValue.name}>
                    ✓ {fileValue.name}
                  </div>
                  <div className="file-meta">
                    {formatFileSize(fileValue.size)} • Job Description PDF ready
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="file-remove-btn"
                onClick={onFileRemove}
                disabled={disabled}
                title="Remove selected job description PDF"
                aria-label="Remove job description"
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
              onClick={() => !disabled && jdFileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  jdFileInputRef.current?.click();
                }
              }}
              aria-label="Upload PDF job description by clicking or dragging and dropping"
            >
              <input
                type="file"
                ref={jdFileInputRef}
                onChange={handleInputChange}
                accept=".pdf,application/pdf"
                style={{ display: 'none' }}
                disabled={disabled}
              />
              <div className="dropzone-icon-wrap" aria-hidden="true">
                <UploadCloud size={24} />
              </div>
              <div className="dropzone-title">Upload Job Description</div>
              <div className="dropzone-subtitle">Drag & drop your job description PDF here</div>
              <button
                type="button"
                className="dropzone-btn"
                disabled={disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  jdFileInputRef.current?.click();
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
      )}
    </div>
  );
}
