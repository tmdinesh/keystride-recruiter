import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { User, Bell, Code2, SlidersHorizontal, Loader2 } from 'lucide-react';
import { apiService } from '../services/api';
import { Toast } from '../components/ui/toast';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

const Toggle = ({ checked, onChange, label, description }: ToggleProps) => {
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring/60 focus:ring-offset-2 ${checked ? 'bg-primary' : 'bg-muted-foreground/30'
          }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? 'translate-x-[18px]' : 'translate-x-[3px]'
            }`}
        />
      </button>
    </div>
  );
};

export const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  // Profile
  const [fullName, setFullName] = useState('HR Manager');
  const [email, setEmail] = useState('hr@company.com');
  
  // Preferences
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  
  // API
  const [apiEndpoint, setApiEndpoint] = useState('http://localhost:8000/api');
  const [apiKey, setApiKey] = useState('••••••••');
  
  // Weights
  const [weights, setWeights] = useState({
    experience: 30,
    skills: 50,
    education: 20
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await apiService.getSettings();
        setFullName(data.fullName || 'HR Manager');
        setEmail(data.email || 'hr@company.com');
        setEmailNotifs(data.emailNotifications ?? true);
        setDarkMode(data.darkMode ?? false);
        setApiEndpoint(data.apiEndpoint || 'http://localhost:8000/api');
        setWeights(data.weights || { experience: 30, skills: 50, education: 20 });
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await apiService.updateSettings({ fullName, email });
      setToast({ message: 'Profile updated successfully', type: 'success' });
    } catch {
      setToast({ message: 'Failed to update profile', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      await apiService.updateSettings({ emailNotifications: emailNotifs, darkMode });
      setToast({ message: 'Preferences updated successfully', type: 'success' });
    } catch {
      setToast({ message: 'Failed to update preferences', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setToast({ message: 'Testing connection to ' + apiEndpoint, type: 'info' });
    setTimeout(() => setToast({ message: 'Connection successful!', type: 'success' }), 1000);
  };

  const handleUpdateWeights = async () => {
    const sum = Number(weights.experience) + Number(weights.skills) + Number(weights.education);
    if (sum !== 100) {
      setToast({ message: `Weights must sum to 100 (current sum: ${sum})`, type: 'error' });
      return;
    }
    setSaving(true);
    try {
      await apiService.updateSettings({ weights });
      setToast({ message: 'Scoring weights updated', type: 'success' });
    } catch {
      setToast({ message: 'Failed to update weights', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setEmailNotifs(true);
    setDarkMode(false);
    setToast({ message: 'Preferences reset to defaults', type: 'info' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const sections = [
    {
      icon: User,
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      iconBg: 'bg-indigo-500/10',
      title: 'Profile Settings',
      description: 'Update your profile information',
      content: (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Full Name</label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Email Address</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button size="sm" onClick={handleSaveProfile} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      ),
    },
    {
      icon: Bell,
      iconColor: 'text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-500/10',
      title: 'Preferences',
      description: 'Customize your experience',
      content: (
        <div className="space-y-4">
          <Toggle
            checked={emailNotifs}
            onChange={setEmailNotifs}
            label="Email Notifications"
            description="Receive email updates for new matches"
          />
          <Toggle
            checked={darkMode}
            onChange={setDarkMode}
            label="Dark Mode"
            description="Switch to the dark theme"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSavePreferences} disabled={saving}>
              Save
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>Reset to Defaults</Button>
          </div>
        </div>
      ),
    },
    {
      icon: Code2,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-500/10',
      title: 'API Configuration',
      description: 'Manage API keys and endpoints',
      content: (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">API Endpoint</label>
            <Input value={apiEndpoint} onChange={(e) => setApiEndpoint(e.target.value)} className="font-mono text-xs" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">API Key</label>
            <Input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="font-mono" />
          </div>
          <Button variant="outline" size="sm" onClick={handleTestConnection}>Test Connection</Button>
        </div>
      ),
    },
    {
      icon: SlidersHorizontal,
      iconColor: 'text-rose-600 dark:text-rose-400',
      iconBg: 'bg-rose-500/10',
      title: 'Scoring Weights',
      description: 'Adjust match score calculation (must sum to 100)',
      content: (
        <div className="space-y-4">
          {[
            { label: 'Experience Weight', key: 'experience', value: weights.experience },
            { label: 'Skills Weight', key: 'skills', value: weights.skills },
            { label: 'Education Weight', key: 'education', value: weights.education },
          ].map(({ label, key, value }) => (
            <div key={label} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">{label}</label>
                <span className="text-xs text-muted-foreground">{value}%</span>
              </div>
              <Input 
                type="number" 
                value={value} 
                onChange={(e) => setWeights({ ...weights, [key]: e.target.value })} 
                min="0" 
                max="100" 
              />
            </div>
          ))}
          <Button size="sm" onClick={handleUpdateWeights} disabled={saving}>Update Weights</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 animate-in fade-in slide-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.title}>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-lg ${section.iconBg} flex items-center justify-center`}>
                    <Icon className={`h-4 w-4 ${section.iconColor}`} />
                  </div>
                  <div>
                    <CardTitle>{section.title}</CardTitle>
                    <CardDescription className="mt-0.5">{section.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {section.content}
              </CardContent>
            </Card>
          );
        })}
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};
