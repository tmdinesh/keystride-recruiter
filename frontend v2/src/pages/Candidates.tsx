import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, ArrowUpDown, ArrowUp, ArrowDown, Check, X } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { apiService } from '../services/api';
import type { Candidate } from '../types';
import { cn } from '../utils/cn';
import { Toast } from '../components/ui/toast';

type FilterType = 'All' | 'Strong' | 'Medium' | 'Weak';
type SortType = 'score' | 'experience' | 'name';
type SortOrder = 'asc' | 'desc';
type TabType = 'active' | 'rejected';

const filterConfig: Record<FilterType, string> = {
  All: 'bg-foreground/10 text-foreground hover:bg-foreground/15',
  Strong: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20',
  Medium: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 border-amber-500/20',
  Weak: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 hover:bg-orange-500/20 border-orange-500/20',
};

const filterActiveConfig: Record<FilterType, string> = {
  All: 'bg-foreground text-background',
  Strong: 'bg-emerald-500 text-white',
  Medium: 'bg-amber-500 text-white',
  Weak: 'bg-orange-500 text-white',
};

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function getAvatarColor(name: string): string {
  const colors = [
    'from-indigo-500 to-violet-600',
    'from-emerald-500 to-teal-600',
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-600',
    'from-sky-500 to-blue-600',
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

const SkeletonRow = () => (
  <tr>
    <td className="px-5 py-3.5" colSpan={7}>
      <div className="flex items-center gap-3">
        <div className="skeleton h-8 w-8 rounded-full" />
        <div className="space-y-1.5 flex-1">
          <div className="skeleton h-3 w-32" />
          <div className="skeleton h-2.5 w-48" />
        </div>
      </div>
    </td>
  </tr>
);

export const Candidates = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('active');

  // Active tab state
  const [filteredActive, setFilteredActive] = useState<Candidate[]>([]);
  const [filterActive, setFilterActive] = useState<FilterType>('All');
  const [searchActive, setSearchActive] = useState('');

  // Rejected tab state
  const [filteredRejected, setFilteredRejected] = useState<Candidate[]>([]);
  const [searchRejected, setSearchRejected] = useState('');

  // Shared sort state
  const [sortBy, setSortBy] = useState<SortType>('score');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const data = await apiService.getCandidates();
        setCandidates(data);
      } catch (error) {
        console.error('Failed to fetch candidates:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  // Filter active (non-rejected) candidates
  useEffect(() => {
    let base = candidates.filter(c => c.recommendation !== 'Reject');
    if (filterActive !== 'All') base = base.filter(c => c.recommendation === filterActive);
    if (searchActive) {
      const q = searchActive.toLowerCase();
      base = base.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.topMatchedSkills.some(s => s.toLowerCase().includes(q)) ||
        c.id.toLowerCase().includes(q)
      );
    }
    base = [...base].sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case 'score': cmp = a.matchScore - b.matchScore; break;
        case 'experience': cmp = a.experience - b.experience; break;
        case 'name': cmp = a.name.localeCompare(b.name); break;
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    setFilteredActive(base);
  }, [candidates, filterActive, searchActive, sortBy, sortOrder]);

  // Filter rejected candidates
  useEffect(() => {
    let base = candidates.filter(c => c.recommendation === 'Reject');
    if (searchRejected) {
      const q = searchRejected.toLowerCase();
      base = base.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.topMatchedSkills.some(s => s.toLowerCase().includes(q)) ||
        c.id.toLowerCase().includes(q)
      );
    }
    base = [...base].sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case 'score': cmp = a.matchScore - b.matchScore; break;
        case 'experience': cmp = a.experience - b.experience; break;
        case 'name': cmp = a.name.localeCompare(b.name); break;
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    setFilteredRejected(base);
  }, [candidates, searchRejected, sortBy, sortOrder]);

  const handleSort = (field: SortType) => {
    if (sortBy === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortOrder('desc'); }
  };

  const getRecommendationVariant = (rec: string) => {
    switch (rec) {
      case 'Strong': return 'success';
      case 'Medium': return 'warning';
      case 'Weak': return 'danger';
      case 'Reject': return 'danger';
      default: return 'default';
    }
  };

  const SortButton = ({ field, children }: { field: SortType; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-foreground transition-colors"
    >
      {children}
      {sortBy === field ? (
        sortOrder === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
      ) : (
        <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
      )}
    </button>
  );

  const handleShortlist = async (e: React.MouseEvent, id: string, currentlyShortlisted: boolean) => {
    e.stopPropagation();
    try {
      if (currentlyShortlisted) {
        await apiService.removeFromShortlist(id);
      } else {
        await apiService.addToShortlist(id);
      }
      const data = await apiService.getCandidates();
      setCandidates(data);
      setToast({ message: currentlyShortlisted ? 'Removed from shortlist' : 'Added to shortlist', type: 'success' });
    } catch (error) {
      console.error('Failed to toggle shortlist:', error);
      setToast({ message: 'Failed to update shortlist', type: 'error' });
    }
  };

  const handleReject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await apiService.rejectCandidate(id);
      const data = await apiService.getCandidates();
      setCandidates(data);
      setToast({ message: 'Candidate marked as Rejected', type: 'info' });
    } catch (error) {
      console.error('Failed to reject candidate:', error);
      setToast({ message: 'Failed to reject candidate', type: 'error' });
    }
  };

  const totalRejected = candidates.filter(c => c.recommendation === 'Reject').length;

  const CandidateTable = ({ rows, emptyMessage }: { rows: Candidate[]; emptyMessage: string }) => (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                {[
                  { key: 'name', label: 'Candidate' },
                  { key: 'score', label: 'Match Score' },
                  { key: 'experience', label: 'Experience' },
                  { key: null, label: 'Top Skills' },
                  { key: null, label: 'Missing Skills' },
                  { key: null, label: 'Fit' },
                  { key: null, label: '' },
                ].map((col, i) => (
                  <th
                    key={i}
                    className="px-5 py-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-widest"
                  >
                    {col.key ? (
                      <SortButton field={col.key as SortType}>{col.label}</SortButton>
                    ) : col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {loading ? (
                Array(5).fill(0).map((_, i) => <SkeletonRow key={i} />)
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <p className="text-sm text-muted-foreground">{emptyMessage}</p>
                  </td>
                </tr>
              ) : (
                rows.map((candidate) => (
                  <tr
                    key={candidate.id}
                    className="hover:bg-accent/30 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/candidates/${candidate.id}`)}
                  >
                    {/* Candidate */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${getAvatarColor(candidate.name)} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                          {getInitials(candidate.name)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{candidate.name || candidate.id}</p>
                          <p className="text-xs text-muted-foreground">{candidate.id}</p>
                        </div>
                      </div>
                    </td>
                    {/* Score */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <div className="flex-1">
                          <Progress value={candidate.matchScore} />
                        </div>
                        <span className={cn("text-sm font-semibold tabular-nums w-10 text-right", {
                          "text-emerald-600 dark:text-emerald-400": candidate.matchScore >= 75,
                          "text-amber-600 dark:text-amber-400": candidate.matchScore >= 50 && candidate.matchScore < 75,
                          "text-orange-600 dark:text-orange-400": candidate.matchScore >= 30 && candidate.matchScore < 50,
                          "text-red-600 dark:text-red-400": candidate.matchScore < 30,
                        })}>
                          {candidate.matchScore}%
                        </span>
                      </div>
                    </td>
                    {/* Experience */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-sm text-foreground">
                      {candidate.experience}y
                    </td>
                    {/* Top skills */}
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {candidate.topMatchedSkills.slice(0, 3).map((skill, idx) => (
                          <Badge key={idx} variant="info" className="text-[10px]">{skill}</Badge>
                        ))}
                        {candidate.topMatchedSkills.length > 3 && (
                          <Badge variant="info" className="text-[10px]">+{candidate.topMatchedSkills.length - 3}</Badge>
                        )}
                      </div>
                    </td>
                    {/* Missing skills */}
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {candidate.missingSkills.slice(0, 2).map((skill, idx) => (
                          <Badge key={idx} variant="warning" className="text-[10px]">{skill}</Badge>
                        ))}
                        {candidate.missingSkills.length > 2 && (
                          <Badge variant="warning" className="text-[10px]">+{candidate.missingSkills.length - 2}</Badge>
                        )}
                      </div>
                    </td>
                    {/* Recommendation */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <Badge variant={getRecommendationVariant(candidate.recommendation) as any}>
                        {candidate.recommendation}
                      </Badge>
                    </td>
                    {/* Action */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-sm" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/candidates/${candidate.id}`)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        View
                      </Button>
                      {candidate.recommendation !== 'Reject' && (
                        <>
                          <Button
                            variant={candidate.shortlisted ? "default" : "outline"}
                            size="sm"
                            onClick={(e) => handleShortlist(e, candidate.id, candidate.shortlisted)}
                            className={cn("ml-2 transition-opacity", !candidate.shortlisted && "opacity-0 group-hover:opacity-100")}
                          >
                            <Check className="h-3.5 w-3.5 mr-1" />
                            {candidate.shortlisted ? 'Shortlisted' : 'Shortlist'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleReject(e, candidate.id)}
                            className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-500/10"
                          >
                            <X className="h-3.5 w-3.5 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-5 animate-in fade-in slide-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Candidates</h1>
        <p className="text-sm text-muted-foreground mt-1">Review and rank all candidates</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-muted/50 border border-border w-fit">
        <button
          onClick={() => setActiveTab('active')}
          className={cn(
            "px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
            activeTab === 'active'
              ? "bg-background text-foreground shadow-sm border border-border/60"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Candidates
          {!loading && (
            <span className={cn(
              "ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-semibold",
              activeTab === 'active' ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}>
              {candidates.filter(c => c.recommendation !== 'Reject').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('rejected')}
          className={cn(
            "px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
            activeTab === 'rejected'
              ? "bg-background text-foreground shadow-sm border border-border/60"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Rejected
          {!loading && totalRejected > 0 && (
            <span className={cn(
              "ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-semibold",
              activeTab === 'rejected' ? "bg-red-500/10 text-red-600 dark:text-red-400" : "bg-red-500/10 text-red-600/70 dark:text-red-400/70"
            )}>
              {totalRejected}
            </span>
          )}
        </button>
      </div>

      {/* ── ACTIVE CANDIDATES TAB ── */}
      {activeTab === 'active' && (
        <>
          {/* Search + Filters */}
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex flex-col md:flex-row gap-3">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search by name, email, skills, or ID..."
                    value={searchActive}
                    onChange={(e) => setSearchActive(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {/* Filters */}
                <div className="flex gap-1.5 flex-wrap">
                  {(['All', 'Strong', 'Medium', 'Weak'] as FilterType[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilterActive(f)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200",
                        filterActive === f
                          ? filterActiveConfig[f]
                          : filterConfig[f] + ' border-transparent'
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Count */}
          {!loading && (
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filteredActive.length}</span> of{' '}
              <span className="font-semibold text-foreground">{candidates.filter(c => c.recommendation !== 'Reject').length}</span> active candidates
            </p>
          )}

          <CandidateTable rows={filteredActive} emptyMessage="No candidates found" />
        </>
      )}

      {/* ── REJECTED CANDIDATES TAB ── */}
      {activeTab === 'rejected' && (
        <>
          {/* Search */}
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search rejected candidates..."
                    value={searchRejected}
                    onChange={(e) => setSearchRejected(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Count */}
          {!loading && (
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filteredRejected.length}</span> of{' '}
              <span className="font-semibold text-foreground">{totalRejected}</span> rejected candidates
            </p>
          )}

          <CandidateTable rows={filteredRejected} emptyMessage="No rejected candidates" />
        </>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};
