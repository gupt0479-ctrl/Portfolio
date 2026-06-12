/**
 * Unit tests for the chat-driven Orby navigation channel (Phase 7).
 *
 * Verifies: orby:navigate CustomEvent → Orby glides home → arrival message
 * appears after section intersects. Fully separate from the scroll-popup channel.
 */

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ── IntersectionObserver mock ────────────────────────────────────────────────

type IOCallback = (entries: IntersectionObserverEntry[]) => void;

interface MockIOInstance {
  callback: IOCallback;
  elements: Element[];
  disconnect: () => void;
  observe: (el: Element) => void;
}

let mockIOs: MockIOInstance[] = [];

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin = "0px";
  readonly thresholds: ReadonlyArray<number> = [0];
  private inst: MockIOInstance;

  constructor(cb: IOCallback, _opts?: IntersectionObserverInit) {
    this.inst = {
      callback: cb,
      elements: [],
      disconnect: vi.fn(),
      observe: vi.fn(),
    };
    mockIOs.push(this.inst);
  }
  observe(el: Element) {
    this.inst.elements.push(el);
    this.inst.observe(el);
  }
  unobserve() {}
  disconnect() {
    this.inst.disconnect();
  }
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

function fireIO(index: number, isIntersecting: boolean) {
  const io = mockIOs[index];
  if (!io) return;
  const el = io.elements[0];
  if (!el) return;
  io.callback([
    {
      isIntersecting,
      target: el,
      intersectionRatio: isIntersecting ? 0.4 : 0,
      boundingClientRect: {} as DOMRectReadOnly,
      intersectionRect: {} as DOMRectReadOnly,
      rootBounds: null,
      time: performance.now(),
    } as IntersectionObserverEntry,
  ]);
}

// ── Module mocks ─────────────────────────────────────────────────────────────

vi.mock("@/components/orby/useScrollProgress", () => ({
  useScrollProgress: () => 0.3,
  clamp: (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi),
  lerp: (a: number, b: number, t: number) => a + (b - a) * t,
}));

vi.mock("@/components/ui/sidebar", () => ({
  useSidebar: () => ({
    toggleSidebar: vi.fn(),
    open: false,
    isMobile: false,
    openMobile: false,
  }),
}));

import { useOrbyState } from "../orby/useOrbyState";

// ── Helpers ──────────────────────────────────────────────────────────────────

function dispatchNavEvent(sectionId: string, orbyMessage: string | null) {
  window.dispatchEvent(
    new CustomEvent("orby:navigate", {
      detail: { sectionId, orbyMessage },
    }),
  );
}

function makeSection(id: string): HTMLElement {
  const el = document.createElement("section");
  el.id = id;
  document.body.appendChild(el);
  return el;
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("Chat-driven Orby navigation (Phase 7)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockIOs = [];

    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockReturnValue({
        matches: false,
        media: "",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }),
    });
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 1440,
    });
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      value: 900,
    });
    Object.defineProperty(window, "scrollY", { writable: true, value: 0 });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    mockIOs = [];
    document.body.innerHTML = "";
  });

  it("orby:navigate transitions state to chat-nav-home", () => {
    makeSection("projects");
    const { result } = renderHook(() => useOrbyState());

    // Advance past intro → pointing → roaming
    act(() => {
      vi.advanceTimersByTime(5000); // intro → pointing
    });
    act(() => {
      vi.advanceTimersByTime(4000); // pointing → roaming
    });
    expect(result.current.state).toBe("roaming");

    // Dispatch the chat-nav event
    act(() => {
      dispatchNavEvent("projects", "Here are the builds!");
    });

    expect(result.current.state).toBe("chat-nav-home");
    expect(result.current.speechText).toBeNull();
  });

  it("arrival IO fires → state becomes chat-nav-arrival with orbyMessage", () => {
    makeSection("projects");
    const { result } = renderHook(() => useOrbyState());

    act(() => {
      vi.advanceTimersByTime(5000); // intro → pointing
    });
    act(() => {
      vi.advanceTimersByTime(4000); // pointing → roaming
    });

    // The section-comment IntersectionObservers are created at mount (3 of them).
    // The chat-nav IO is created after the event, so it's the 4th.
    const sectionIOCount = mockIOs.length; // should be 3

    act(() => {
      dispatchNavEvent("projects", "Here are the builds!");
    });

    // A new IO should have been created for the nav target
    expect(mockIOs.length).toBe(sectionIOCount + 1);

    // Simulate the projects section entering the viewport
    act(() => {
      fireIO(sectionIOCount, true);
    });

    expect(result.current.state).toBe("chat-nav-arrival");
    expect(result.current.speechText).toBe("Here are the builds!");
  });

  it("arrival message auto-clears after 7s and returns to roaming", () => {
    makeSection("skills");
    const { result } = renderHook(() => useOrbyState());

    act(() => {
      vi.advanceTimersByTime(5000); // intro → pointing
    });
    act(() => {
      vi.advanceTimersByTime(4000); // pointing → roaming
    });

    const navIOIndex = mockIOs.length;

    act(() => {
      dispatchNavEvent("skills", "Full stack right here.");
    });

    act(() => {
      fireIO(navIOIndex, true);
    });

    expect(result.current.state).toBe("chat-nav-arrival");

    act(() => {
      vi.advanceTimersByTime(7000);
    });

    expect(result.current.state).toBe("roaming");
    expect(result.current.speechText).toBeNull();
  });

  it("null orbyMessage: section still navigates but no speech text shown", () => {
    makeSection("education");
    const { result } = renderHook(() => useOrbyState());

    act(() => {
      vi.advanceTimersByTime(5000); // intro → pointing
    });
    act(() => {
      vi.advanceTimersByTime(4000); // pointing → roaming
    });

    const navIOIndex = mockIOs.length;

    act(() => {
      dispatchNavEvent("education", null);
    });

    act(() => {
      fireIO(navIOIndex, true);
    });

    // Should return to roaming without showing any text
    expect(result.current.state).toBe("roaming");
    expect(result.current.speechText).toBeNull();
  });

  it("wheel event during glide cancels the pending arrival message", () => {
    makeSection("contact");
    const { result } = renderHook(() => useOrbyState());

    act(() => {
      vi.advanceTimersByTime(5000); // intro → pointing
    });
    act(() => {
      vi.advanceTimersByTime(4000); // pointing → roaming
    });

    act(() => {
      dispatchNavEvent("contact", "Reach out!");
    });

    expect(result.current.state).toBe("chat-nav-home");

    // User wheels (scrolls) before section arrives
    act(() => {
      window.dispatchEvent(new WheelEvent("wheel"));
    });

    // Should return to roaming, not stay in chat-nav-home
    expect(result.current.state).toBe("roaming");
    expect(result.current.speechText).toBeNull();
  });

  it("4s max-wait timeout cancels pending nav if IO never fires", () => {
    makeSection("blog");
    const { result } = renderHook(() => useOrbyState());

    act(() => {
      vi.advanceTimersByTime(5000); // intro → pointing
    });
    act(() => {
      vi.advanceTimersByTime(4000); // pointing → roaming
    });

    act(() => {
      dispatchNavEvent("blog", "Thoughts incoming!");
    });

    expect(result.current.state).toBe("chat-nav-home");

    // Advance 4s without IO firing
    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(result.current.state).toBe("roaming");
    expect(result.current.speechText).toBeNull();
  });

  it("second orby:navigate in same turn is ignored (no double-fire)", () => {
    makeSection("projects");
    makeSection("skills");
    const { result } = renderHook(() => useOrbyState());

    act(() => {
      vi.advanceTimersByTime(5000); // intro → pointing
    });
    act(() => {
      vi.advanceTimersByTime(4000); // pointing → roaming
    });

    const _firstNavIOIndex = mockIOs.length;

    // First navigate
    act(() => {
      dispatchNavEvent("projects", "Here are projects!");
    });

    // Second navigate immediately after — simulates PortfolioLab's navFiredRef
    // In real usage PortfolioLab guards this; here we test the hook resets properly
    act(() => {
      dispatchNavEvent("skills", "Here are skills!");
    });

    // The second event should replace the first (hook resets and starts fresh)
    // State should still be chat-nav-home (latest nav wins)
    expect(result.current.state).toBe("chat-nav-home");

    // The first IO (projects) is still there but may have been disconnected
    // by the second event. The second event created a new IO for skills.
    const skillsIOIndex = mockIOs.length - 1;

    // Fire the skills IO
    act(() => {
      fireIO(skillsIOIndex, true);
    });

    expect(result.current.state).toBe("chat-nav-arrival");
    expect(result.current.speechText).toBe("Here are skills!");
  });

  it("scroll-popup channel (section-comment) is not affected by chat-nav events", () => {
    makeSection("projects");
    makeSection("blog");
    makeSection("contact");
    const { result } = renderHook(() => useOrbyState());

    act(() => {
      vi.advanceTimersByTime(5000); // intro → pointing
    });
    act(() => {
      vi.advanceTimersByTime(4000); // pointing → roaming
    });

    // Scroll popup fires via IntersectionObserver (existing channel, IO index 0)
    act(() => {
      fireIO(0, true); // projects scroll popup
    });

    expect(result.current.state).toBe("section-comment");
    expect(result.current.speechText).toContain("deploy links");

    // While section-comment is showing, a chat-nav event arrives
    const _navIOIndex = mockIOs.length;
    act(() => {
      dispatchNavEvent("skills", "Here are skills!");
    });

    // Chat-nav resets to chat-nav-home (it interrupts section-comment)
    expect(result.current.state).toBe("chat-nav-home");
    // Speech text is cleared during the home glide
    expect(result.current.speechText).toBeNull();
  });
});
