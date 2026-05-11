import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export async function POST(req) {
  console.log("📨 POST /api/chat called");

  try {
    // 1. Parse request body
    let body;
    try {
      body = await req.json();
      console.log("✅ Request body parsed:", { 
        message: body.message ? `${body.message.slice(0, 50)}...` : null,
        chatId: body.chatId,
        chatTitle: body.chatTitle
      });
    } catch (parseError) {
      console.error("❌ Failed to parse request body:", parseError.message);
      return Response.json(
        { reply: "Invalid request format. Please send a valid JSON body." },
        { status: 400 }
      );
    }

    const userMessage = body.message;
    const chatId = body.chatId;
    const chatTitle = body.chatTitle || userMessage?.slice(0, 30);

    // 2. Validate required fields
    if (!userMessage || typeof userMessage !== "string") {
      console.warn("⚠️ Empty or invalid message received");
      return Response.json(
        { reply: "Please send a valid message." },
        { status: 400 }
      );
    }

    if (!chatId) {
      console.warn("⚠️ Missing chatId");
      return Response.json(
        { reply: "Missing chat ID." },
        { status: 400 }
      );
    }

    // 3. Check OpenRouter API Key
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error("❌ OPENROUTER_API_KEY is not set in environment variables");
      return Response.json(
        {
          reply:
            "Server configuration error: OpenRouter API key missing. Contact support.",
        },
        { status: 500 }
      );
    }
    console.log("✅ OpenRouter API key found");

    // 4. Prepare system instructions
    const assistantInstructions = `You are a smart, modern AI study assistant similar to ChatGPT.

Rules:
- Give clean, human-like responses.
- Avoid unnecessary introductions.
- Keep answers concise but useful.
- Use simple explanations first.
- Use proper markdown formatting.
- Use headings and bullet points only when useful.
- If code is needed, provide clean code blocks.
- Do not over-explain basic concepts.
- Respond naturally like a real assistant.
- Avoid repetitive analogies unless asked.
- Make responses easy to read inside a chat UI.
- Prefer practical examples over long theory.
- Keep tone friendly and professional.`;

    // 5. Call OpenRouter API
    console.log("🚀 Calling OpenRouter API with model: google/gemini-2.0-flash-exp:free");
    const openRouterResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://ai-study-assistant.com",
          "X-Title": "AI Study Assistant",
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: assistantInstructions,
            },
            {
              role: "user",
              content: userMessage,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      }
    );

    console.log("📤 OpenRouter response status:", openRouterResponse.status);

    // 6. Parse OpenRouter response
    let openRouterData;
    try {
      openRouterData = await openRouterResponse.json();
      console.log("✅ OpenRouter response parsed");
    } catch (parseError) {
      console.error("❌ Failed to parse OpenRouter response:", parseError.message);
      return Response.json(
        { reply: "AI service returned invalid response. Please try again." },
        { status: 502 }
      );
    }

    // 7. Check for API errors
    if (!openRouterResponse.ok) {
      console.error("❌ OpenRouter API error:", {
        status: openRouterResponse.status,
        error: openRouterData.error,
      });

      let errorMessage = "AI service error. ";
      if (openRouterData.error?.message) {
        errorMessage += openRouterData.error.message;
      } else if (openRouterResponse.status === 429) {
        errorMessage = "Rate limited. Please wait a moment and try again.";
      } else if (openRouterResponse.status === 401 || openRouterResponse.status === 403) {
        errorMessage = "Authentication error with AI service.";
      }

      return Response.json(
        { reply: errorMessage },
        { status: openRouterResponse.status }
      );
    }

    // 8. Extract AI response
    const aiReply =
      openRouterData.choices?.[0]?.message?.content ||
      "Sorry, I could not generate a response.";

    console.log("✅ AI response generated:", `${aiReply.slice(0, 50)}...`);

    // 9. Save to Supabase (non-blocking)
    if (isSupabaseConfigured) {
      try {
        const { error: supabaseError } = await supabase.from("chats").insert([
          {
            user_message: userMessage,
            ai_reply: aiReply,
            chat_id: chatId,
            chat_title: chatTitle,
          },
        ]);

        if (supabaseError) {
          console.warn("⚠️ Supabase save error:", supabaseError.message);
        } else {
          console.log("✅ Chat saved to Supabase");
        }
      } catch (supabaseError) {
        console.warn("⚠️ Supabase error (non-blocking):", supabaseError.message);
      }
    } else {
      console.warn("⚠️ Supabase not configured - chat not saved to database");
    }

    // 10. Return success response
    console.log("✅ Returning AI response to client");
    return Response.json(
      { reply: aiReply },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Unexpected error in /api/chat:", error);
    return Response.json(
      { 
        reply: "Something went wrong. Please try again.",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET(req) {
  console.log("🏥 GET /api/chat called (health check)");
  return Response.json({
    status: "ok",
    message: "Chat API is running. Use POST to send messages.",
  });
}