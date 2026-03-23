import { Search, Bell, Moon, Sun, LogOut, ChevronDown, Zap } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../ui/input';
import { useTheme } from '../../hooks/useTheme';

export const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/60 glass">
      <div className="flex h-14 items-center gap-4 px-5">
        {/* Search */}
        <div className="flex flex-1 items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search candidates, skills..."
              className="h-9 w-full rounded-full border border-input bg-muted/40 pl-9 pr-4 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/60 focus:border-primary/40 transition-all duration-200"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          {/* Notification bell */}
          <button className="relative p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary border-2 border-background animate-pulse-soft" />
          </button>

          {/* Profile */}
          <div className="relative ml-1" ref={menuRef}>
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-indigo-700 flex items-center justify-center text-white text-[10px] font-bold shadow-glow-sm">
                HR
              </div>
              <span className="text-sm font-medium text-foreground hidden sm:inline">HR Manager</span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${profileMenuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown */}
            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-xl border border-border bg-card shadow-soft-lg z-50 overflow-hidden animate-in fade-in slide-up">
                {/* Profile header */}
                <div className="px-4 py-3 border-b border-border/60 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-indigo-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    HR
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">HR Manager</p>
                    <p className="text-xs text-muted-foreground truncate">hr@company.com</p>
                  </div>
                </div>
                {/* Menu items */}
                <div className="p-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-destructive/10 hover:text-destructive transition-colors rounded-lg"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
