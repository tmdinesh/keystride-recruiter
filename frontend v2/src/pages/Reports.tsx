import { useEffect, useState } from 'react';
import { FileText, Download, Calendar, LayoutGrid } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { apiService } from '../services/api';
import type { Report } from '../types';
import { Toast } from '../components/ui/toast';

const reportTypeConfig: Record<string, { label: string; variant: 'default' | 'info' | 'success' | 'warning' }> = {
  shortlist_summary: { label: 'Shortlist Summary', variant: 'success' },
  full_ranking: { label: 'Full Ranking', variant: 'info' },
  bias_evaluation: { label: 'Bias Evaluation', variant: 'warning' },
};

export const Reports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await apiService.getReports();
        setReports(data);
      } catch (error) {
        console.error('Failed to fetch reports:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleDownload = async (report: Report, format: 'pdf' | 'excel') => {
    setDownloading(`${report.id}-${format}`);
    try {
      const blob = await apiService.exportReport(report.type, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.name.replace(/\s+/g, '_')}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setToast({ message: `Downloaded as ${format.toUpperCase()}`, type: 'success' });
    } catch {
      setToast({ message: 'Failed to download report', type: 'error' });
    } finally {
      setDownloading(null);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="skeleton h-7 w-24" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-6 space-y-4">
              <div className="skeleton h-4 w-40" />
              <div className="skeleton h-3 w-24" />
              <div className="skeleton h-3 w-32" />
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">Generate and download recruitment reports</p>
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-4">
            <div className="h-14 w-14 mx-auto rounded-full bg-muted flex items-center justify-center">
              <LayoutGrid className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No reports available yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => {
            const typeInfo = reportTypeConfig[report.type] ?? { label: report.type, variant: 'default' };
            return (
              <Card key={report.id} className="hover:shadow-soft-lg transition-all duration-300 group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <Badge variant={typeInfo.variant} className="text-[10px] mt-0.5">
                      {typeInfo.label}
                    </Badge>
                  </div>
                  <div className="mt-3">
                    <CardTitle className="text-sm leading-snug">{report.name}</CardTitle>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Generated {formatDate(report.dateGenerated)}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 pt-3 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDownload(report, 'pdf')}
                      disabled={downloading !== null}
                    >
                      <Download className="h-3.5 w-3.5" />
                      {downloading === `${report.id}-pdf` ? 'Downloading...' : 'PDF'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDownload(report, 'excel')}
                      disabled={downloading !== null}
                    >
                      <Download className="h-3.5 w-3.5" />
                      {downloading === `${report.id}-excel` ? 'Downloading...' : 'Excel'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};
