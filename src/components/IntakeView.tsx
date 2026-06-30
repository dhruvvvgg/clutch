import { useState, KeyboardEvent } from 'react';
import { motion } from 'motion/react';
import { Flame, Calendar, ArrowRight, CornerDownLeft, Sparkles, RefreshCw } from 'lucide-react';

interface IntakeViewProps {
  key?: string;
  selectedMode: 'crisis' | 'plan' | 'review';
  isSubmitting: boolean;
  onSubmit: (text: string) => void;
  onCancel: () => void;
  onBackToModes?: () => void;
  googleUser: any;
  onGoogleSignIn: () => void;
}

export default function IntakeView({
  selectedMode,
  isSubmitting,
  onSubmit,
  onCancel,
  onBackToModes,
  googleUser,
  onGoogleSignIn,
}: IntakeViewProps) {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const demos = [
    {
      label: 'Investor Presentation',
      text: 'B2B SaaS investor pitch deck. Needs to compile competitive market sizing data and draft email updates to my seed investors.',
    },
    {
      label: 'Research Essay',
      text: 'Final research essay on loss aversion in cognitive psychology. Must ground with actual clinical studies and cite authors.',
    },
    {
      label: 'Software Bug Crisis',
      text: 'Production server is crashing. I need to compile a incident summary report for clients, draft a status page notification, and outline the fix.',
    },
  ];

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey && text.trim() && !isSubmitting) {
      onSubmit(text);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-2xl mx-auto space-y-6 py-6 select-none transition-colors duration-300"
    >
      {/* Title */}
      <div className="space-y-2 text-center">
        <span className="text-[10px] font-sans font-black uppercase tracking-wider text-[#D95D39]">
          {selectedMode === 'crisis' ? 'Emergency Protocol Intake' : 'Proactive Outline Setup'}
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight text-[#1C1C1A] dark:text-[#F5F4F0] transition-colors duration-300">
          {selectedMode === 'crisis' ? 'What are we working on?' : 'What do you want to get ahead of?'}
        </h2>
        <p className="text-sm text-[#71706C] dark:text-[#A19F9A] max-w-md mx-auto transition-colors duration-300">
          Describe your task in plain, human English. Be as detailed or as brief as you want — include due dates, stakes, or key concerns.
        </p>
      </div>

      {/* Google Link Prompt */}
      {!googleUser && (
        <div className="bg-[#D95D39]/5 dark:bg-[#D95D39]/10 border border-[#D95D39]/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#D95D39] flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#1C1C1A] dark:text-[#F5F4F0]">Connect your real Google Account</h4>
              <p className="text-xs text-[#71706C] dark:text-[#A19F9A] leading-relaxed">
                Clutch can optimize your <strong>real Google Calendar</strong> and create <strong>actual drafts in your Gmail</strong>. Link your workspace to bypass simulator mode.
              </p>
            </div>
          </div>
          <button
            onClick={onGoogleSignIn}
            className="flex items-center gap-2 bg-white dark:bg-[#252422] border border-[#E6E5E0] dark:border-[#2E2D2A]/60 rounded-xl py-2 px-4 shadow-sm text-xs font-bold text-[#1C1C1A] dark:text-[#F5F4F0] hover:bg-[#FAF9F6] dark:hover:bg-[#1C1B19] transition-all cursor-pointer flex-shrink-0"
          >
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 flex-shrink-0">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
            </svg>
            <span>Link Google Workspace</span>
          </button>
        </div>
      )}

      {/* Input canvas */}
      <div className={`bg-white dark:bg-[#1C1B19] border rounded-[2rem] p-6 space-y-4 transition-all duration-300 ${
        isFocused 
          ? 'border-[#D95D39] shadow-[0_12px_40px_rgba(217,93,57,0.06)]' 
          : 'border-[#E6E5E0] dark:border-[#2E2D2A] ballpark-shadow'
      }`}>
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={
              selectedMode === 'crisis'
                ? "Describe your situation... e.g., 'I have a 10-slide presentation due for my chemistry final tomorrow morning at 9:00 AM. I have nothing written and haven't slept...'"
                : "Describe what you want to build... e.g., 'An 8-page whitepaper outlining our carbon offset strategy. It needs carbon capture math and compliance facts...'"
            }
            disabled={isSubmitting}
            className="w-full h-44 bg-transparent text-[#1C1C1A] dark:text-[#F5F4F0] placeholder-[#A19F9A] dark:placeholder-[#5E5D59] text-sm leading-relaxed border-none focus:outline-none resize-none font-sans"
          />

          {/* Textarea metrics overlay - neatly integrated, not absolutely overlapping text scroll */}
          {text.length > 0 && !isSubmitting && (
            <div className="flex items-center justify-between border-t border-dashed border-[#E6E5E0] dark:border-[#2E2D2A] pt-2 mt-1 select-none transition-colors duration-300">
              <span className="text-[10px] font-sans text-[#71706C] dark:text-[#A19F9A]">
                {text.split(/\s+/).filter(Boolean).length} words • {text.length} chars
              </span>
              <button
                type="button"
                onClick={() => setText('')}
                className="text-[10px] font-sans font-bold text-[#D95D39] hover:text-[#C24E2D] cursor-pointer transition-colors"
              >
                Clear text
              </button>
            </div>
          )}
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-between pt-4 border-t border-[#FAF9F6] dark:border-[#2E2D2A] text-[#71706C] dark:text-[#A19F9A] transition-colors duration-300">
          <div className="hidden sm:flex items-center flex-wrap gap-2 font-sans text-[10px]">
            <div className="flex items-center gap-1">
              <span className="bg-[#FAF9F6] dark:bg-[#252422] border border-[#E6E5E0] dark:border-[#2E2D2A] px-1.5 py-0.5 rounded font-bold transition-colors duration-300">Ctrl</span>
              <span>+</span>
              <span className="bg-[#FAF9F6] dark:bg-[#252422] border border-[#E6E5E0] dark:border-[#2E2D2A] px-1.5 py-0.5 rounded font-bold transition-colors duration-300">Enter</span>
              <span className="ml-1">to submit intake</span>
            </div>
            <span className="text-[#E6E5E0] dark:text-[#2E2D2A] hidden md:inline">|</span>
            <div className="inline-flex items-center gap-1 text-[9px] text-[#4285F4] font-bold font-mono uppercase bg-[#4285F4]/5 dark:bg-[#4285F4]/10 border border-[#4285F4]/10 rounded-full px-2 py-0.5">
              <Sparkles className="w-2.5 h-2.5" />
              Powered by Gemini 3.5 Flash
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold text-[#71706C] dark:text-[#A19F9A] hover:text-[#1C1C1A] dark:hover:text-[#F5F4F0] cursor-pointer transition-colors duration-300"
            >
              Cancel
            </button>
            
            <button
              onClick={() => onSubmit(text)}
              disabled={!text.trim() || isSubmitting}
              className="bg-[#D95D39] hover:bg-[#C24E2D] disabled:bg-[#ECE7E1] dark:disabled:bg-[#252422] disabled:text-[#A19F9A] dark:disabled:text-[#5E5D59] disabled:cursor-not-allowed text-white font-bold text-xs px-5 py-2.5 rounded-full flex items-center gap-1.5 cursor-pointer shadow transition-all duration-300"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Parsing Intake...</span>
                </>
              ) : (
                <>
                  {selectedMode === 'crisis' ? (
                    <>
                      <Flame className="w-3.5 h-3.5" />
                      <span>Initialize Crisis Mode</span>
                    </>
                  ) : (
                    <>
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Initialize Plan Mode</span>
                    </>
                  )}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Demo shortcuts */}
      {!isSubmitting && (
        <div className="space-y-3">
          <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#71706C] dark:text-[#A19F9A] block text-center transition-colors duration-300">
            Or select a sample scenario to demo:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {demos.map((demo, idx) => (
              <button
                key={idx}
                onClick={() => setText(demo.text)}
                className="bg-white dark:bg-[#1C1B19] hover:bg-[#FAF9F6] dark:hover:bg-[#252422] border border-[#E6E5E0] dark:border-[#2E2D2A] rounded-2xl p-4 text-left transition-all text-xs space-y-1.5 cursor-pointer ballpark-shadow hover:border-[#D95D39] dark:hover:border-[#D95D39] group transition-colors duration-300"
              >
                <span className="font-extrabold text-[#1C1C1A] dark:text-[#F5F4F0] block flex items-center justify-between transition-colors duration-300">
                  {demo.label}
                  <span className="opacity-0 group-hover:opacity-100 text-[#D95D39] transition-opacity">→</span>
                </span>
                <span className="text-[#71706C] dark:text-[#D2CFC9] leading-relaxed line-clamp-2 transition-colors duration-300">
                  {demo.text}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
