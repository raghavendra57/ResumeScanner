import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Sliders,
  BarChart2,
  Sparkles,
  AlertCircle,
  UploadCloud,
  Layers,
  Users
} from 'lucide-react';
import Header from './components/Header';
import ResumeUpload from './components/ResumeUpload';
import JobDescription from './components/JobDescription';
import AnalyzeButton from './components/AnalyzeButton';
import LoadingState from './components/LoadingState';
import Results from './components/Results';
import CandidateList from './components/CandidateList';
import CandidateDetailsModal from './components/CandidateDetailsModal';

const API_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/+$/, '') : '';

export default function App() {
  // Navigation View: 'screener' | 'candidates'
  const [activeView, setActiveView] = useState('screener');

  // Screener Form States
  const [selectedFile, setSelectedFile] = useState(null);
  const [jdMode, setJdMode] = useState('text'); // 'text' | 'pdf'
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [jobDescriptionFile, setJobDescriptionFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Candidate History & Storage States
  const [candidates, setCandidates] = useState([]);
  const [isCandidatesLoading, setIsCandidatesLoading] = useState(false);
  const [candidatesError, setCandidatesError] = useState(null);
  const [activeModalCandidate, setActiveModalCandidate] = useState(null);

  // Fetch candidates from MongoDB on mount
  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    setIsCandidatesLoading(true);
    setCandidatesError(null);
    try {
      const response = await fetch(`${API_BASE}/api/candidates`);
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setCandidates(data.data);
      }
    } catch (err) {
      console.warn('Could not fetch candidate history:', err);
      setCandidatesError('Candidate history could not be loaded from database.');
    } finally {
      setIsCandidatesLoading(false);
    }
  };

  const handleShortlistToggle = async (id, newShortlistState) => {
    // Optimistic UI update
    setCandidates((prev) =>
      prev.map((c) => (c._id === id ? { ...c, shortlisted: newShortlistState } : c))
    );

    if (activeModalCandidate && activeModalCandidate._id === id) {
      setActiveModalCandidate((prev) => ({ ...prev, shortlisted: newShortlistState }));
    }

    try {
      const response = await fetch(`${API_BASE}/api/candidates/${id}/shortlist`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shortlisted: newShortlistState })
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to update shortlist status');
      }
    } catch (err) {
      console.error('Error toggling shortlist:', err);
      // Revert optimistic update
      setCandidates((prev) =>
        prev.map((c) => (c._id === id ? { ...c, shortlisted: !newShortlistState } : c))
      );
    }
  };

  const handleDeleteCandidate = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/api/candidates/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        setCandidates((prev) => prev.filter((c) => c._id !== id));
        if (activeModalCandidate && activeModalCandidate._id === id) {
          setActiveModalCandidate(null);
        }
      }
    } catch (err) {
      console.error('Error deleting candidate:', err);
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setError(null);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
  };

  const handleJdModeChange = (newMode) => {
    if (newMode === jdMode) return;
    setJdMode(newMode);
    setError(null);
    if (newMode === 'text') {
      setJobDescriptionFile(null);
    } else {
      setJobDescriptionText('');
    }
  };

  const handleJdTextChange = (val) => {
    setJobDescriptionText(val);
    if (error) setError(null);
  };

  const handleJdFileSelect = (file) => {
    setJobDescriptionFile(file);
    if (error) setError(null);
  };

  const handleJdFileRemove = () => {
    setJobDescriptionFile(null);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setJobDescriptionText('');
    setJobDescriptionFile(null);
    setResults(null);
    setError(null);
    setIsLoading(false);
    setJdMode('text');
  };

  const handleAnalyze = async () => {
    setError(null);

    // 1. Validate resume
    if (!selectedFile) {
      setError('Please upload a resume before analyzing.');
      return;
    }

    // 2. Validate job description based on active mode
    if (jdMode === 'text' && !jobDescriptionText.trim()) {
      setError('Please provide a job description by pasting text or uploading a PDF.');
      return;
    }

    if (jdMode === 'pdf' && !jobDescriptionFile) {
      setError('Please provide a job description by pasting text or uploading a PDF.');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('resume', selectedFile);

      if (jdMode === 'text') {
        formData.append('jobDescriptionText', jobDescriptionText.trim());
      } else if (jdMode === 'pdf' && jobDescriptionFile) {
        formData.append('jobDescriptionFile', jobDescriptionFile);
      }

      const response = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || 'Failed to analyze resume. Please check server status.'
        );
      }

      setResults(data);

      // Refresh candidate list to include the newly saved candidate
      fetchCandidates();
    } catch (err) {
      console.error('Analysis error:', err);
      setError(
        err.message ||
          'Unable to connect to analysis server. Make sure backend is running on port 5000.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const canAnalyze = Boolean(
    selectedFile &&
      ((jdMode === 'text' && jobDescriptionText.trim().length > 0) ||
        (jdMode === 'pdf' && jobDescriptionFile))
  );

  const shortlistedCount = candidates.filter((c) => c.shortlisted).length;

  return (
    <div className="app-container">
      <Header
        activeView={activeView}
        onViewChange={(view) => setActiveView(view)}
        candidateCount={candidates.length}
        shortlistedCount={shortlistedCount}
      />

      <main className="main-content">
        {activeView === 'screener' ? (
          /* SCREENER VIEW */
          <div className="dashboard-grid">
            {/* Left Column: Input Configuration */}
            <div className="panel-card">
              <div className="panel-header">
                <div className="panel-title">
                  <Sliders className="panel-title-icon" size={18} />
                  <span>Screening Inputs</span>
                </div>
                <span className="panel-badge">Step 1 & 2</span>
              </div>

              {error && (
                <div className="alert-box alert-danger" role="alert">
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <div>{error}</div>
                </div>
              )}

              <ResumeUpload
                selectedFile={selectedFile}
                onFileSelect={handleFileSelect}
                onFileRemove={handleFileRemove}
                disabled={isLoading}
              />

              <JobDescription
                mode={jdMode}
                onModeChange={handleJdModeChange}
                textValue={jobDescriptionText}
                onTextChange={handleJdTextChange}
                fileValue={jobDescriptionFile}
                onFileSelect={handleJdFileSelect}
                onFileRemove={handleJdFileRemove}
                disabled={isLoading}
              />

              <AnalyzeButton
                onAnalyze={handleAnalyze}
                onClear={handleClear}
                isLoading={isLoading}
                canAnalyze={canAnalyze}
              />
            </div>

            {/* Right Column: Analysis Dashboard */}
            <div className="panel-card">
              <div className="panel-header">
                <div className="panel-title">
                  <BarChart2 className="panel-title-icon" size={18} />
                  <span>Screening Results</span>
                </div>
                <span className="panel-badge">
                  {results ? 'Analysis Ready' : isLoading ? 'Processing' : 'Awaiting Input'}
                </span>
              </div>

              {isLoading ? (
                <LoadingState />
              ) : results ? (
                <Results
                  data={results}
                  onShortlistToggle={handleShortlistToggle}
                />
              ) : (
                <div className="empty-state">
                  <div className="empty-icon-wrap">
                    <Layers size={32} />
                  </div>
                  <h3 className="empty-title">Ready for Screening</h3>
                  <p className="empty-desc">
                    Upload a candidate resume PDF and provide a job description (as text or PDF) on the
                    left to generate instant ATS compatibility scores, structured extraction, and Gemini AI semantic evaluation.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* CANDIDATES HISTORY VIEW */
          <div className="candidates-page-wrap">
            <CandidateList
              candidates={candidates}
              isLoading={isCandidatesLoading}
              error={candidatesError}
              onShortlistToggle={handleShortlistToggle}
              onViewCandidate={(cand) => setActiveModalCandidate(cand)}
              onDeleteCandidate={handleDeleteCandidate}
              onNavigateToScreener={() => setActiveView('screener')}
            />
          </div>
        )}
      </main>

      {/* Candidate Details Modal Dialog */}
      {activeModalCandidate && (
        <CandidateDetailsModal
          candidate={activeModalCandidate}
          onClose={() => setActiveModalCandidate(null)}
          onShortlistToggle={handleShortlistToggle}
          onDelete={(id) => {
            handleDeleteCandidate(id);
            setActiveModalCandidate(null);
          }}
        />
      )}
    </div>
  );
}
