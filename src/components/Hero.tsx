import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Flame, Calendar, Clock, Check, RefreshCw, Mail, Sparkles, Play } from 'lucide-react';

interface HeroProps {
  onLaunchClutch: () => void;
  ambientDeadlinesCount: number;
  showAmbientAlert: boolean;
  setShowAmbientAlert: (show: boolean) => void;
  onPrebuildWorkspace: () => void;
  onTryDemo: () => void;
}

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [
    h.toString().padStart(2, '0'),
    m.toString().padStart(2, '0'),
    s.toString().padStart(2, '0')
  ].join(':');
};

export default function Hero({
  onLaunchClutch,
  ambientDeadlinesCount,
  showAmbientAlert,
  setShowAmbientAlert,
  onPrebuildWorkspace,
  onTryDemo,
}: HeroProps) {
  // Generate a random natural countdown duration on load (between 2 and 4.5 hours)
  const [timeLeft] = useState(() => {
    const minSeconds = 2 * 3600 + 15 * 60; // 2h 15m
    const maxSeconds = 4 * 3600 + 30 * 60; // 4h 30m
    return Math.floor(Math.random() * (maxSeconds - minSeconds + 1)) + minSeconds;
  });

  return (
    <div className="space-y-16 transition-colors duration-300">
      {/* Main Hero Copy - ballpark.ing massive display headings */}
      <div className="text-center space-y-6 max-w-4xl mx-auto pt-4 select-none">
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-[0.95] sm:leading-[0.9] text-[#1C1C1A] dark:text-[#F5F4F0] transition-colors duration-300">
          Because planning <br className="hidden md:inline" />
          isn't <span className="text-[#D95D39]">execution.</span>
        </h1>
        
        <p className="text-[#51504B] dark:text-[#A19F9A] text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed font-normal transition-colors duration-300">
          Clutch clears calendar blocks, drafts stakeholder emails, and scaffolds workspace files in seconds.
        </p>
        
        <div className="flex items-center justify-center pt-2">
          <button
            onClick={onLaunchClutch}
            className="bg-[#D95D39] hover:bg-[#C24E2D] text-white font-extrabold text-sm sm:text-base px-8 py-4 rounded-full shadow-lg hover:scale-[1.02] transition-all flex items-center gap-2.5 cursor-pointer ballpark-shadow"
          >
            <Sparkles className="w-5 h-5 animate-pulse" />
            Get started
          </button>
        </div>
      </div>

      {/* Angled Floating Product UI Mockup */}
      <div className="relative max-w-4xl mx-auto py-4 px-4 sm:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative -rotate-1 md:-rotate-2 hover:rotate-0 hover:scale-[1.01] transition-all duration-700 bg-white dark:bg-[#1C1B19] border border-[#E6E5E0] dark:border-[#2E2D2A] rounded-[2rem] p-6 sm:p-8 shadow-[0_24px_60px_rgba(0,0,0,0.05)] ballpark-shadow transition-colors duration-300"
        >
          {/* Top Mockup Control Bar */}
          <div className="flex items-center justify-between border-b border-[#FAF9F6] dark:border-[#252422] pb-4 mb-6 transition-colors duration-300">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E58F65]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#ECE7E1] dark:bg-[#3E3D3A]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#E2E1DD] dark:bg-[#2E2D2A]" />
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-[#FAF9F6] dark:bg-[#252422] border border-[#E6E5E0] dark:border-[#2E2D2A] rounded-full py-1 px-4 text-[10px] font-mono font-bold text-[#71706C] dark:text-[#A19F9A] transition-colors duration-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>clutch.session_active</span>
            </div>
            <div className="w-8" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
            
            {/* Mockup Left Side: Active Pipeline execution steps */}
            <div className="md:col-span-7 space-y-3.5">
              <h3 className="text-xs font-mono font-extrabold uppercase tracking-widest text-[#71706C] dark:text-[#A19F9A] mb-2 transition-colors duration-300">
                Active Strike Sequence
              </h3>
              
              <div className="bg-[#FAF9F6] dark:bg-[#252422] border border-[#E6E5E0] dark:border-[#2E2D2A] rounded-2xl p-4 flex items-center gap-3 transition-colors duration-300">
                <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-extrabold text-[#1C1C1A] dark:text-[#F5F4F0] transition-colors duration-300">Intake Parsed Successfully</h4>
                  <p className="text-[10px] text-[#71706C] dark:text-[#A19F9A] font-mono transition-colors duration-300">B2B SaaS Investor Pitch Deck • 4 Hours Left</p>
                </div>
              </div>

              <div className="bg-[#FAF9F6] dark:bg-[#252422] border border-[#E6E5E0] dark:border-[#2E2D2A] rounded-2xl p-4 flex items-center gap-3 transition-colors duration-300">
                <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-extrabold text-[#1C1C1A] dark:text-[#F5F4F0] transition-colors duration-300">Assessment Complete</h4>
                  <p className="text-[10px] text-[#71706C] dark:text-[#A19F9A] font-mono transition-colors duration-300">Completion Probability: 85% • Strategy: FIGHT</p>
                </div>
              </div>

              <div className="bg-white dark:bg-[#1C1B19] border-2 border-[#D95D39] rounded-2xl p-4 flex items-center gap-3 shadow-sm transition-colors duration-300">
                <div className="w-5 h-5 rounded-full border border-[#D95D39] border-t-transparent animate-spin" />
                <div className="flex-1">
                  <h4 className="text-xs font-extrabold text-[#1C1C1A] dark:text-[#F5F4F0] transition-colors duration-300">Calendar Path Optimization</h4>
                  <p className="text-[10px] text-[#D95D39] font-mono animate-pulse">Dropping 3 meetings to clear deep work time</p>
                </div>
              </div>

              <div className="bg-[#FAF9F6] dark:bg-[#252422] border border-[#E6E5E0] dark:border-[#2E2D2A] rounded-2xl p-4 flex items-center gap-3 opacity-60 transition-colors duration-300">
                <div className="w-5 h-5 rounded-full border border-[#C8C7C2] dark:border-[#5E5D59] flex items-center justify-center font-mono text-[9px] text-[#71706C] dark:text-[#A19F9A]">
                  4
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-extrabold text-[#71706C] dark:text-[#A19F9A] transition-colors duration-300">Diplomatic Drafts Auto-Generated</h4>
                  <p className="text-[10px] text-[#C8C7C2] dark:text-[#5E5D59] font-mono transition-colors duration-300">Gmail drafts ready for review</p>
                </div>
              </div>
            </div>

            {/* Mockup Right Side: Floatings items */}
            <div className="md:col-span-5 space-y-3.5">
              
              {/* Floating Widget 1: Countdown dial */}
              <div className="bg-white dark:bg-[#1C1B19] border border-[#E6E5E0] dark:border-[#2E2D2A] rounded-2xl p-5 shadow-sm space-y-2 transition-colors duration-300">
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#71706C] dark:text-[#A19F9A] transition-colors duration-300">
                  <span>TIME REMAINING</span>
                </div>
                <div className="text-3xl font-black font-mono text-[#1C1C1A] dark:text-[#F5F4F0] text-center tracking-wider transition-colors duration-300">
                  {formatTime(timeLeft)}
                </div>
              </div>

              {/* Floating Widget 2: Calendar Drop visual */}
              <div className="bg-white dark:bg-[#1C1B19] border border-[#E6E5E0] dark:border-[#2E2D2A] rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden transition-colors duration-300">
                <div className="absolute top-2 right-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 text-[8px] font-mono px-1.5 py-0.5 rounded-full uppercase font-bold">
                  Cleared
                </div>
                
                <h4 className="text-xs font-extrabold text-[#1C1C1A] dark:text-[#F5F4F0] flex items-center gap-1.5 transition-colors duration-300">
                  <Calendar className="w-3.5 h-3.5 text-[#D95D39]" />
                  Calendar Optimizations
                </h4>
                
                <div className="border-l-2 border-[#D95D39] pl-3 py-1 space-y-0.5">
                  <p className="text-[11px] font-extrabold text-[#71706C] dark:text-[#A19F9A] line-through transition-colors duration-300">
                    11:00 AM • B2B SaaS Sync Meeting
                  </p>
                  <p className="text-[9px] text-[#D95D39] font-mono font-bold">
                    → Postponed & cleared for Deep Work block
                  </p>
                </div>
              </div>

              {/* Floating Widget 3: Apology Letter Draft */}
              <div className="bg-white dark:bg-[#1C1B19] border border-[#E6E5E0] dark:border-[#2E2D2A] rounded-2xl p-5 shadow-sm space-y-3 transition-colors duration-300">
                <h4 className="text-xs font-extrabold text-[#1C1C1A] dark:text-[#F5F4F0] flex items-center gap-1.5 transition-colors duration-300">
                  <Mail className="w-3.5 h-3.5 text-[#1E1D2F] dark:text-[#D2CFC9]" />
                  Communication Drafts
                </h4>
                <div className="bg-[#FAF9F6] dark:bg-[#252422] border border-[#E6E5E0] dark:border-[#2E2D2A] rounded-xl p-3 font-mono text-[9px] text-[#71706C] dark:text-[#A19F9A] leading-normal space-y-1 transition-colors duration-300">
                  <p className="font-bold text-[#1C1C1A] dark:text-[#F5F4F0] transition-colors duration-300">To: clutchapp@gmail.com</p>
                  <p>Subject: Rescheduling our sync today</p>
                  <p className="pt-1 italic">"Hi team, I am calling a clutch adjustment on today's scheduled 11:00 AM sync to finalise our core presentation..."</p>
                </div>
              </div>

            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
