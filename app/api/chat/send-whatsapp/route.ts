import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { text, recipient_wa_id, lead_id, media_url } = await req.json();

    if ((!text && !media_url) || !recipient_wa_id || !lead_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const waToken = process.env.META_ACCESS_TOKEN;
    const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID;

    let messagePayload: any = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipient_wa_id,
    };

    // --- Logic: Detect if media is Video or Image ---
    let mediaType: "text" | "image" | "video" = "text";
    
    if (media_url) {
      // Extension check karein
      const isVideo = media_url.match(/\.(mp4|mov|webm|m4v)/i);
      mediaType = isVideo ? "video" : "image";

      messagePayload.type = mediaType;
      messagePayload[mediaType] = {
        link: media_url,
        caption: text || "" 
      };
    } else {
      messagePayload.type = "text";
      messagePayload.text = { body: text, preview_url: false };
    }

    const fbResponse = await fetch(
      `https://graph.facebook.com/v24.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${waToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messagePayload),
      }
    );

    const fbData = await fbResponse.json();

    if (fbData.error) {
      console.error("WhatsApp API Error:", fbData.error);
      return NextResponse.json({ error: fbData.error.message }, { status: 400 });
    }

    const supabase = await createClient();
    const { error: dbError } = await supabase.from("lead_messages").insert([
      {
        lead_id: lead_id,
        sender: "page",
        message_text: text || (mediaType === "video" ? "[Sent a video]" : mediaType === "image" ? "[Sent an image]" : ""),
        metadata: { 
          wa_message_id: fbData.messages?.[0]?.id,
          media_url: media_url,
          media_type: mediaType // Save type to help frontend
        },
      },
    ]);

    if (dbError) console.error("DB Log Fail:", dbError.message);

    return NextResponse.json({
      success: true,
      wa_message_id: fbData.messages?.[0]?.id,
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}