"use client";
import type { EvidenceItem } from "@/lib/lab-data";

interface EvidenceCardProps {
  item: EvidenceItem;
}

export function EvidenceCard({ item }: EvidenceCardProps) {
  return (
    <div className="cosmic-card rounded-xl p-4">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium text-white/85">{item.title}</h4>
        {item.sectionLink && (
          <a
            href={item.sectionLink}
            className="shrink-0 text-[10px] text-violet-300/70 hover:text-violet-200 font-mono transition-colors"
          >
            {item.sectionLink} →
          </a>
        )}
      </div>
      <p className="mt-1 text-xs text-white/55 font-sans leading-relaxed">
        {item.description}
      </p>
      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {item.tags.map((tag) => (
            <span key={tag} className="orbit-chip text-[10px]">{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}
