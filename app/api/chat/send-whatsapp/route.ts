import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { text, recipient_wa_id, lead_id } = await req.json();

    // 1. Basic Validation
    if (!text || !recipient_wa_id || !lead_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const waToken = process.env.META_ACCESS_TOKEN;
    const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID;

    if (!waToken || !phoneNumberId) {
      console.error("Missing WhatsApp Configuration");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // 2. Send to WhatsApp Business Cloud API
    const fbResponse = await fetch(
      `https://graph.facebook.com/v24.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${waToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: recipient_wa_id,
          type: "text",
          text: {
            body: text,
            preview_url: false,
          },
        }),
      }
    );

    const fbData = await fbResponse.json();

    if (fbData.error) {
      console.error("WhatsApp API Error:", fbData.error);
      return NextResponse.json(
        { error: fbData.error.message },
        { status: 400 }
      );
    }

    // --- 3. SAVE TO DATABASE (Because WhatsApp won't echo this back) ---
    const supabase = await createClient();

    // We log this as sender: 'page' (or 'admin') so it appears on the right side of your chat UI
    const { error: dbError } = await supabase.from("lead_messages").insert([
      {
        lead_id: lead_id,
        sender: "page",
        message_text: text,
        // Optional: store the WhatsApp message ID for status tracking (sent/delivered/read)
        // metadata: { wa_message_id: fbData.messages?.[0]?.id }
      },
    ]);

    if (dbError) {
      console.error("Database logging failed:", dbError.message);
      // We don't return an error here because the message WAS sent to the user successfully
    }

    return NextResponse.json({
      success: true,
      wa_message_id: fbData.messages?.[0]?.id,
    });
  } catch (err: any) {
    console.error("WhatsApp Send API Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
