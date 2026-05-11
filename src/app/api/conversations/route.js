import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("chats")
      .select("chat_id, chat_title, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return Response.json(
        {
          error: error.message,
        },
        {
          status: 500,
        }
      );
    }

    const uniqueChats = [];

    const addedChatIds = new Set();

    data.forEach((chat) => {
      if (!addedChatIds.has(chat.chat_id)) {
        addedChatIds.add(chat.chat_id);

        uniqueChats.push(chat);
      }
    });

    return Response.json(uniqueChats);
  } catch {
    return Response.json(
      {
        error: "Failed to fetch conversations",
      },
      {
        status: 500,
      }
    );
  }
}