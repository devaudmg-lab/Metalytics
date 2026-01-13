import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text, recipient_id, lead_id } = await req.json();

    // 1. Basic Validation
    if (!text || !recipient_id || !lead_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const pageAccessToken = process.env.META_PAGE_ACCESS_TOKEN;
    if (!pageAccessToken) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // 2. Send to Facebook Graph API
    // Hum sirf Meta ko message bhejenge. Database mein save karne ka kaam 
    // Webhook (Echo) apne aap kar lega jab message deliver hoga.
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


    return NextResponse.json({ 
      success: true, 
      fb_message_id: fbData.message_id 
    });

  } catch (err: any) {
    console.error("Send API Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}