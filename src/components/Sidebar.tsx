import { Home, Mic2, LogOut, Globe, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState } from 'react';

interface SidebarProps {
  currentPage: string;
    onNavigate: (page: string, options?: { allowUnauthed?: boolean; replace?: boolean }) => void;
  userType?: 'student' | 'teacher';
}

export function Sidebar({ currentPage, onNavigate, userType = 'student' }: SidebarProps) {
  const { user, role, logout, refreshUser } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const effectiveUserType: 'student' | 'teacher' = role === 'teacher' || role === 'admin' ? 'teacher' : userType;

  const displayName = user?.displayName || (user?.email ? user.email.split('@')[0] : null);
  const initials = (displayName || (effectiveUserType === 'teacher' ? 'Teacher' : 'Student'))
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || 'U';

  const studentNavItems = [
    { id: 'student-dashboard', icon: Home, label: 'Dashboard' },
    { id: 'pronunciation', icon: Mic2, label: 'Practice' },
  ];

  const teacherNavItems = [
    { id: 'teacher-dashboard', icon: Home, label: 'Dashboard' },
    { id: 'pronunciation', icon: Mic2, label: 'Practice' },
  ];

  const navItems = effectiveUserType === 'teacher' ? teacherNavItems : studentNavItems;

  return (
    <>
      {/* Mobile Header with Hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-sidebar-border shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <Globe className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">LinguaLive</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col z-40
        w-64 lg:w-64
        transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        overflow-hidden
      `}>
        {/* Logo - Hidden on mobile (shown in header instead) */}
        <div className="hidden lg:block p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
              <Globe className="w-6 h-6 text-sidebar-primary-foreground" />
            </div>
            <span className="text-xl">LinguaLive</span>
          </div>
        </div>

        {/* Spacer for mobile header */}
        <div className="lg:hidden h-16" />

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto min-h-0">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      onNavigate(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                        : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile - Always visible at bottom */}
        <div className="p-4 border-t border-sidebar-border flex-shrink-0">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-sidebar-accent transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground shrink-0">
              {user?.photoURL ? (
                <ImageWithFallback src={user.photoURL} alt="User" className="w-full h-full object-cover" />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-slate-900 truncate">{displayName ?? (effectiveUserType === 'teacher' ? 'Teacher' : 'Student')}</div>
              <div className="text-xs text-muted-foreground truncate">
                {role === 'admin' ? 'Admin' : effectiveUserType === 'teacher' ? 'Teacher' : (user?.email ?? 'Student')}
              </div>
            </div>
          </div>
          <button 
            onClick={async () => {
              await logout();
              onNavigate('landing');
              setIsMobileMenuOpen(false);
            }}
            className="w-full mt-2 flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
