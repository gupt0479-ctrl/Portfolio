"use client";

import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { ChatInputBar } from "./ChatInputBar";
import type { ChatMessage, ToolResult } from "./ChatThread";
import { ChatThread } from "./ChatThread";
import { PanelOrby } from "./PanelOrby";
import type { Persona } from "./PersonaSelector";
import { PersonaSelector } from "./PersonaSelector";
import { PowerPromptBlock } from "./PowerPromptBlock";
import { SuggestedChips } from "./SuggestedChips";

type PanelOrbyState = "idle" | "thinking" | "responding";

function generateId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Date.now().toString(36);
}

export function PortfolioLab() {
  const { toggleSidebar } = useSidebar();
  const [persona, setPersona] = useState<Persona>("recruiter");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [panelOrbyState, setPanelOrbyState] = useState<PanelOrbyState>("idle");
  const [chatStarted, setChatStarted] = useState(false);
  const [orbyWaving, setOrbyWaving] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const [perPersonaMessages, setPerPersonaMessages] = useState<
    Record<Persona, ChatMessage[]>
  >({ friend: [], recruiter: [], ceo: [], weirdo: [] });
  const abortRef = useRef<AbortController | null>(null);
  const navFiredRef = useRef(false);

  // Escape key closes the lab panel
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") toggleSidebar();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleSidebar]);

  // Abort any in-flight request on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const handlePersonaChange = useCallback(
    (newPersona: Persona) => {
      if (newPersona === persona) return;
      abortRef.current?.abort();
      // Save current messages only if a chat was already underway
      if (chatStarted) {
        setPerPersonaMessages((prev) => ({ ...prev, [persona]: messages }));
      }
      const existing = perPersonaMessages[newPersona];
      setMessages(existing);
      setChatStarted(existing.length > 0);
      setOrbyWaving(false);
      setPanelOrbyState("idle");
      setPersona(newPersona);
    },
    [chatStarted, persona, messages, perPersonaMessages],
  );

  const handleCopied = useCallback(() => {
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2000);
  }, []);

  const handleSubmit = useCallback(
    async (text: string) => {
      navFiredRef.current = false;
      if (!text.trim()) return;

      // Abort any ongoing request
      abortRef.current?.abort();

      // Add user message
      const userMessage: ChatMessage = {
        id: generateId(),
        role: "user",
        text,
        timestamp: Date.now(),
      };

      // Add empty assistant placeholder
      const assistantId = generateId();
      const assistantPlaceholder: ChatMessage = {
        id: assistantId,
        role: "assistant",
        text: "",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);
      setPanelOrbyState("thinking");

      // Trigger wave on the very first message for this persona
      if (!chatStarted) {
        setOrbyWaving(true);
        // chatStarted=true fires via PanelOrby onWaveComplete after 1500ms
      }

      // Build conversation history for the API (text only — strip toolResults)
      const conversationHistory = messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.text,
      }));

      const ctrl = new AbortController();
      abortRef.current = ctrl;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...conversationHistory, { role: "user", content: text }],
            persona,
          }),
          signal: ctrl.signal,
        });

        if (!res.ok) {
          setPanelOrbyState("idle");
          setMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            updated[lastIdx] = {
              ...updated[lastIdx],
              text: "Couldn't reach Orby — try again?",
            };
            return updated;
          });
          return;
        }

        setPanelOrbyState("responding");

        if (!res.body) {
          setPanelOrbyState("idle");
          return;
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let assistantText = "";
        const toolResults: ToolResult[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          // Process complete lines
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (line.startsWith("0:")) {
              try {
                assistantText += JSON.parse(line.slice(2));
              } catch {
                // ignore malformed text fragment
              }
            } else if (line.startsWith("a:")) {
              try {
                const parsed = JSON.parse(line.slice(2)) as {
                  toolCallId: string;
                  toolName: string;
                  result: Record<string, unknown>;
                };
                toolResults.push({
                  toolName: parsed.toolName,
                  result: parsed.result,
                });
                // navigate side-effect
                if (
                  parsed.toolName === "navigate" &&
                  parsed.result?.ok === true &&
                  typeof parsed.result.sectionId === "string"
                ) {
                  const el = document.getElementById(parsed.result.sectionId);
                  el?.scrollIntoView({ behavior: "smooth", block: "start" });
                  // Dispatch chat-driven nav to Orby — first navigate per turn only
                  if (!navFiredRef.current) {
                    navFiredRef.current = true;
                    window.dispatchEvent(
                      new CustomEvent("orby:navigate", {
                        detail: {
                          sectionId: parsed.result.sectionId as string,
                          orbyMessage:
                            typeof parsed.result.orbyMessage === "string"
                              ? parsed.result.orbyMessage
                              : null,
                          itemSlug:
                            typeof parsed.result.itemSlug === "string"
                              ? parsed.result.itemSlug
                              : null,
                          itemIndex:
                            typeof parsed.result.itemIndex === "number"
                              ? parsed.result.itemIndex
                              : null,
                        },
                      }),
                    );
                  }
                }
              } catch {
                // ignore malformed tool result
              }
            } else if (line.startsWith("t:")) {
              // Final clean text replacement — replace everything accumulated so far
              try {
                assistantText = JSON.parse(line.slice(2)) as string;
              } catch {
                // ignore malformed
              }
            } else if (line.startsWith("m:")) {
              // orbyMessage extracted from leaked <orbyMessage> tags
              try {
                const msg = JSON.parse(line.slice(2)) as string;
                window.dispatchEvent(
                  new CustomEvent("orby:speech", { detail: { text: msg } }),
                );
              } catch {
                // ignore malformed
              }
            }
            // d: (finish) and e: (error) handled implicitly — stream ends naturally
          }

          setMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            updated[lastIdx] = {
              ...updated[lastIdx],
              text: assistantText,
              toolResults: [...toolResults],
            };
            return updated;
          });
        }

        setPanelOrbyState("idle");
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setPanelOrbyState("idle");
        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          updated[lastIdx] = {
            ...updated[lastIdx],
            text: "Couldn't reach Orby — try again?",
          };
          return updated;
        });
      }
    },
    [messages, persona, chatStarted],
  );

  const currentAssistantText =
    messages.length > 0 && messages[messages.length - 1].role === "assistant"
      ? messages[messages.length - 1].text
      : "";

  return (
    <div className="flex flex-col h-full">
      {/* Header with close button */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/[0.06]">
        <div>
          <p className="section-kicker mb-0.5">{"// portfolio lab"}</p>
          <p className="text-xs text-white/40 font-sans">
            Explore the portfolio through different lenses.
          </p>
        </div>
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Close Portfolio Lab"
          className="float-btn flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/40 hover:text-white/80 transition-colors shrink-0"
        >
          <X className="size-3.5" />
        </button>
      </div>

      {/* Persona selector — always visible */}
      <PersonaSelector active={persona} onChange={handlePersonaChange} />

      {chatStarted ? (
        /* ── In-chat layout: personas + messages + input ── */
        <>
          <ChatThread messages={messages} />
          <div className="px-4 pb-4 pt-2">
            <ChatInputBar
              onSubmit={handleSubmit}
              onPersonaDetected={handlePersonaChange}
            />
          </div>
        </>
      ) : (
        /* ── Pre-chat layout: chips + Orby + power prompt + input ── */
        <>
          <SuggestedChips persona={persona} onSend={handleSubmit} />

          <PanelOrby
            state={panelOrbyState}
            responseText={currentAssistantText}
            isWaving={orbyWaving}
            onWaveComplete={() => {
              setOrbyWaving(false);
              setChatStarted(true);
            }}
            copyConfirmation={promptCopied}
          />

          {/* Spacer pushes power prompt + input to bottom */}
          <div className="flex-1" />

          {(persona === "recruiter" || persona === "ceo") && (
            <PowerPromptBlock persona={persona} onCopied={handleCopied} />
          )}

          <div className="px-4 pb-4 pt-2">
            <ChatInputBar
              onSubmit={handleSubmit}
              onPersonaDetected={handlePersonaChange}
            />
          </div>
        </>
      )}
    </div>
  );
}
