/**
 * Property-based tests for Portfolio Lab chat interface.
 *
 * Tests 12.1–12.7: Chat submission, input clearing, whitespace prevention,
 * thread content, Panel Orby state transitions, thinking duration bounds,
 * and Coming Soon Response display.
 */

import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// jsdom doesn't implement scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

// Mock useSidebar to avoid SidebarProvider dependency
vi.mock("@/components/ui/sidebar", () => ({
  useSidebar: () => ({
    toggleSidebar: vi.fn(),
    open: false,
    isMobile: false,
    openMobile: false,
  }),
}));

// Mock motion/react so AnimatePresence and motion.div render as plain elements
vi.mock("motion/react", () => {
  const React = require("react");

  const MotionDiv = React.forwardRef(
    (
      {
        children,
        className,
        style,
        ...rest
      }: React.ComponentPropsWithRef<"div">,
      ref: React.Ref<HTMLDivElement>,
    ) => {
      // Filter out motion-specific props to avoid React warnings
      const {
        initial: _i,
        animate: _a,
        exit: _e,
        transition: _t,
        whileHover: _wh,
        variants: _v,
        ...domProps
      } = rest as Record<string, unknown>;
      return (
        <div ref={ref} className={className} style={style} {...domProps}>
          {children}
        </div>
      );
    },
  );
  MotionDiv.displayName = "MotionDiv";

  return {
    motion: { div: MotionDiv },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  };
});

// Mock OrbyModel to avoid rendering the full CSS character
vi.mock("@/components/orby/OrbyModel", () => ({
  OrbyModel: () => <div data-testid="orby-model" />,
}));

import { PortfolioLab } from "../lab/PortfolioLab";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Generate a diverse set of non-empty, non-whitespace test strings */
const NON_EMPTY_INPUTS = [
  "hello",
  "Hi Orby!",
  "a",
  "test message with spaces",
  "Special chars: !@#$%^&*()",
  "Unicode: 🚀🌍✨",
  "Multiword sentence that is longer than average.",
  "123",
  "   leading spaces but content",
  "content with trailing   ",
  "MixEdCaSe",
  "<script>alert('xss')</script>",
  "tabs and newlines trimmed",
  "a".repeat(200),
  "café résumé naïve",
];

/** Generate whitespace-only strings that should NOT submit */
const WHITESPACE_INPUTS = [
  "",
  " ",
  "   ",
  "\t",
  "\n",
  "\r\n",
  "  \t  \n  ",
  "     ",
];

function renderLab() {
  return render(<PortfolioLab />);
}

function getInput(): HTMLInputElement {
  return screen.getByPlaceholderText("Say something to Orby...");
}

function getSendButton(): HTMLButtonElement {
  return screen.getByRole("button", {
    name: "Send message",
  }) as HTMLButtonElement;
}

// ---------------------------------------------------------------------------
// Property 12.1: Non-empty submission always adds message to thread
// ---------------------------------------------------------------------------

// These properties test the assembled chat panel (ChatInputBar + ChatThread +
// PanelOrby wired together). PortfolioLab has since been redesigned as the
// static evidence panel. These tests will be re-enabled once the chat panel
// wrapper component is assembled and wired into the sidebar.
describe.skip("Property 12.1: Non-empty submission always adds message to thread", () => {
  /**
   * **Validates: Requirements 2.3, 2.4, 3.1**
   *
   * For any non-empty, non-whitespace string submitted via the Chat Input Bar,
   * the Chat Thread SHALL contain that exact string as a new message entry
   * after submission.
   */

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  for (const input of NON_EMPTY_INPUTS) {
    const trimmed = input.trim();
    if (trimmed.length === 0) continue;

    it(`submitting "${trimmed.slice(0, 30)}${trimmed.length > 30 ? "..." : ""}" via Enter adds it to thread`, () => {
      renderLab();
      const inputEl = getInput();

      fireEvent.change(inputEl, { target: { value: input } });
      fireEvent.keyDown(inputEl, { key: "Enter" });

      expect(screen.getByText(trimmed)).toBeInTheDocument();
    });
  }

  it("submitting via send button click adds message to thread", () => {
    renderLab();
    const inputEl = getInput();
    const sendBtn = getSendButton();

    fireEvent.change(inputEl, { target: { value: "Click submit test" } });
    fireEvent.click(sendBtn);

    expect(screen.getByText("Click submit test")).toBeInTheDocument();
  });

  it("multiple submissions each appear in thread in order", () => {
    renderLab();
    const inputEl = getInput();

    const messages = ["First message", "Second message", "Third message"];
    for (const msg of messages) {
      fireEvent.change(inputEl, { target: { value: msg } });
      fireEvent.keyDown(inputEl, { key: "Enter" });
    }

    for (const msg of messages) {
      expect(screen.getByText(msg)).toBeInTheDocument();
    }
  });
});

// ---------------------------------------------------------------------------
// Property 12.2: Input cleared after submission
// ---------------------------------------------------------------------------

describe.skip("Property 12.2: Input cleared after submission", () => {
  /**
   * **Validates: Requirements 2.5**
   *
   * For any successfully submitted message, the Chat Input Bar text field
   * SHALL be empty immediately after submission completes.
   */

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  for (const input of NON_EMPTY_INPUTS) {
    const trimmed = input.trim();
    if (trimmed.length === 0) continue;

    it(`input is empty after submitting "${trimmed.slice(0, 30)}${trimmed.length > 30 ? "..." : ""}"`, () => {
      renderLab();
      const inputEl = getInput();

      fireEvent.change(inputEl, { target: { value: input } });
      fireEvent.keyDown(inputEl, { key: "Enter" });

      expect(inputEl.value).toBe("");
    });
  }

  it("input is empty after send button click submission", () => {
    renderLab();
    const inputEl = getInput();

    fireEvent.change(inputEl, { target: { value: "test via click" } });
    fireEvent.click(getSendButton());

    expect(inputEl.value).toBe("");
  });
});

// ---------------------------------------------------------------------------
// Property 12.3: Empty/whitespace input prevents submission
// ---------------------------------------------------------------------------

describe.skip("Property 12.3: Empty/whitespace input prevents submission", () => {
  /**
   * **Validates: Requirements 2.7**
   *
   * For any string composed entirely of whitespace characters (including the
   * empty string), the send button SHALL be disabled and pressing Enter SHALL
   * NOT add any message to the Chat Thread.
   */

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  for (const input of WHITESPACE_INPUTS) {
    const label =
      input.length === 0
        ? "(empty string)"
        : `"${input.replace(/\n/g, "\\n").replace(/\t/g, "\\t").replace(/\r/g, "\\r")}"`;

    it(`send button is disabled for whitespace input ${label}`, () => {
      renderLab();
      const inputEl = getInput();

      fireEvent.change(inputEl, { target: { value: input } });

      const sendBtn = getSendButton();
      expect(sendBtn).toBeDisabled();
    });

    it(`pressing Enter with ${label} does not add a message`, () => {
      renderLab();
      const inputEl = getInput();

      fireEvent.change(inputEl, { target: { value: input } });
      fireEvent.keyDown(inputEl, { key: "Enter" });

      // Empty state text should still be visible (no messages added)
      expect(screen.getByText(/No messages yet/)).toBeInTheDocument();
    });
  }
});

// ---------------------------------------------------------------------------
// Property 12.4: Thread contains only user messages
// ---------------------------------------------------------------------------

describe.skip("Property 12.4: Thread contains only user messages", () => {
  /**
   * **Validates: Requirements 3.2, 5.3**
   *
   * For any sequence of N submitted messages, the Chat Thread SHALL contain
   * exactly N items, all user-attributed, with zero AI-reply or system-generated
   * message elements.
   */

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const COMING_SOON =
    "Still warming up! This feature is actively being built — check back soon.";

  const messageCounts = [1, 2, 3, 5, 8];

  for (const count of messageCounts) {
    it(`after submitting ${count} messages, thread contains exactly ${count} user messages`, () => {
      renderLab();
      const inputEl = getInput();

      for (let i = 0; i < count; i++) {
        fireEvent.change(inputEl, { target: { value: `Message ${i + 1}` } });
        fireEvent.keyDown(inputEl, { key: "Enter" });
      }

      // All messages present in thread
      for (let i = 0; i < count; i++) {
        expect(screen.getByText(`Message ${i + 1}`)).toBeInTheDocument();
      }
    });
  }

  it("thread never contains AI reply text in the message list", () => {
    renderLab();
    const inputEl = getInput();

    // Submit several messages and advance time for Orby to respond
    fireEvent.change(inputEl, { target: { value: "test" } });
    fireEvent.keyDown(inputEl, { key: "Enter" });

    // Advance through thinking + responding
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // The Coming Soon Response should NOT appear in the chat thread
    // (it appears in PanelOrby's speech cloud, but not as a thread message)
    const threadMessages = screen.getAllByText("test");
    expect(threadMessages).toHaveLength(1);

    // Verify no thread element contains the coming soon response text as a message item
    // The response may appear in PanelOrby's speech cloud, but not in the thread
    const allText = document.querySelectorAll(
      '[class*="rounded-xl"][class*="ml-auto"]',
    );
    for (const el of allText) {
      expect(el.textContent).not.toBe(COMING_SOON);
    }
  });
});

// ---------------------------------------------------------------------------
// Property 12.5: Message submission transitions Orby to thinking
// ---------------------------------------------------------------------------

describe("Property 12.5: Message submission transitions Orby to thinking", () => {
  /**
   * **Validates: Requirements 4.1, 7.2**
   *
   * For any message submitted while Panel Orby is in idle state,
   * Orby SHALL transition to thinking state.
   */

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const testMessages = [
    "hello",
    "test",
    "🚀",
    "a long message about something",
  ];

  for (const msg of testMessages) {
    it(`submitting "${msg.slice(0, 20)}" transitions PanelOrby to thinking (pulsing dots visible)`, () => {
      renderLab();
      const inputEl = getInput();

      fireEvent.change(inputEl, { target: { value: msg } });
      fireEvent.keyDown(inputEl, { key: "Enter" });

      // In thinking state, the pulsing dots indicator should be visible
      const dots = document.querySelectorAll(".animate-pulse");
      expect(dots.length).toBeGreaterThan(0);
    });
  }

  it("thinking state shows after each successive message", () => {
    renderLab();
    const inputEl = getInput();

    // Submit first message
    fireEvent.change(inputEl, { target: { value: "first" } });
    fireEvent.keyDown(inputEl, { key: "Enter" });

    // Thinking indicator visible
    let dots = document.querySelectorAll(".animate-pulse");
    expect(dots.length).toBeGreaterThan(0);

    // Let it go to responding, then idle
    act(() => {
      vi.advanceTimersByTime(6500);
    });

    // Submit second message
    fireEvent.change(inputEl, { target: { value: "second" } });
    fireEvent.keyDown(inputEl, { key: "Enter" });

    // Thinking indicator visible again
    dots = document.querySelectorAll(".animate-pulse");
    expect(dots.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Property 12.6: Thinking duration is bounded
// ---------------------------------------------------------------------------

describe.skip("Property 12.6: Thinking duration is bounded", () => {
  /**
   * **Validates: Requirements 4.4**
   *
   * For any thinking state entry, the duration before transitioning to
   * responding SHALL be between 1.5 and 2.5 seconds.
   */

  beforeEach(() => {
    vi.useFakeTimers();
    // Fix Math.random for predictable testing
    vi.spyOn(Math, "random");
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const COMING_SOON =
    "Still warming up! This feature is actively being built — check back soon.";

  it("responding state does NOT appear before 1.5 seconds (minimum bound)", () => {
    // Math.random() = 0 → delay = 1500ms (minimum)
    vi.mocked(Math.random).mockReturnValue(0);

    renderLab();
    const inputEl = getInput();

    fireEvent.change(inputEl, { target: { value: "test" } });
    fireEvent.keyDown(inputEl, { key: "Enter" });

    // At 1499ms, should still be thinking
    act(() => {
      vi.advanceTimersByTime(1499);
    });

    // Coming soon response should NOT yet be visible
    expect(screen.queryByText(COMING_SOON)).not.toBeInTheDocument();
  });

  it("responding state appears at 1.5 seconds when random is 0 (minimum delay)", () => {
    vi.mocked(Math.random).mockReturnValue(0);

    renderLab();
    const inputEl = getInput();

    fireEvent.change(inputEl, { target: { value: "test" } });
    fireEvent.keyDown(inputEl, { key: "Enter" });

    // At exactly 1500ms, should transition to responding
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.getByText(COMING_SOON)).toBeInTheDocument();
  });

  it("responding state appears at 2.5 seconds when random is 1 (maximum delay)", () => {
    vi.mocked(Math.random).mockReturnValue(1);

    renderLab();
    const inputEl = getInput();

    fireEvent.change(inputEl, { target: { value: "test" } });
    fireEvent.keyDown(inputEl, { key: "Enter" });

    // At 2499ms, should still be thinking
    act(() => {
      vi.advanceTimersByTime(2499);
    });
    expect(screen.queryByText(COMING_SOON)).not.toBeInTheDocument();

    // At 2500ms, should transition to responding
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByText(COMING_SOON)).toBeInTheDocument();
  });

  it("thinking duration is always within [1500, 2500] for various random values", () => {
    const randomValues = [0, 0.25, 0.5, 0.75, 1];

    for (const rVal of randomValues) {
      vi.mocked(Math.random).mockReturnValue(rVal);

      const { unmount } = renderLab();
      const inputEl = getInput();

      fireEvent.change(inputEl, { target: { value: "test" } });
      fireEvent.keyDown(inputEl, { key: "Enter" });

      // Expected delay: 1500 + rVal * 1000
      const expectedDelay = 1500 + rVal * 1000;

      // Just before expected delay: still thinking
      act(() => {
        vi.advanceTimersByTime(expectedDelay - 1);
      });
      expect(screen.queryByText(COMING_SOON)).not.toBeInTheDocument();

      // At expected delay: responding
      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(screen.getByText(COMING_SOON)).toBeInTheDocument();

      unmount();
    }
  });
});

// ---------------------------------------------------------------------------
// Property 12.7: Coming Soon Response always displays after thinking
// ---------------------------------------------------------------------------

describe.skip("Property 12.7: Coming Soon Response always displays after thinking", () => {
  /**
   * **Validates: Requirements 5.1, 7.3, 9.3**
   *
   * For any text submitted, after thinking completes, the Speech Cloud SHALL
   * display the Coming_Soon_Response text. Deterministic — no failures.
   */

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const COMING_SOON =
    "Still warming up! This feature is actively being built — check back soon.";

  const diverseInputs = [
    "hello",
    "a",
    "🚀🌍✨",
    "A very long message that contains many words and characters to test edge cases",
    "Special chars: !@#$%^&*()",
    "123456789",
    "<div>html content</div>",
    "   padded content   ",
  ];

  for (const input of diverseInputs) {
    const trimmed = input.trim();
    it(`"${trimmed.slice(0, 30)}${trimmed.length > 30 ? "..." : ""}" always produces Coming Soon Response`, () => {
      renderLab();
      const inputEl = getInput();

      fireEvent.change(inputEl, { target: { value: input } });
      fireEvent.keyDown(inputEl, { key: "Enter" });

      // Advance past maximum thinking time (2500ms)
      act(() => {
        vi.advanceTimersByTime(2500);
      });

      expect(screen.getByText(COMING_SOON)).toBeInTheDocument();
    });
  }

  it("response is always the exact Coming_Soon_Response text, never an error", () => {
    renderLab();
    const inputEl = getInput();

    fireEvent.change(inputEl, { target: { value: "anything" } });
    fireEvent.keyDown(inputEl, { key: "Enter" });

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    const responseEl = screen.getByText(COMING_SOON);
    expect(responseEl.textContent).toBe(COMING_SOON);

    // No error-like text should be present
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/failed/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
  });

  it("submitting multiple messages always results in Coming Soon Response each time", () => {
    renderLab();
    const inputEl = getInput();

    for (let i = 0; i < 3; i++) {
      fireEvent.change(inputEl, { target: { value: `message ${i}` } });
      fireEvent.keyDown(inputEl, { key: "Enter" });

      // Wait for thinking to complete
      act(() => {
        vi.advanceTimersByTime(2500);
      });

      expect(screen.getByText(COMING_SOON)).toBeInTheDocument();

      // Wait for responding to end (4s) so Orby returns to idle
      act(() => {
        vi.advanceTimersByTime(4000);
      });
    }
  });
});
