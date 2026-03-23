import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, TrendingUp, AlertCircle, XCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { apiService } from '../services/api';
import type { DashboardStats, Activity } from '../types';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';

const CHART_COLORS = {
  strong: '#10b981',
  medium: '#f59e0b',
  weak: '#f97316',
  reject: '#ef4444',
  primary: '#6366f1',
};

const statCards = (stats: DashboardStats) => [
  {
    label: 'Total Candidates',
    value: stats.totalCandidates,
    suffix: '',
    icon: Users,
    iconBg: 'bg-indigo-500/10',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-l-indigo-500/60',
    sub: 'Active profiles',
  },
  {
    label: 'Strong Fit',
    value: stats.strongFit,
    suffix: '',
    icon: TrendingUp,
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-l-emerald-500/60',
    sub: 'High match score',
  },
  {
    label: 'Medium Fit',
    value: stats.mediumFit,
    suffix: '',
    icon: AlertCircle,
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-600 dark:text-amber-400',
    border: 'border-l-amber-500/60',
    sub: 'Moderate match',
  },
  {
    label: 'Weak / Reject',
    value: stats.weakFit,
    suffix: '',
    icon: XCircle,
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-600 dark:text-red-400',
    border: 'border-l-red-500/60',
    sub: 'Low match score',
  },
  {
    label: 'Avg Match Score',
    value: stats.averageMatchScore,
    suffix: '%',
    icon: TrendingUp,
    iconBg: 'bg-indigo-500/10',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-l-indigo-500/60',
    sub: 'Overall average',
  },
];

const SkeletonCard = () => (
  <div className="rounded-xl border border-border bg-card p-6 space-y-3">
    <div className="flex justify-between items-center">
      <div className="skeleton h-3 w-28" />
      <div className="skeleton h-8 w-8 rounded-lg" />
    </div>
    <div className="skeleton h-8 w-16" />
    <div className="skeleton h-2.5 w-20" />
  </div>
);

export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, activitiesData] = await Promise.all([
          apiService.getDashboardStats(),
          apiService.getActivities(),
        ]);
        setStats(statsData);
        setActivities(activitiesData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const skillsData = [
    { skill: 'Python', count: 8 },
    { skill: 'React', count: 7 },
    { skill: 'Node.js', count: 6 },
    { skill: 'TypeScript', count: 6 },
    { skill: 'AWS', count: 5 },
    { skill: 'Docker', count: 5 },
    { skill: 'MongoDB', count: 4 },
    { skill: 'PostgreSQL', count: 4 },
    { skill: 'GraphQL', count: 3 },
    { skill: 'Kubernetes', count: 3 },
  ];

  const scoreDistribution = [
    { range: '0–20', count: 0 },
    { range: '21–40', count: 1 },
    { range: '41–60', count: 2 },
    { range: '61–80', count: 4 },
    { range: '81–100', count: 3 },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'resume_uploaded':
        return <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center"><Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /></div>;
      case 'jd_processed':
        return <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center"><TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /></div>;
      case 'candidate_shortlisted':
        return <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center"><AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" /></div>;
      default:
        return <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center"><div className="h-2 w-2 rounded-full bg-muted-foreground" /></div>;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="space-y-7 animate-in fade-in slide-up">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your recruitment analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {loading
          ? Array(5).fill(0).map((_, i) => <SkeletonCard key={i} />)
          : stats && statCards(stats).map((card) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.label}
                className={`border-l-4 ${card.border} hover:shadow-soft-lg transition-all duration-300 group`}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-5 px-5">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {card.label}
                  </CardTitle>
                  <div className={`h-8 w-8 rounded-lg ${card.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-4 w-4 ${card.iconColor}`} />
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <div className="text-2xl font-bold text-foreground">
                    {card.value}{card.suffix}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
                </CardContent>
              </Card>
            );
          })
        }
      </div>

      {/* Charts row */}
      {!loading && stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Pie chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Fit Distribution</CardTitle>
              <CardDescription>Candidate match categories</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Strong Fit', value: stats.strongFit, color: CHART_COLORS.strong },
                      { name: 'Medium Fit', value: stats.mediumFit, color: CHART_COLORS.medium },
                      { name: 'Weak Fit', value: stats.weakFit, color: CHART_COLORS.weak },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {[CHART_COLORS.strong, CHART_COLORS.medium, CHART_COLORS.weak].map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="flex justify-center gap-4 mt-2">
                {[
                  { label: 'Strong', color: CHART_COLORS.strong },
                  { label: 'Medium', color: CHART_COLORS.medium },
                  { label: 'Weak', color: CHART_COLORS.weak },
                ].map(({ label, color }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                    <span className="text-xs text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bar chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Top 10 Skills</CardTitle>
              <CardDescription>Most common skills across candidates</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={skillsData} margin={{ bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="skill"
                    angle={-45}
                    textAnchor="end"
                    height={70}
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}
                  />
                  <Bar dataKey="count" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Line chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Score Distribution</CardTitle>
              <CardDescription>Match score ranges</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="range" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke={CHART_COLORS.primary}
                    strokeWidth={2.5}
                    dot={{ fill: CHART_COLORS.primary, strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activity */}
      {!loading && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription className="mt-1">Latest actions in your recruitment pipeline</CardDescription>
            </div>
            <Link
              to="/candidates"
              className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors group cursor-default"
                >
                  <div className="flex-shrink-0 group-hover:scale-105 transition-transform">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{activity.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatTime(activity.timestamp)}</p>
                  </div>
                </div>
              ))}
              {activities.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
