import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Zap, ArrowRight, Users, BarChart3, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { apiService } from '../services/api';

const features = [
  { icon: Users, text: 'AI-powered resume screening' },
  { icon: BarChart3, text: 'Smart candidate ranking' },
  { icon: CheckCircle, text: 'Bias-free evaluation' },
];

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiService.login(email, password);
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/dashboard');
    } catch {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await apiService.login('demo@hr.com', 'demo');
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/dashboard');
    } catch {
      setError('Demo login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand & features */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col justify-between p-12 bg-gradient-to-br from-indigo-950 via-primary/90 to-indigo-800">
        {/* Animated orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl animate-float" />
          <div className="absolute top-1/2 -right-24 h-80 w-80 rounded-full bg-primary/20 blur-3xl animate-float-delayed" />
          <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-indigo-400/15 blur-3xl animate-float" />
          {/* Dot grid overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-lg leading-none">AI HR Platform</p>
            <p className="text-indigo-200 text-xs">Resume & Job Fit Analyzer</p>
          </div>
        </div>

        {/* Hero content */}
        <div className="relative space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-soft" />
              <span className="text-xs text-indigo-100 font-medium">AI-Powered Recruitment</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
              Hire smarter,<br />
              <span className="text-indigo-300">not harder</span>
            </h1>
            <p className="text-indigo-200 text-base leading-relaxed max-w-sm">
              Intelligent resume parsing and candidate matching that helps you find the right talent, faster.
            </p>
          </div>

          {/* Feature pills */}
          <div className="space-y-3">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-indigo-200" />
                </div>
                <p className="text-sm text-indigo-100">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <p className="relative text-xs text-indigo-300/70">
          © 2025 AI HR Platform · Built for modern recruiters
        </p>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-indigo-700 flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <p className="font-bold text-foreground">AI HR Platform</p>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h2>
            <p className="text-sm text-muted-foreground">Sign in to your account to continue</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="hr@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg border border-destructive/20">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign in
                </span>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-3 text-xs text-muted-foreground uppercase tracking-wider">or</span>
            </div>
          </div>

          {/* Demo login */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            size="lg"
            onClick={handleDemoLogin}
            disabled={loading}
          >
            <ArrowRight className="h-4 w-4" />
            Continue as Demo HR
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Demo account: <span className="font-mono text-foreground">demo@hr.com / demo</span>
          </p>
        </div>
      </div>
    </div>
  );
};
