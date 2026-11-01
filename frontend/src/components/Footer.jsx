import React from 'react';
import { Sparkles, Code, Heart, Mail, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200/80 py-8 px-4 sm:px-8 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-slate-800">SkillBridge AI</span>
          <span>• Intelligent Skill Gap Analyzer & Personalized Career Roadmap</span>
        </div>

        <div className="flex items-center gap-6">
          <Link to="/" className="hover:text-indigo-600 transition">About</Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-indigo-600 transition"
          >
            <Code className="w-3.5 h-3.5" /> GitHub
          </a>
          <a
            href="mailto:support@skillbridge.ai"
            className="flex items-center gap-1 hover:text-indigo-600 transition"
          >
            <Mail className="w-3.5 h-3.5" /> Contact Support
          </a>
        </div>
      </div>
    </footer>
  );
}
