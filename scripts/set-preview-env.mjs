#!/usr/bin/env node
/**
 * One-shot script to upsert NEXT_PUBLIC_* vars into the Vercel Preview environment.
 * Requires VERCEL_TOKEN env var (or uses the Vercel CLI token file).
 */

import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { homedir } from "node:os";

const PROJECT_ID = "prj_FakL984VfRBPzuz8iE2Om9klYO8B";
const TEAM_ID = "team_ZW2eeUU6jQDEOAzensQVYjzD";

// Try to get token from env, then from Vercel CLI auth file
let token = process.env.VERCEL_TOKEN;
if (!token) {
  const authPath = join(homedir(), ".local/share/com.vercel.cli/auth.json");
  if (existsSync(authPath)) {
    const auth = JSON.parse(readFileSync(authPath, "utf-8"));
    token = auth.token;
  }
}
if (!token) {
  console.error("No VERCEL_TOKEN found. Set it or login with vercel CLI.");
  process.exit(1);
}

const vars = [
  ["NEXT_PUBLIC_SANITY_DATASET", "production"],
  ["NEXT_PUBLIC_SANITY_PROJECT_ID", "hh1i87hh"],
  ["NEXT_PUBLIC_SANITY_API_VERSION", "2025-01-01"],
  ["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "pk_test_ZGVjZW50LXRpY2stMjIuY2xlcmsuYWNjb3VudHMuZGV2JA"],
  ["NEXT_PUBLIC_CLERK_SIGN_IN_URL", "/sign-in"],
  ["NEXT_PUBLIC_CLERK_SIGN_UP_URL", "/sign-up"],
  ["NEXT_PUBLIC_SITE_URL", "https://anantgupta.dev"],
];

async function upsert(key, value) {
  const url = `https://api.vercel.com/v10/projects/${PROJECT_ID}/env?upsert=true&teamId=${TEAM_ID}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ key, value, type: "plain", target: ["preview"] }),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error(`FAIL ${key}:`, data.error?.message || JSON.stringify(data));
  } else {
    console.log(`OK   ${key} → preview`);
  }
}

for (const [k, v] of vars) {
  await upsert(k, v);
}
console.log("\nDone. Preview env vars set.");
