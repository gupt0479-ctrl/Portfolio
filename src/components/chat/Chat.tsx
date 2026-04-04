"use client";

import { ChatKit, useChatKit } from "@openai/chatkit-react";
import type { CSSProperties } from "react";
import { createSession } from "@/app/actions/create-session";
import type { CHAT_PROFILE_QUERYResult } from "@/sanity/types";
import { useSidebar } from "../ui/sidebar";

export function Chat({
  profile,
}: {
  profile: CHAT_PROFILE_QUERYResult | null;
}) {
  const { toggleSidebar } = useSidebar();
  const chatTitle = `Chat with ${profile?.firstName || "Me"}`;

  const getGreeting = () => {
    if (!profile?.firstName) {
      return "Hi there! Ask me anything about my work, experience, or projects.";
    }
    const fullName = [profile.firstName, profile.lastName]
      .filter(Boolean)
      .join(" ");
    return `Hi! I'm ${fullName}. Ask me anything about my work, experience, or projects.`;
  };

  const { control } = useChatKit({
    api: {
      getClientSecret: async (_existingSecret) => {
        return createSession();
      },
    },
    frameTitle: chatTitle,
    /*
      Dark theme colours aligned with the portfolio palette.
      The surface is slightly lighter than the page background so the
      composer feels integrated while still reading as an interactive area.
    */
    theme: {
      colorScheme: "dark",
      radius: "round",
      color: {
        grayscale: {
          hue: 248,
          tint: 8,
          shade: -2,
        },
        accent: {
          primary: "#8f7cf7",
          level: 2,
        },
        surface: {
          background: "#10101a",
          foreground: "rgba(255,255,255,0.88)",
        },
      },
    },
    header: {
      title: {
        text: chatTitle,
      },
      leftAction: {
        icon: "close",
        onClick: () => {
          toggleSidebar();
        },
      },
    },
    startScreen: {
      greeting: getGreeting(),
      prompts: [
        {
          icon: "suitcase",
          label: "What's your experience?",
          prompt:
            "Tell me about your professional experience and previous roles",
        },
        {
          icon: "square-code",
          label: "What skills do you have?",
          prompt:
            "What technologies and programming languages do you specialize in?",
        },
        {
          icon: "cube",
          label: "What have you built?",
          prompt: "Show me some of your most interesting projects",
        },
        {
          icon: "profile",
          label: "Who are you?",
          prompt: "Tell me more about yourself and your background",
        },
      ],
    },
    composer: {
      placeholder: "Ask about projects, experience, or skills...",
      models: [
        { id: "crisp", label: "Crisp", description: "Concise and factual" },
        { id: "clear", label: "Clear", description: "Focused and helpful" },
        {
          id: "chatty",
          label: "Chatty",
          description: "Conversational companion",
          default: true,
        },
      ],
    },
    disclaimer: {
      text: "This is an AI-powered twin. Responses may not be 100% accurate.",
    },
  });

  return (
    <div className="chatkit-shell h-full w-full">
      <ChatKit
        control={control}
        className="chatkit-root h-full w-full"
        style={
          {
            "--ck-border-radius": "28px",
            "--ck-surface-background": "#10101a",
            "--ck-composer-background": "#141421",
            "--ck-composer-foreground": "rgba(255,255,255,0.92)",
            "--ck-input-background": "#141421",
            "--ck-input-foreground": "rgba(255,255,255,0.92)",
            "--ck-send-button-background": "#191927",
            "--ck-send-button-foreground": "#f5f2ff",
            "--ck-accent-color": "#8f7cf7",
          } as CSSProperties
        }
      />
    </div>
  );
}

export default Chat;
