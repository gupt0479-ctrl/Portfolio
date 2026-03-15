"use server";

import { auth } from "@clerk/nextjs/server";

export async function createSession(): Promise<string> {
  const { userId } = await auth();

  const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      workflow_id: process.env.NEXT_PUBLIC_CHATKIT_WORKFLOW_ID,
      external_user_id: userId ?? "anonymous",
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to create session: ${response.status} ${err}`);
  }

  const data = await response.json();
  return data.client_secret as string;
}
