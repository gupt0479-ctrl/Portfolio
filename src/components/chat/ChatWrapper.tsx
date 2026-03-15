import Chat from "@/components/chat/Chat";
import { sanityFetch } from "@/sanity/lib/live";
import { CHAT_PROFILE_QUERY } from "@/sanity/lib/queries";
import type { PROFILE_QUERYResult } from "@/sanity/types";
import SidebarToggle from "../SidebarToggle";

async function ChatWrapper() {
  const { data: profile } = await sanityFetch({ query: CHAT_PROFILE_QUERY });

  return (
    <div className="h-full w-full">
      <div className="md:hidden p-2 sticky top-0 z-10">
        <SidebarToggle />
      </div>

      <Chat profile={profile as unknown as PROFILE_QUERYResult | null} />
    </div>
  );
}

export default ChatWrapper;
