import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  HiSun,
  HiMoon,
  HiBell,
  HiBars3,
  HiMagnifyingGlass,
  HiCog6Tooth,
  HiUser,
  HiArrowRightOnRectangle,
} from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/upload': 'Upload Dataset',
  '/preview': 'Dataset Preview',
  '/cleaning': 'Data Cleaning',
  '/outliers': 'Outlier Detection',
  '/visualizations': 'Visualizations',
  '/insights': 'AI Insights',
  '/reports': 'Reports',
  '/downloads': 'Downloads',
  '/settings': 'Settings',
};

export default function Navbar({ onMenuToggle }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleDark } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const profileRef = useRef(null);

  const pageTitle = PAGE_TITLES[location.pathname] || 'DataClean Pro';
  const isDark = theme === 'dark';

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'DC';

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 md:px-6 bg-surface border-b border-border">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg transition-colors md:hidden"
        >
          <HiBars3 className="w-5 h-5" />
        </button>
        {/* Desktop sidebar toggle */}
        <button
          onClick={onMenuToggle}
          className="hidden md:flex p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg transition-colors"
        >
          <HiBars3 className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold text-text-primary">{pageTitle}</h2>
      </div>

      {/* Center — search bar */}
      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search datasets, charts, insights..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full bg-bg border border-border text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        {/* Dark / light toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleDark}
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg transition-colors"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
        </motion.button>

        {/* Notification bell */}
        <button className="relative p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg transition-colors">
          <HiBell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full ring-2 ring-surface" />
        </button>

        {/* Profile */}
        <div ref={profileRef} className="relative ml-2">
          <button
            onClick={() => setProfileOpen((p) => !p)}
            className="flex items-center gap-2 p-1 pr-2 rounded-xl hover:bg-bg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
              {initials}
            </div>
            <span className="hidden lg:block text-sm font-medium text-text-primary">
              {user?.name || 'User'}
            </span>
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-xl shadow-xl overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold text-text-primary">{user?.name || 'User'}</p>
                  <p className="text-xs text-text-muted">{user?.email || ''}</p>
                </div>
                <div className="p-1.5">
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:bg-bg hover:text-text-primary rounded-lg transition-colors">
                    <HiUser className="w-4 h-4" />
                    Profile
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:bg-bg hover:text-text-primary rounded-lg transition-colors">
                    <HiCog6Tooth className="w-4 h-4" />
                    Settings
                  </button>
                  <div className="border-t border-border my-1" />
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-danger hover:bg-danger/5 rounded-lg transition-colors"
                  >
                    <HiArrowRightOnRectangle className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
