import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Subtle dot-grid background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40 dark:opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />
      <Sidebar />
      <div className="lg:pl-64 relative">
        <Navbar />
        <main className="p-5 lg:p-7">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
