import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  HiChartBarSquare,
  HiCloudArrowUp,
  HiTableCells,
  HiWrenchScrewdriver,
  HiExclamationTriangle,
  HiChartPie,
  HiLightBulb,
  HiDocumentText,
  HiArrowDownTray,
  HiCog6Tooth,
  HiSparkles,
  HiXMark,
  HiBars3,
  HiArrowRightOnRectangle,
} from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: HiChartBarSquare },
  { path: '/upload', label: 'Upload Dataset', icon: HiCloudArrowUp },
  { path: '/preview', label: 'Dataset Preview', icon: HiTableCells },
  { path: '/cleaned-preview', label: 'Clean Dataset Preview', icon: HiSparkles },
  { path: '/cleaning', label: 'Data Cleaning', icon: HiWrenchScrewdriver },
  { path: '/outliers', label: 'Outlier Detection', icon: HiExclamationTriangle },
  { path: '/visualizations', label: 'Visualizations', icon: HiChartPie },
  { path: '/insights', label: 'AI Insights', icon: HiLightBulb },
  { path: '/reports', label: 'Reports', icon: HiDocumentText },
  { path: '/downloads', label: 'Downloads', icon: HiArrowDownTray },
  { path: '/settings', label: 'Settings', icon: HiCog6Tooth },
];

export default function Sidebar({ isOpen, onToggle }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'DC';

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen flex flex-col
          bg-sidebar text-white
          transition-all duration-300 ease-in-out
          ${isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full md:translate-x-0 md:w-20'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10 min-h-[72px]">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg">
            <HiSparkles className="w-5 h-5 text-white" />
          </div>
          <div
            className={`overflow-hidden transition-all duration-300 ${
              isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 md:opacity-0 md:w-0'
            }`}
          >
            <h1 className="text-lg font-bold whitespace-nowrap">
              <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
                DataClean
              </span>{' '}
              <span className="text-white font-light">Pro</span>
            </h1>
          </div>
          {/* Mobile close */}
          <button
            onClick={onToggle}
            className="ml-auto md:hidden text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <HiXMark className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 768) onToggle();
                }}
                className="block"
              >
                <motion.div
                  whileHover={{ x: 4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className={`
                    relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                    transition-colors duration-200 group
                    ${
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-sidebar-hover'
                    }
                  `}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-accent"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <item.icon
                    className={`w-5 h-5 flex-shrink-0 ${
                      isActive ? 'text-accent-light' : 'text-slate-500 group-hover:text-white'
                    }`}
                  />
                  <span
                    className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${
                      isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 md:opacity-0 md:w-0'
                    }`}
                  >
                    {item.label}
                  </span>
                </motion.div>
              </NavLink>
            );
          })}
        </nav>

        {/* User card */}
        <div className="border-t border-white/10 p-3">
          <div
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-sidebar-hover transition-colors ${
              isOpen ? '' : 'justify-center md:justify-center'
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-md">
              {initials}
            </div>
            <div
              className={`overflow-hidden transition-all duration-300 flex-1 min-w-0 ${
                isOpen ? 'opacity-100' : 'opacity-0 md:opacity-0'
              }`}
            >
              <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.role || 'Analyst'}</p>
            </div>
            <button
              onClick={logout}
              className={`text-slate-400 hover:text-rose-400 transition-colors flex-shrink-0 ${
                isOpen ? 'opacity-100' : 'opacity-0 md:opacity-0'
              }`}
              title="Logout"
            >
              <HiArrowRightOnRectangle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
