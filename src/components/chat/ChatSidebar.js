import { useState } from "react";

export default function ChatSidebar({
  conversations = [],
  activeChatId,
  onNewChat,
  onSelectChat,
}) {
  const [editingChatId, setEditingChatId] = useState(null);

  const [editedTitle, setEditedTitle] = useState("");

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
          {conversations.map((chat, index) => {
            const isActive = chat.chat_id === activeChatId;

            const conversationKey =
              chat.chat_id ||
              `${chat.chat_title || "conversation"}-${index}`;

            return (
              <div
                key={conversationKey}
                onClick={() => {
                  if (chat.chat_id) {
                    onSelectChat(chat.chat_id);
                  }
                }}
                className={`min-w-52 cursor-pointer rounded-xl px-3 py-3 text-left text-sm transition lg:min-w-0 ${
                  isActive
                    ? "bg-white text-slate-950"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  {editingChatId === chat.chat_id ? (
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(event) =>
                        setEditedTitle(event.target.value)
                      }
                      onClick={(event) => event.stopPropagation()}
                      className="w-full rounded bg-slate-200 px-2 py-1 text-sm text-black outline-none"
                    />
                  ) : (
                    <span className="block truncate font-medium">
                      {chat.chat_title}
                    </span>
                  )}

                  <div className="flex items-center gap-2">
                    {editingChatId === chat.chat_id ? (
                      <button
                        type="button"
                        onClick={async (event) => {
                          console.log("SAVE CLICKED");
                          event.stopPropagation();
                          console.log("SAVE CLICKED");

                          try {
                          const response = await fetch("/api/chats/update", {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    chatId: chat.chat_id,
    chatTitle: editedTitle,
  }),
});

const data = await response.json();

console.log(data);

                            window.location.reload();
                          } catch (error) {
                            console.error(
                              "Failed to update title:",
                              error
                            );
                          }
                        }}
                        className="text-xs text-green-400 hover:text-green-300"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();

                          setEditingChatId(chat.chat_id);

                          setEditedTitle(chat.chat_title);
                        }}
                        className="text-xs text-blue-400 hover:text-blue-300"
                      >
                        ✏️
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={async(event) => {
                        event.stopPropagation();

                        try { await fetch("/api/chats/delete", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chatId: chat.chat_id,
    }),
  });

  window.location.reload();
} catch (error) {
  console.error("Failed to delete chat:", error);
}
                      }}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <span className="mt-1 block truncate text-xs text-slate-500">
                  Saved conversation
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}