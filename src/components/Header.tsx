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
  googleUser: any;
  onGoogleSignIn: () => void;
  onGoogleSignOut: () => void;
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
  googleUser,
  onGoogleSignIn,
  onGoogleSignOut,
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
        {/* Google Workspace Sign-In/Out */}
        {googleUser ? (
          <div className="flex items-center gap-2 bg-[#FAF9F6] dark:bg-[#252422] border border-emerald-500/20 rounded-lg py-1 px-2.5 text-[10px] sm:text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline max-w-[120px] truncate">{googleUser.email}</span>
            <button
              onClick={onGoogleSignOut}
              className="ml-1 text-[#71706C] hover:text-[#1C1C1A] dark:hover:text-[#F5F4F0] font-mono text-[9px] uppercase tracking-wider underline cursor-pointer"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={onGoogleSignIn}
            className="flex items-center gap-2 bg-white dark:bg-[#252422] border border-[#E6E5E0] dark:border-[#2E2D2A]/60 rounded-lg py-1.5 px-3 shadow-sm text-xs font-semibold text-[#1C1C1A] dark:text-[#F5F4F0] hover:bg-[#FAF9F6] dark:hover:bg-[#1C1B19] transition-all cursor-pointer"
          >
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-3.5 h-3.5 flex-shrink-0">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
            </svg>
            <span className="hidden xs:inline">Link Workspace</span>
          </button>
        )}

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
