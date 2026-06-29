import React from 'react';
import { motion } from 'motion/react';
import { Flame, Compass, Calendar, Mail, Sparkles, ShieldAlert } from 'lucide-react';

export default function FeaturesSection() {
  const highlights = [
    {
      icon: <Compass className="w-5 h-5 text-neutral-200" />,
      title: 'Context Parsing',
      description: 'Converts unstructured thoughts into precise scope parameters and deadlines.'
    },
    {
      icon: <ShieldAlert className="w-5 h-5 text-neutral-200" />,
      title: 'Strategy Formulation',
      description: 'Calculates project feasibility and recommends fight or negotiation strategies.'
    },
    {
      icon: <Calendar className="w-5 h-5 text-neutral-200" />,
      title: 'Calendar Clearance',
      description: 'Reschedules lower-priority meetings automatically to protect your focus blocks.'
    },
    {
      icon: <Mail className="w-5 h-5 text-neutral-200" />,
      title: 'Diplomatic Drafts',
      description: 'Generates professional delay notices and negotiation email templates in your drafts.'
    },
    {
      icon: <Sparkles className="w-5 h-5 text-neutral-200" />,
      title: 'Search Grounding',
      description: 'Performs live search queries to collect statistics, citations, and structural briefs.'
    },
    {
      icon: <Flame className="w-5 h-5 text-neutral-200" />,
      title: 'Interactive Co-Pilot',
      description: 'A distraction-free writing interface with inline suggestions and completions.'
    }
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
    <div className="space-y-12 select-none max-w-5xl mx-auto py-8 transition-colors duration-300">
      {/* Section Header */}
      <div className="space-y-2 border-b border-[#E6E5E0] dark:border-[#2E2D2A] pb-6 transition-colors duration-300">
        <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#D95D39]">
          Under the Hood
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#1C1C1A] dark:text-[#F5F4F0] transition-colors duration-300">
          Automating the non-writing parts of work.
        </h2>
        <p className="text-sm text-[#71706C] dark:text-[#A19F9A] max-w-2xl transition-colors duration-300">
          The reason projects fail is not because you cannot write or code. It is because calendar scheduling, stakeholders management, and blank-page friction devour your mental capacity. Clutch automates that noise.
        </p>
      </div>

      {/* Grid of details */}
      <div onMouseMove={handleMouseMove} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {highlights.map((item, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            transition={{ delay: idx * 0.05, duration: 0.4 }}
            className="space-y-3 bg-white dark:bg-[#1C1B19] border border-[#E6E5E0] dark:border-[#2E2D2A] p-6 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.01)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.15)] ballpark-shadow transition-colors duration-300 spotlight-card cursor-default"
          >
            <div className="bg-[#1C1C1A] dark:bg-[#252422] border border-[#2E2D2A] w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300">
              {item.icon}
            </div>
            <h4 className="text-sm font-bold text-[#1C1C1A] dark:text-[#F5F4F0] transition-colors duration-300">
              {item.title}
            </h4>
            <p className="text-xs text-[#71706C] dark:text-[#D2CFC9] leading-relaxed transition-colors duration-300">
              {item.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
