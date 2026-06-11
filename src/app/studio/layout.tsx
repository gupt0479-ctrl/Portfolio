export { metadata, viewport } from "next-sanity/studio";

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 h-svh w-full overflow-hidden bg-[#101112]">
      {children}
    </div>
  );
}
