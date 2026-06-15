/**
 * chat-sanitizer.ts
 *
 * Strips model-emitted pseudo-tool-call markup from raw text deltas.
 * Models that do not natively support structured function calls sometimes
 * emit tool directives as inline text. This sanitizer removes all known
 * patterns before the text reaches the user's chat bubble.
 *
 * Returns clean text plus any metadata extracted from the stripped patterns.
 */

export function sanitizeChatText(raw: string): {
  cleanText: string;
  orbyMessage: string | null;
  extractedSectionId: string | null;
} {
  let text = raw;
  let orbyMessage: string | null = null;
  let extractedSectionId: string | null = null;

  // 1. Extract <orbyMessage>...</orbyMessage> — capture inner text, remove tag
  text = text.replace(
    /<orbyMessage>([\s\S]*?)<\/orbyMessage>/gi,
    (_, msg: string) => {
      if (!orbyMessage) orbyMessage = msg.trim();
      return "";
    },
  );

  // 2. Strip <details>...</details> blocks (multi-line, case-insensitive)
  text = text.replace(/<details[\s\S]*?<\/details>/gi, "");

  // 3. Strip <lookupFact ... /> self-closing tags
  text = text.replace(/<lookupFact\b[^>]*\/>/gi, "");

  // 4. Strip <lookupFact ...>...</lookupFact> paired tags
  text = text.replace(/<lookupFact\b[^>]*>[\s\S]*?<\/lookupFact>/gi, "");

  // 5. Strip inline JSON tool call objects: { "tool": "..." ... }
  //    These can be multi-line. Match objects that start with the "tool" key.
  text = text.replace(/\{[\s\n]*"tool"\s*:\s*"[^"]*"[\s\S]*?\}/g, "");

  // 6. Strip Navigation: {...} lines; extract sectionId if present
  text = text.replace(
    /^Navigation:\s*(\{[^\n]*\})\s*$/gim,
    (_, jsonStr: string) => {
      if (!extractedSectionId) {
        try {
          const parsed = JSON.parse(jsonStr) as Record<string, unknown>;
          if (typeof parsed.sectionId === "string") {
            extractedSectionId = parsed.sectionId;
          }
        } catch {
          // ignore malformed JSON
        }
      }
      return "";
    },
  );

  // 7. Strip "Project details?:" lines and any trailing JSON block
  text = text.replace(/^Project\s+details?:[\s\S]*?(?=\n\n|\n[A-Z]|$)/gim, "");

  // 8. Clean up orphaned whitespace: collapse 3+ consecutive newlines to 2
  text = text.replace(/\n{3,}/g, "\n\n").trim();

  return { cleanText: text, orbyMessage, extractedSectionId };
}
