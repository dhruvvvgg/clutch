import React from 'react';
import { motion } from 'motion/react';
import { Flame, Calendar, BookOpen, ChevronRight } from 'lucide-react';

interface ModesGridProps {
  onSelectMode: (mode: 'crisis' | 'plan' | 'review') => void;
  onEnterView: (view: any) => void;
  isStatic?: boolean;
}

export default function ModesGrid({
  onSelectMode,
  onEnterView,
  isStatic = false,
}: ModesGridProps) {
  
  const modes = [
    {
      id: 'crisis' as const,
      icon: <Flame className="w-6 h-6 text-neutral-200" />,
      title: 'Crisis Mode',
      subtitle: '“I have an urgent deadline coming up.”',
      description: 'Clear calendar clutter, generate diplomatic buffer emails, and scaffold work files in minutes.',
      buttonLabel: 'Initialize protocol',
      accentColor: '#D95D39',
      borderColor: 'hover:border-[#D95D39] dark:hover:border-[#E58F65]',
    },
    {
      id: 'plan' as const,
      icon: <Calendar className="w-6 h-6 text-neutral-200" />,
      title: 'Plan Mode',
      subtitle: '“I want to get organized and stay ahead.”',
      description: 'Map upcoming milestones, claim focus slots on your calendar, and outline documents early.',
      buttonLabel: 'Structure workspace',
      accentColor: '#1E1D2F',
      borderColor: 'hover:border-[#1E1D2F] dark:hover:border-[#A8A4FF]',
    },
    {
      id: 'review' as const,
      icon: <BookOpen className="w-6 h-6 text-neutral-200" />,
      title: 'Review Mode',
      subtitle: '“I want to reflect and improve my systems.”',
      description: 'Analyze why timelines slipped, isolate key friction points, and build lasting focus habits.',
      buttonLabel: 'Audit past cycle',
      accentColor: '#059669',
      borderColor: 'hover:border-emerald-600 dark:hover:border-emerald-400',
    },
  ];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const cards = e.currentTarget.getElementsByClassName('spotlight-card');
    for (const card of cards) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      (card as HTMLElement).style.setProperty('--mouse-x', `${x}px`);
      (card as HTMLElement).style.setProperty('--mouse-y', `${y}px`);
    }
  };

  return (
    <div className="space-y-12 select-none max-w-5xl mx-auto transition-colors duration-300">
      {/* Conversational Section Header - ballpark.ing style */}
      <div className="space-y-2 border-b border-[#E6E5E0] dark:border-[#2E2D2A] pb-6 transition-colors duration-300">
        <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#D95D39]">
          {isStatic ? 'Tailored Workflows' : 'Choose Your Pathway'}
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#1C1C1A] dark:text-[#F5F4F0] transition-colors duration-300">
          {isStatic ? 'Support for every phase of your work.' : 'Select a mode to get started.'}
        </h2>
        <p className="text-sm text-[#71706C] dark:text-[#A19F9A] max-w-2xl transition-colors duration-300">
          {isStatic 
            ? 'Clutch adapts to your schedule—whether you are dealing with a crunch, planning ahead, or auditing past cycles.' 
            : 'Choose the mode that fits your current timeline. We clear administrative friction so you can focus on making progress.'}
        </p>
      </div>

      {/* Modes Grid */}
      <div onMouseMove={handleMouseMove} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {modes.map((mode, idx) => (
          <motion.div
            key={mode.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={isStatic ? undefined : { y: -6, transition: { duration: 0.2 } }}
            transition={{ delay: idx * 0.1, duration: 0.5 }}
            onClick={isStatic ? undefined : () => {
              onSelectMode(mode.id);
              if (mode.id === 'review') {
                onEnterView('debrief');
              } else {
                onEnterView('intake');
              }
            }}
            className={`bg-white dark:bg-[#1C1B19] border border-[#E6E5E0] dark:border-[#2E2D2A] rounded-[2rem] p-6 sm:p-8 lg:p-10 flex flex-col justify-between h-full relative transition-colors duration-300 spotlight-card max-w-xl mx-auto w-full lg:max-w-none ${
              isStatic 
                ? 'cursor-default' 
                : `cursor-pointer group transition-all duration-300 ballpark-shadow hover:shadow-[0_12px_40px_rgba(0,0,0,0.03)] dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.2)] ${mode.borderColor}`
            }`}
          >
            <div className="space-y-6">
              {/* Header Icon Block */}
              <div className="flex items-center justify-between">
                <div className="bg-[#1C1C1A] dark:bg-[#252422] border border-[#2E2D2A] p-3.5 rounded-2xl transition-colors duration-300">
                  {mode.icon}
                </div>
                {!isStatic && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[#FAF9F6] dark:bg-[#252422] border border-[#E6E5E0] dark:border-[#2E2D2A] p-1.5 rounded-full">
                    <ChevronRight className="w-4 h-4 text-[#71706C] dark:text-[#A19F9A]" />
                  </div>
                )}
              </div>

              {/* Text Info */}
              <div className="space-y-3">
                <h3 className="text-2xl font-black tracking-tight text-[#1C1C1A] dark:text-[#F5F4F0] transition-colors duration-300">
                  {mode.title}
                </h3>
                
                <p className="text-xs font-semibold italic text-[#71706C] dark:text-[#A19F9A] transition-colors duration-300">
                  {mode.subtitle}
                </p>
                
                <p className="text-sm text-[#51504B] dark:text-[#D2CFC9] leading-relaxed font-normal transition-colors duration-300">
                  {mode.description}
                </p>
              </div>
            </div>

            {/* Action text - only visible if interactive */}
            {!isStatic && (
              <div className="pt-8 border-t border-[#FAF9F6] dark:border-[#252422] mt-8 flex items-center justify-between text-xs font-bold text-[#1C1C1A] dark:text-[#F5F4F0] transition-colors duration-300">
                <span>{mode.buttonLabel}</span>
                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
