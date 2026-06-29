import { Clock, Sliders, Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';

interface HeaderProps {
  currentView: string;
  setCurrentView: (view: any) => void;
  geminiActive: boolean;
  currentTime: Date;
  onLaunchClutch: () => void;
  hasActiveWorkspace: boolean;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onBack?: () => void;
  backLabel?: string;
}

export default function Header({
  currentView,
  setCurrentView,
  geminiActive,
  currentTime,
  onLaunchClutch,
  hasActiveWorkspace,
  darkMode,
  onToggleDarkMode,
  onBack,
  backLabel,
}: HeaderProps) {
  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-6xl z-50 rounded-xl bg-white dark:bg-[#1C1B19] border border-[#E6E5E0] dark:border-[#2E2D2A]/50 shadow-[0_8px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] px-4 sm:px-6 py-3.5 flex items-center justify-between transition-all duration-300 select-none">
      {/* Wordmark (Left) */}
      <div 
        className="flex items-center gap-3 cursor-pointer select-none group" 
        onClick={() => setCurrentView('home')}
      >
        <div className="flex items-baseline gap-0.5">
          <span className="text-xl font-black tracking-tight text-[#1C1C1A] dark:text-[#F5F4F0] font-sans">
            clutch
          </span>
          <span className="text-xl font-black text-[#D95D39] animate-pulse">.</span>
        </div>
      </div>

      {/* Dynamic Navigation Options & Action Button (Right) */}
      <div className="flex items-center gap-2 sm:gap-3.5">
        {/* Dark Mode Toggle Pill */}
        <button
          onClick={onToggleDarkMode}
          className="hidden md:flex items-center gap-1.5 bg-[#FAF9F6] dark:bg-[#252422] border border-[#E6E5E0] dark:border-[#2E2D2A]/60 rounded-lg py-1.5 px-3 shadow-sm text-xs font-semibold text-[#1C1C1A] dark:text-[#F5F4F0] hover:bg-white dark:hover:bg-[#1C1B19] transition-all cursor-pointer"
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline-block font-mono text-[9px] tracking-wider uppercase">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-[#1E1D2F]" />
              <span className="hidden sm:inline-block font-mono text-[9px] tracking-wider uppercase">Dark</span>
            </>
          )}
        </button>

        {/* Dynamic local clock in an elegant pill */}
        <div className="hidden md:flex items-center gap-2 bg-[#FAF9F6] dark:bg-[#252422] border border-[#E6E5E0] dark:border-[#2E2D2A]/60 rounded-lg py-1.5 px-3 shadow-sm text-xs font-semibold text-[#1C1C1A] dark:text-[#F5F4F0] transition-colors duration-300">
          <Clock className="w-3.5 h-3.5 text-[#D95D39] animate-pulse" />
          <span className="font-mono text-xs">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </div>

        {/* Minimal ballpark.ing Style Primary Button */}
        {onBack && backLabel ? (
          <button
            onClick={onBack}
            className="bg-[#1C1C1A] dark:bg-[#F5F4F0] text-white dark:text-[#121211] hover:bg-[#32312E] dark:hover:bg-[#E2E1DD] font-bold text-xs px-4 sm:px-5 py-2 rounded-lg transition-all ballpark-shadow border border-transparent cursor-pointer"
          >
            ← Back to {backLabel}
          </button>
        ) : hasActiveWorkspace ? (
          <button
            onClick={() => setCurrentView('workspace')}
            className="bg-[#1C1C1A] dark:bg-[#F5F4F0] text-white dark:text-[#121211] hover:bg-[#32312E] dark:hover:bg-[#E2E1DD] font-bold text-xs px-4 sm:px-5 py-2 rounded-lg transition-all ballpark-shadow flex items-center gap-2 border border-transparent cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="hidden xs:inline">Active Workspace</span>
            <span className="xs:hidden">Active</span>
          </button>
        ) : (
          <button
            onClick={onLaunchClutch}
            className="bg-[#1C1C1A] dark:bg-[#F5F4F0] text-white dark:text-[#121211] hover:bg-[#32312E] dark:hover:bg-[#E2E1DD] font-bold text-xs px-4 sm:px-5 py-2 rounded-lg transition-all ballpark-shadow border border-transparent cursor-pointer"
          >
            Launch <span className="hidden sm:inline">Clutch</span>
          </button>
        )}
      </div>
    </header>
  );
}
