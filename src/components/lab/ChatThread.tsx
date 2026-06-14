"use client";

import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { cn } from "@/lib/utils";
import { ToolResultRenderer } from "./cards/ToolResultRenderer";

export interface ToolResult {
  toolName: string;
  result: Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: number;
  toolResults?: ToolResult[];
}

interface ChatThreadProps {
  messages: ChatMessage[];
}

const MARKDOWN_COMPONENTS: Components = {
  // Paragraphs — don't double-wrap with extra margin
  p: ({ children }) => (
    <p className="text-sm text-white/85 leading-relaxed mb-1 last:mb-0">
      {children}
    </p>
  ),
  // Bold
  strong: ({ children }) => (
    <strong className="font-semibold text-white">{children}</strong>
  ),
  // Italic
  em: ({ children }) => <em className="italic text-violet-200">{children}</em>,
  // Headings
  h1: ({ children }) => (
    <h1 className="text-base font-semibold text-white mt-3 mb-1 first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-sm font-semibold text-violet-200 mt-2.5 mb-1 first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm font-medium text-violet-300/80 mt-2 mb-0.5 first:mt-0">
      {children}
    </h3>
  ),
  // Unordered list
  ul: ({ children }) => (
    <ul className="list-disc list-inside space-y-0.5 mt-1 mb-1 text-sm text-white/80">
      {children}
    </ul>
  ),
  // Ordered list
  ol: ({ children }) => (
    <ol className="list-decimal list-inside space-y-0.5 mt-1 mb-1 text-sm text-white/80">
      {children}
    </ol>
  ),
  // List item
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  // Inline code and fenced code blocks
  code: ({ children, className }) => {
    const isBlock = className?.startsWith("language-");
    if (isBlock) {
      return (
        <code className="block font-mono text-xs text-cyan-200 whitespace-pre-wrap break-words">
          {children}
        </code>
      );
    }
    return (
      <code className="font-mono text-xs text-cyan-300 bg-white/[0.08] px-1 py-0.5 rounded">
        {children}
      </code>
    );
  },
  // Fenced code block wrapper
  pre: ({ children }) => (
    <pre className="mt-2 mb-1 rounded-lg bg-black/40 border border-white/10 p-3 overflow-x-auto text-xs">
      {children}
    </pre>
  ),
  // GFM table
  table: ({ children }) => (
    <div className="overflow-x-auto mt-2 mb-1 rounded-lg border border-violet-500/20">
      <table className="w-full text-xs text-white/80 border-collapse">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-violet-950/50 text-violet-200 font-medium">
      {children}
    </thead>
  ),
  tbody: ({ children }) => (
    <tbody className="divide-y divide-white/[0.06]">{children}</tbody>
  ),
  tr: ({ children }) => <tr>{children}</tr>,
  th: ({ children }) => (
    <th className="px-3 py-1.5 text-left font-medium">{children}</th>
  ),
  td: ({ children }) => <td className="px-3 py-1.5">{children}</td>,
  // Horizontal rule
  hr: () => <hr className="my-2 border-white/10" />,
  // Blockquote
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-violet-500/40 pl-3 my-1 text-white/60 italic text-sm">
      {children}
    </blockquote>
  ),
  // Links — open in new tab, styled violet
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-violet-300 hover:text-violet-200 underline underline-offset-2 decoration-violet-500/40 hover:decoration-violet-300"
    >
      {children}
    </a>
  ),
};

export function ChatThread({ messages }: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 text-center">
        <p className="text-sm text-white/30 font-sans">
          No messages yet — say hi to Orby!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-3">
      {messages.map((msg) =>
        msg.role === "user" ? (
          <div
            key={msg.id}
            className={cn(
              "ml-auto max-w-[80%] rounded-xl px-3 py-2",
              "bg-white/[0.04] border border-violet-500/20",
              "backdrop-blur-sm",
              "text-sm text-white/85 leading-relaxed",
            )}
          >
            {msg.text}
          </div>
        ) : (
          <div key={msg.id} className="mr-auto max-w-[80%] flex flex-col gap-2">
            <div
              className={cn(
                "rounded-xl px-3 py-2",
                "bg-violet-950/40 border border-violet-500/15",
                "backdrop-blur-sm",
                "text-sm text-white/85 leading-relaxed",
              )}
            >
              {msg.text.length === 0 ? (
                <span className="animate-pulse text-white/40">...</span>
              ) : (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={MARKDOWN_COMPONENTS}
                >
                  {msg.text}
                </ReactMarkdown>
              )}
            </div>
            {msg.toolResults && msg.toolResults.length > 0 && (
              <div className="flex flex-col gap-2">
                {msg.toolResults.map((tr, idx) => (
                  <ToolResultRenderer
                    key={`${msg.id}-tool-${idx}`}
                    toolName={tr.toolName}
                    result={tr.result}
                  />
                ))}
              </div>
            )}
          </div>
        ),
      )}
      <div ref={bottomRef} aria-hidden="true" />
    </div>
  );
}
