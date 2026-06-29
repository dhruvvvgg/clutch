import { motion } from 'motion/react';
import { MissionAssessment } from '../types';
import { Check, ShieldAlert, Sparkles, ChevronRight, Flame, Target } from 'lucide-react';

interface AssessmentViewProps {
  key?: string;
  assessment: MissionAssessment;
  onProceed: () => void;
  onBackToModes: () => void;
  mode: 'crisis' | 'plan';
}

export default function AssessmentView({
  assessment,
  onProceed,
  onBackToModes,
  mode,
}: AssessmentViewProps) {
  const isFight = assessment.recommendedStrategy === 'FIGHT';
  const isPlanMode = mode === 'plan';

  const probability = isPlanMode ? 95 : assessment.completionProbability;
  const strokeColor = isPlanMode 
    ? '#10B981' // emerald
    : probability >= 70 
      ? '#10B981' 
      : probability >= 40 
        ? '#F59E0B' // amber
        : '#D95D39'; // red

  // SVG parameters for 80px circle
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (probability / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-2xl mx-auto space-y-6 py-6 select-none transition-colors duration-300"
    >
      {/* Title */}
      <div className="space-y-2 text-center">
        <span className="text-[10px] font-sans font-black uppercase tracking-wider text-[#D95D39]">
          {isPlanMode ? 'Proactive Strategy Prepared' : 'Mission Parameters Staged'}
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight text-[#1C1C1A] dark:text-[#F5F4F0] transition-colors duration-300">
          {isPlanMode ? 'Proactive Readiness & Planning Brief' : 'Strategic Feasibility Assessment'}
        </h2>
        <p className="text-sm text-[#71706C] dark:text-[#A19F9A] max-w-md mx-auto transition-colors duration-300">
          {isPlanMode 
            ? 'We have assessed your timeline and compiled optimal proactive blocks to establish strategic safety buffers.' 
            : 'We have calculated the complexity, remaining hours, and output constraints to outline your tactical path.'}
        </p>
      </div>

      {/* Main Core Score Card */}
      <div className="bg-white dark:bg-[#1C1B19] border border-[#E6E5E0] dark:border-[#2E2D2A] ballpark-shadow rounded-[2rem] p-8 space-y-8 transition-colors duration-300">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center border-b border-[#FAF9F6] dark:border-[#2E2D2A] pb-8 transition-colors duration-300">
          
          {/* Circular SVG Ring metric on left */}
          <div className="space-y-4 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
                {/* Background track circle */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    className="stroke-[#FAF9F6] dark:stroke-[#252422]"
                    strokeWidth="5"
                    fill="transparent"
                  />
                  {/* Active animated progress ring */}
                  <motion.circle
                    cx="40"
                    cy="40"
                    r={radius}
                    stroke={strokeColor}
                    strokeWidth="5"
                    fill="transparent"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    strokeLinecap="round"
                  />
                </svg>
                {/* Score label inside */}
                <span className="absolute text-base font-black font-mono text-[#1C1C1A] dark:text-[#F5F4F0]">
                  {probability}%
                </span>
              </div>
              
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[10px] font-sans font-black uppercase tracking-widest text-[#71706C] dark:text-[#A19F9A] block">
                  {isPlanMode ? 'Strategic Readiness' : 'Completion Odds'}
                </span>
                <span className={`text-xs font-bold leading-none ${
                  probability >= 70 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : probability >= 40 
                      ? 'text-amber-500 dark:text-amber-400' 
                      : 'text-[#D95D39]'
                }`}>
                  {probability >= 70 
                    ? 'Optimal feasibility.' 
                    : probability >= 40 
                      ? 'Challenging runway.' 
                      : 'Severe compression risk.'}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#71706C] dark:text-[#A19F9A] max-w-xs transition-colors duration-300 leading-relaxed">
              {isPlanMode 
                ? 'High preparedness score due to early-stage active runway buffers and structured workspace scaffolding.'
                : `Based on required ${assessment.details.estimatedOutputCount} deliverables under existing timeline parameters.`}
            </p>
          </div>

          {/* Tactical Strategy block on right */}
          <div className={`p-6 rounded-2xl border flex flex-col justify-between h-full space-y-4 transition-colors duration-300 ${
            isPlanMode
              ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400'
              : isFight 
                ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400' 
                : 'bg-[#FAF9F6] dark:bg-[#252422] border-[#E6E5E0] dark:border-[#2E2D2A] text-[#1C1C1A] dark:text-[#F5F4F0]'
          }`}>
            <div className="space-y-1">
              <span className="text-[9px] font-sans font-extrabold uppercase tracking-widest block opacity-70">
                Recommended Strategy
              </span>
              <h3 className="text-2xl font-black tracking-tight flex items-center gap-2">
                {isPlanMode ? (
                  <>
                    <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span>PROACTIVE PIPELINE</span>
                  </>
                ) : isFight ? (
                  <>
                    <Flame className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span>FIGHT PROTOCOL</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-5 h-5 text-[#D95D39]" />
                    <span>DAMAGE CONTROL</span>
                  </>
                )}
              </h3>
            </div>

            <p className="text-xs leading-relaxed opacity-90">
              {isPlanMode 
                ? 'Establish preemptive calendar timeblocks and request early stakeholder alignment to ensure a flawless execution.'
                : isFight 
                  ? 'Mathematically viable with calendar clearing and document bootstrapping. Clear the path and write immediately.' 
                  : 'Timeline extremely high-risk. We suggest negotiating an extension immediately to secure safety buffers.'}
            </p>
          </div>

        </div>

        {/* Detailed reasoning text */}
        <div className="space-y-2">
          <span className="text-xs font-sans font-bold uppercase tracking-wider text-[#71706C] dark:text-[#A19F9A] block transition-colors duration-300">
            Executive Briefing & Reasoning:
          </span>
          <p className="text-sm text-[#51504B] dark:text-[#D2CFC9] leading-relaxed italic border-l-2 border-[#E6E5E0] dark:border-[#2E2D2A] pl-4 font-sans transition-colors duration-300">
            "{isPlanMode 
              ? 'Timeline allows a highly focused and strategic execution. By booking deep work reserves on your calendar now, we can protect your focus blocks and coordinate kickoff documents before friction develops.' 
              : assessment.reasoning}"
          </p>
        </div>

        {/* Action items and challenges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#FAF9F6] dark:border-[#2E2D2A] transition-colors duration-300">
          
          <div className="space-y-3">
            <span className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-[#71706C] dark:text-[#A19F9A] block transition-colors duration-300">
              {isPlanMode ? 'Key Milestone Targets' : 'Deliverable Targets'}
            </span>
            <ul className="space-y-2">
              {(isPlanMode 
                ? [
                    "Outline & Scaffolding draft baseline.",
                    "Time-blocked focus reservations.",
                    "Preemptive team status kickoff."
                  ]
                : assessment.details.challenges
              ).map((challenge, idx) => (
                <li key={idx} className="text-xs text-[#51504B] dark:text-[#D2CFC9] flex items-start gap-2 leading-relaxed transition-colors duration-300">
                  <span className="text-[#D95D39] font-sans font-bold mt-0.5">•</span>
                  <span>{challenge}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-[#71706C] dark:text-[#A19F9A] block transition-colors duration-300">
              Proactive Action Plan
            </span>
            <ul className="space-y-2">
              {(isPlanMode
                ? [
                    "Reserve optimal calendar focus blocks.",
                    "Sync proactive kickoff drafts to Gmail.",
                    "Load research grounding reference outlines."
                  ]
                : assessment.details.actionItems
              ).map((item, idx) => (
                <li key={idx} className="text-xs text-[#51504B] dark:text-[#D2CFC9] flex items-start gap-2 leading-relaxed transition-colors duration-300">
                  <span className="text-[#1E1D2F] dark:text-[#A8A4FF] font-sans font-bold mt-0.5">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Proceed primary button */}
        <div className="pt-6 border-t border-[#FAF9F6] dark:border-[#2E2D2A] flex items-center justify-between transition-colors duration-300">
          <span className="text-xs font-sans text-[#71706C] dark:text-[#A19F9A] transition-colors duration-300">
            Ready to review calibrated planning deliverables
          </span>
          
          <button
            onClick={onProceed}
            className="bg-[#1C1C1A] dark:bg-[#F5F4F0] hover:bg-[#32312E] dark:hover:bg-[#E2E1DD] text-white dark:text-[#121211] font-bold text-xs px-6 py-3 rounded-full flex items-center gap-1.5 cursor-pointer shadow transition-all duration-300"
          >
            <span>Proceed to Step Protocol</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </motion.div>
  );
}
