import { dark } from "@clerk/themes";

export const clerkAppearance = {
  baseTheme: dark,
  variables: {
    colorBackground: "#0d1117",
    colorText: "#e2e8f0",
    colorTextSecondary: "#94a3b8",
    colorInputBackground: "#161b22",
    colorInputText: "#e2e8f0",
    colorPrimary: "#7c3aed",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "mx-auto w-full max-w-[420px]",
    cardBox: "mx-auto w-full shadow-none",
    card: "bg-[#0d1117] border border-white/10 shadow-[0_0_40px_rgba(124,58,237,0.08)]",
    headerTitle: "text-white",
    headerSubtitle: "text-slate-400",
    socialButtonsBlockButton:
      "border border-white/10 bg-white/5 text-white hover:bg-white/10",
    formFieldInput: "bg-slate-800 border-slate-700",
    formFieldLabel: "text-slate-300",
    formButtonPrimary:
      "bg-violet-600 hover:bg-violet-500 text-white shadow-none",
    footerActionLink: "text-violet-400 hover:text-violet-300",
  },
};
