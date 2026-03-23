import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Trash2, FileText, FileSpreadsheet, Bookmark } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { apiService } from '../services/api';
import type { Candidate } from '../types';
import { cn } from '../utils/cn';
import { Toast } from '../components/ui/toast';

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

const avatarColors = [
  'from-indigo-500 to-violet-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-sky-500 to-blue-600',
];

function getAvatarColor(name: string) {
  return avatarColors[name.charCodeAt(0) % avatarColors.length];
}

export const Shortlist = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShortlisted = async () => {
      try {
        const data = await apiService.getShortlisted();
        setCandidates(data);
      } catch (error) {
        console.error('Failed to fetch shortlisted candidates:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchShortlisted();
  }, []);

  const handleRemove = async (id: string) => {
    try {
      await apiService.removeFromShortlist(id);
      setCandidates(prev => prev.filter(c => c.id !== id));
      setToast({ message: 'Removed from shortlist', type: 'success' });
    } catch {
      setToast({ message: 'Failed to remove', type: 'error' });
    }
  };

  const handleExport = async (format: 'pdf' | 'excel') => {
    setExporting(format);
    try {
      const blob = await apiService.exportReport('shortlist', format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shortlist_report.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setToast({ message: `Exported as ${format.toUpperCase()}`, type: 'success' });
    } catch {
      setToast({ message: 'Failed to export', type: 'error' });
    } finally {
      setExporting(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="skeleton h-7 w-32" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="skeleton h-10 w-10 rounded-full" />
                <div className="space-y-1.5">
                  <div className="skeleton h-3.5 w-28" />
                  <div className="skeleton h-2.5 w-16" />
                </div>
              </div>
              <div className="skeleton h-2 w-full rounded-full" />
              <div className="skeleton h-8 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Shortlist</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {candidates.length} selected candidate{candidates.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('pdf')}
            disabled={candidates.length === 0 || exporting !== null}
          >
            <FileText className="h-4 w-4" />
            {exporting === 'pdf' ? 'Exporting...' : 'Export PDF'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('excel')}
            disabled={candidates.length === 0 || exporting !== null}
          >
            <FileSpreadsheet className="h-4 w-4" />
            {exporting === 'excel' ? 'Exporting...' : 'Export Excel'}
          </Button>
        </div>
      </div>

      {candidates.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-4">
            <div className="h-14 w-14 mx-auto rounded-full bg-muted flex items-center justify-center">
              <Bookmark className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Your shortlist is empty</p>
            <Button variant="outline" size="sm" onClick={() => navigate('/candidates')}>
              Browse Candidates
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {candidates.map((candidate) => (
            <Card key={candidate.id} className="group hover:shadow-soft-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${getAvatarColor(candidate.name)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                      {getInitials(candidate.name)}
                    </div>
                    <div>
                      <CardTitle className="text-sm">{candidate.name}</CardTitle>
                      <CardDescription className="text-xs mt-0.5">{candidate.id}</CardDescription>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(candidate.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Score */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-medium text-muted-foreground">Match Score</span>
                    <span className={cn("text-sm font-bold tabular-nums", {
                      "text-emerald-600 dark:text-emerald-400": candidate.matchScore >= 75,
                      "text-amber-600 dark:text-amber-400": candidate.matchScore >= 50 && candidate.matchScore < 75,
                      "text-orange-600 dark:text-orange-400": candidate.matchScore >= 30 && candidate.matchScore < 50,
                      "text-red-600 dark:text-red-400": candidate.matchScore < 30,
                    })}>
                      {candidate.matchScore}%
                    </span>
                  </div>
                  <Progress value={candidate.matchScore} />
                </div>

                {/* Experience */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Experience</span>
                  <span className="text-xs font-medium text-foreground">{candidate.experience} years</span>
                </div>

                {/* Skills */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">Top Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {candidate.topMatchedSkills.slice(0, 4).map((skill, idx) => (
                      <Badge key={idx} variant="info" className="text-[10px]">{skill}</Badge>
                    ))}
                  </div>
                </div>

                {/* Action */}
                <div className="pt-2 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => navigate(`/candidates/${candidate.id}`)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};
