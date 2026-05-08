"use client";

import { CometCard } from "@/components/ui/comet-card";
import type { Education } from "@/sanity/types";

export function EducationEntry({ edu }: { edu: Education }) {
  return (
    <CometCard rotateDepth={9} translateDepth={11}>
      <div className="relative overflow-hidden rounded-xl border border-white/10 cosmic-card p-6 backdrop-blur-sm">
        <div className="relative z-10">
          <div className="flex items-start justify-between flex-wrap gap-2 mb-1">
            <h3 className="text-lg font-display font-semibold text-white">
              {edu.degree}
            </h3>
            <span className="text-xs text-white/50 font-sans whitespace-nowrap">
              {edu.startDate ? new Date(edu.startDate).getFullYear() : ""} —{" "}
              {edu.current
                ? "Present"
                : edu.endDate
                  ? new Date(edu.endDate).getFullYear()
                  : ""}
            </span>
          </div>

          {edu.fieldOfStudy && (
            <p className="text-white/60 text-sm font-sans mb-3">
              in {edu.fieldOfStudy}
            </p>
          )}

          <p className="text-white/50 font-sans text-sm mb-4">
            {edu.institution}
          </p>

          {edu.description && (
            <p className="text-white/65 text-sm font-sans leading-relaxed mb-4">
              {edu.description}
            </p>
          )}

          {edu.gpa && (
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/[0.06] border border-white/15 text-xs font-semibold text-white/80 font-sans">
              GPA: {edu.gpa}
            </div>
          )}
        </div>
      </div>
    </CometCard>
  );
}
