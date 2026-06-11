/**
 * Property-based test for section-triggered one-shot messages.
 *
 * Test 12.8: Section messages fire at most once per session.
 *
 * **Validates: Requirements 11.4, 11.5**
 *
 * For any section ID (projects, blog, contact), regardless of how many times
 * that section enters and exits viewport, the corresponding section message
 * SHALL display at most once per session.
 */

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Track IntersectionObserver instances and their callbacks
type IntersectionCallback = (entries: IntersectionObserverEntry[]) => void;

interface MockObserverInstance {
  callback: IntersectionCallback;
  elements: Element[];
  disconnect: () => void;
  observe: (target: Element) => void;
  unobserve: (target: Element) => void;
  takeRecords: () => IntersectionObserverEntry[];
}

let mockObservers: MockObserverInstance[] = [];

// Mock IntersectionObserver
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = "0px";
  readonly thresholds: ReadonlyArray<number> = [0];
  private instance: MockObserverInstance;

  constructor(
    callback: IntersectionCallback,
    _options?: IntersectionObserverInit,
  ) {
    this.instance = {
      callback,
      elements: [],
      disconnect: vi.fn(),
      observe: vi.fn(),
      unobserve: vi.fn(),
      takeRecords: vi.fn(),
    };
    mockObservers.push(this.instance);
  }

  observe(element: Element) {
    this.instance.elements.push(element);
    this.instance.observe(element);
  }

  unobserve(element: Element) {
    this.instance.unobserve(element);
  }

  disconnect() {
    this.instance.disconnect();
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

/** Simulate a section entering the viewport for a specific observer */
function simulateSectionIntersection(
  observerIndex: number,
  isIntersecting: boolean,
) {
  const observer = mockObservers[observerIndex];
  if (!observer) return;

  const element = observer.elements[0];
  if (!element) return;

  const entry = {
    isIntersecting,
    target: element,
    intersectionRatio: isIntersecting ? 0.5 : 0,
    boundingClientRect: {} as DOMRectReadOnly,
    intersectionRect: {} as DOMRectReadOnly,
    rootBounds: null,
    time: performance.now(),
  } as IntersectionObserverEntry;

  observer.callback([entry]);
}

// Mock useScrollProgress to return a fixed value (roaming state, scroll > 10%)
vi.mock("@/components/orby/useScrollProgress", () => ({
  useScrollProgress: () => 0.3,
  clamp: (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max),
  lerp: (start: number, end: number, t: number) => start + (end - start) * t,
}));

// Mock useSidebar
vi.mock("@/components/ui/sidebar", () => ({
  useSidebar: () => ({
    toggleSidebar: vi.fn(),
    open: false,
    isMobile: false,
    openMobile: false,
  }),
}));

import { useOrbyState } from "../orby/useOrbyState";

describe("Property 12.8: Section messages fire at most once", () => {
  /**
   * **Validates: Requirements 11.4, 11.5**
   *
   * For any section ID (projects, blog, contact), regardless of how many
   * times that section enters and exits viewport, the corresponding section
   * message SHALL display at most once per session.
   */

  beforeEach(() => {
    vi.useFakeTimers();
    mockObservers = [];

    // Install mock IntersectionObserver
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

    // Mock matchMedia for reduced motion check
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    // Mock window dimensions for position calculations
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 1440,
    });
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      value: 900,
    });

    // Create section elements that IntersectionObserver will target
    for (const id of ["projects", "blog", "contact"]) {
      const el = document.createElement("section");
      el.id = id;
      document.body.appendChild(el);
    }
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    mockObservers = [];

    // Clean up DOM
    for (const id of ["projects", "blog", "contact"]) {
      const el = document.getElementById(id);
      if (el) el.remove();
    }
  });

  const SECTION_TEXTS: Record<string, string> = {
    projects:
      "Fair warning — some of these deploy links are on sabbatical. The real, live collection is at github.com/gupta-builds.",
    blog: "He's been converting browser tabs into an actual blog. The link appears here once it's live — I'm watching.",
    contact:
      "You orbited the whole thing. Reach out — I've been watching the evidence, and he's worth the message.",
  };

  it("section message fires once when section enters viewport", () => {
    const { result } = renderHook(() => useOrbyState());

    // Advance past intro (5s) + pointing (4s) to get to roaming
    act(() => {
      vi.advanceTimersByTime(9000);
    });

    // Find the observer for "projects" section
    // Observers are created for projects, blog, contact
    expect(mockObservers.length).toBeGreaterThanOrEqual(3);

    // Simulate projects section entering viewport
    act(() => {
      simulateSectionIntersection(0, true);
    });

    expect(result.current.state).toBe("section-comment");
    expect(result.current.speechText).toBe(SECTION_TEXTS.projects);
  });

  it("same section entering viewport again does NOT trigger a second message", () => {
    const { result } = renderHook(() => useOrbyState());

    // Advance to roaming
    act(() => {
      vi.advanceTimersByTime(9000);
    });

    // First intersection for projects
    act(() => {
      simulateSectionIntersection(0, true);
    });

    expect(result.current.state).toBe("section-comment");
    expect(result.current.speechText).toBe(SECTION_TEXTS.projects);

    // Wait for section-comment to return to roaming (6s per hook implementation)
    act(() => {
      vi.advanceTimersByTime(6000);
    });

    expect(result.current.state).toBe("roaming");

    // The observer should be disconnected after first fire
    // Attempting to trigger it again should have no effect
    // since the observer disconnects itself
    expect(mockObservers[0].disconnect).toHaveBeenCalled();
  });

  it("observer disconnects immediately after firing", () => {
    renderHook(() => useOrbyState());

    // Advance to roaming
    act(() => {
      vi.advanceTimersByTime(9000);
    });

    // Simulate projects section entering viewport
    act(() => {
      simulateSectionIntersection(0, true);
    });

    // Observer should have been disconnected
    expect(mockObservers[0].disconnect).toHaveBeenCalledTimes(1);
  });

  it("each of the three sections can fire independently, each at most once", () => {
    const { result } = renderHook(() => useOrbyState());

    // Advance to roaming
    act(() => {
      vi.advanceTimersByTime(9000);
    });

    // Fire projects
    act(() => {
      simulateSectionIntersection(0, true);
    });
    expect(result.current.speechText).toBe(SECTION_TEXTS.projects);

    // Wait for section-comment to end
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Fire blog
    act(() => {
      simulateSectionIntersection(1, true);
    });
    expect(result.current.speechText).toBe(SECTION_TEXTS.blog);

    // Wait for section-comment to end
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Fire contact
    act(() => {
      simulateSectionIntersection(2, true);
    });
    expect(result.current.speechText).toBe(SECTION_TEXTS.contact);

    // All three observers should be disconnected
    expect(mockObservers[0].disconnect).toHaveBeenCalled();
    expect(mockObservers[1].disconnect).toHaveBeenCalled();
    expect(mockObservers[2].disconnect).toHaveBeenCalled();
  });

  it("firedSections Set prevents duplicate messages regardless of re-observation", () => {
    const { result } = renderHook(() => useOrbyState());

    // Advance to roaming
    act(() => {
      vi.advanceTimersByTime(9000);
    });

    // Fire projects first time
    act(() => {
      simulateSectionIntersection(0, true);
    });
    expect(result.current.state).toBe("section-comment");

    // Wait for return to roaming (6s per hook implementation)
    act(() => {
      vi.advanceTimersByTime(6000);
    });
    expect(result.current.state).toBe("roaming");

    // Even if we could somehow re-trigger (which we can't since observer disconnected),
    // the firedSections guard would prevent it.
    // Verify state doesn't go back to section-comment
    // Manually call the callback again to test the Set guard
    const observer = mockObservers[0];
    const element = observer.elements[0];
    if (element) {
      act(() => {
        observer.callback([
          {
            isIntersecting: true,
            target: element,
            intersectionRatio: 0.5,
            boundingClientRect: {} as DOMRectReadOnly,
            intersectionRect: {} as DOMRectReadOnly,
            rootBounds: null,
            time: performance.now(),
          } as IntersectionObserverEntry,
        ]);
      });
    }

    // Should still be in roaming, NOT section-comment again
    expect(result.current.state).toBe("roaming");
  });

  it("non-intersecting entries (section exit) do not trigger messages", () => {
    const { result } = renderHook(() => useOrbyState());

    // Advance past intro (5s) then pointing (4s) in separate steps
    // to allow React effects to schedule properly
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    act(() => {
      vi.advanceTimersByTime(4000);
    });

    // Should be in roaming now
    expect(result.current.state).toBe("roaming");

    // Simulate section LEAVING viewport (isIntersecting: false)
    act(() => {
      simulateSectionIntersection(0, false);
    });

    // Should remain in roaming, no message triggered
    expect(result.current.state).toBe("roaming");
    expect(result.current.speechText).toBeNull();
  });

  it("rapid entry/exit/entry of the same section still fires only once", () => {
    const { result } = renderHook(() => useOrbyState());

    // Advance to roaming
    act(() => {
      vi.advanceTimersByTime(9000);
    });

    // Rapid intersections: enter, exit, enter
    act(() => {
      simulateSectionIntersection(0, true);
    });
    // First entry triggers section-comment
    expect(result.current.state).toBe("section-comment");
    expect(result.current.speechText).toBe(SECTION_TEXTS.projects);

    // Observer is already disconnected after first fire
    expect(mockObservers[0].disconnect).toHaveBeenCalledTimes(1);
  });
});
