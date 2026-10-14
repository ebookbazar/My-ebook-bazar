import React from 'react';
import { 
  Calculator, 
  PiggyBank, 
  TrendingUp, 
  Tag, 
  Percent, 
  Store, 
  ArrowRight, 
  Sparkles 
} from 'lucide-react';
import { FreeToolConfig, ToolId } from '../types/freeTools';
import { DEFAULT_FREE_TOOLS } from '../data/defaultFreeTools';

interface HomeFreeToolsSectionProps {
  tools?: FreeToolConfig[];
  onOpenTool: (toolId: ToolId) => void;
  onOpenAllTools: () => void;
}

export const HomeFreeToolsSection: React.FC<HomeFreeToolsSectionProps> = ({
  tools = DEFAULT_FREE_TOOLS,
  onOpenTool,
  onOpenAllTools
}) => {
  const enabledTools = tools
    .filter(t => t.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 5);

  const renderIcon = (iconName: string) => {
    const iconClass = "w-4.5 h-4.5 text-amber-300";
    switch (iconName) {
      case 'PiggyBank': return <PiggyBank className={iconClass} />;
      case 'TrendingUp': return <TrendingUp className={iconClass} />;
      case 'Tag': return <Tag className={iconClass} />;
      case 'Percent': return <Percent className={iconClass} />;
      case 'Store': return <Store className={iconClass} />;
      default: return <Calculator className={iconClass} />;
    }
  };

  const getCardGridClasses = (idx: number) => {
    // Mobile: 1 card per row
    // Tablet (sm): 2 columns, 5th card spans 2 columns centered
    // Desktop (lg): 6 columns grid -> Row 1 has 3 cards (span 2 each), Row 2 has 2 cards (start at col 2, span 2 each)
    if (idx < 3) {
      return 'col-span-1 sm:col-span-1 lg:col-span-2';
    }
    if (idx === 3) {
      return 'col-span-1 sm:col-span-1 lg:col-start-2 lg:col-span-2';
    }
    // idx === 4 (5th card)
    return 'col-span-1 sm:col-span-2 sm:max-w-md sm:mx-auto sm:w-full lg:col-span-2 lg:max-w-none';
  };

  if (enabledTools.length === 0) return null;

  return (
    <section 
      id="free-tools-section"
      aria-label="ফ্রি Tools & Calculators" 
      className="bg-gradient-to-br from-[#042d19] via-[#022112] to-[#01140a] text-white rounded-3xl p-5 sm:p-6 md:p-8 shadow-xl border border-emerald-500/25 space-y-5 sm:space-y-6 relative overflow-hidden"
    >
      {/* Subtle brand glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 relative z-10">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[11px] font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>১০০% ফ্রি অনলাইন টুলস</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            <span>ফ্রি Tools & Calculators</span>
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 font-medium max-w-xl">
            দৈনন্দিন হিসাব ও ব্যবসার প্রয়োজনীয় টুলস—এক জায়গায়।
          </p>
        </div>

        <button
          onClick={onOpenAllTools}
          className="self-start sm:self-auto bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 shrink-0 active:scale-95 cursor-pointer"
        >
          <span>সব টুলস ব্যবহার করুন</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tools Cards Grid:
          - Mobile (<640px): 1 card per row
          - Tablet (sm): 2 columns adaptive layout
          - Desktop (lg): Exactly 3 cards in row 1, 2 cards centered in row 2
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4 relative z-10">
        {enabledTools.map((tool, idx) => (
          <div
            key={tool.id}
            onClick={() => onOpenTool(tool.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpenTool(tool.id);
              }
            }}
            className={`bg-[#063820]/75 hover:bg-[#084527]/90 backdrop-blur-sm rounded-2xl p-4 sm:p-4.5 border border-emerald-500/25 hover:border-amber-400/60 transition-all duration-200 flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5 shadow-sm hover:shadow-md ${getCardGridClasses(idx)}`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="w-8.5 h-8.5 rounded-xl bg-[#022112] text-amber-300 flex items-center justify-center shrink-0 border border-emerald-500/30 group-hover:scale-105 group-hover:bg-amber-400 group-hover:text-slate-950 transition-all">
                  {renderIcon(tool.icon)}
                </div>
                <span className="text-[10px] text-emerald-300 font-bold px-2 py-0.5 rounded-md bg-emerald-950/70 border border-emerald-500/20 shrink-0 truncate max-w-[140px]">
                  {tool.category}
                </span>
              </div>

              <div>
                <h3 className="text-sm sm:text-base font-black text-white group-hover:text-amber-300 transition-colors leading-snug line-clamp-1">
                  {tool.shortName}
                </h3>

                <p className="text-xs text-emerald-100/80 line-clamp-2 leading-relaxed font-medium mt-1">
                  {tool.description}
                </p>
              </div>
            </div>

            <div className="pt-2.5 mt-2.5 border-t border-emerald-500/20 flex items-center justify-between text-xs font-bold text-amber-300 group-hover:text-amber-200 transition-colors">
              <span>ব্যবহার করুন →</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
