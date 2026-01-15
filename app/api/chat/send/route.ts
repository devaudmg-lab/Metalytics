import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { sendWhatsAppText } from "@/utils/metaApi";

export async function POST(req: NextRequest) {
  try {
    const { leadId, message } = await req.json();
    const supabase = await createClient();

    // 1. Fetch Lead to get Phone Number & Check Session
    const { data: lead, error: leadErr } = await supabase
      .from("leads")
      .select("id, phone, last_interaction_at")
      .eq("id", leadId)
      .single();

    if (leadErr || !lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    if (!lead.phone) {
      return NextResponse.json({ error: "Lead has no phone number" }, { status: 400 });
    }

    // 2. Check 24-Hour Rule
    const lastInteraction = lead.last_interaction_at ? new Date(lead.last_interaction_at) : null;
    const now = new Date();
    const diffHours = lastInteraction
      ? (now.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60)
      : 999;

    if (diffHours > 24) {
      return NextResponse.json(
        { error: "Session Expired. Please send a template." },
        { status: 403 }
      );
    }

    // 3. Send Message via Meta API
    const metaRes = await sendWhatsAppText(lead.phone, message);
    const waMessageId = metaRes.messages?.[0]?.id;

    // 4. Log to DB
    const { error: dbErr } = await supabase.from("lead_messages").insert([
      {
        lead_id: lead.id,
        sender: "page", // Sent by us
        message_text: message,
        wa_message_id: waMessageId,
        status: "sent",
        direction: "outbound",
        type: "text"
      },
    ]);

    if (dbErr) throw dbErr;

    return NextResponse.json({ success: true, waMessageId });

  } catch (error: any) {
    console.error("Send Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}