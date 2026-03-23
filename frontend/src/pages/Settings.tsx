import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { User, Bell, Code2, SlidersHorizontal } from 'lucide-react';

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
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

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
            <Input defaultValue="HR Manager" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Email Address</label>
            <Input type="email" defaultValue="hr@company.com" />
          </div>
          <Button size="sm">Save Changes</Button>
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
          <Button variant="outline" size="sm">Reset to Defaults</Button>
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
            <Input defaultValue="http://localhost:8000/api" className="font-mono text-xs" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">API Key</label>
            <Input type="password" defaultValue="••••••••" className="font-mono" />
          </div>
          <Button variant="outline" size="sm">Test Connection</Button>
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
            { label: 'Experience Weight', defaultValue: '30' },
            { label: 'Skills Weight', defaultValue: '50' },
            { label: 'Education Weight', defaultValue: '20' },
          ].map(({ label, defaultValue }) => (
            <div key={label} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">{label}</label>
                <span className="text-xs text-muted-foreground">{defaultValue}%</span>
              </div>
              <Input type="number" defaultValue={defaultValue} min="0" max="100" />
            </div>
          ))}
          <Button size="sm">Update Weights</Button>
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
    </div>
  );
};
