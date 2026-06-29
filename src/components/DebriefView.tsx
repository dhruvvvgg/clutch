import { motion } from 'motion/react';
import { Debrief, CompletedSession } from '../types';
import { Check, ShieldAlert, Sparkles, Calendar, ChevronRight, RefreshCw, History, ArrowLeft } from 'lucide-react';

interface DebriefViewProps {
  key?: string;
  taskSuccess: boolean;
  debriefData: Debrief | null;
  isDebriefLoading: boolean;
  onScheduleHabit: (debrief: Debrief) => void;
  onBackToHome: () => void;
  completedSessions?: CompletedSession[];
  onSelectSessionToPrepopulate?: (session: CompletedSession) => void;
}

export default function DebriefView({
  taskSuccess,
  debriefData,
  isDebriefLoading,
  onScheduleHabit,
  onBackToHome,
  completedSessions = [],
  onSelectSessionToPrepopulate,
}: DebriefViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-2xl mx-auto space-y-8 py-6 select-none transition-colors duration-300 px-4 sm:px-6"
    >
      {/* Title */}
      <div className="space-y-2 text-center">
        <span className="text-[10px] font-sans font-black uppercase tracking-wider text-[#D95D39]">
          Productive Retrospective
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight text-[#1C1C1A] dark:text-[#F5F4F0] transition-colors duration-300">
          Post-Crisis Debrief
        </h2>
        <p className="text-sm text-[#71706C] dark:text-[#A19F9A] max-w-md mx-auto transition-colors duration-300">
          Let’s break the cycle of last-minute stress. We review our processes honestly to build single-action preventive habits.
        </p>
      </div>

      {isDebriefLoading ? (
        <div className="bg-white dark:bg-[#1C1B19] border border-[#E6E5E0] dark:border-[#2E2D2A] ballpark-shadow rounded-[2rem] p-12 text-center space-y-4 transition-colors duration-300">
          <RefreshCw className="w-8 h-8 text-[#D95D39] animate-spin mx-auto" />
          <h4 className="text-sm font-bold text-[#1C1C1A] dark:text-[#F5F4F0] transition-colors duration-300">Assembling Root Cause Audit...</h4>
          <p className="text-xs text-[#71706C] dark:text-[#A19F9A] max-w-sm mx-auto leading-relaxed transition-colors duration-300">
            Gemini is evaluating your task profile parameters, response latency, and stress indicators to generate a tailored preventive workflow habit.
          </p>
        </div>
      ) : debriefData ? (
        <div className="space-y-6">
          {/* Switch Session selector link if we have history and callback */}
          {completedSessions.length > 0 && onSelectSessionToPrepopulate && (
            <div className="flex justify-end">
              <button
                onClick={() => {
                  onSelectSessionToPrepopulate({ debriefData: null } as any);
                }}
                className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 dark:text-[#A8A4FF] hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer bg-indigo-500/5 px-3 py-1.5 rounded-xl border border-indigo-500/10"
              >
                <History className="w-3.5 h-3.5" />
                <span>Switch / Load Another Session</span>
              </button>
            </div>
          )}
          
          {/* Main Card */}
          <div className="bg-white dark:bg-[#1C1B19] border border-[#E6E5E0] dark:border-[#2E2D2A] ballpark-shadow rounded-[2rem] p-6 sm:p-8 space-y-6 relative overflow-hidden transition-colors duration-300">
            
            {/* Success flag header */}
            <div className="flex items-center gap-4 border-b border-[#FAF9F6] dark:border-[#2E2D2A] pb-5 transition-colors duration-300">
              <div className={`p-3 rounded-2xl border ${
                taskSuccess 
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-500/20' 
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-500/20'
              }`}>
                {taskSuccess ? <Check className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
              </div>
              
              <div>
                <span className="text-[9px] font-mono text-[#71706C] dark:text-[#A19F9A] uppercase tracking-wider block font-bold transition-colors duration-300">Workspace outcome status</span>
                <h4 className="text-sm font-extrabold text-[#1C1C1A] dark:text-[#F5F4F0] transition-colors duration-300">
                  {taskSuccess ? 'MISSION DELIVERED ON-TIME' : 'PRE-EMPTIVE POSTPONEMENT / SHIELD'}
                </h4>
              </div>
            </div>

            {/* Task Title */}
            {debriefData.taskTitle && (
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-[#71706C] dark:text-[#A19F9A] uppercase tracking-widest font-bold block transition-colors duration-300">
                  Target Task Description
                </span>
                <p className="text-sm font-extrabold text-[#1C1C1A] dark:text-[#F5F4F0]">
                  {debriefData.taskTitle}
                </p>
              </div>
            )}

            {/* What happened */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-[#71706C] dark:text-[#A19F9A] uppercase tracking-widest font-bold block transition-colors duration-300">
                Session Narrative
              </span>
              <p className="text-xs text-[#51504B] dark:text-[#D2CFC9] leading-relaxed font-mono bg-[#FAF9F6] dark:bg-[#252422] border border-[#E6E5E0] dark:border-[#2E2D2A] p-4 rounded-2xl transition-colors duration-300">
                {debriefData.whatHappened}
              </p>
            </div>

            {/* Root cause */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-[#71706C] dark:text-[#A19F9A] uppercase tracking-widest font-bold block transition-colors duration-300">
                Root Cause Analysis
              </span>
              <p className="text-sm text-[#51504B] dark:text-[#D2CFC9] leading-relaxed transition-colors duration-300">
                {debriefData.rootCause}
              </p>
            </div>

            {/* Preventive action recommendation */}
            <div className="bg-white dark:bg-[#1C1B19] border-2 border-indigo-600/30 dark:border-indigo-400/20 rounded-[2rem] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm transition-colors duration-300">
              <div className="flex items-start gap-3.5">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl flex-shrink-0 mt-1 sm:mt-0 transition-colors duration-300">
                  <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                </div>
                <div className="space-y-1 flex-1">
                  <span className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-indigo-600 dark:text-[#A8A4FF] transition-colors duration-300">
                    One Preventive Action
                  </span>
                  <p className="text-xs text-[#1C1C1A] dark:text-[#F5F4F0] leading-relaxed font-bold transition-colors duration-300">
                    {debriefData.preventiveAction.suggestion}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onScheduleHabit(debriefData)}
                className="bg-[#1C1C1A] dark:bg-[#F5F4F0] hover:bg-[#32312E] dark:hover:bg-[#E2E1DD] text-white dark:text-[#121211] font-bold text-xs px-4 py-2.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer shadow flex-shrink-0"
              >
                <Calendar className="w-4 h-4" />
                <span>{debriefData.preventiveAction.actionButtonLabel}</span>
              </button>
            </div>

          </div>

          {/* Return Home button */}
          <div className="flex items-center justify-center pt-2">
            <button
              onClick={onBackToHome}
              className="text-[#71706C] dark:text-[#A19F9A] hover:text-[#1C1C1A] dark:hover:text-[#F5F4F0] text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors duration-300"
            >
              <span>Back to home dashboard</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      ) : completedSessions.length > 0 && onSelectSessionToPrepopulate ? (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1C1B19] border border-[#E6E5E0] dark:border-[#2E2D2A] ballpark-shadow rounded-[2rem] p-6 sm:p-10 text-center space-y-6 transition-colors duration-300">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-[#A8A4FF] border border-indigo-500/20 flex items-center justify-center mx-auto">
              <History className="w-6 h-6" />
            </div>
            
            <div className="space-y-2">
              <h4 className="text-lg font-extrabold text-[#1C1C1A] dark:text-[#F5F4F0] tracking-tight transition-colors duration-300">
                Audit Past Session Cycles
              </h4>
              <p className="text-xs sm:text-sm text-[#71706C] dark:text-[#A19F9A] max-w-sm mx-auto leading-relaxed transition-colors duration-300">
                Review Mode allows you to select any of your past completed sessions from history to pre-populate and audit your performance, outline strategy, and habit logs.
              </p>
            </div>

            <div className="border-t border-[#FAF9F6] dark:border-[#2E2D2A] pt-6 text-left space-y-4">
              <span className="text-[10px] font-mono font-bold text-[#71706C] dark:text-[#A19F9A] uppercase tracking-wider block">
                Select a past session to load
              </span>
              
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {completedSessions.map((session) => {
                  const isSuccess = session.outcome === 'Success';
                  return (
                    <button
                      key={session.id}
                      onClick={() => onSelectSessionToPrepopulate(session)}
                      className="w-full flex items-center justify-between p-3.5 rounded-xl border border-[#E6E5E0] dark:border-[#2E2D2A] hover:border-indigo-500/40 dark:hover:border-indigo-400/30 bg-[#FAF9F6] dark:bg-[#252422]/40 hover:bg-white dark:hover:bg-[#1C1B19] transition-all text-left cursor-pointer"
                    >
                      <div className="space-y-1 flex-1 pr-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[8px] font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-[#A8A4FF] uppercase px-1.5 py-0.5 rounded">
                            {session.mode}
                          </span>
                          <span className="text-[9px] text-[#71706C] dark:text-[#A19F9A] font-mono">
                            {session.date}
                          </span>
                        </div>
                        <h5 className="text-xs font-extrabold text-[#1C1C1A] dark:text-[#F5F4F0] line-clamp-1">
                          {session.taskDescription}
                        </h5>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          isSuccess 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-500/20'
                        }`}>
                          {isSuccess ? 'DELIVERED' : 'ABORTED'}
                        </span>
                        <ChevronRight className="w-4 h-4 text-[#71706C] dark:text-[#A19F9A]" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex justify-center">
              <button
                onClick={onBackToHome}
                className="text-[#71706C] dark:text-[#A19F9A] hover:text-[#1C1C1A] dark:hover:text-[#F5F4F0] text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors duration-300"
              >
                <span>Back to home dashboard</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1C1B19] border border-[#E6E5E0] dark:border-[#2E2D2A] ballpark-shadow rounded-[2rem] p-8 sm:p-12 text-center space-y-6 transition-colors duration-300">
            <div className="w-12 h-12 rounded-2xl bg-[#D95D39]/10 text-[#D95D39] border border-[#D95D39]/20 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            
            <div className="space-y-2">
              <h4 className="text-lg font-extrabold text-[#1C1C1A] dark:text-[#F5F4F0] tracking-tight transition-colors duration-300">
                No Retrospective Data Available Yet
              </h4>
              <p className="text-xs sm:text-sm text-[#71706C] dark:text-[#A19F9A] max-w-sm mx-auto leading-relaxed transition-colors duration-300">
                Complete your first crisis management or planning session using Clutch to analyze your workflow constraints, detect calendar bottlenecks, and generate automated preventative focus blocks.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={onBackToHome}
                className="inline-flex items-center gap-2 bg-[#D95D39] hover:bg-[#C24E2D] text-white font-extrabold text-xs px-6 py-3.5 rounded-full shadow-md hover:scale-[1.02] transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Go to Home to Get Started
              </button>
            </div>
          </div>
        </div>
      )}

    </motion.div>
  );
}
