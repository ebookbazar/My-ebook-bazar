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
    .sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return a.sortOrder - b.sortOrder;
    });

  const renderIcon = (iconName: string, className = "w-5 h-5") => {
    switch (iconName) {
      case 'PiggyBank': return <PiggyBank className={className} />;
      case 'TrendingUp': return <TrendingUp className={className} />;
      case 'Tag': return <Tag className={className} />;
      case 'Percent': return <Percent className={className} />;
      case 'Store': return <Store className={className} />;
      default: return <Calculator className={className} />;
    }
  };

  if (enabledTools.length === 0) return null;

  return (
    <section className="bg-gradient-to-br from-emerald-900/90 via-[#064e3b] to-slate-950 text-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-lg border border-emerald-500/30 space-y-6 relative overflow-hidden">
      {/* Background soft glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>১০০% ফ্রি অনলাইন টুলস ও ক্যালকুলেটর</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white">
            স্মার্ট ফিন্যান্স ও বিজনেস <span className="text-amber-300">ক্যালকুলেটর</span>
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl">
            লগইন ছাড়াই ব্যবহার করুন আপনার আয়-ব্যয় সঞ্চয়, পণ্যের লাভ-মার্জিন, ডিসকাউন্ট ও শতকরার দ্রুত হিসাব।
          </p>
        </div>

        <button
          onClick={onOpenAllTools}
          className="self-start sm:self-auto bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm px-4 py-2.5 rounded-xl transition shadow-md flex items-center gap-2 group shrink-0 active:scale-95"
        >
          <span>সব টুলস ব্যবহার করুন</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Tools Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 relative z-10">
        {enabledTools.slice(0, 5).map((tool) => (
          <div
            key={tool.id}
            onClick={() => onOpenTool(tool.id)}
            className="bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-emerald-400/20 hover:border-amber-400/50 transition-all duration-300 flex flex-col justify-between cursor-pointer group hover:-translate-y-1 shadow-xs"
          >
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/80 text-amber-300 flex items-center justify-center font-black group-hover:scale-110 group-hover:bg-amber-400 group-hover:text-slate-950 transition-all shadow-xs">
                {renderIcon(tool.icon, "w-5 h-5")}
              </div>

              <div>
                <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider block">
                  {tool.category}
                </span>
                <h3 className="text-sm font-black text-white group-hover:text-amber-300 transition">
                  {tool.shortName}
                </h3>
              </div>

              <p className="text-[11px] text-emerald-100/80 line-clamp-2 leading-relaxed">
                {tool.description}
              </p>
            </div>

            <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-black text-amber-300 group-hover:text-white transition">
              <span>হিসাব করুন</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
