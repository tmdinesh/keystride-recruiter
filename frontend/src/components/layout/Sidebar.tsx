import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Upload,
  Users,
  Bookmark,
  FileText,
  BarChart3,
  Settings,
  Menu,
  X,
  Zap
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../utils/cn';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Upload, label: 'Upload', path: '/upload' },
  { icon: Users, label: 'Candidates', path: '/candidates' },
  { icon: Bookmark, label: 'Shortlist', path: '/shortlist' },
  { icon: FileText, label: 'Reports', path: '/reports' },
  { icon: BarChart3, label: 'Evaluation Metrics', path: '/metrics' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export const Sidebar = () => {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-card border border-border shadow-soft hover:bg-accent transition-colors"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 glass border-r border-border/60 transition-transform duration-300 ease-in-out lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="h-full flex flex-col px-3 py-5 overflow-y-auto">
          {/* Logo */}
          <div className="mb-6 px-2">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-indigo-700 flex items-center justify-center shadow-glow-sm flex-shrink-0">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-foreground tracking-tight">AI HR Platform</h1>
                <p className="text-xs text-muted-foreground">Resume Parser & Job Fit</p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-border/60 mx-2 mb-4" />

          {/* Nav label */}
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-3 mb-2">
            Menu
          </p>

          {/* Nav items */}
          <nav className="flex-1 space-y-0.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  )}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
                  )}
                  <Icon
                    className={cn(
                      "h-4 w-4 flex-shrink-0 transition-transform duration-200",
                      isActive ? "text-primary" : "group-hover:scale-110"
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom user card */}
          <div className="mt-4 pt-4 border-t border-border/60 px-2">
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-indigo-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                HR
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">HR Manager</p>
                <p className="text-xs text-muted-foreground truncate">hr@company.com</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};
