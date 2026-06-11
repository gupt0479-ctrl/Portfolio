import { SignIn } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function SignInPage() {
  return (
    <main className="flex min-h-svh w-full items-center justify-center bg-[#07070d] px-4 py-12">
      <SignIn
        appearance={clerkAppearance}
        fallbackRedirectUrl="/studio"
        signUpUrl="/sign-up"
      />
    </main>
  );
}
