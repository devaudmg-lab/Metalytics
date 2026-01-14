import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text, recipient_wa_id, lead_id } = await req.json();

    // 1. Basic Validation
    if (!text || !recipient_wa_id || !lead_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // WhatsApp change env variables
    const waToken = process.env.META_WHATSAPP_BUSINESS_ACCOUNT_ID;
    const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID;

    if (!waToken || !phoneNumberId) {
      console.error("Missing WhatsApp Configuration");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // 2. Send to WhatsApp Business Cloud API
    // Endpoint format: https://graph.facebook.com/v24.0/{PHONE_NUMBER_ID}/messages
    const fbResponse = await fetch(
      `https://graph.facebook.com/v24.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${waToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: recipient_wa_id, // User ka phone number (e.g., "919876543210")
          type: "text",
          text: { 
            body: text,
            preview_url: false // Agar message mein link hai toh preview dikhana hai ya nahi
          },
        }),
      }
    );

    const fbData = await fbResponse.json();

    if (fbData.error) {
      console.error("WhatsApp API Error:", fbData.error);
      return NextResponse.json({ error: fbData.error.message }, { status: 400 });
    }

    // Messenger ki tarah hi, hum yahan DB mein save nahi kar rahe 
    // kyunki Webhook 'Echo' isey handle kar lega (agar aapne WhatsApp webhooks subscribe kiye hain).
    
    return NextResponse.json({ 
      success: true, 
      wa_message_id: fbData.messages?.[0]?.id 
    });

  } catch (err: any) {
    console.error("WhatsApp Send API Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}