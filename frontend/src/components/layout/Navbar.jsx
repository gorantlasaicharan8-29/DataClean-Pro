import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  HiCheckCircle,
  HiInformationCircle,
  HiExclamationTriangle,
  HiXMark,
} from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useDataset } from '../../context/DatasetContext';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/upload': 'Upload Dataset',
  '/preview': 'Dataset Preview',
  '/cleaned-preview': 'Clean Preview',
  '/cleaning': 'Data Cleaning',
  '/outliers': 'Outlier Detection',
  '/visualizations': 'Visualizations',
  '/insights': 'AI Insights',
  '/reports': 'Reports',
  '/downloads': 'Downloads',
  '/settings': 'Settings',
};

const INITIAL_NOTIFICATIONS = [
  { id: 1, type: 'info', title: 'Welcome to DataClean Pro!', body: 'Upload a dataset to get started.', time: 'Just now', read: false },
  { id: 2, type: 'tip', title: 'Try Auto Clean', body: 'Go to Data Cleaning and click Auto Clean to fix your data instantly.', time: '2m ago', read: false },
  { id: 3, type: 'success', title: 'System Ready', body: 'All services are running normally.', time: '5m ago', read: true },
];

const NOTIF_ICON = {
  success: { icon: HiCheckCircle, color: 'text-accent' },
  info: { icon: HiInformationCircle, color: 'text-primary' },
  tip: { icon: HiExclamationTriangle, color: 'text-warning' },
};

export default function Navbar({ onMenuToggle }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleDark } = useTheme();
  const { isLoaded, datasetInfo } = useDataset();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [searchQuery, setSearchQuery] = useState('');

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const pageTitle = PAGE_TITLES[location.pathname] || 'DataClean Pro';
  const isDark = theme === 'dark';
  const unread = notifications.filter((n) => !n.read).length;

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'DC';

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Add a notification when dataset loads
  useEffect(() => {
    if (isLoaded && datasetInfo?.filename) {
      setNotifications((prev) => {
        const alreadyExists = prev.some((n) => n.title === 'Dataset Loaded');
        if (alreadyExists) return prev;
        return [
          {
            id: Date.now(),
            type: 'success',
            title: 'Dataset Loaded',
            body: `"${datasetInfo.filename}" is ready — ${datasetInfo.rows || 0} rows, ${datasetInfo.columns || 0} columns.`,
            time: 'Now',
            read: false,
          },
          ...prev,
        ];
      });
    }
  }, [isLoaded, datasetInfo?.filename]);

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const dismiss = (id) => setNotifications((prev) => prev.filter((n) => n.id !== id));

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 md:px-6 bg-surface border-b border-border shadow-sm">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg transition-colors"
        >
          <HiBars3 className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold text-text-primary">{pageTitle}</h2>
      </div>

      {/* Center — search */}
      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search datasets, charts, insights..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full bg-bg border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">

        {/* Dark/light toggle */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={toggleDark}
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg transition-colors"
          title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
        >
          {isDark ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
        </motion.button>

        {/* ── Notification Bell ── */}
        <div ref={notifRef} className="relative">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => { setNotifOpen((p) => !p); setProfileOpen(false); }}
            className="relative p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg transition-colors"
            title="Notifications"
          >
            <HiBell className="w-5 h-5" />
            {unread > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1 right-1 w-4 h-4 bg-danger rounded-full ring-2 ring-surface flex items-center justify-center text-[9px] text-white font-bold"
              >
                {unread > 9 ? '9+' : unread}
              </motion.span>
            )}
          </motion.button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden z-50"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <h3 className="text-sm font-bold text-text-primary">Notifications</h3>
                  {unread > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-primary hover:text-primary-dark font-medium transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notification list */}
                <div className="max-h-80 overflow-y-auto divide-y divide-border">
                  {notifications.length === 0 ? (
                    <div className="py-10 text-center">
                      <HiBell className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-40" />
                      <p className="text-sm text-text-muted">No notifications</p>
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const { icon: Icon, color } = NOTIF_ICON[notif.type] || NOTIF_ICON.info;
                      return (
                        <motion.div
                          key={notif.id}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`flex items-start gap-3 px-4 py-3 hover:bg-bg transition-colors ${!notif.read ? 'bg-primary/[0.03]' : ''}`}
                        >
                          <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${color}`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${notif.read ? 'text-text-secondary' : 'text-text-primary'}`}>
                              {notif.title}
                              {!notif.read && <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-primary align-middle" />}
                            </p>
                            <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{notif.body}</p>
                            <p className="text-[10px] text-text-muted mt-1">{notif.time}</p>
                          </div>
                          <button
                            onClick={() => dismiss(notif.id)}
                            className="text-text-muted hover:text-text-primary transition-colors flex-shrink-0 mt-0.5"
                          >
                            <HiXMark className="w-3.5 h-3.5" />
                          </button>
                        </motion.div>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2.5 border-t border-border bg-bg/50">
                  <button
                    onClick={() => { setNotifOpen(false); navigate('/settings'); }}
                    className="text-xs text-text-secondary hover:text-primary transition-colors"
                  >
                    Manage notification settings →
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Profile dropdown ── */}
        <div ref={profileRef} className="relative ml-2">
          <button
            onClick={() => { setProfileOpen((p) => !p); setNotifOpen(false); }}
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
                className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-2xl shadow-xl overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold text-text-primary">{user?.name || 'User'}</p>
                  <p className="text-xs text-text-muted">{user?.email || ''}</p>
                </div>
                <div className="p-1.5">
                  <button
                    onClick={() => { setProfileOpen(false); navigate('/settings'); }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:bg-bg hover:text-text-primary rounded-lg transition-colors"
                  >
                    <HiUser className="w-4 h-4" /> Profile
                  </button>
                  <button
                    onClick={() => { setProfileOpen(false); navigate('/settings'); }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:bg-bg hover:text-text-primary rounded-lg transition-colors"
                  >
                    <HiCog6Tooth className="w-4 h-4" /> Settings
                  </button>
                  <div className="border-t border-border my-1" />
                  <button
                    onClick={() => { setProfileOpen(false); logout(); }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-danger hover:bg-danger/5 rounded-lg transition-colors"
                  >
                    <HiArrowRightOnRectangle className="w-4 h-4" /> Logout
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
