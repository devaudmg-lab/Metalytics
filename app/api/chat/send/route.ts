import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
    try {
        const { text, recipient_id, lead_id } = await req.json();

        // Basic validation
        if (!text || !recipient_id || !lead_id) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const pageAccessToken = process.env.META_PAGE_ACCESS_TOKEN;
        if (!pageAccessToken) {
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        // 1. Send to Facebook Graph API
        const fbResponse = await fetch(
            `https://graph.facebook.com/v24.0/me/messages?access_token=${pageAccessToken}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    recipient: { id: recipient_id },
                    message: { text: text },
                }),
            }
        );

        const fbData = await fbResponse.json();

        if (fbData.error) {
            console.error("Facebook API Error:", fbData.error);
            return NextResponse.json({ error: fbData.error.message }, { status: 400 });
        }

        // 2. Log to Database (Hume pata hai 'page' sender hai)
        const supabase = await createClient();
        const { error: dbError } = await supabase.from("lead_messages").insert([
            {
                lead_id: lead_id,
                sender: "page", // Aapki table constraint ('user' or 'page')
                message_text: text,
            },
        ]);

        if (dbError) {
            console.error("Database Log Error:", dbError);
            // Hint: Yahan aap Sentry ya koi alert system laga sakte hain
        }

        return NextResponse.json({ 
            success: true, 
            fb_message_id: fbData.message_id 
        });

    } catch (err: any) {
        console.error("Send API Error:", err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}