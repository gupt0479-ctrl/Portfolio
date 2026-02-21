"use client";

import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-black/40 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="font-semibold text-white">Navigate</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a href="#projects" className="text-white/70 hover:text-white">
                  Projects
                </a>
              </li>
              <li>
                <a
                  href="#experience"
                  className="text-white/70 hover:text-white"
                >
                  Experience
                </a>
              </li>
              <li>
                <a href="#skills" className="text-white/70 hover:text-white">
                  Skills
                </a>
              </li>
              <li>
                <a href="#contact" className="text-white/70 hover:text-white">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white">Tools</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/studio" className="text-white/70 hover:text-white">
                  Studio (CMS)
                </Link>
              </li>
              <li>
                <a
                  href="https://sanity.io"
                  target="_blank"
                  rel="noreferrer"
                  className="text-white/70 hover:text-white"
                >
                  Sanity
                </a>
              </li>
              <li>
                <a
                  href="https://nextjs.org"
                  target="_blank"
                  rel="noreferrer"
                  className="text-white/70 hover:text-white"
                >
                  Next.js
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white">Connect</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-white/70 hover:text-white"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-white/70 hover:text-white"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@example.com"
                  className="text-white/70 hover:text-white"
                >
                  Email
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-white/10 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-white/60 sm:flex-row">
            <p>&copy; {currentYear} Anant Gupta. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="/privacy" className="hover:text-white">
                Privacy
              </a>
              <a href="/terms" className="hover:text-white">
                Terms
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
