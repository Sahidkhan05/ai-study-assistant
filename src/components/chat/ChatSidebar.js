'use client';

import { useState, useRef, useEffect } from "react";
import { Edit2, Trash2, Check, X } from "lucide-react";
import ConfirmModal from "../ConfirmModal";
import Toast from "../Toast";

export default function ChatSidebar({
  conversations = [],
  activeChatId,
  onNewChat,
  onSelectChat,
  onUpdateChat,
  onDeleteChat,
}) {
  const [editingChatId, setEditingChatId] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [loadingChatId, setLoadingChatId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [toast, setToast] = useState(null);
  const inputRef = useRef(null);

  // Auto-focus input when editing starts
  useEffect(() => {
    if (editingChatId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingChatId]);

  const handleStartEdit = (event, chat) => {
    event.stopPropagation();
    setEditingChatId(chat.chat_id);
    setEditedTitle(chat.chat_title);
  };

  // FIX 1: handleCancelEdit no longer expects an event parameter.
  // Previously the Cancel button called handleCancelEdit with no args,
  // but the function did event.stopPropagation() — silent crash.
  const handleCancelEdit = () => {
    setEditingChatId(null);
    setEditedTitle("");
  };

  const handleSaveTitle = async (event, chat) => {
    event.stopPropagation();

    const trimmedTitle = editedTitle.trim();

    if (!trimmedTitle) {
      setToast({ message: "Title cannot be empty", type: "error" });
      return;
    }

    if (trimmedTitle === chat.chat_title) {
      // No change — just exit edit mode silently
      setEditingChatId(null);
      return;
    }

    setLoadingChatId(chat.chat_id);

    // FIX 2: Optimistic update — update parent state immediately so UI
    // feels instant. We'll roll back if the API call fails.
    if (onUpdateChat) {
      onUpdateChat(chat.chat_id, trimmedTitle);
    }

    try {
      // FIX 3: Correct endpoint — /api/chats/[chatId] with PATCH.
      // Previously called /api/chats/update which doesn't exist in
      // Next.js App Router dynamic routing.
      const response = await fetch("/api/chats/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        // FIX 4: chatId is now in the URL (route param), NOT in the body.
        // Only send chatTitle in the body.
        body: JSON.stringify({
  chatId: chat.chat_id,
  chatTitle: trimmedTitle,
}),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || `Server error: ${response.status}`);
      }

      // Confirm with the title the server actually saved
      if (onUpdateChat && data?.chat?.chat_title) {
        onUpdateChat(chat.chat_id, data.chat.chat_title);
      }

      setEditingChatId(null);
      setEditedTitle("");
      setToast({ message: "Chat title updated", type: "success" });

    } catch (error) {
      console.error("[Save] Failed to update title:", error);

      // FIX 5: Roll back the optimistic update on failure so the
      // sidebar doesn't show a wrong title after a failed save.
      if (onUpdateChat) {
        onUpdateChat(chat.chat_id, chat.chat_title);
      }

      setToast({ message: "Failed to update title. Please try again.", type: "error" });
    } finally {
      setLoadingChatId(null);
    }
  };

  const handleDeleteChat = async (chatId) => {
    setLoadingChatId(chatId);

    try {
      // FIX 6: Correct endpoint — /api/chats/[chatId] with DELETE.
      // Previously used /api/chats/delete?chatId= (query param) which
      // doesn't match the dynamic [chatId] route and won't work after refresh.
      const response = await fetch(`/api/chats/delete?chatId=${chatId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || `Server error: ${response.status}`);
      }

      setDeleteConfirmId(null);
      setToast({ message: "Chat deleted", type: "success" });

      if (onDeleteChat) {
        onDeleteChat(chatId);
      }

    } catch (error) {
      console.error("[Delete] Failed to delete chat:", error);
      setToast({ message: "Failed to delete chat. Please try again.", type: "error" });
    } finally {
      setLoadingChatId(null);
    }
  };

  const showDeleteConfirm = (event, chatId) => {
    event.stopPropagation();
    setDeleteConfirmId(chatId);
  };

  return (
    <>
      <aside className="flex w-full shrink-0 flex-col border-b border-slate-200 bg-gradient-to-b from-slate-900 to-slate-950 text-white lg:w-72 lg:border-b-0 lg:border-r lg:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-800 px-4 py-4">
          <div>
            <p className="text-base font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              AI Study Assistant
            </p>
            <p className="text-xs text-slate-400">Study smarter with AI</p>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-sm font-bold shadow-lg">
            AI
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            type="button"
            onClick={onNewChat}
            className="w-full rounded-lg border border-blue-500/50 bg-blue-600/10 px-4 py-3 text-left text-sm font-semibold text-blue-300 transition-all hover:border-blue-400 hover:bg-blue-600/20 active:scale-95"
          >
            + New Chat
          </button>
        </div>

        {/* Conversations List */}
        <div className="min-h-0 flex-1 px-3 pb-4 overflow-hidden">
          <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Previous Chats
          </p>

          <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden">
            {conversations.length === 0 ? (
              <p className="px-3 py-2 text-xs text-slate-500 text-center">
                No chats yet
              </p>
            ) : (
              // FIX 7: Removed the .reduce() deduplication entirely.
              // Deduplication must be fixed at the source (DB query + parent
              // state). Masking it here hides real bugs and wastes a render.
              // Each chat_id in the DB is now a true primary key — unique.
              conversations.map((chat, index) => {
                const isActive = chat.chat_id === activeChatId;
                const isEditing = editingChatId === chat.chat_id;
                const isLoading = loadingChatId === chat.chat_id;

                return (
                  // FIX 8: Key is purely chat_id — clean, stable, and unique.
                  // Using chat_id + index was masking duplicate data issues.
                  <div
                    key={`${chat.chat_id}-${index}`}
                    onClick={() => {
                      if (!isEditing) onSelectChat(chat.chat_id);
                    }}
                    className={`group min-w-52 rounded-lg px-3 py-3 text-left text-sm transition-all lg:min-w-0 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600/20 to-cyan-600/10 border border-blue-500/50 text-slate-100 shadow-md"
                        : "text-slate-300 hover:bg-slate-800/50 border border-transparent hover:border-slate-700"
                    } ${isEditing ? "bg-slate-800/50" : "cursor-pointer"}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      {/* Chat Title or Edit Input */}
                      {isEditing ? (
                        <input
                          ref={inputRef}
                          type="text"
                          value={editedTitle}
                          onChange={(e) => setEditedTitle(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveTitle(e, chat);
                            if (e.key === "Escape") handleCancelEdit();
                          }}
                          className="w-full rounded-md bg-slate-700 px-2 py-1 text-sm text-white outline-none ring-2 ring-blue-500/50 focus:ring-blue-500 transition-all"
                          placeholder="Enter chat title..."
                        />
                      ) : (
                        <span className="block truncate font-medium text-slate-100 group-hover:text-white transition-colors">
                          {chat.chat_title}
                        </span>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={(e) => handleSaveTitle(e, chat)}
                              disabled={isLoading}
                              title="Save title (Enter)"
                              className="p-1.5 rounded-md bg-green-600/20 text-green-400 hover:bg-green-600/30 hover:text-green-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-90"
                            >
                              {isLoading ? (
                                <div className="w-4 h-4 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </button>

                            {/* FIX 1 applied here: no event passed to handleCancelEdit */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelEdit();
                              }}
                              disabled={isLoading}
                              title="Cancel editing (Esc)"
                              className="p-1.5 rounded-md bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-slate-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-90"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={(e) => handleStartEdit(e, chat)}
                              title="Edit title"
                              className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 bg-slate-700/50 text-slate-400 hover:bg-blue-600/30 hover:text-blue-400 transition-all active:scale-90"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => showDeleteConfirm(e, chat.chat_id)}
                              disabled={isLoading}
                              title="Delete chat"
                              className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 bg-slate-700/50 text-slate-400 hover:bg-red-600/30 hover:text-red-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-90"
                            >
                              {isLoading ? (
                                <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Metadata */}
                    {!isEditing && (
                      <span className="mt-1 block truncate text-xs text-slate-500 group-hover:text-slate-400 transition-colors">
                        {new Date(chat.created_at || new Date()).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" }
                        )}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </aside>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirmId}
        title="Delete Chat?"
        description="This action cannot be undone. The chat history will be permanently removed."
        cancelText="Cancel"
        confirmText="Delete"
        isLoading={loadingChatId === deleteConfirmId}
        isDangerous={true}
        onCancel={() => setDeleteConfirmId(null)}
        onConfirm={() => handleDeleteChat(deleteConfirmId)}
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
