/**
 * Unit tests for useTypedText hook
 *
 * Validates: Requirements 8.1, 6.5
 *
 * Tests char-by-char typing, reduced motion fallback,
 * text change reset, and enabled/disabled behavior.
 */

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTypedText } from "../orby/useTypedText";

describe("useTypedText", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Default: no reduced motion
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
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("starts with empty displayText and isComplete false", () => {
    const { result } = renderHook(() => useTypedText("Hello"));
    expect(result.current.displayText).toBe("");
    expect(result.current.isComplete).toBe(false);
  });

  it("types text incrementally at default speed (30 chars/sec)", () => {
    const { result } = renderHook(() => useTypedText("Hi"));

    // After ~33ms (1000/30), should have 1 char
    act(() => {
      vi.advanceTimersByTime(34);
    });
    expect(result.current.displayText).toBe("H");
    expect(result.current.isComplete).toBe(false);

    // After another interval, should have 2 chars
    act(() => {
      vi.advanceTimersByTime(34);
    });
    expect(result.current.displayText).toBe("Hi");
    expect(result.current.isComplete).toBe(true);
  });

  it("respects custom speed parameter", () => {
    // 10 chars/sec = 100ms per char
    const { result } = renderHook(() => useTypedText("AB", 10));

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current.displayText).toBe("A");

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current.displayText).toBe("AB");
    expect(result.current.isComplete).toBe(true);
  });

  it("does not type when enabled is false", () => {
    const { result } = renderHook(() => useTypedText("Hello", 30, false));

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current.displayText).toBe("");
    expect(result.current.isComplete).toBe(false);
  });

  it("returns full text immediately when reduced motion is active", () => {
    // Set reduced motion preference
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const { result } = renderHook(() => useTypedText("Hello World"));
    // Need to advance timers for the effect to run
    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(result.current.displayText).toBe("Hello World");
    expect(result.current.isComplete).toBe(true);
  });

  it("resets charIndex when text changes", () => {
    const { result, rerender } = renderHook(({ text }) => useTypedText(text), {
      initialProps: { text: "AB" },
    });

    // Type out first text
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current.displayText.length).toBeGreaterThan(0);

    // Change text
    rerender({ text: "XY" });
    expect(result.current.displayText).toBe("");
    expect(result.current.isComplete).toBe(false);
  });

  it("cleans up interval on unmount", () => {
    const clearIntervalSpy = vi.spyOn(global, "clearInterval");
    const { unmount } = renderHook(() => useTypedText("Hello"));

    // Start typing
    act(() => {
      vi.advanceTimersByTime(34);
    });

    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});
