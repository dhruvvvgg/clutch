import { motion } from 'motion/react';
import { Loader2, Check, RefreshCw, AlertCircle, Compass, ShieldAlert, Calendar, Mail, Sparkles } from 'lucide-react';

const GoogleCalendarLogo = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="4" width="20" height="17" rx="3" fill="#4285F4" />
    <path d="M2 4V8H22V4C22 2.9 21.1 2 20 2H4C2.9 2 2 2.9 2 4Z" fill="#34A853" />
    <rect x="6" y="10" width="12" height="8" rx="1.5" fill="white" />
    <text x="12" y="17" fill="#4285F4" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">31</text>
  </svg>
);

const GmailLogo = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4Z" fill="#F2F2F2" />
    <path d="M20 4H4C2.9 4 2 4.9 2 6V9L12 14L22 9V6C22 4.9 21.1 4 20 4Z" fill="#EA4335" />
    <path d="M2 9V18C2 19.1 2.9 20 4 20H6V11L2 9Z" fill="#FBBC05" />
    <path d="M22 9V18C22 19.1 21.1 20 20 20H18V11L22 9Z" fill="#34A853" />
    <path d="M18 20H6V11L12 14L18 11V20Z" fill="#4285F4" />
  </svg>
);

interface PipelineStep {
  name: string;
  status: string; // 'idle' | 'running' | 'success' | 'failed'
  desc: string;
}

interface PipelineViewProps {
  key?: string;
  steps: PipelineStep[];
  currentStepIndex: number;
  logs: string[];
  onBackToModes?: () => void;
}

export default function PipelineView({
  steps,
  currentStepIndex,
  logs,
  onBackToModes,
}: PipelineViewProps) {
  
  const icons = [
    <Compass className="w-4 h-4 text-orange-500" />,
    <Sparkles className="w-4 h-4 text-[#4285F4]" />,
    <GoogleCalendarLogo className="w-4 h-4" />,
    <GmailLogo className="w-4 h-4" />,
    <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />,
  ];

  const getGoogleBadge = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('intake') || lower.includes('parsing')) {
      return (
        <div className="inline-flex items-center gap-1 bg-[#4285F4]/10 dark:bg-[#4285F4]/20 text-[#4285F4] border border-[#4285F4]/20 rounded-full px-2 py-0.5 text-[8px] font-bold font-mono uppercase tracking-wider transition-all">
          <Sparkles className="w-2.5 h-2.5" />
          Gemini 3.5 Flash
        </div>
      );
    }
    if (lower.includes('assessment') || lower.includes('mission')) {
      return (
        <div className="inline-flex items-center gap-1 bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 border border-violet-500/20 rounded-full px-2 py-0.5 text-[8px] font-bold font-mono uppercase tracking-wider transition-all">
          <Sparkles className="w-2.5 h-2.5" />
          Gemini Core
        </div>
      );
    }
    if (lower.includes('calendar') || lower.includes('triage')) {
      return (
        <div className="inline-flex items-center gap-1 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-full px-2 py-0.5 text-[8px] font-bold font-mono uppercase tracking-wider transition-all">
          <GoogleCalendarLogo className="w-3 h-3" />
          Google Calendar API
        </div>
      );
    }
    if (lower.includes('gmail') || lower.includes('comms') || lower.includes('communications')) {
      return (
        <div className="inline-flex items-center gap-1 bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-full px-2 py-0.5 text-[8px] font-bold font-mono uppercase tracking-wider transition-all">
          <GmailLogo className="w-3 h-3" />
          Gmail API
        </div>
      );
    }
    if (lower.includes('workspace') || lower.includes('bootstrap') || lower.includes('bootstrapping')) {
      return (
        <div className="flex flex-wrap gap-1">
          <div className="inline-flex items-center gap-1 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 rounded-full px-2 py-0.5 text-[8px] font-bold font-mono uppercase tracking-wider transition-all">
            <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3z"/>
            </svg>
            Search Grounding
          </div>
          <div className="inline-flex items-center gap-1 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full px-2 py-0.5 text-[8px] font-bold font-mono uppercase tracking-wider transition-all">
            <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
            </svg>
            Google Drive
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-3xl lg:max-w-6xl mx-auto space-y-6 py-6 select-none transition-colors duration-300"
    >
      {/* Title */}
      <div className="space-y-2 text-center">
        <div className="inline-flex items-center gap-1.5 bg-[#FAF9F6] dark:bg-[#252422] border border-[#E6E5E0] dark:border-[#2E2D2A] px-3 py-1 rounded-full text-[10px] font-mono font-bold text-[#D95D39] transition-colors duration-300">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>STRIKE TEAM ORCHESTRATION ACTIVE</span>
        </div>
        <h2 className="text-3xl font-black tracking-tight transition-colors duration-300">
          <span className="animate-shine font-black">Executing Deployments...</span>
        </h2>
        <p className="text-sm text-[#71706C] dark:text-[#A19F9A] max-w-md mx-auto transition-colors duration-300">
          Our autonomous agents are parallel-clearing calendar friction, staging negotiations, and compiling factual reference outlines.
        </p>
      </div>

      {/* Stacked Layout allowing cards to expand fully */}
      <div className="flex flex-col gap-6">
        {/* Steps List */}
        <div className="bg-white dark:bg-[#1C1B19] border border-[#E6E5E0] dark:border-[#2E2D2A] ballpark-shadow rounded-[2rem] p-6 sm:p-8 space-y-4 transition-colors duration-300">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#71706C] dark:text-[#A19F9A] border-b border-[#FAF9F6] dark:border-[#2E2D2A] pb-3 mb-4 transition-colors duration-300">
              Coordination Pipeline
            </h3>

            <div className="space-y-4">
              {steps.map((step, idx) => {
                const isRunning = step.status === 'running';
                const isSuccess = step.status === 'success';
                const isIdle = step.status === 'idle';

                return (
                  <div 
                    key={idx} 
                    className={`flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300 ${
                      isRunning 
                        ? 'bg-[#FAF9F6] dark:bg-[#252422] border-[#D95D39]/40 shadow-sm' 
                        : isSuccess 
                          ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-200/50 dark:border-emerald-500/20' 
                          : 'bg-white dark:bg-[#1C1B19] border-[#FAF9F6] dark:border-[#2E2D2A]/60'
                    }`}
                  >
                    {/* Visual indicator */}
                    <div className="flex-shrink-0 mt-0.5">
                      {isSuccess ? (
                        <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center">
                          <Check className="w-4 h-4" />
                        </div>
                      ) : isRunning ? (
                        <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center animate-spin">
                          <RefreshCw className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#FAF9F6] dark:bg-[#252422] border border-[#E6E5E0] dark:border-[#2E2D2A] text-[#71706C] dark:text-[#A19F9A] flex items-center justify-center transition-colors duration-300">
                          {icons[idx] || idx + 1}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className={`text-sm font-bold flex items-center gap-2 transition-colors duration-300 ${isRunning ? 'text-[#1C1C1A] dark:text-[#F5F4F0]' : 'text-[#51504B] dark:text-[#D2CFC9]'}`}>
                            {step.name}
                          </h4>
                          {getGoogleBadge(step.name)}
                        </div>
                        
                        <span className={`self-start sm:self-center text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded transition-all duration-300 ${
                          isSuccess 
                            ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                            : isRunning 
                              ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 animate-pulse' 
                              : 'bg-[#FAF9F6] dark:bg-[#252422] text-[#71706C] dark:text-[#A19F9A]'
                        }`}>
                          {step.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#71706C] dark:text-[#A19F9A] leading-relaxed transition-colors duration-300">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Terminal Logs Block */}
        <div className="bg-[#1C1C1A] dark:bg-[#121211] text-[#FAF9F6] border border-[#1C1C1A] dark:border-[#2E2D2A] rounded-[2rem] p-6 shadow-2xl relative overflow-hidden transition-colors duration-300">
          <div className="flex flex-col">
            <div>
              {/* Glowing visual indicator */}
              <div className="absolute top-4 right-6 flex items-center gap-2 font-mono text-[9px] text-[#A19F9A]">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                <span>LIVE METADATA FEED</span>
              </div>

              <h4 className="text-[10px] font-mono font-black uppercase tracking-widest text-[#71706C] dark:text-[#A19F9A] border-b border-[#32312E] dark:border-[#2E2D2A] pb-3 mb-4 transition-colors duration-300">
                Console Output Log
              </h4>
            </div>

            <div className="font-mono text-xs space-y-2 h-64 lg:h-80 overflow-y-auto scrollbar-thin pr-2 mt-2">
              {logs.length === 0 ? (
                <p className="text-[#71706C] dark:text-[#5E5D59] italic transition-colors duration-300">Warming up pipeline metrics... Spawning sandboxed agents...</p>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-neutral-300 dark:text-neutral-400">
                    <span className="text-[#D95D39] select-none">&gt;</span>
                    <p className="leading-relaxed whitespace-pre-wrap">{log}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
