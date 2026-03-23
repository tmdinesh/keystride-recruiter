import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, FileText, X, Loader2, CheckCircle2, CloudUpload } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { apiService } from '../services/api';
import { Toast } from '../components/ui/toast';

export const Upload = () => {
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState('');
  const [resumeFiles, setResumeFiles] = useState<File[]>([]);
  const [jdUploading, setJdUploading] = useState(false);
  const [resumesUploading, setResumesUploading] = useState(false);
  const [jdUploaded, setJdUploaded] = useState(false);
  const [resumesUploaded, setResumesUploaded] = useState(false);
  const [jdDragging, setJdDragging] = useState(false);
  const [resumeDragging, setResumeDragging] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const navigate = useNavigate();

  const handleJdFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setJdDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/pdf' || file.type.includes('word'))) {
      setJdFile(file);
    }
  }, []);

  const handleResumeFilesDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setResumeDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type === 'application/pdf' || file.type.includes('word')
    );
    setResumeFiles(prev => [...prev, ...files]);
  }, []);

  const handleJdFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setJdFile(file);
  };

  const handleResumeFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setResumeFiles(prev => [...prev, ...files]);
  };

  const removeResumeFile = (index: number) => {
    setResumeFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleJdUpload = async () => {
    if (!jdFile && !jdText.trim()) {
      setToast({ message: 'Please upload a file or enter JD text', type: 'error' });
      return;
    }
    setJdUploading(true);
    try {
      const content = jdFile || jdText;
      await apiService.uploadJD(content as File | string);
      setJdUploaded(true);
      setToast({ message: 'Job Description uploaded successfully!', type: 'success' });
    } catch {
      setToast({ message: 'Failed to upload JD', type: 'error' });
    } finally {
      setJdUploading(false);
    }
  };

  const handleResumesUpload = async () => {
    if (resumeFiles.length === 0) {
      setToast({ message: 'Please select at least one resume', type: 'error' });
      return;
    }
    setResumesUploading(true);
    try {
      await apiService.uploadResumes(resumeFiles);
      setResumesUploaded(true);
      setToast({ message: `Successfully uploaded ${resumeFiles.length} resume(s)!`, type: 'success' });
      setTimeout(() => navigate('/candidates'), 2000);
    } catch {
      setToast({ message: 'Failed to upload resumes', type: 'error' });
    } finally {
      setResumesUploading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Upload</h1>
        <p className="text-sm text-muted-foreground mt-1">Upload job description and candidate resumes</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* JD Upload */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <CardTitle>Job Description</CardTitle>
                <CardDescription className="mt-0.5">Upload PDF/DOCX or paste text</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Drop zone */}
            <div
              onDrop={handleJdFileDrop}
              onDragOver={(e) => { e.preventDefault(); setJdDragging(true); }}
              onDragLeave={() => setJdDragging(false)}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${jdDragging
                  ? 'border-primary bg-primary/5 scale-[1.01]'
                  : jdFile
                    ? 'border-emerald-500/50 bg-emerald-500/5'
                    : 'border-border hover:border-primary/50 hover:bg-accent/40'
                }`}
            >
              {jdFile ? (
                <div className="space-y-3">
                  <div className="h-12 w-12 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-sm font-medium text-foreground truncate px-4">{jdFile.name}</p>
                  <p className="text-xs text-muted-foreground">{(jdFile.size / 1024).toFixed(1)} KB</p>
                  <Button variant="ghost" size="sm" onClick={() => setJdFile(null)}>
                    <X className="h-3.5 w-3.5 mr-1" /> Remove
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center gap-3 cursor-pointer">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <CloudUpload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-foreground font-medium">
                      Drop your JD here, or <span className="text-primary underline-offset-2 hover:underline">browse</span>
                    </p>
                    <p className="text-xs text-muted-foreground">PDF, DOC, DOCX up to 10MB</p>
                  </div>
                  <input type="file" accept=".pdf,.doc,.docx" onChange={handleJdFileSelect} className="hidden" />
                </label>
              )}
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-3 text-xs text-muted-foreground uppercase tracking-wider">or paste text</span>
              </div>
            </div>

            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste job description text here..."
              className="w-full min-h-[160px] rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/60 focus:border-primary/50 resize-none transition-all duration-200 disabled:opacity-50"
              disabled={!!jdFile}
            />

            <Button
              onClick={handleJdUpload}
              disabled={jdUploading || jdUploaded || (!jdFile && !jdText.trim())}
              className="w-full"
              variant={jdUploaded ? 'success' : 'default'}
            >
              {jdUploading ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Processing...</>
              ) : jdUploaded ? (
                <><CheckCircle2 className="h-4 w-4" />Uploaded!</>
              ) : (
                <><UploadIcon className="h-4 w-4" />Upload JD</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Resumes Upload */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <CloudUpload className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle>Candidate Resumes</CardTitle>
                <CardDescription className="mt-0.5">Upload multiple resumes at once</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Drop zone */}
            <div
              onDrop={handleResumeFilesDrop}
              onDragOver={(e) => { e.preventDefault(); setResumeDragging(true); }}
              onDragLeave={() => setResumeDragging(false)}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${resumeDragging
                  ? 'border-primary bg-primary/5 scale-[1.01]'
                  : 'border-border hover:border-primary/50 hover:bg-accent/40'
                }`}
            >
              <label className="flex flex-col items-center gap-3 cursor-pointer">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${resumeFiles.length > 0 ? 'bg-primary/10' : 'bg-muted'
                  }`}>
                  <CloudUpload className={`h-6 w-6 ${resumeFiles.length > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-foreground font-medium">
                    Drop resume files here, or <span className="text-primary underline-offset-2 hover:underline">browse</span>
                  </p>
                  <p className="text-xs text-muted-foreground">PDF, DOC, DOCX · up to 10MB each</p>
                </div>
                <input type="file" accept=".pdf,.doc,.docx" multiple onChange={handleResumeFilesSelect} className="hidden" />
              </label>
            </div>

            {/* File list */}
            {resumeFiles.length > 0 && (
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  {resumeFiles.length} file{resumeFiles.length !== 1 ? 's' : ''} selected
                </p>
                {resumeFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2.5 bg-muted/50 rounded-lg border border-border/50 group"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm text-foreground truncate">{file.name}</span>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {(file.size / 1024).toFixed(0)}KB
                      </span>
                    </div>
                    <button
                      onClick={() => removeResumeFile(index)}
                      className="ml-2 p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <Button
              onClick={handleResumesUpload}
              disabled={resumesUploading || resumesUploaded || resumeFiles.length === 0}
              className="w-full"
              variant={resumesUploaded ? 'success' : 'default'}
            >
              {resumesUploading ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Processing {resumeFiles.length} resume(s)...</>
              ) : resumesUploaded ? (
                <><CheckCircle2 className="h-4 w-4" />Uploaded! Redirecting...</>
              ) : (
                <><UploadIcon className="h-4 w-4" />Upload {resumeFiles.length > 0 ? `${resumeFiles.length} ` : ''}Resumes</>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};
