import Chat from "@/components/chat/Chat";
import { sanityFetch } from "@/sanity/lib/live";
import { CHAT_PROFILE_QUERY } from "@/sanity/lib/queries";

async function ChatWrapper() {
  const { data: profile } = await sanityFetch({ query: CHAT_PROFILE_QUERY });

  return (
    <div className="chat-wrapper h-full w-full">
      <Chat profile={profile} />
    </div>
  );
}

export default ChatWrapper;
