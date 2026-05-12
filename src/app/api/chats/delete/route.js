import { supabase } from "@/lib/supabase";

// ─── DELETE /api/chats/delete ───────────────────────────────
export async function DELETE(req) {
  try {
    // Get chatId from query params
    const { searchParams } = new URL(req.url);

    const chatId = searchParams.get("chatId");

    // Validate chatId
    if (!chatId) {
      return Response.json(
        {
          success: false,
          error: "chatId is required",
        },
        {
          status: 400,
        }
      );
    }

    // Check if chat exists
    const { data: existingChats, error: fetchError } = await supabase
      .from("chats")
      .select("chat_id")
      .eq("chat_id", chatId);

    if (fetchError) {
      console.error("[DELETE] Fetch Error:", fetchError);

      return Response.json(
        {
          success: false,
          error: fetchError.message,
        },
        {
          status: 500,
        }
      );
    }

    // Chat not found
    if (!existingChats || existingChats.length === 0) {
      return Response.json(
        {
          success: false,
          error: "Chat not found",
        },
        {
          status: 404,
        }
      );
    }

    console.log("Deleting messages for:", chatId);

    // ─── STEP 1: Delete all related messages ─────────────────
    const { error: messagesDeleteError } = await supabase
      .from("messages")
      .delete()
      .eq("chat_id", chatId);

    if (messagesDeleteError) {
      console.error(
        "[DELETE] Messages Delete Error:",
        messagesDeleteError
      );

      return Response.json(
        {
          success: false,
          error: messagesDeleteError.message,
        },
        {
          status: 500,
        }
      );
    }

    console.log("Messages deleted successfully");

    console.log("Deleting chat row:", chatId);

    // ─── STEP 2: Delete chat from chats table ─────────────────
   const { data: deletedChat, error: chatDeleteError } = await supabase
  .from("chats")
  .delete()
  .eq("chat_id", chatId)
  .select();


    if (chatDeleteError) {
      console.error("[DELETE] Chat Delete Error:", chatDeleteError);

      return Response.json(
        {
          success: false,
          error: chatDeleteError.message,
        },
        {
          status: 500,
        }
      );
    }

    console.log("Deleted chat row:", deletedChat);

    // Success response
    return Response.json(
      {
        success: true,
        message: "Chat deleted successfully",
        chatId,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("[DELETE] Server Error:", error);

    return Response.json(
      {
        success: false,
        error: error.message || "Unexpected server error",
      },
      {
        status: 500,
      }
    );
  }
}