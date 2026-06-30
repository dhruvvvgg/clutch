import { useState } from 'react';
import { motion } from 'motion/react';
import { CalendarEvent, EmailDraft, BootstrapOutput } from '../types';
import { 
  Calendar, Mail, FileText, Check, X, Play, ExternalLink, HelpCircle, ChevronRight, Sliders, Copy, RotateCcw 
} from 'lucide-react';

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

interface CrisisStepsViewProps {
  key?: string;
  assessment: any;
  calendarEvents: CalendarEvent[];
  selectedCalendarEvents: Record<string, boolean>;
  onToggleCalendarEvent: (id: string) => void;
  onToggleAllCalendarEvents?: (select: boolean) => void;
  calendarApproved: boolean;
  onApproveCalendar: () => void;
  emailDrafts: EmailDraft[];
  editingEmails: Record<string, string>;
  onChangeEmail: (id: string, text: string) => void;
  onResetEmail?: (id: string) => void;
  emailsSynced: boolean;
  onSyncEmails: () => void;
  bootstrapData: BootstrapOutput | null;
  onLaunchWorkspace: () => void;
  onBackToModes?: () => void;
  mode: 'crisis' | 'plan';
}

export default function CrisisStepsView({
  assessment,
  calendarEvents,
  selectedCalendarEvents,
  onToggleCalendarEvent,
  onToggleAllCalendarEvents,
  calendarApproved,
  onApproveCalendar,
  emailDrafts,
  editingEmails,
  onChangeEmail,
  onResetEmail,
  emailsSynced,
  onSyncEmails,
  bootstrapData,
  onLaunchWorkspace,
  onBackToModes,
  mode,
}: CrisisStepsViewProps) {
  const [copiedDraftId, setCopiedDraftId] = useState<string | null>(null);
  const isPlanMode = mode === 'plan';

  const handleCopyDraft = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDraftId(id);
    setTimeout(() => {
      setCopiedDraftId(null);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-6xl mx-auto space-y-6 py-6 select-none font-sans transition-colors duration-300"
    >
      {/* Title block */}
      <div className="space-y-2 text-center">
        <span className="text-[10px] font-sans font-black uppercase tracking-wider text-[#D95D39]">
          {isPlanMode ? 'Proactive Planning Center' : 'Crisis Deployment Center'}
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight text-[#1C1C1A] dark:text-[#F5F4F0] transition-colors duration-300">
          {isPlanMode ? 'Step-by-Step Milestones' : 'Step-by-Step Calibrations'}
        </h2>
        <p className="text-sm text-[#71706C] dark:text-[#A19F9A] max-w-lg mx-auto leading-relaxed transition-colors duration-300">
          {isPlanMode 
            ? 'Review, customize, and approve the proactive blueprint, calendar, and templates mapped out by our agents.'
            : 'Review, customize, and approve the automatic actions prepared by our agents before entering your live focus workspace.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Step 1 (Calendar) & Step 2 (Emails) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Step 1: Calendar Path Clearance / Focus Reservation */}
          <div className="bg-white dark:bg-[#1C1B19] border border-[#E6E5E0] dark:border-[#2E2D2A] ballpark-shadow rounded-[2rem] p-6 sm:p-8 space-y-6 transition-colors duration-300">
            <div className="flex items-center justify-between border-b border-[#FAF9F6] dark:border-[#2E2D2A] pb-4 transition-colors duration-300">
              <div className="flex items-center gap-3">
                <div className="bg-[#FAF9F6] dark:bg-[#252422] border border-[#E6E5E0] dark:border-[#2E2D2A] p-2.5 rounded-xl transition-colors duration-300">
                  <GoogleCalendarLogo className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-[#71706C] dark:text-[#A19F9A] transition-colors duration-300">Step 1 • Google Calendar Agent</span>
                  <h3 className="text-base font-bold text-[#1C1C1A] dark:text-[#F5F4F0] transition-colors duration-300">
                    {isPlanMode ? 'Focus Blocks Reservation' : 'Calendar Optimization'}
                  </h3>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[9px] font-sans font-bold uppercase px-2.5 py-1.5 rounded-full border border-blue-500/20 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-500/10 transition-colors duration-300 shadow-sm">
                <GoogleCalendarLogo className="w-3.5 h-3.5" />
                Google Calendar Integration
              </span>
            </div>

            <p className="text-xs text-[#71706C] dark:text-[#A19F9A] leading-relaxed transition-colors duration-300">
              {isPlanMode 
                ? 'We mapped out optimal dedicated high-energy focus slots. Approve them below to automatically schedule reservation blocks directly on your Google Calendar.'
                : 'We identified upcoming schedules that directly conflict with your writing window. Review conflict choices below to auto-postpone or clear them on Google Calendar.'}
            </p>

            {calendarEvents.some(ev => ev.classification !== 'critical') && onToggleAllCalendarEvents && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onToggleAllCalendarEvents(true)}
                  className="text-[10px] font-sans font-bold text-[#D95D39] hover:text-[#C24E2D] bg-[#FAF9F6] dark:bg-[#252422] border border-[#E6E5E0] dark:border-[#2E2D2A] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  {isPlanMode ? '✓ Pre-schedule All Focus Blocks' : '✓ Auto-Postpone All Deferrable'}
                </button>
                <button
                  type="button"
                  onClick={() => onToggleAllCalendarEvents(false)}
                  className="text-[10px] font-sans font-bold text-[#71706C] dark:text-[#A19F9A] bg-white dark:bg-[#1C1B19] border border-[#E6E5E0] dark:border-[#2E2D2A] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  {isPlanMode ? '↺ Restore Default Selections' : '↺ Restore All Conflicts'}
                </button>
              </div>
            )}

            {calendarEvents.length === 0 ? (
              <p className="text-xs text-[#71706C] dark:text-[#A19F9A] italic py-4 transition-colors duration-300">No scheduled syncs detected in the timeline window.</p>
            ) : (
              <div className="space-y-3">
                {calendarEvents.map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => ev.classification !== 'critical' && onToggleCalendarEvent(ev.id)}
                    className={`border rounded-2xl p-4 flex items-center justify-between transition-all select-none ${
                      ev.classification === 'critical'
                        ? 'bg-[#FAF9F6] dark:bg-[#252422] border-[#E6E5E0] dark:border-[#2E2D2A] opacity-60 cursor-not-allowed'
                        : selectedCalendarEvents[ev.id]
                          ? 'bg-[#D95D39]/5 border-[#D95D39] dark:border-[#D95D39] cursor-pointer'
                          : 'bg-white dark:bg-[#1C1B19] border-[#E6E5E0] dark:border-[#2E2D2A] hover:border-[#D95D39] cursor-pointer'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <GoogleCalendarLogo className="w-4 h-4 flex-shrink-0" />
                        <h4 className="text-xs font-bold text-[#1C1C1A] dark:text-[#F5F4F0] transition-colors duration-300">
                          {isPlanMode && ev.classification !== 'critical' ? `[Focus Reserve] ${ev.title}` : ev.title}
                        </h4>
                      </div>
                      <span className="text-[10px] text-[#71706C] dark:text-[#A19F9A] transition-colors duration-300 pl-6">
                        {new Date(ev.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(ev.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-sans font-bold px-2 py-0.5 rounded uppercase ${
                        ev.classification === 'critical' 
                          ? 'bg-[#FAF9F6] dark:bg-[#252422] text-[#71706C] dark:text-[#A19F9A]' 
                          : ev.classification === 'skippable'
                            ? 'bg-[#D95D39]/10 text-[#D95D39]'
                            : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                      }`}>
                        {isPlanMode && ev.classification !== 'critical' ? 'focus-block' : ev.classification}
                      </span>
                      {ev.classification !== 'critical' && (
                        <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                          selectedCalendarEvents[ev.id]
                            ? 'bg-[#D95D39] text-white border-[#D95D39]'
                            : 'border-[#E6E5E0] dark:border-[#2E2D2A] bg-white dark:bg-[#1C1B19]'
                        }`}>
                          {selectedCalendarEvents[ev.id] && <Check className="w-3 h-3" />}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={onApproveCalendar}
                disabled={calendarApproved}
                className={`w-full text-xs font-bold py-3 rounded-full border flex items-center justify-center gap-1.5 transition-all cursor-pointer ballpark-shadow ${
                  calendarApproved 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 cursor-not-allowed'
                    : 'bg-[#1C1C1A] dark:bg-[#F5F4F0] hover:bg-[#32312E] dark:hover:bg-[#E2E1DD] text-white dark:text-[#121211] border-transparent'
                }`}
              >
                {calendarApproved ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <GoogleCalendarLogo className="w-4 h-4" />}
                {calendarApproved 
                  ? (isPlanMode ? 'Google Calendar focus blocks reserved successfully' : 'Google Calendar optimized successfully') 
                  : (isPlanMode ? 'Reserve focus blocks on Google Calendar' : 'Clear conflict slots on Google Calendar')}
              </button>
            </div>
          </div>

          {/* Step 2: Communications Drafting */}
          <div className="bg-white dark:bg-[#1C1B19] border border-[#E6E5E0] dark:border-[#2E2D2A] ballpark-shadow rounded-[2rem] p-6 sm:p-8 space-y-6 transition-colors duration-300">
            <div className="flex items-center justify-between border-b border-[#FAF9F6] dark:border-[#2E2D2A] pb-4 transition-colors duration-300">
              <div className="flex items-center gap-3">
                <div className="bg-[#FAF9F6] dark:bg-[#252422] border border-[#E6E5E0] dark:border-[#2E2D2A] p-2.5 rounded-xl transition-colors duration-300">
                  <GmailLogo className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-[#71706C] dark:text-[#A19F9A] transition-colors duration-300">Step 2 • Gmail Agent</span>
                  <h3 className="text-base font-bold text-[#1C1C1A] dark:text-[#F5F4F0] transition-colors duration-300">
                    {isPlanMode ? 'Stakeholder Collaboration & Alignment' : 'Stakeholder Communications'}
                  </h3>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[9px] font-sans font-bold uppercase px-2.5 py-1.5 rounded-full border border-rose-500/20 text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-500/10 transition-colors duration-300 shadow-sm">
                <GmailLogo className="w-3.5 h-3.5" />
                Gmail Workspace Sync
              </span>
            </div>

            <p className="text-xs text-[#71706C] dark:text-[#A19F9A] leading-relaxed transition-colors duration-300">
              {isPlanMode 
                ? 'We generated proactive alignment templates and milestone status updates. Review and sync them to your Gmail Drafts folder to get ahead of stakeholder requests.'
                : 'We generated polite, professional templates based on your target plan. Review, modify, and click to automatically sync them directly to your Gmail Drafts folder.'}
            </p>

            <div className="space-y-4">
              {emailDrafts.map((draft) => {
                const displaySubject = isPlanMode ? `[Alignment Kickoff] ${draft.subject.replace('Urgent: ', '')}` : draft.subject;
                const displayBody = isPlanMode 
                  ? editingEmails[draft.id]?.replace(/apologize/gi, 'coordinate proactively')
                                       ?.replace(/impossible/gi, 'strategic progress')
                                       ?.replace(/unfortunately/gi, 'to align early') || draft.body
                  : editingEmails[draft.id] || draft.body;

                return (
                  <div key={draft.id} className="border border-[#E6E5E0] dark:border-[#2E2D2A] rounded-2xl overflow-hidden bg-[#FAF9F6]/40 dark:bg-[#252422]/40 shadow-sm transition-colors duration-300">
                    <div className="bg-[#FAF9F6] dark:bg-[#252422] px-4 py-2.5 text-[10px] border-b border-[#E6E5E0] dark:border-[#2E2D2A] text-[#71706C] dark:text-[#A19F9A] flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-sans transition-colors duration-300">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 items-start sm:items-center">
                        <div className="flex items-center gap-1 bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/10 px-1.5 py-0.5 rounded text-[8px] text-rose-600 dark:text-rose-400 font-bold uppercase flex-shrink-0">
                          <GmailLogo className="w-3 h-3" />
                          <span>Gmail Draft</span>
                        </div>
                        <span className="mt-1 sm:mt-0"><strong className="text-[#1C1C1A] dark:text-[#F5F4F0] transition-colors duration-300">To:</strong> {draft.recipient}</span>
                        <span className="hidden sm:inline text-[#E6E5E0] dark:text-[#2E2D2A]">|</span>
                        <span><strong className="text-[#1C1C1A] dark:text-[#F5F4F0] transition-colors duration-300">Subject:</strong> {displaySubject}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleCopyDraft(draft.id, displayBody)}
                          className="flex items-center gap-1 hover:text-[#1C1C1A] dark:hover:text-[#F5F4F0] transition-colors cursor-pointer"
                          title="Copy to Clipboard"
                        >
                          {copiedDraftId === draft.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                        
                        {onResetEmail && (
                          <button
                            type="button"
                            onClick={() => onResetEmail(draft.id)}
                            className="flex items-center gap-1 hover:text-[#D95D39] transition-colors cursor-pointer"
                            title="Reset draft to original recommended text"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reset</span>
                          </button>
                        )}
                      </div>
                    </div>
                    <textarea
                      value={displayBody}
                      onChange={(e) => onChangeEmail(draft.id, e.target.value)}
                      className="w-full h-32 bg-white dark:bg-[#1C1B19] text-[#51504B] dark:text-[#D2CFC9] p-4 text-xs focus:outline-none focus:ring-0 leading-relaxed resize-none border-none font-sans transition-colors duration-300"
                    />
                  </div>
                );
              })}
            </div>

            <div className="pt-2">
              <button
                onClick={onSyncEmails}
                disabled={emailsSynced}
                className={`w-full text-xs font-bold py-3 rounded-full border flex items-center justify-center gap-1.5 transition-all cursor-pointer ballpark-shadow ${
                  emailsSynced 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 cursor-not-allowed'
                    : 'bg-[#1C1C1A] dark:bg-[#F5F4F0] hover:bg-[#32312E] dark:hover:bg-[#E2E1DD] text-white dark:text-[#121211] border-transparent'
                }`}
              >
                {emailsSynced ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <GmailLogo className="w-4 h-4" />}
                {emailsSynced 
                  ? (isPlanMode ? 'Proactive drafts synced to Gmail folder' : 'Diplomatic drafts synced to Gmail folder') 
                  : (isPlanMode ? 'Sync proactive alignment drafts to Gmail' : 'Sync diplomatic drafts to Gmail Account')}
              </button>
            </div>
          </div>

        </div>

        {/* Right Side: Step 3 Workspace Bootstrap preview */}
        <div className="lg:col-span-5 space-y-6">
          {bootstrapData && (
            <div className="bg-white dark:bg-[#1C1B19] border border-[#E6E5E0] dark:border-[#2E2D2A] ballpark-shadow rounded-[2rem] p-6 sm:p-8 space-y-6 flex flex-col h-full transition-colors duration-300">
              <div className="flex items-center justify-between border-b border-[#FAF9F6] dark:border-[#2E2D2A] pb-4 transition-colors duration-300">
                <div className="flex items-center gap-3">
                  <div className="bg-[#FAF9F6] dark:bg-[#252422] border border-[#E6E5E0] dark:border-[#2E2D2A] p-2.5 rounded-xl text-amber-500 dark:text-amber-400 transition-colors duration-300">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-[#71706C] dark:text-[#A19F9A] transition-colors duration-300">Step 3</span>
                    <h3 className="text-base font-bold text-[#1C1C1A] dark:text-[#F5F4F0] transition-colors duration-300">
                      {isPlanMode ? 'Deliverables Blueprint' : 'Workspace Grounding'}
                    </h3>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[9px] font-sans font-bold uppercase px-2.5 py-1 rounded-full border border-indigo-500/20 text-indigo-600 dark:text-[#A8A4FF] bg-indigo-50/50 dark:bg-indigo-500/10 transition-colors duration-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                  Gemini Grounding Active
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] text-[#71706C] dark:text-[#A19F9A] uppercase tracking-wider block font-bold font-sans transition-colors duration-300">
                  {isPlanMode ? 'Blueprint document outline' : 'Generated start asset'}
                </span>
                <h4 className="text-sm font-extrabold text-[#1C1C1A] dark:text-[#F5F4F0] font-sans transition-colors duration-300">{bootstrapData.title}</h4>
              </div>

              {/* Outline Scroller */}
              <div className="flex-1 overflow-y-auto space-y-4 max-h-[350px] pr-2 scrollbar-thin">
                {bootstrapData.outline.map((item, idx) => (
                  <div key={idx} className="border border-[#E6E5E0] dark:border-[#2E2D2A]/60 rounded-2xl p-4 bg-[#FAF9F6]/30 dark:bg-[#252422]/20 space-y-3 shadow-sm transition-colors duration-300">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-extrabold text-[#1C1C1A] dark:text-[#F5F4F0] font-sans transition-colors duration-300">{item.section}</h5>
                    </div>
                    <p className="text-[11px] text-[#71706C] dark:text-[#A19F9A] leading-relaxed font-sans transition-colors duration-300">{item.description}</p>
                    
                    <ul className="space-y-1.5 pl-3 border-l border-[#E6E5E0] dark:border-[#2E2D2A]">
                      {item.bullets.map((bullet, bIdx) => (
                        <li key={bIdx} className="text-xs text-[#51504B] dark:text-[#D2CFC9] list-none flex items-start gap-1.5 font-sans transition-colors duration-300">
                          <span className="text-[#A19F9A] dark:text-[#5E5D59] mt-0.5">•</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>

                    {item.expandMarker && (
                      <div className="bg-[#D95D39]/5 border border-[#D95D39]/10 rounded-xl p-3 flex items-start gap-2 mt-1">
                        <HelpCircle className="w-4 h-4 text-[#D95D39] flex-shrink-0 mt-0.5" />
                        <span className="text-[10px] text-[#D95D39] leading-relaxed font-bold font-sans">
                          {isPlanMode ? item.expandMarker.replace('Input required write node', 'Proactive write block') : item.expandMarker}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Web Grounding sources */}
              {bootstrapData.sources && bootstrapData.sources.length > 0 && (
                <div className="space-y-2 border-t border-[#FAF9F6] dark:border-[#2E2D2A] pt-4 transition-colors duration-300">
                  <span className="inline-flex items-center gap-1 text-[9px] text-[#4285F4] dark:text-[#4285F4] uppercase tracking-wider block font-bold font-sans transition-colors duration-300">
                    <svg className="w-3 h-3 text-[#4285F4]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                    </svg>
                    Google Search Grounding Sources:
                  </span>
                  <div className="flex flex-col gap-2">
                    {bootstrapData.sources.map((src, idx) => (
                      <a 
                        key={idx}
                        href={src.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-[#D95D39] hover:text-[#C24E2D] font-bold truncate transition-colors font-sans"
                      >
                        <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{src.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-[#E6E5E0] dark:border-[#2E2D2A] mt-auto transition-colors duration-300">
                <button
                  onClick={onLaunchWorkspace}
                  className="w-full bg-[#1C1C1A] dark:bg-[#F5F4F0] hover:bg-[#32312E] dark:hover:bg-[#E2E1DD] text-white dark:text-[#121211] font-bold py-3.5 rounded-full text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer font-sans"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  {isPlanMode ? 'Launch Guided Planning Workspace' : 'Launch Clutch Live Workspace'}
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
}
