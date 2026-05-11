import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export async function POST(req) {
  try {
    const body = await req.json();
    const userMessage = body.message;
    const chatId = body.chatId;
    const chatTitle = body.chatTitle || userMessage.slice(0, 30);
    const apiKey = process.env.GEMINI_API_KEY;
    const assistantInstructions = `
You are a smart, modern AI study assistant similar to ChatGPT.

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
- Keep tone friendly and professional.
`;

    if (!userMessage) {
      return Response.json(
        { reply: "Please send a message before asking the AI." },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return Response.json(
        { reply: "Gemini API key is missing. Add GEMINI_API_KEY to .env.local." },
        { status: 500 }
      );
    }

    // This is the Gemini REST endpoint for a single non-streaming AI response.
    const geminiUrl =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

    // Send the user's message to Gemini with clear style instructions.
    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${assistantInstructions}\n\nStudent question: ${userMessage}`,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json(
        {
          reply:
            data.error?.message ||
            "Gemini could not create a response. Please try again.",
        },
        { status: response.status }
      );
    }

    const aiReply =
      data.candidates?.[0]?.content?.parts
        ?.map((part) => part.text)
        .join("") || "Sorry, I could not create a response.";

    // Save the completed chat exchange after Gemini creates the reply.
    if (isSupabaseConfigured) {
      const { error: supabaseError } = await supabase.from("chats").insert([
        {
          user_message: userMessage,
          ai_reply: aiReply,
          chat_id: chatId,
          chat_title: chatTitle,
        },
      ]);

      if (supabaseError) {
        console.error("Supabase save error:", supabaseError.message);
      }
    } else {
      console.error(
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local."
      );
    }

    return Response.json({
      reply: aiReply,
    });
  } catch {
    return Response.json(
      { reply: "Something went wrong while contacting Gemini." },
      { status: 500 }
    );
  }
}
