import { supabase } from "@/lib/supabase";

export async function PATCH(req) {
  try {
    const body = await req.json();

    const { chatId, chatTitle } = body;

    if (!chatId || !chatTitle) {
      return Response.json(
        {
          error: "chatId and chatTitle are required",
        },
        {
          status: 400,
        }
      );
    }

    const { error } = await supabase
      .from("chats")
      .update({
        chat_title: chatTitle,
      })
      .eq("chat_id", chatId);

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

    return Response.json({
      success: true,
      message: "Chat title updated successfully",
    });
  } catch {
    return Response.json(
      {
        error: "Failed to update chat title",
      },
      {
        status: 500,
      }
    );
  }
}