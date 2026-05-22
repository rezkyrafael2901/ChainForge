'use client';

interface ProjectCardProps {
  icon: string;
  name: string;
  description: string;
  type: string;
  chain: string;
  features?: string[];
  index?: number;
}

export default function ProjectCard({
  icon,
  name,
  description,
  type,
  chain,
  features = [],
  index = 0,
}: ProjectCardProps) {
  return (
    <div
      className="glass glass-hover p-5 animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500/20 to-indigo-500/20 flex items-center justify-center text-xl shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm truncate">{name}</h3>
          <p className="text-gray-400 text-xs mt-1 line-clamp-2">{description}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4">
        <span className="text-[10px] px-2 py-1 rounded-full bg-brand-500/10 text-brand-300 font-medium uppercase tracking-wide">
          {type}
        </span>
        <span className="text-[10px] px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-300 font-medium uppercase tracking-wide">
          {chain}
        </span>
      </div>

      {features.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {features.map((f) => (
            <span
              key={f}
              className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.03] text-gray-500 border border-white/[0.06]"
            >
              {f}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
