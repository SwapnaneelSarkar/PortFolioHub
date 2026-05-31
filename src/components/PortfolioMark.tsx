import { Layers3 } from "lucide-react";

export function PortfolioMark() {
  return (
    <div className="flex items-center gap-2.5 text-slate-950 select-none">
      <span className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-violet-800 text-white shadow-md shadow-violet-500/30">
        <Layers3 size={17} strokeWidth={2.5} />
      </span>
      <span className="text-[17px] font-bold tracking-tight">
        Portfolio<span className="gradient-text">Hub</span>
      </span>
    </div>
  );
}
