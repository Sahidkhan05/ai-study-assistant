import { supabase } from "@/lib/supabase";

export async function GET() {
    try {
        const { data , error}  = await supabase
        .from("chats")
        .select("*")
        .order("created_at",
            { ascending: true }
        )

        if(error) 
        {
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