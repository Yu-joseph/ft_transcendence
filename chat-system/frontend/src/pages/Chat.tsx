import { ConversationList } from "../components/chat/ConversationList";
import { ChatInput } from "../components/chat/ChatInput";
import { ChatMessage } from "../components/chat/ChatMessage";

export function Chat() {
  return (
    <main className="h-full flex p-4 gap-4 overflow-hidden container mx-auto maximum-w-7xl">
      <ConversationList/>
      <section className="flex-1 flex flex-col bg-slate-800 backdrop-blur-md border border-blue-700 rounded-2xl shadow-xl overflow-hidden hover:border-amber-500 hover:scale-101 transition-all duration-300">
        <ChatMessage/>
        <ChatInput/>
      </section>
    </main>
  );
}
