import axios from 'axios';
import type { Candidate, DashboardStats, Activity, Report, Metrics } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // Auth
  login: async (email: string, password: string) => {
    // Keep mock auth for now as backend doesn't have User models
    await new Promise(resolve => setTimeout(resolve, 500));
    return { token: 'mock-token', user: { email, name: 'HR Manager' } };
  },

  // Dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    const res = await api.get('/dashboard/stats');
    return res.data;
  },

  getActivities: async (): Promise<Activity[]> => {
    const res = await api.get('/activities');
    return res.data;
  },

  // Upload
  uploadJD: async (file: File | string): Promise<{ success: boolean; message: string }> => {
    if (file instanceof File) {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/upload_jd', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    }
    return { success: false, message: 'Text upload not supported yet' };
  },

  uploadResumes: async (files: File[]): Promise<{ success: boolean; message: string; count: number }> => {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f)); // Backend expects list[UploadFile] named 'files'
    const res = await api.post('/upload_resumes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  // Candidates
  getCandidates: async (filter?: string): Promise<Candidate[]> => {
    const url = filter ? `/candidates?filter=${filter}` : '/candidates';
    const res = await api.get(url);
    return res.data;
  },

  getCandidate: async (id: string): Promise<Candidate> => {
    const res = await api.get(`/candidates/${id}`);
    return res.data;
  },

  // Shortlist
  addToShortlist: async (id: string): Promise<{ success: boolean }> => {
    const res = await api.post(`/candidates/${id}/shortlist`);
    return res.data;
  },

  removeFromShortlist: async (id: string): Promise<{ success: boolean }> => {
    const res = await api.delete(`/candidates/${id}/shortlist`);
    return res.data;
  },

  rejectCandidate: async (id: string): Promise<{ success: boolean }> => {
    const res = await api.post(`/candidates/${id}/reject`);
    return res.data;
  },

  getShortlisted: async (): Promise<Candidate[]> => {
    const res = await api.get('/shortlist');
    return res.data;
  },

  // Reports
  getReports: async (): Promise<Report[]> => {
    const res = await api.get('/reports');
    return res.data;
  },

  exportReport: async (type: string, format: 'pdf' | 'excel'): Promise<Blob> => {
    const res = await api.get(`/export?type=${type}&format=${format}`, {
      responseType: 'blob'
    });
    return res.data;
  },

  // Settings
  getSettings: async (): Promise<any> => {
    const res = await api.get('/settings');
    return res.data;
  },

  updateSettings: async (settings: any): Promise<{ success: boolean }> => {
    const res = await api.post('/settings', settings);
    return res.data;
  },

  // Metrics
  getMetrics: async (): Promise<Metrics> => {
    const res = await api.get('/metrics');
    return res.data;
  },
};
