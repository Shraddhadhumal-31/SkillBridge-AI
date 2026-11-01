import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileSearch,
  Briefcase,
  GitCompare,
  Milestone,
  HelpCircle,
  UserCheck,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Resume Analyzer', path: '/analyzer', icon: FileSearch },
    { label: 'Job Recommendations', path: '/jobs', icon: Briefcase },
    { label: 'Skill Gap Analysis', path: '/skill-gap', icon: GitCompare },
    { label: 'Career Roadmap', path: '/roadmap', icon: Milestone },
    { label: 'AI Interview Prep', path: '/interview', icon: HelpCircle },
    { label: 'Profile & History', path: '/profile', icon: UserCheck },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 p-5 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Top Branding in Sidebar */}
          <div className="flex items-center gap-2.5 pb-6 mb-6 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-navy-900 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-slate-900">
                Skill<span className="text-indigo-600">Bridge</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 ml-1 px-1 py-0.2 bg-purple-50 rounded">
                AI
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom AI Status Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 via-purple-50 to-white border border-indigo-100 text-xs">
          <div className="flex items-center gap-2 text-indigo-700 font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>AI Guidance Active</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            TF-IDF vector matching & NLP skill gap engine online.
          </p>
        </div>
      </aside>
    </>
  );
}
