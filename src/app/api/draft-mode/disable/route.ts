import { draftMode } from "next/headers";

export async function POST() {
  (await draftMode()).disable();
  return new Response(null, { status: 204 });
}
