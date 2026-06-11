import { SignUp } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function SignUpPage() {
  return (
    <main className="flex min-h-svh w-full items-center justify-center bg-[#07070d] px-4 py-12">
      <SignUp
        appearance={clerkAppearance}
        fallbackRedirectUrl="/studio"
        signInUrl="/sign-in"
      />
    </main>
  );
}
