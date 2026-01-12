import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createHmac, timingSafeEqual } from "crypto";

/**
 * Verify request signature from Meta
 */
function verifySignature(payload: string, signature: string | null) {
  if (!signature) return false;

  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret) return false;

  const [, sig] = signature.split("=");
  const hmac = createHmac("sha256", appSecret);
  const digest = hmac.update(payload).digest("hex");

  return timingSafeEqual(Buffer.from(sig), Buffer.from(digest));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  if (
    searchParams.get("hub.mode") === "subscribe" &&
    searchParams.get("hub.verify_token") === process.env.META_VERIFY_TOKEN
  ) {
    return new NextResponse(searchParams.get("hub.challenge"), { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-hub-signature-256");

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const body = JSON.parse(rawBody);
  const supabase = await createClient();

  console.log(body);
  

  try {
    const messagingEvent = body.entry?.[0]?.messaging?.[0];

    if (
      messagingEvent &&
      messagingEvent.sender?.id &&
      messagingEvent.message &&
      !messagingEvent.message.is_echo
    ) {
      const senderPsid = messagingEvent.sender.id;

      // Ensure numeric PSID
      if (!/^\d+$/.test(senderPsid)) {
        console.warn("Skipping invalid sender id:", senderPsid);
        return NextResponse.json({ skipped: true });
      }

      const messageText = messagingEvent.message.text || "";
      const graphToken = process.env.META_PAGE_ACCESS_TOKEN;

      if (!graphToken) {
        throw new Error("Missing META_PAGE_ACCESS_TOKEN");
      }

      // Check existing lead
      const { data: existingLead } = await supabase
        .from("leads")
        .select("*")
        .eq("messenger_psid", senderPsid)
        .maybeSingle();

      let leadId = existingLead?.id;
      let profile: any = {};
      let fullName = "Messenger User";

      if (!existingLead) {
        try {
          const profileRes = await fetch(
            `https://graph.facebook.com/v24.0/${senderPsid}?fields=first_name,last_name,profile_pic&access_token=${graphToken}`
          );
          const profileJson = await profileRes.json();

          if (!profileJson.error) {
            profile = profileJson;
            fullName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim();
          }
        } catch (e) {
          console.error("Profile fetch failed:", e);
        }

        const { data: newLead, error } = await supabase
          .from("leads")
          .insert([
            {
              full_name: fullName,
              messenger_psid: senderPsid,
              raw_data: { source: "messenger", profile }
            }
          ])
          .select()
          .single();

        if (error) throw error;
        leadId = newLead.id;
      }

      if (messageText) {
        await supabase.from("lead_messages").insert([
          {
            lead_id: leadId,
            sender: "user",
            message_text: messageText
          }
        ]);
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ ignored: true });

  } catch (err: any) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: err.message }, { status: 200 });
  }
}
