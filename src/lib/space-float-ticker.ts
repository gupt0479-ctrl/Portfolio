/**
 * space-float-ticker.ts
 *
 * Singleton requestAnimationFrame ticker shared by all useSpaceFloat instances.
 * Starts the rAF loop when the first floater registers, stops it when the last
 * one unregisters. This means the entire site pays exactly ONE rAF budget for
 * all floating elements — not one per element.
 *
 * Elapsed time (seconds) is passed to every callback so each hook can drive its
 * own sine functions with its own phase offsets.
 *
 * R3F / ObsidianBackground uses its own internal scheduler (useFrame inside a
 * Canvas) — that is a completely separate rAF chain managed by @react-three/fiber
 * and does NOT interact with this ticker.
 */

type FloaterCallback = (elapsed: number) => void;

interface FloaterEntry {
  cb: FloaterCallback;
}

const floaters = new Map<string, FloaterEntry>();
let rafHandle: number | null = null;
let startTime: number | null = null;

function tick(now: number): void {
  if (startTime === null) startTime = now;
  const elapsed = (now - startTime) / 1000; // seconds

  for (const { cb } of floaters.values()) {
    cb(elapsed);
  }

  if (floaters.size > 0) {
    rafHandle = requestAnimationFrame(tick);
  } else {
    rafHandle = null;
    startTime = null;
  }
}

/**
 * Register a floater callback.
 * The callback receives elapsed seconds since the ticker started.
 * @param id   Stable, unique string per component instance (e.g. crypto.randomUUID())
 * @param cb   Called every animation frame with elapsed seconds
 */
export function addFloater(id: string, cb: FloaterCallback): void {
  floaters.set(id, { cb });

  // Start the loop only when the first floater is added
  if (floaters.size === 1 && rafHandle === null) {
    rafHandle = requestAnimationFrame(tick);
  }
}

/**
 * Unregister a floater. When the last floater is removed the rAF loop stops
 * automatically — no timer leaks between route navigations.
 */
export function removeFloater(id: string): void {
  floaters.delete(id);
  // The loop will self-terminate on the next tick when it sees floaters.size === 0
}
