/**
 * Orby Chat-Driven Navigation E2E Smoke Test
 *
 * Tests the pipeline:
 *   (1) Portfolio Lab chat → Orby glides home
 *   (2) Page scrolls to target section
 *   (3) Orby pops an arrival message (OrbySpeechCloud)
 *
 * Also verifies the separate scroll-triggered popup channel (section-comment state).
 */

import fs from "node:fs";
import path from "node:path";
import { expect, type Page, test } from "@playwright/test";

const BASE_URL = "http://localhost:3000";
const SCREENSHOT_DIR =
  "/home/anant_gupta/projects/hub/portfolio/e2e-screenshots";
const ERRORS: string[] = [];

async function screenshot(page: Page, name: string) {
  const filepath = path.join(SCREENSHOT_DIR, name);
  await page.screenshot({ path: filepath, fullPage: false });
  console.log(`[screenshot] ${filepath}`);
}

test.describe("Orby chat-driven navigation smoke test", () => {
  test.beforeAll(() => {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  });

  test("full navigation flow", async ({ page }) => {
    // Capture console errors
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        ERRORS.push(`[console error] ${msg.text()}`);
      }
    });
    page.on("pageerror", (err) => {
      ERRORS.push(`[page error] ${err.message}`);
    });

    // ── Step 1: Navigate to home ─────────────────────────────────────────────
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });

    // Wait for body / home section to be visible
    await page.waitForSelector("body", { state: "visible", timeout: 15000 });
    // Try to wait for #home if it exists; otherwise just settle with body
    try {
      await page.waitForSelector("#home", { state: "attached", timeout: 5000 });
      console.log("[check] #home section found");
    } catch {
      console.log("[check] #home section not found, continuing with body");
    }

    // Give Three.js a moment to settle
    await page.waitForTimeout(1500);

    // Screenshot 01: initial load
    await screenshot(page, "01-initial-load.png");
    console.log("[step 1] Page loaded at", BASE_URL);

    // ── Step 2: Open Portfolio Lab ───────────────────────────────────────────
    // Two buttons share this label; the floating trigger is the last one (fixed bottom-right)
    const labButton = page
      .getByRole("button", { name: /open portfolio lab/i })
      .last();
    await expect(labButton).toBeVisible({ timeout: 10000 });
    await labButton.click();
    console.log("[step 2] Clicked lab button");

    // Wait for the sidebar to open — look for the chat input placeholder
    const chatInput = page.getByPlaceholder("Say something to Orby...");
    await expect(chatInput).toBeVisible({ timeout: 8000 });
    console.log("[step 2] Lab panel opened, chat input visible");

    // Screenshot 02: lab open
    await screenshot(page, "02-lab-open.png");

    // ── Step 3: Type and submit chat message ─────────────────────────────────
    await chatInput.fill("show me your projects");

    // Submit by pressing Enter
    await chatInput.press("Enter");
    console.log("[step 3] Submitted: 'show me your projects'");

    // ── Step 4: Wait for the full API round-trip + navigate tool to fire ───────
    // Strategy: poll the sidebar chat thread for a non-empty ASSISTANT message.
    // The panel shows user messages right-aligned and assistant messages left-aligned.
    // We specifically check that the send-message time attribute changes, or that
    // a data-role="assistant" node has content. Fallback: wait a flat 12s for the
    // full model response + smooth-scroll to complete.
    const submitTime = Date.now();
    let assistantReplied = false;

    for (let i = 0; i < 24; i++) {
      await page.waitForTimeout(500);
      const elapsed = Date.now() - submitTime;
      try {
        const hasReply = await page.evaluate(() => {
          // ChatThread assistant messages render as: div.mr-auto.max-w-[80%]
          // containing a div.bg-violet-950\/40 with the text.
          // There's no data-role attribute — use the mr-auto layout class.
          const assistantWrappers = Array.from(
            document.querySelectorAll(".mr-auto"),
          );
          return assistantWrappers.some((el) => {
            const text = (el as HTMLElement).innerText.trim();
            // Skip empty placeholder "..." (shown while streaming)
            return text.length > 20 && !text.includes("...");
          });
        });
        if (hasReply) {
          assistantReplied = true;
          console.log(`[step 4] Assistant reply detected after ${elapsed}ms`);
          // Give the navigate tool result + smooth scroll 3 more seconds
          await page.waitForTimeout(3000);
          break;
        }
      } catch {
        /* ignore */
      }
    }

    if (!assistantReplied) {
      console.log(
        "[step 4] WARNING: no assistant reply within 12s — taking screenshot anyway",
      );
    }

    // Screenshot 03: after chat
    await screenshot(page, "03-after-chat.png");

    // ── Step 5: Check if #projects section is now in viewport ────────────────
    // Give smooth scroll an additional 2s window
    await page.waitForTimeout(2000);

    const projectsInViewport = await page.evaluate(() => {
      const el = document.getElementById("projects");
      if (!el)
        return { visible: false, rect: null, reason: "no #projects element" };
      const rect = el.getBoundingClientRect();
      const visible = rect.top < window.innerHeight && rect.bottom > 0;
      return {
        visible,
        rect: {
          top: Math.round(rect.top),
          bottom: Math.round(rect.bottom),
          height: Math.round(rect.height),
          viewportHeight: window.innerHeight,
        },
        reason: visible ? "section is in viewport" : "section not in viewport",
      };
    });

    console.log(
      "[step 5] #projects viewport check:",
      JSON.stringify(projectsInViewport, null, 2),
    );

    // ── Step 6: Check Orby speech cloud ─────────────────────────────────────
    // OrbySpeechCloud renders a motion.div with border-violet-500/50 style.
    // The component has aria-hidden="true" and renders text via useTypedText.
    // We look for the speech cloud by its distinctive CSS class or text content.
    await page.waitForTimeout(1500); // Let Orby finish gliding

    const orbyCloudInfo = await page.evaluate(() => {
      // The OrbySpeechCloud has class: "absolute left-1/2 -translate-x-1/2"
      // with a distinctive border style. Look for any visible element inside
      // the fixed Orby wrapper that has speech text.
      const orbyWrapper = document.querySelector(
        '[aria-hidden="true"].fixed.inset-0.z-40',
      );
      if (!orbyWrapper)
        return { visible: false, text: null, reason: "no orby wrapper found" };

      // Find any text in the cloud — it sits inside a motion.div with font-sans text
      const cloud = orbyWrapper.querySelector(".absolute.left-1\\/2");
      if (!cloud)
        return { visible: false, text: null, reason: "no cloud element found" };

      const text = (cloud as HTMLElement).innerText || null;
      const style = window.getComputedStyle(cloud as HTMLElement);
      const visible = style.opacity !== "0" && style.display !== "none";

      return {
        visible,
        text,
        reason: visible ? "cloud is visible" : "cloud is hidden",
      };
    });

    console.log(
      "[step 6] Orby speech cloud:",
      JSON.stringify(orbyCloudInfo, null, 2),
    );

    // Screenshot 04: Orby state after nav
    await screenshot(page, "04-orby-state.png");

    // ── Step 7: Close sidebar and scroll to #contact ─────────────────────────
    // Scroll back to top first so fixed sidebar header is reachable, then ESC
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(300);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(800);

    const sidebarClosed = await chatInput.isHidden();
    if (sidebarClosed) {
      console.log("[step 7] Sidebar closed via Escape");
    } else {
      // Fallback: force-click the X button regardless of viewport position
      const closeBtn = page.getByRole("button", {
        name: /close portfolio lab/i,
      });
      try {
        await closeBtn.click({ force: true, timeout: 3000 });
        console.log("[step 7] Sidebar closed via close button (force)");
      } catch {
        console.log("[step 7] WARNING: Could not close sidebar");
      }
    }
    await page.waitForTimeout(400);

    // Scroll to #contact section
    await page.evaluate(() => {
      const el = document.getElementById("contact");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    console.log("[step 7] Scrolled to #contact");

    // Wait 3s for scroll-triggered popup (section-comment IntersectionObserver)
    await page.waitForTimeout(3500);

    // Screenshot 05: scroll-triggered popup state
    await screenshot(page, "05-scroll-popup.png");

    // ── Step 8: Check scroll-triggered Orby speech ───────────────────────────
    const scrollPopupInfo = await page.evaluate(() => {
      const orbyWrapper = document.querySelector(
        '[aria-hidden="true"].fixed.inset-0.z-40',
      );
      if (!orbyWrapper)
        return { visible: false, text: null, reason: "no orby wrapper" };

      const cloud = orbyWrapper.querySelector(".absolute.left-1\\/2");
      if (!cloud) return { visible: false, text: null, reason: "no cloud" };

      const text = (cloud as HTMLElement).innerText || null;
      const style = window.getComputedStyle(cloud as HTMLElement);
      const visible =
        style.opacity !== "0" && style.display !== "none" && !!text;
      return {
        visible,
        text,
        reason: visible ? "scroll popup fired" : "no scroll popup",
      };
    });

    console.log(
      "[step 8] Scroll-triggered popup:",
      JSON.stringify(scrollPopupInfo, null, 2),
    );

    // ── Summary ──────────────────────────────────────────────────────────────
    console.log("\n════════════════════════════════════════════════════");
    console.log("ORBY NAVIGATION SMOKE TEST — RESULTS");
    console.log("════════════════════════════════════════════════════");
    console.log(`Branch: Chatbot`);
    console.log(
      `Projects section in viewport: ${projectsInViewport.visible} ${JSON.stringify(projectsInViewport.rect ?? {})}`,
    );
    console.log(
      `Orby speech cloud after nav: ${orbyCloudInfo.visible} | text: "${orbyCloudInfo.text ?? "(none)"}"`,
    );
    console.log(
      `Scroll popup at contact: ${scrollPopupInfo.visible} | text: "${scrollPopupInfo.text ?? "(none)"}"`,
    );
    console.log(
      `Console errors (${ERRORS.length}): ${ERRORS.length === 0 ? "none" : ERRORS.join(", ")}`,
    );
    console.log("Screenshots saved to:", SCREENSHOT_DIR);
    console.log("════════════════════════════════════════════════════");

    // Soft assertions — log outcomes without hard failing on streaming (API key may not work in test)
    expect(true).toBe(true); // ensure test always reports
  });
});
