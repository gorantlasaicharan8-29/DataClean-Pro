import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { HiSun, HiMoon, HiCog6Tooth, HiSparkles, HiBell, HiUser } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';

const THEMES = [
  {
    id: 'light',
    label: 'Light',
    icon: <HiSun className="w-8 h-8 text-amber-500" />,
    ring: 'border-amber-400',
    bg: 'bg-amber-50',
  },
  {
    id: 'dark',
    label: 'Dark',
    icon: <HiMoon className="w-8 h-8 text-indigo-400" />,
    ring: 'border-indigo-500',
    bg: 'bg-indigo-50',
  },
  {
    id: 'blue',
    label: 'Blue',
    dot: 'bg-blue-600',
    ring: 'border-blue-600',
    bg: 'bg-blue-50',
  },
  {
    id: 'green',
    label: 'Green',
    dot: 'bg-emerald-500',
    ring: 'border-emerald-500',
    bg: 'bg-emerald-50',
  },
  {
    id: 'purple',
    label: 'Purple',
    dot: 'bg-purple-600',
    ring: 'border-purple-600',
    bg: 'bg-purple-50',
  },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  const [notifications, setNotifications] = useState({
    upload: true,
    cleaning: true,
    report: true,
    error: true,
  });

  const handleThemeChange = (t) => {
    setTheme(t);
    toast.success(`Theme changed to ${t}`);
  };

  const toggleNotif = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-md">
            <HiCog6Tooth className="w-5 h-5 text-white" />
          </span>
          Settings
        </h1>
        <p className="text-text-secondary text-sm mt-1">Manage your preferences and application settings.</p>
      </motion.div>

      {/* ── Appearance ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-surface rounded-2xl border border-border p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-5">
          <HiSparkles className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-text-primary">Appearance</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => handleThemeChange(t.id)}
              className={`relative cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition-all duration-200 ${
                theme === t.id
                  ? `${t.ring} ${t.bg} shadow-md scale-105`
                  : 'border-border bg-bg hover:border-primary/40 hover:scale-102'
              }`}
            >
              {theme === t.id && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
              )}
              {t.icon ?? <div className={`w-8 h-8 rounded-full ${t.dot} shadow`} />}
              <span className="text-sm font-semibold text-text-primary">{t.label}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-text-muted mt-4">
          Current theme: <span className="font-semibold text-primary capitalize">{theme}</span>
        </p>
      </motion.div>

      {/* ── Notifications ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-surface rounded-2xl border border-border p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-5">
          <HiBell className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-text-primary">Notifications</h2>
        </div>
        <div className="space-y-4">
          {Object.keys(notifications).map((k) => (
            <div key={k} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <h3 className="font-medium text-text-primary capitalize">{k} Notifications</h3>
                <p className="text-sm text-text-secondary">Show alerts for {k} events.</p>
              </div>
              {/* Toggle switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={notifications[k]}
                  onChange={() => toggleNotif(k)}
                />
                <div className="w-11 h-6 bg-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
              </label>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Profile ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-surface rounded-2xl border border-border p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-5">
          <HiUser className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-text-primary">Profile</h2>
        </div>
        <div className="flex items-center gap-5 flex-wrap">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-text-primary">{user?.name || 'Admin User'}</h3>
            <p className="text-text-secondary text-sm">{user?.email || 'admin@dataclean.pro'}</p>
            <span className="mt-2 inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
              Data Analyst
            </span>
          </div>
          <button
            onClick={() => toast('Feature coming soon! 🚀')}
            className="ml-auto px-5 py-2 border border-border rounded-xl text-text-primary bg-bg hover:bg-primary/10 hover:border-primary/40 transition font-medium text-sm"
          >
            Edit Profile
          </button>
        </div>
      </motion.div>

      {/* ── About ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-surface rounded-2xl border border-border p-6 shadow-sm text-center"
      >
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-dark shadow-md mb-3">
          <HiSparkles className="w-6 h-6 text-white" />
        </div>
        <p className="font-bold text-lg text-text-primary">DataClean Pro</p>
        <p className="text-text-secondary text-sm">Version 1.0.0</p>
        <p className="mt-3 text-xs text-text-muted">Built with React, FastAPI, and Pandas</p>
      </motion.div>
    </div>
  );
}
