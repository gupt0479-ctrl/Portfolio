import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { signToken, verifyToken } from "@/lib/chat-token";

export async function GET(_req: NextRequest) {
  const cookieStore = await cookies();
  const existing = cookieStore.get("chat_token")?.value;

  if (existing && (await verifyToken(existing))) {
    return new NextResponse(null, { status: 200 });
  }

  const token = await signToken(Date.now());
  const res = new NextResponse(null, { status: 200 });
  res.cookies.set("chat_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 3600,
    path: "/",
  });
  return res;
}
