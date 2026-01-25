"use client";

import { useState } from "react";

export function DisableDraftMode() {
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        try {
          setBusy(true);
          await fetch("/api/draft-mode/disable", { method: "POST" });
          window.location.reload();
        } finally {
          setBusy(false);
        }
      }}
      className="fixed bottom-4 right-4 z-50 rounded-md border border-white/10 bg-black/60 px-3 py-2 text-xs text-white/80 backdrop-blur hover:bg-black/80 disabled:opacity-60"
    >
      {busy ? "Exiting…" : "Exit draft"}
    </button>
  );
}
