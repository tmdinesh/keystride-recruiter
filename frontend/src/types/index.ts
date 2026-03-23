export interface Candidate {
  id: string;
  name: string;
  email: string;
  matchScore: number;
  experience: number;
  topMatchedSkills: string[];
  missingSkills: string[];
  recommendation: 'Strong' | 'Medium' | 'Weak' | 'Reject';
  shortlisted: boolean;
  strengths: string[];
  skillGaps: string[];
  summary: string;
  interviewQuestions: string[];
  experienceMatch: number;
  skillMatch: number;
  educationMatch: number;
  skillComparison: SkillComparison[];
}

export interface SkillComparison {
  skill: string;
  candidateHas: boolean;
  matchScore: number;
}

export interface DashboardStats {
  totalCandidates: number;
  strongFit: number;
  mediumFit: number;
  weakFit: number;
  averageMatchScore: number;
}

export interface Activity {
  id: string;
  type: 'resume_uploaded' | 'jd_processed' | 'candidate_shortlisted';
  message: string;
  timestamp: string;
}

export interface Report {
  id: string;
  name: string;
  type: 'shortlist_summary' | 'full_ranking' | 'bias_evaluation';
  dateGenerated: string;
}

export interface Metrics {
  precision: number;
  recall: number;
  top5Accuracy: number;
  confusionMatrix: number[][];
  fairnessScore: number;
  scoreDifference: number;
}
