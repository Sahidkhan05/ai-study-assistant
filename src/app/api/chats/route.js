import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("chats")
      .select("chat_id, chat_title, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return Response.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Remove duplicate chats
    const uniqueChats = [];
    const seen = new Set();

    for (const chat of data) {
      if (!seen.has(chat.chat_id)) {
        seen.add(chat.chat_id);
        uniqueChats.push(chat);
      }
    }

    return Response.json(uniqueChats);
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
}