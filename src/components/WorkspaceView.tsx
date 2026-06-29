import { useState, useEffect, KeyboardEvent } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, Copy, Check, Clock, MessageSquare, 
  Send, HelpCircle, CheckCircle2, ArrowRight, RefreshCw, Sparkles
} from 'lucide-react';
import { BootstrapOutput, StuckChatMessage } from '../types';

interface WorkspaceViewProps {
  key?: string;
  bootstrapData: BootstrapOutput;
  stuckChatHistory: StuckChatMessage[];
  isChatLoading: boolean;
  onSendStuckMessage: () => void;
  chatMessage: string;
  setChatMessage: (msg: string) => void;
  onTypeInWorkspace: () => void;
  estimatedProgress: number;
  timeRemainingSeconds: number;
  onAbort: () => void;
  onMarkDone: () => void;
  isDemoActive?: boolean;
}

export default function WorkspaceView({
  bootstrapData,
  stuckChatHistory,
  isChatLoading,
  onSendStuckMessage,
  chatMessage,
  setChatMessage,
  onTypeInWorkspace,
  estimatedProgress,
  timeRemainingSeconds,
  onAbort,
  onMarkDone,
  isDemoActive = false,
}: WorkspaceViewProps) {
  const [copiedSectionIdx, setCopiedSectionIdx] = useState<number | null>(null);
  const [expansionTexts, setExpansionTexts] = useState<Record<number, string>>({});

  // Format seconds to HH:MM:SS
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSendStuckMessage();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:h-[calc(100vh-140px)] lg:min-h-[600px] select-none py-2 font-sans transition-colors duration-300"
    >
      
      {/* Left Column: Live rich editor canvas */}
      <div className="lg:col-span-8 border border-[#E6E5E0] dark:border-[#2E2D2A] bg-white dark:bg-[#1C1B19] rounded-[2rem] flex flex-col h-[500px] md:h-[600px] lg:h-full overflow-hidden ballpark-shadow transition-colors duration-300">
        
        {/* Editor Top Control Bar */}
        <div className="border-b border-[#FAF9F6] dark:border-[#2E2D2A] bg-[#FAF9F6]/60 dark:bg-[#252422]/60 px-6 py-4 flex items-center justify-between transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div className="bg-white dark:bg-[#1C1B19] border border-[#E6E5E0] dark:border-[#2E2D2A] p-1.5 rounded-lg text-[#D95D39] transition-colors duration-300">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#1C1C1A] dark:text-[#F5F4F0] transition-colors duration-300">{bootstrapData.title}</h3>
              <p className="text-[9px] text-[#71706C] dark:text-[#A19F9A] font-sans uppercase tracking-widest font-bold transition-colors duration-300">
                Workspace Active • {isDemoActive ? 'Demo Sandbox' : 'Google Drive Synced'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {isDemoActive && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1 text-[9px] font-sans font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest animate-pulse">
                Demo Mode
              </div>
            )}
            <div className="bg-[#FAF9F6] dark:bg-[#252422] border border-[#E6E5E0] dark:border-[#2E2D2A] rounded-full px-3 py-1 text-[9px] font-sans font-bold text-indigo-600 dark:text-[#A8A4FF] uppercase tracking-widest transition-colors duration-300">
              {bootstrapData.type}
            </div>
          </div>
        </div>

        {/* Live Interactive Writing Canvas */}
        <div className="flex-1 p-6 md:p-10 overflow-y-auto space-y-8 text-sm text-[#51504B] dark:text-[#D2CFC9] scrollbar-thin select-text">
          <div className="max-w-2xl mx-auto space-y-6">
            
            {/* Quick jump anchor navigation */}
            <div className="flex flex-wrap gap-1.5 pb-4 border-b border-[#FAF9F6] dark:border-[#2E2D2A] items-center transition-colors duration-300">
              <span className="text-[10px] font-sans font-bold text-[#71706C] dark:text-[#A19F9A] select-none mr-1.5 uppercase tracking-wider">Jump To:</span>
              {bootstrapData.outline.map((sec, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    const el = document.getElementById(`section-node-${idx}`);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                  className="text-[9px] font-sans font-bold px-2.5 py-1 rounded-full bg-[#FAF9F6] dark:bg-[#252422] border border-[#E6E5E0] dark:border-[#2E2D2A] hover:border-[#D95D39] dark:hover:border-[#D95D39] hover:bg-white dark:hover:bg-[#1C1B19] text-[#51504B] dark:text-[#D2CFC9] hover:text-[#1C1C1A] dark:hover:text-[#F5F4F0] cursor-pointer transition-all"
                >
                  {sec.section.length > 20 ? `${sec.section.substring(0, 20)}...` : sec.section}
                </button>
              ))}
            </div>

            <h1 className="text-3xl font-black text-[#1C1C1A] dark:text-[#F5F4F0] tracking-tight transition-colors duration-300">{bootstrapData.title}</h1>
            <div className="w-full h-[1px] bg-[#E6E5E0] dark:bg-[#2E2D2A] transition-colors duration-300" />

            {bootstrapData.outline.map((section, sIdx) => (
              <div key={sIdx} id={`section-node-${sIdx}`} className="space-y-4 pt-4 border-t border-[#FAF9F6]/80 dark:border-[#2E2D2A]/80 first:border-none scroll-mt-6 transition-colors duration-300">
                <div className="flex items-center justify-between border-b border-[#FAF9F6] dark:border-[#2E2D2A] pb-2 transition-colors duration-300">
                  <h2 className="text-base font-extrabold text-[#1C1C1A] dark:text-[#F5F4F0] font-sans uppercase tracking-tight transition-colors duration-300">
                    {section.section}
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      const bulletsText = section.bullets.map(b => `• ${b}`).join('\n');
                      const writtenExpansion = expansionTexts[sIdx] ? `\n\n[Expansion]:\n${expansionTexts[sIdx]}` : '';
                      const fullSectionText = `${section.section}\nWriter helper: ${section.description}\n\nOutline points:\n${bulletsText}${writtenExpansion}`;
                      navigator.clipboard.writeText(fullSectionText);
                      setCopiedSectionIdx(sIdx);
                      setTimeout(() => setCopiedSectionIdx(null), 2000);
                    }}
                    className="text-[10px] font-sans font-bold text-[#D95D39] hover:text-[#C24E2D] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedSectionIdx === sIdx ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Section</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[#71706C] dark:text-[#A19F9A] italic text-xs mb-3 font-sans transition-colors duration-300">Writer prompt helper: {section.description}</p>
                
                <div className="space-y-2.5 pl-4 border-l-2 border-[#E6E5E0] dark:border-[#2E2D2A] text-xs leading-relaxed text-[#71706C] dark:text-[#A19F9A] font-sans transition-colors duration-300">
                  {section.bullets.map((b, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-[#A19F9A] dark:text-[#5E5D59] select-none font-bold">•</span>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>

                {section.expandMarker && (
                  <div className="bg-[#FAF9F6] dark:bg-[#252422] border border-[#E6E5E0] dark:border-[#2E2D2A] rounded-2xl p-5 space-y-3 shadow-sm font-sans transition-colors duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-[#D95D39] font-bold uppercase tracking-wider">
                        <Sparkles className="w-4 h-4 text-[#D95D39] animate-pulse" />
                        <span>Input required write node</span>
                      </div>
                      <span className="text-[9px] text-[#A19F9A] dark:text-[#71706C] select-none transition-colors duration-300">
                        {expansionTexts[sIdx]?.split(/\s+/).filter(Boolean).length || 0} words • {expansionTexts[sIdx]?.length || 0} chars
                      </span>
                    </div>
                    
                    <p className="text-xs text-[#71706C] dark:text-[#D2CFC9] leading-relaxed transition-colors duration-300">
                      {section.expandMarker.replace('[EXPAND THIS]', '').trim()}
                    </p>
                    
                    <textarea
                      placeholder="Compose your custom expansion section here... (type to progress)"
                      value={expansionTexts[sIdx] || ''}
                      onChange={(e) => {
                        setExpansionTexts(prev => ({ ...prev, [sIdx]: e.target.value }));
                        onTypeInWorkspace();
                      }}
                      className="w-full h-28 bg-white dark:bg-[#1C1B19] border border-[#E6E5E0] dark:border-[#2E2D2A] rounded-xl p-3.5 text-[#1C1C1A] dark:text-[#F5F4F0] placeholder-[#A19F9A] dark:placeholder-[#5E5D59] focus:outline-none focus:border-[#D95D39] text-xs leading-relaxed resize-none shadow-inner font-sans transition-colors duration-300"
                    />
                  </div>
                )}
              </div>
            ))}

            <div className="h-24" />
          </div>
        </div>

      </div>

      {/* Right Column: Tracking Panel & "I'm Stuck" Co-pilot */}
      <div className="lg:col-span-4 bg-[#FAF9F6] dark:bg-[#121211] border border-[#E6E5E0] dark:border-[#2E2D2A] rounded-[2rem] flex flex-col h-[500px] md:h-[600px] lg:h-full overflow-hidden ballpark-shadow font-sans transition-colors duration-300">
        
        {/* Countdown & Progress Stats */}
        <div className="bg-white dark:bg-[#1C1B19] p-6 border-b border-[#E6E5E0] dark:border-[#2E2D2A] space-y-4 transition-colors duration-300">
          <div className="flex items-center justify-between text-[10px] font-bold text-[#71706C] dark:text-[#A19F9A] transition-colors duration-300">
            <span className="uppercase tracking-widest text-[#D95D39] font-extrabold">Deadline Timer</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#A19F9A] dark:text-[#71706C]" />
              Time remaining
            </span>
          </div>

          <div className="text-4xl font-black text-[#1C1C1A] dark:text-[#F5F4F0] text-center tracking-wider transition-colors duration-300">
            {formatTime(timeRemainingSeconds)}
          </div>

          {/* Progress Tracker bar */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between text-[10px] font-bold text-[#71706C] dark:text-[#A19F9A] transition-colors duration-300">
              <span>ESTIMATED DRAFT COMPLETED</span>
              <span>{estimatedProgress}%</span>
            </div>
            
            <div className="w-full h-1.5 bg-[#FAF9F6] dark:bg-[#252422] rounded-full overflow-hidden border border-[#E6E5E0] dark:border-[#2E2D2A] transition-colors duration-300">
              <div 
                className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${estimatedProgress}%` }}
              />
            </div>
          </div>

          {(() => {
            const totalRequiredNodes = bootstrapData.outline.filter(s => !!s.expandMarker).length;
            const completedRequiredNodes = bootstrapData.outline.filter((s, sIdx) => !!s.expandMarker && !!expansionTexts[sIdx]?.trim()).length;
            
            return (
              <div className="flex flex-col gap-2 bg-[#FAF9F6] dark:bg-[#252422] border border-[#E6E5E0] dark:border-[#2E2D2A] rounded-2xl p-3 text-[10px] leading-relaxed text-[#71706C] dark:text-[#A19F9A] transition-colors duration-300">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Suggested focus:</strong> Overwrite prompt markers with draft expansions.
                  </span>
                </div>
                {totalRequiredNodes > 0 && (
                  <div className="mt-1 pt-2 border-t border-[#E6E5E0]/60 dark:border-[#2E2D2A]/60 flex items-center justify-between font-mono font-bold">
                    <span className="uppercase text-[9px] tracking-wider">Write Nodes:</span>
                    <span className={completedRequiredNodes === totalRequiredNodes ? "text-emerald-600 dark:text-emerald-400" : "text-[#D95D39]"}>
                      {completedRequiredNodes} / {totalRequiredNodes} Completed
                    </span>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Co-pilot Chat Container */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#FAF9F6] dark:bg-[#121211] transition-colors duration-300">
          
          <div className="px-4 py-2.5 bg-white dark:bg-[#1C1B19] border-b border-[#E6E5E0] dark:border-[#2E2D2A] flex items-center justify-between transition-colors duration-300">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1C1C1A] dark:text-[#F5F4F0] uppercase tracking-wider transition-colors duration-300">
              <MessageSquare className="w-4 h-4 text-[#D95D39]" />
              <span>Co-pilot Assistance</span>
            </div>
            <span className="text-[9px] font-bold text-[#71706C] dark:text-[#A19F9A] uppercase bg-[#FAF9F6] dark:bg-[#252422] px-2 py-0.5 rounded-full border border-[#E6E5E0] dark:border-[#2E2D2A] transition-colors duration-300">
              Context Aware
            </span>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-0 scrollbar-thin">
            {stuckChatHistory.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <HelpCircle className="w-8 h-8 text-[#A19F9A] dark:text-[#5E5D59] mx-auto animate-pulse transition-colors duration-300" />
                <h5 className="text-xs font-bold text-[#1C1C1A] dark:text-[#F5F4F0] transition-colors duration-300">Stuck on a slide or sentence?</h5>
                <p className="text-[10px] text-[#71706C] dark:text-[#A19F9A] max-w-[200px] mx-auto leading-relaxed transition-colors duration-300">
                  Our grounded co-pilot reads your context. Ask it to draft paragraphs, write stats, or suggest summaries!
                </p>
              </div>
            ) : (
              stuckChatHistory.map((m) => (
                <div 
                  key={m.id}
                  className={`flex flex-col max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed transition-all ${
                    m.role === 'user'
                      ? 'bg-[#1C1C1A] dark:bg-[#D95D39] text-white self-end rounded-tr-none shadow-sm'
                      : 'bg-white dark:bg-[#1C1B19] text-[#51504B] dark:text-[#D2CFC9] self-start rounded-tl-none border border-[#E6E5E0] dark:border-[#2E2D2A] shadow-sm'
                  }`}
                >
                  <span className={`text-[8px] uppercase font-bold block mb-1 ${m.role === 'user' ? 'text-[#FAF9F6]/80' : 'text-[#71706C] dark:text-[#A19F9A]'}`}>
                    {m.role === 'user' ? 'You' : 'Clutch AI'}
                  </span>
                  <div className="whitespace-pre-wrap font-sans">{m.text}</div>
                </div>
              ))
            )}
            
            {isChatLoading && (
              <div className="bg-white dark:bg-[#1C1B19] text-[#71706C] dark:text-[#A19F9A] self-start rounded-2xl rounded-tl-none border border-[#E6E5E0] dark:border-[#2E2D2A] p-3.5 text-xs flex items-center gap-1.5 shadow-sm font-sans transition-colors duration-300">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#D95D39]" />
                <span className="text-[10px]">Formulating response...</span>
              </div>
            )}
          </div>

          {/* Suggestion Pills */}
          <div className="px-3 py-1.5 bg-white dark:bg-[#1C1B19] border-t border-[#E6E5E0] dark:border-[#2E2D2A] flex flex-wrap gap-1 font-sans transition-colors duration-300">
            {[
              { label: '💡 Draft intro', text: 'Please draft a strong introductory paragraph for this section.' },
              { label: '📊 Stats/Facts', text: 'Provide some key, grounded statistics or industry facts related to this topic.' },
              { label: '📝 Summarize', text: 'Can you summarize these outline bullet points into a concise 3-sentence summary?' },
              { label: '🎯 Next steps', text: 'What is a specific, actionable next-step checklist to finalize this section?' }
            ].map((pill, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setChatMessage(pill.text)}
                className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-[#FAF9F6] dark:bg-[#252422] border border-[#E6E5E0] dark:border-[#2E2D2A] hover:border-[#D95D39] dark:hover:border-[#D95D39] text-[#71706C] dark:text-[#A19F9A] hover:text-[#1C1C1A] dark:hover:text-[#F5F4F0] cursor-pointer transition-colors"
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t border-[#E6E5E0] dark:border-[#2E2D2A] bg-white dark:bg-[#1C1B19] flex items-center gap-2 transition-colors duration-300">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything (e.g. 'Draft bullet points')..."
              className="flex-1 bg-[#FAF9F6] dark:bg-[#252422] border border-[#E6E5E0] dark:border-[#2E2D2A] rounded-xl px-3.5 py-2 text-xs text-[#1C1C1A] dark:text-[#F5F4F0] placeholder-[#A19F9A] dark:placeholder-[#5E5D59] focus:outline-none focus:border-[#D95D39] font-sans transition-colors duration-300"
            />
            <button
              onClick={onSendStuckMessage}
              disabled={!chatMessage.trim()}
              className="bg-[#D95D39] hover:bg-[#C24E2D] disabled:bg-[#ECE7E1] dark:disabled:bg-[#252422] disabled:text-[#A19F9A] dark:disabled:text-[#5E5D59] text-white p-2.5 rounded-xl transition-all cursor-pointer shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#E6E5E0] dark:border-[#2E2D2A] bg-white dark:bg-[#1C1B19] flex items-center gap-3 transition-colors duration-300">
          <button
            onClick={onAbort}
            className="flex-1 bg-[#FAF9F6] dark:bg-[#252422] hover:bg-[#FAF9F6]/50 dark:hover:bg-[#252422]/50 border border-[#E6E5E0] dark:border-[#2E2D2A] text-[#71706C] dark:text-[#A19F9A] hover:text-[#1C1C1A] dark:hover:text-[#F5F4F0] font-bold py-2.5 rounded-full text-xs transition-all cursor-pointer text-center"
          >
            Abort / Postpone
          </button>
          
          <button
            onClick={onMarkDone}
            className="flex-1 bg-[#1C1C1A] dark:bg-[#F5F4F0] hover:bg-[#32312E] dark:hover:bg-[#E2E1DD] text-white dark:text-[#121211] font-bold py-2.5 rounded-full text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Mark Task Done</span>
          </button>
        </div>

      </div>

    </motion.div>
  );
}
