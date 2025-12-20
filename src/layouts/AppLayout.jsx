import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Bell, Settings as SettingsIcon, LogOut, Menu, X } from 'lucide-react';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { useUnreadNotifications } from '../hooks/useUnreadNotifications';

export default function AppLayout({ children, userRole = 'artist' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const unreadCount = useUnreadNotifications();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('[AppLayout] Logout error:', error);
    }
  };

  const navItems = [
    { 
      path: '/dashboard', 
      icon: LayoutDashboard, 
      label: 'Dashboard',
      show: userRole === 'artist'
    },
    { 
      path: '/client/dashboard', 
      icon: LayoutDashboard, 
      label: 'Dashboard',
      show: userRole === 'client'
    },
    { 
      path: '/notifications', 
      icon: Bell, 
      label: 'Notifications',
      badge: unreadCount > 0 ? unreadCount : null
    },
    { 
      path: '/settings', 
      icon: SettingsIcon, 
      label: 'Settings'
    }
  ].filter(item => item.show !== false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={closeMobileMenu}
          className="md:hidden fixed inset-0 bg-black/50 z-30"
        />
      )}

      {/* Sidebar - Fixed, sempre visível */}
      <aside
        className={`
          w-64 bg-white border-r border-gray-200 flex flex-col
          fixed md:static inset-y-0 left-0 z-40
          transform transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Close Button - Inside Sidebar (Mobile) */}
        <button
          onClick={closeMobileMenu}
          className="md:hidden absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent">
            Healink
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {userRole === 'artist' ? 'Artist Portal' : 'Client Portal'}
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  closeMobileMenu();
                }}
                className={`
                  w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl 
                  transition-all duration-200 font-medium
                  ${
                    isActive
                      ? 'bg-black text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`
                    text-xs font-bold px-2 py-0.5 rounded-full
                    ${isActive ? 'bg-white text-black' : 'bg-red-500 text-white'}
                  `}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content - Scrollable, muda baseado na rota */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header with Hamburger - Only visible on mobile */}
        <div className="md:hidden sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">Healink</h2>
        </div>
        
        {children}
      </main>
    </div>
  );
}
