import React from 'react';
import { motion } from 'motion/react';
import { CompletedSession } from '../types';
import { BookOpen, Calendar, CheckCircle2, AlertTriangle, ChevronRight, Trash2, Shield, Flame, Sparkles } from 'lucide-react';

interface SessionHistoryProps {
  sessions: CompletedSession[];
  onViewDebrief: (session: CompletedSession) => void;
  onClearHistory: () => void;
}

export default function SessionHistory({
  sessions,
  onViewDebrief,
  onClearHistory
}: SessionHistoryProps) {
  if (sessions.length === 0) return null;

  return (
    <div className="space-y-8 select-none max-w-5xl mx-auto transition-colors duration-300 border-t border-[#E6E5E0] dark:border-[#2E2D2A] pt-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-black uppercase tracking-wider text-indigo-600 dark:text-[#A8A4FF]">
            Historical Log
          </span>
          <h3 className="text-2xl font-extrabold tracking-tight text-[#1C1C1A] dark:text-[#F5F4F0] transition-colors duration-300">
            Session History Archive
          </h3>
          <p className="text-xs text-[#71706C] dark:text-[#A19F9A] transition-colors duration-300">
            A comprehensive record of your past crisis management, planning, and retrospective sessions.
          </p>
        </div>
        
        <button
          onClick={() => {
            if (window.confirm("Are you sure you want to clear your entire session archive? This action cannot be undone.")) {
              onClearHistory();
            }
          }}
          className="self-start sm:self-center flex items-center gap-1.5 text-[10px] font-bold text-rose-500 hover:text-rose-600 transition-colors bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/10 px-3 py-1.5 rounded-xl cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Archive</span>
        </button>
      </div>

      <div className="space-y-4">
        {sessions.map((session, index) => {
          const isSuccess = session.outcome === 'Success';
          const isCrisis = session.mode === 'crisis';
          const isPlan = session.mode === 'plan';

          return (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              className="bg-white dark:bg-[#1C1B19] border border-[#E6E5E0] dark:border-[#2E2D2A] rounded-2xl p-5 hover:border-indigo-500/40 dark:hover:border-indigo-400/30 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6 ballpark-shadow"
            >
              {/* Left Column: Icon + Title & Description */}
              <div className="flex items-start gap-4 flex-1">
                <div className={`p-3 rounded-xl border flex-shrink-0 mt-0.5 ${
                  isCrisis 
                    ? 'bg-[#D95D39]/10 text-[#D95D39] border-[#D95D39]/20' 
                    : isPlan 
                      ? 'bg-indigo-500/10 text-indigo-600 dark:text-[#A8A4FF] border-indigo-500/20' 
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                }`}>
                  {isCrisis ? (
                    <Flame className="w-5 h-5" />
                  ) : isPlan ? (
                    <Calendar className="w-5 h-5" />
                  ) : (
                    <BookOpen className="w-5 h-5" />
                  )}
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                      isCrisis 
                        ? 'bg-[#D95D39]/10 text-[#D95D39]' 
                        : isPlan 
                          ? 'bg-indigo-500/10 text-indigo-600 dark:text-[#A8A4FF]' 
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {session.mode} mode
                    </span>
                    <span className="text-[10px] text-[#71706C] dark:text-[#A19F9A] font-mono">
                      {session.date}
                    </span>
                  </div>
                  
                  <h4 className="text-sm font-extrabold text-[#1C1C1A] dark:text-[#F5F4F0] leading-snug transition-colors duration-300">
                    {session.taskDescription}
                  </h4>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1.5 text-[11px] font-mono text-[#71706C] dark:text-[#A19F9A]">
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#D95D39]" />
                      <span>Prob: <strong className="text-[#1C1C1A] dark:text-[#F5F4F0]">{session.completionProbability}%</strong></span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Strategy: <strong className="text-[#1C1C1A] dark:text-[#F5F4F0]">{session.strategy}</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Status & View Details button */}
              <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 border-[#FAF9F6] dark:border-[#2E2D2A] pt-4 md:pt-0">
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                    isSuccess 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-500/20'
                  }`}>
                    {isSuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                    <span>{isSuccess ? 'DELIVERED' : 'ABORTED / SHIELDED'}</span>
                  </div>
                </div>

                <button
                  onClick={() => onViewDebrief(session)}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-[#A8A4FF] hover:text-[#1C1C1A] dark:hover:text-[#F5F4F0] bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 px-4 py-2 rounded-xl cursor-pointer transition-all duration-300"
                >
                  <span>View Retrospective</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
