import React from 'react';
import { AppView } from '../types';

interface HeaderProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-neonBlue to-neonPurple animate-pulse" />
        <span className="font-bold text-lg tracking-wide text-white">Reflekt AI</span>
      </div>

      <div className="flex items-center gap-2">
        {/* View Toggles */}
        <div className="flex bg-slate-800 rounded-full p-1 border border-white/5">
          <button
            onClick={() => setView(AppView.PROMPT)}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-300 ${
              currentView === AppView.PROMPT
                ? 'bg-neonBlue/20 text-neonBlue border border-neonBlue/50 shadow-[0_0_10px_rgba(0,243,255,0.2)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Prompt
          </button>
          <button
            onClick={() => setView(AppView.MESSAGE)}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-300 ${
              currentView === AppView.MESSAGE
                ? 'bg-neonPurple/20 text-neonPurple border border-neonPurple/50 shadow-[0_0_10px_rgba(188,19,254,0.2)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Message
          </button>
        </div>
        
        {/* Settings Icon */}
        <button 
          onClick={() => setView(AppView.OPTIONS)}
          className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543 .826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Header;
