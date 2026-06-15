"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface OrbyArrowProps {
  orbyPosition: { x: number; y: number };
  visible: boolean;
  sidebarOpen?: boolean;
  isMobile?: boolean;
}

export function OrbyArrow({
  orbyPosition,
  visible,
  sidebarOpen = false,
  isMobile = false,
}: OrbyArrowProps) {
  const [angle, setAngle] = useState(0);

  useEffect(() => {
    const updateAngle = () => {
      // Target the button's left edge (nearest perimeter to Orby) instead of center.
      // Button is 56×56 at bottom-8 right-8: left edge = vw - 32 (right) - 56 (width) = vw - 88.
      // When sidebar is open on desktop, button shifts left by sidebar-width (25rem = 400px).
      const sidebarOffset = sidebarOpen && !isMobile ? 400 : 0;

      const labButtonEdge = {
        x: window.innerWidth - 88 - sidebarOffset, // left edge of button
        y: window.innerHeight - 60, // vertical center of button
      };

      const dx = labButtonEdge.x - orbyPosition.x;
      const dy = labButtonEdge.y - orbyPosition.y;
      setAngle(Math.atan2(dy, dx) * (180 / Math.PI));
    };

    updateAngle();

    window.addEventListener("resize", updateAngle);
    return () => window.removeEventListener("resize", updateAngle);
  }, [orbyPosition.x, orbyPosition.y, sidebarOpen, isMobile]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className={cn("pointer-events-none", "hidden md:block")}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          <div
            style={{
              width: 56,
              height: 2,
              background:
                "linear-gradient(90deg, transparent 0%, rgba(139, 92, 246, 0.35) 30%, rgba(167, 139, 250, 0.85) 100%)",
              transformOrigin: "left center",
              transform: `rotate(${angle}deg)`,
              position: "relative",
              boxShadow: "0 0 6px rgba(139, 92, 246, 0.4)",
            }}
          >
            {/* Arrowhead */}
            <div
              style={{
                position: "absolute",
                right: -12,
                top: -6,
                width: 0,
                height: 0,
                borderLeft: "13px solid rgba(167, 139, 250, 0.92)",
                borderTop: "7px solid transparent",
                borderBottom: "7px solid transparent",
                filter: "drop-shadow(0 0 6px rgba(139, 92, 246, 0.8))",
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
