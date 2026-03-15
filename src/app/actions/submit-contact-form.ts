"use server";

import { serverClient } from "@/sanity/lib/server-client";

export async function submitContactForm(
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return { success: false, error: "Name, email and message are required." };
  }

  try {
    await serverClient.create({
      _type: "contact",
      name: name.trim(),
      email: email.trim(),
      subject: subject?.trim() ?? "",
      message: message.trim(),
      status: "new",
      submittedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    console.error("Contact form submission error:", error);
    return { success: false, error: "Failed to submit. Please try again." };
  }
}
