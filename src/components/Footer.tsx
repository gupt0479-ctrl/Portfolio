"use client";

import { useEffect, useRef } from "react";
import { Github, Linkedin, Twitter } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-fade-in-up");
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <footer
      ref={containerRef}
      className="w-full py-12 px-6 lg:px-8 border-t border-white/10"
    >
      <div className="mx-auto max-w-6xl">
        {/* Single rounded contact card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-12">
          <h3 className="text-xl font-semibold text-white mb-6">
            Let&apos;s Work Together
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Email */}
            <div>
              <p className="text-sm text-white/60 mb-2">Email</p>
              <a
                href="mailto:anant@example.com"
                className="text-white hover:text-violet-400 transition-colors break-all"
              >
                anant@example.com
              </a>
            </div>

            {/* Social Links */}
            <div>
              <p className="text-sm text-white/60 mb-2">Connect</p>
              <div className="flex gap-3">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub"
                  className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 hover:border-white/40 text-white/70 hover:text-white transition-colors"
                >
                  <Github size={18} />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 hover:border-white/40 text-white/70 hover:text-white transition-colors"
                >
                  <Linkedin size={18} />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Twitter / X"
                  className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 hover:border-white/40 text-white/70 hover:text-white transition-colors"
                >
                  <Twitter size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Simple copyright */}
        <div className="text-center text-sm text-white/50">
          <p>© {currentYear} Anant Gupta. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
