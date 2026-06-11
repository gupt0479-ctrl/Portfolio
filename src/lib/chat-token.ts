const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

async function importKey(secret: string, usage: "sign" | "verify") {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    [usage],
  );
}

export async function signToken(iat: number): Promise<string> {
  const secret = process.env.CHAT_TOKEN_SECRET;
  if (!secret) throw new Error("CHAT_TOKEN_SECRET not set");

  const payload = btoa(JSON.stringify({ iat }));
  const key = await importKey(secret, "sign");
  const sigBuf = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  const sig = btoa(String.fromCharCode(...new Uint8Array(sigBuf)));
  return `${payload}.${sig}`;
}

export async function verifyToken(token: string): Promise<boolean> {
  const secret = process.env.CHAT_TOKEN_SECRET;
  if (!secret) return false;

  const dotIdx = token.lastIndexOf(".");
  if (dotIdx === -1) return false;

  const payload = token.slice(0, dotIdx);
  const sig = token.slice(dotIdx + 1);

  try {
    const key = await importKey(secret, "verify");
    const sigBytes = Uint8Array.from(atob(sig), (c) => c.charCodeAt(0));
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      new TextEncoder().encode(payload),
    );
    if (!valid) return false;

    const { iat } = JSON.parse(atob(payload)) as { iat: number };
    return Date.now() - iat < TOKEN_TTL_MS;
  } catch {
    return false;
  }
}
