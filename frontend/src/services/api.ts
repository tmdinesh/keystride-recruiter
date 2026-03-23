import axios from 'axios';
import type { Candidate, DashboardStats, Activity, Report, Metrics } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock data generators
const generateMockCandidates = (): Candidate[] => {
  const names = ['John Doe', 'Jane Smith', 'Michael Johnson', 'Emily Davis', 'David Wilson', 
                 'Sarah Brown', 'Robert Taylor', 'Jessica Martinez', 'William Anderson', 'Ashley Thomas'];
  const skills = ['Python', 'React', 'Node.js', 'TypeScript', 'AWS', 'Docker', 'Kubernetes', 
                  'MongoDB', 'PostgreSQL', 'GraphQL', 'Machine Learning', 'Data Science'];
  
  return names.map((name, idx) => {
    const matchScore = 60 + Math.random() * 40;
    const recommendation = matchScore >= 80 ? 'Strong' : matchScore >= 60 ? 'Medium' : matchScore >= 40 ? 'Weak' : 'Reject';
    const matchedSkills = skills.sort(() => 0.5 - Math.random()).slice(0, 5);
    const missingSkills = skills.filter(s => !matchedSkills.includes(s)).slice(0, 3);
    
    return {
      id: `CAND-${String(idx + 1).padStart(4, '0')}`,
      name,
      email: `${name.toLowerCase().replace(' ', '.')}@email.com`,
      matchScore: Math.round(matchScore),
      experience: Math.floor(Math.random() * 10) + 2,
      topMatchedSkills: matchedSkills,
      missingSkills,
      recommendation,
      shortlisted: false,
      strengths: [
        `Strong experience in ${matchedSkills[0]}`,
        `Excellent ${matchedSkills[1]} skills`,
        `Proven track record in ${matchedSkills[2]}`
      ],
      skillGaps: [
        `Limited experience with ${missingSkills[0]}`,
        `Needs improvement in ${missingSkills[1]}`
      ],
      summary: `Experienced professional with ${Math.floor(Math.random() * 10) + 2} years in software development. Strong background in ${matchedSkills.slice(0, 2).join(' and ')}. Looking for opportunities to grow in ${missingSkills[0]}.`,
      interviewQuestions: [
        `Tell us about your experience with ${matchedSkills[0]}.`,
        `How do you handle ${matchedSkills[1]} in production environments?`,
        `What challenges have you faced with ${missingSkills[0]}?`,
        `Describe a project where you used ${matchedSkills[2]}.`,
        `How do you stay updated with latest ${matchedSkills[1]} trends?`
      ],
      experienceMatch: Math.round(70 + Math.random() * 25),
      skillMatch: Math.round(matchScore),
      educationMatch: Math.round(75 + Math.random() * 20),
      skillComparison: skills.slice(0, 8).map(skill => ({
        skill,
        candidateHas: matchedSkills.includes(skill),
        matchScore: matchedSkills.includes(skill) ? Math.round(80 + Math.random() * 20) : Math.round(20 + Math.random() * 30)
      }))
    };
  });
};

const mockCandidates = generateMockCandidates();

export const apiService = {
  // Auth
  login: async (email: string, password: string) => {
    // Mock login
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { token: 'mock-token', user: { email, name: 'HR Manager' } };
  },

  // Dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const strong = mockCandidates.filter(c => c.recommendation === 'Strong').length;
    const medium = mockCandidates.filter(c => c.recommendation === 'Medium').length;
    const weak = mockCandidates.filter(c => c.recommendation === 'Weak').length;
    const reject = mockCandidates.filter(c => c.recommendation === 'Reject').length;
    const avgScore = Math.round(mockCandidates.reduce((sum, c) => sum + c.matchScore, 0) / mockCandidates.length);
    
    return {
      totalCandidates: mockCandidates.length,
      strongFit: strong,
      mediumFit: medium,
      weakFit: weak + reject,
      averageMatchScore: avgScore
    };
  },

  getActivities: async (): Promise<Activity[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [
      { id: '1', type: 'resume_uploaded', message: 'Resume uploaded for John Doe', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
      { id: '2', type: 'jd_processed', message: 'Job Description processed successfully', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
      { id: '3', type: 'candidate_shortlisted', message: 'Jane Smith added to shortlist', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
      { id: '4', type: 'resume_uploaded', message: 'Resume uploaded for Michael Johnson', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
    ];
  },

  // Upload
  uploadJD: async (file: File | string): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { success: true, message: 'Job Description uploaded and processed successfully' };
  },

  uploadResumes: async (files: File[]): Promise<{ success: boolean; message: string; count: number }> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { success: true, message: 'Resumes uploaded successfully', count: files.length };
  },

  // Candidates
  getCandidates: async (filter?: string): Promise<Candidate[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (!filter || filter === 'All') return mockCandidates;
    return mockCandidates.filter(c => c.recommendation === filter);
  },

  getCandidate: async (id: string): Promise<Candidate> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const candidate = mockCandidates.find(c => c.id === id);
    if (!candidate) throw new Error('Candidate not found');
    return candidate;
  },

  // Shortlist
  addToShortlist: async (id: string): Promise<{ success: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const candidate = mockCandidates.find(c => c.id === id);
    if (candidate) candidate.shortlisted = true;
    return { success: true };
  },

  removeFromShortlist: async (id: string): Promise<{ success: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const candidate = mockCandidates.find(c => c.id === id);
    if (candidate) candidate.shortlisted = false;
    return { success: true };
  },

  getShortlisted: async (): Promise<Candidate[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockCandidates.filter(c => c.shortlisted);
  },

  // Reports
  getReports: async (): Promise<Report[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [
      { id: '1', name: 'Shortlist Summary Report', type: 'shortlist_summary', dateGenerated: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
      { id: '2', name: 'Full Ranking Report', type: 'full_ranking', dateGenerated: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
      { id: '3', name: 'Bias Evaluation Report', type: 'bias_evaluation', dateGenerated: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString() },
    ];
  },

  exportReport: async (type: string, format: 'pdf' | 'excel'): Promise<Blob> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Mock blob
    return new Blob(['Mock report content'], { type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  },

  // Metrics
  getMetrics: async (): Promise<Metrics> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      precision: 0.87,
      recall: 0.82,
      top5Accuracy: 0.91,
      confusionMatrix: [
        [45, 3, 1, 0],
        [5, 38, 4, 1],
        [2, 6, 28, 3],
        [0, 1, 4, 12]
      ],
      fairnessScore: 0.94,
      scoreDifference: 2.3
    };
  },
};
