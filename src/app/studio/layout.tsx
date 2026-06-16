import { auth } from "@clerk/nextjs/server";

export { metadata, viewport } from "next-sanity/studio";

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await auth.protect();

  return (
    <div className="fixed inset-0 z-50 h-svh w-full overflow-hidden bg-[#101112]">
      {children}
    </div>
  );
}
