"use client";

import ChatSidebar from "@/components/chat/ChatSidebar";
import MarkdownMessage from "@/components/chat/MarkdownMessage";
import TypingDots from "@/components/chat/TypingDots";
import { useEffect, useRef, useState } from "react";

const starterMessage = {
  id: "welcome-message",
  sender: "ai",
  text: "Hi! I am your AI study assistant. Ask me a topic, homework question, or revision prompt.",
};

const firstChat = {
  chat_id: "chat-1",
  chat_title: "Study Chat",
  messages: [starterMessage],
};

const emptyMessages = [];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [conversations, setConversations] = useState([firstChat]);
  const [activeChatId, setActiveChatId] = useState(firstChat.chat_id);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const chatEndRef = useRef(null);

  const activeChat =
    conversations.find((chat) => chat.chat_id === activeChatId) ||
    conversations[0];
  const messages = activeChat?.messages || emptyMessages;
  const isBusy = isLoading || isStreaming;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, isStreaming]);

  const updateActiveChat = (updateChat) => {
    setConversations((previousConversations) =>
      previousConversations.map((chat) =>
        chat.chat_id === activeChatId ? updateChat(chat) : chat
      )
    );
  };

  const addMessage = (newMessage) => {
    updateActiveChat((chat) => ({
      ...chat,
      chat_title:
        newMessage.sender === "user" && chat.messages.length === 1
          ? newMessage.text.slice(0, 34)
          : chat.chat_title,
      messages: [...chat.messages, newMessage],
    }));
  };

  const updateMessageText = (messageId, text) => {
    updateActiveChat((chat) => ({
      ...chat,
      messages: chat.messages.map((chatMessage) =>
        chatMessage.id === messageId ? { ...chatMessage, text } : chatMessage
      ),
    }));
  };

  const streamAiReply = async (fullReply, messageId) => {
    setIsStreaming(true);

    for (let index = 0; index <= fullReply.length; index += 3) {
      updateMessageText(messageId, fullReply.slice(0, index));
      await wait(12);
    }

    updateMessageText(messageId, fullReply);
    setIsStreaming(false);
  };

  const handleNewChat = () => {
    const newChat = {
      chat_id: `chat-${Date.now()}`,
      chat_title: "New Study Chat",
      messages: [
        {
          ...starterMessage,
          id: `welcome-${Date.now()}`,
        },
      ],
    };

    setConversations((previousConversations) => [
      newChat,
      ...previousConversations,
    ]);
    setActiveChatId(newChat.chat_id);
    setMessage("");
  };

  const handleSend = async () => {
    const userText = message.trim();

    if (!userText || isBusy) {
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: userText,
    };

    addMessage(userMessage);
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userText,
          chatId: activeChat.chat_id,
          chatTitle: activeChat.chat_title,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      const aiText = data.reply || "Sorry, I could not create a response.";
      const aiMessageId = `ai-${Date.now()}`;

      setIsLoading(false);

      addMessage({
        id: aiMessageId,
        sender: "ai",
        text: "",
      });

      await streamAiReply(aiText, aiMessageId);
    } catch {
      setIsLoading(false);

      addMessage({
        id: `error-${Date.now()}`,
        sender: "ai",
        text: "Something went wrong. Please try again.",
      });
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSend();
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 px-3 py-4 text-slate-950 sm:px-5 lg:px-8">
      <section className="mx-auto flex h-[calc(100vh-6rem)] min-h-[640px] w-full max-w-7xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl lg:flex-row">
        <ChatSidebar
          conversations={conversations}
          activeChatId={activeChatId}
          onNewChat={handleNewChat}
          onSelectChat={setActiveChatId}
        />

        <div className="flex min-w-0 flex-1 flex-col bg-white">
          <div className="border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
            <p className="text-sm font-medium text-blue-600">AI Assistant</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              {activeChat.chat_title}
            </h1>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto bg-slate-50 px-4 py-6 scroll-smooth sm:px-6">
            {messages.map((chatMessage) => {
              const isUser = chatMessage.sender === "user";

              return (
                <div
                  key={chatMessage.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[92%] rounded-2xl px-4 py-3 shadow-sm transition sm:max-w-[78%] ${
                      isUser
                        ? "rounded-br-sm bg-blue-600 text-white"
                        : "rounded-bl-sm border border-slate-200 bg-white text-slate-800"
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap text-sm leading-6 sm:text-base">
                        {chatMessage.text}
                      </p>
                    ) : (
                      <MarkdownMessage text={chatMessage.text} />
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <TypingDots />
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          <div className="border-t border-slate-200 bg-white p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="min-h-12 flex-1 rounded-2xl border border-slate-300 bg-white px-4 text-base outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

              <button
                type="button"
                onClick={handleSend}
                disabled={isBusy || message.trim() === ""}
                className="min-h-12 rounded-2xl bg-blue-600 px-6 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isBusy ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
