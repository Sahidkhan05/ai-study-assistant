export default function ChatSidebar({
  conversations = [],
  activeChatId,
  onNewChat,
  onSelectChat,
}) {
  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-slate-200 bg-slate-950 text-white lg:w-72 lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-4">
        <div>
          <p className="text-base font-bold">AI Study Assistant</p>
          <p className="text-xs text-slate-400">Study smarter with AI</p>
        </div>
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-sm font-bold">
          AI
        </div>
      </div>

      <div className="p-4">
        <button
          type="button"
          onClick={onNewChat}
          className="w-full rounded-xl border border-white/15 px-4 py-3 text-left text-sm font-semibold transition hover:border-blue-400 hover:bg-white/10"
        >
          + New Chat
        </button>
      </div>

      <div className="min-h-0 flex-1 px-3 pb-4">
        <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Previous chats
        </p>

        <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden">
          {/* conversations has a default empty array, so map is always safe. */}
          {conversations.map((chat, index) => {
            const isActive = chat.chat_id === activeChatId;
            const conversationKey =
              chat.chat_id || `${chat.chat_title || "conversation"}-${index}`;

            return (
              <button
                key={conversationKey}
                type="button"
                onClick={() => {
                  if (chat.chat_id) {
                    onSelectChat(chat.chat_id);
                  }
                }}
                className={`min-w-52 rounded-xl px-3 py-3 text-left text-sm transition lg:min-w-0 ${
                  isActive
                    ? "bg-white text-slate-950"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <span className="block truncate font-medium">
                  {chat.chat_title}
                </span>
                <span className="mt-1 block truncate text-xs text-slate-500">
                  Saved conversation
                </span>
              </button>
            );
          })}

          
        </div>
      </div>
    </aside>
  );
}
