import React, { useState } from 'react';
import axios from 'axios';
import { 
  Upload, FileText, CheckCircle, XCircle, 
  HelpCircle, RefreshCw, Download, 
  Briefcase, GraduationCap, Award, Zap
} from 'lucide-react';
import './index.css';

const API_URL = 'http://localhost:8000/api';

function App() {
  const [jdFile, setJdFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  
  const [jdData, setJdData] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'jd') setJdFile(file);
    else setResumeFile(file);

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const endpoint = type === 'jd' ? '/upload_jd' : '/upload_resume';
      const res = await axios.post(`${API_URL}${endpoint}`, formData);
      
      if (type === 'jd') setJdData(res.data.jd_data);
      else setResumeData(res.data.resume_data);
    } catch (err) {
      alert(`Error uploading ${type.toUpperCase()}: ` + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const calculateMatch = async () => {
    if (!jdData || !resumeData) return;
    
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/match`, {
        jd_data: jdData,
        resume_data: resumeData
      });
      setResults(res.data);
    } catch (err) {
      alert("Error matching details: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 75) return 'var(--success-color)';
    if (score >= 50) return 'var(--warning-color)';
    return 'var(--danger-color)';
  };

  return (
    <div className="app-container">
      <header className="animate-in">
        <h1>AI Resume Scanner</h1>
        <p>Intelligent Candidate Matching & Insights</p>
      </header>

      <main className="dashboard-grid">
        
        {/* Left Panel: Uploads */}
        <div className="upload-section glass-panel animate-in" style={{ animationDelay: '0.1s' }}>
          <h2>1. Data Input</h2>
          
          <div className="upload-box">
            <Upload size={32} className="upload-icon" />
            <h3>Upload Job Description</h3>
            <p>.txt format supported</p>
            <input type="file" accept=".txt,.pdf" onChange={(e) => handleFileUpload(e, 'jd')} />
          </div>
          {jdFile && (
            <div className="file-status success">
              <CheckCircle size={16} color="var(--success-color)" />
              {jdFile.name} {jdData ? "(Parsed)" : "(Parsing...)"}
            </div>
          )}

          <div style={{ margin: '1rem 0' }} />

          <div className="upload-box">
            <FileText size={32} className="upload-icon" />
            <h3>Upload Resume</h3>
            <p>.txt format supported</p>
            <input type="file" accept=".txt,.pdf" onChange={(e) => handleFileUpload(e, 'resume')} />
          </div>
          {resumeFile && (
            <div className="file-status success">
              <CheckCircle size={16} color="var(--success-color)" />
              {resumeFile.name} {resumeData ? "(Parsed)" : "(Parsing...)"}
            </div>
          )}

          <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
            <button 
              className="btn" 
              style={{ width: '100%' }}
              onClick={calculateMatch}
              disabled={!jdData || !resumeData || loading}
            >
              {loading ? (
                <><RefreshCw className="loading-spinner" size={18} /> Processing...</>
              ) : (
                <><Zap size={18} /> Analyze Match</>
              )}
            </button>
          </div>
        </div>

        {/* Right Panel: Results */}
        <div className="results-section glass-panel animate-in" style={{ animationDelay: '0.2s' }}>
          {!results ? (
            <div className="no-data">
              <Activity size={48} opacity={0.5} />
              <p>Upload a Job Description and a Resume to see the AI match analysis.</p>
            </div>
          ) : (
            <div className="report-content animate-in">
              <div className="score-header">
                <div className="candidate-name">
                  <h2>{resumeData?.resume_id || 'Candidate Report'}</h2>
                  <span className="candidate-id">Matched against: {jdData?.jd_id || 'Job Description'}</span>
                </div>
                <div className="overall-score">
                  <div className="score-circle" style={{ borderColor: getScoreColor(results.match_result.overall_score) }}>
                    {results.match_result.overall_score}
                  </div>
                  <span className="score-label">Overall Match Score</span>
                </div>
              </div>

              <div className="summary-text">
                {results.insights.summary}
              </div>

              <div className="metrics-grid">
                <div className="metric-card">
                  <span className="metric-title"><Briefcase size={14}/> Skill Match</span>
                  <span className="metric-value">{results.match_result.skill_match_score}<span className="metric-unit">/100</span></span>
                </div>
                <div className="metric-card">
                  <span className="metric-title"><GraduationCap size={14}/> Experience</span>
                  <span className="metric-value">{results.match_result.experience_score}<span className="metric-unit">/100</span></span>
                </div>
                <div className="metric-card">
                  <span className="metric-title"><Award size={14}/> Similarity</span>
                  <span className="metric-value">{results.match_result.similarity_score}<span className="metric-unit">/100</span></span>
                </div>
              </div>

              <div className="insights-grid">
                <div className="insight-card">
                  <h3 className="strengths"><CheckCircle size={18} /> Key Strengths</h3>
                  <ul className="insight-list check">
                    {results.insights.strengths.map((str, i) => <li key={i}>{str}</li>)}
                  </ul>
                </div>
                <div className="insight-card">
                  <h3 className="gaps"><XCircle size={18} /> Identified Gaps</h3>
                  <ul className="insight-list cross">
                    {results.insights.gaps.map((gap, i) => <li key={i}>{gap}</li>)}
                  </ul>
                </div>
              </div>

              <div className="insight-card questions-section">
                <h3><HelpCircle size={18} /> AI Generated Interview Questions</h3>
                <ul className="insight-list dot">
                  {results.insights.interview_questions.map((q, i) => <li key={i}>{q}</li>)}
                </ul>
              </div>
              
              <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                <button className="btn btn-secondary" onClick={() => window.print()}>
                  <Download size={18} /> Export PDF Report
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Quick placeholder component for initial state
const Activity = ({size, opacity}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{opacity}}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
);

export default App;
