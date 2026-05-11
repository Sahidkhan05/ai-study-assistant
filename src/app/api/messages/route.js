import { supabase } from "@/lib/supabase";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const chatId = searchParams.get("chatId");

    if (!chatId) {
      return Response.json(
        {
          error: "Missing chatId",
        },
        {
          status: 400,
        }
      );
    }

    const { data, error } = await supabase
      .from("chats")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", {
        ascending: true,
      });

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

    return Response.json(data);
  } catch {
    return Response.json(
      {
        error: "An unexpected error occurred.",
      },
      {
        status: 500,
      }
    );
  }
}