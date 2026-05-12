import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // Fetch unique chats from chats table (not messages table)
    const { data, error } = await supabase
      .from("chats")
      .select("chat_id, chat_title, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Chats] Error fetching chats:", error.message);
      return Response.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log(`[Chats] ✅ Fetched ${data?.length || 0} unique chats`);

    return Response.json(data || []);
  } catch (error) {
    console.error("[Chats] Unexpected error:", error);
    return Response.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
}
