import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { HiSun, HiMoon, HiCog6Tooth } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  
  const [notifications, setNotifications] = useState({
    upload: true,
    cleaning: true,
    report: true,
    error: true
  });

  const handleThemeChange = (t) => {
    setTheme(t);
    toast.success(`Theme updated to ${t}`);
  };

  const toggleNotif = (key) => {
    setNotifications(prev => ({...prev, [key]: !prev[key]}));
  };

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2"><HiCog6Tooth className="text-slate-400"/> Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage your preferences and application settings.</p>
      </div>

      <div className="space-y-8">
        
        {/* Theme Section */}
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Appearance</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div onClick={() => handleThemeChange('light')} className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition ${theme === 'light' ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
              <HiSun className="w-8 h-8 text-amber-500" />
              <span className="font-medium text-slate-700 dark:text-slate-300">Light</span>
            </div>
            <div onClick={() => handleThemeChange('dark')} className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition ${theme === 'dark' ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
              <HiMoon className="w-8 h-8 text-indigo-400" />
              <span className="font-medium text-slate-700 dark:text-slate-300">Dark</span>
            </div>
            <div onClick={() => handleThemeChange('blue')} className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition ${theme === 'blue' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
              <div className="w-8 h-8 rounded-full bg-blue-600" />
              <span className="font-medium text-slate-700 dark:text-slate-300">Blue</span>
            </div>
            <div onClick={() => handleThemeChange('green')} className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition ${theme === 'green' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
              <div className="w-8 h-8 rounded-full bg-emerald-500" />
              <span className="font-medium text-slate-700 dark:text-slate-300">Green</span>
            </div>
            <div onClick={() => handleThemeChange('purple')} className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition ${theme === 'purple' ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
              <div className="w-8 h-8 rounded-full bg-purple-600" />
              <span className="font-medium text-slate-700 dark:text-slate-300">Purple</span>
            </div>
          </div>
        </motion.div>

        {/* Notifications Section */}
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay: 0.1}} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Notifications</h2>
          <div className="space-y-4">
            {Object.keys(notifications).map((k) => (
              <div key={k} className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-800 dark:text-white capitalize">{k} Notifications</h3>
                  <p className="text-sm text-slate-500">Show alerts for {k} events.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={notifications[k]} onChange={() => toggleNotif(k)} />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
                </label>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Profile Section */}
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay: 0.2}} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Profile</h2>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-3xl font-bold shadow-md">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">{user?.name || 'Admin User'}</h3>
              <p className="text-slate-500">{user?.email || 'admin@dataclean.pro'}</p>
              <div className="mt-2 inline-block px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-xs font-semibold">
                Data Analyst
              </div>
            </div>
            <div className="ml-auto">
              <button onClick={() => toast('Feature coming soon')} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition font-medium text-slate-700 dark:text-slate-300">
                Edit Profile
              </button>
            </div>
          </div>
        </motion.div>
        
        {/* About Section */}
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay: 0.3}} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 text-center text-slate-500 dark:text-slate-400">
          <p className="font-bold text-lg text-slate-800 dark:text-white">DataClean Pro</p>
          <p>Version 1.0.0</p>
          <p className="mt-4 text-sm">Built with React, FastAPI, and Pandas</p>
        </motion.div>

      </div>
    </div>
  );
}
