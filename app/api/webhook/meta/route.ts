import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createHmac, timingSafeEqual } from "crypto";

// --- 1. Security Verification ---
function verifySignature(payload: string, signature: string | null) {
  if (!signature) return false;
  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret) return false;

  const [algo, sig] = signature.split("=");
  const hmac = createHmac("sha256", appSecret);
  const digest = hmac.update(payload).digest("hex");
  
  try {
    return timingSafeEqual(Buffer.from(sig, "utf8"), Buffer.from(digest, "utf8"));
  } catch (e) {
    return false;
  }
}

// --- 2. GET Handler (Verification Handshake) ---
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

// --- 3. POST Handler (Main Logic) ---
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-hub-signature-256");

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const body = JSON.parse(rawBody);
  const supabase = await createClient();
  const entry = body.entry?.[0];

  try {
    // --- PART A: MESSENGER LOGIC ---
    if (entry?.messaging?.[0]) {
      const event = entry.messaging[0];
      const message = event.message;
      const messageText = message?.text;

      // Identify if this is a message sent BY the page (Echo) or TO the page
      const isEcho = !!message?.is_echo;
      
      /** * CRITICAL: If it's an echo, the 'sender' is the Page. 
       * The 'recipient' is the actual User (Lead).
       */
      const psid = isEcho ? event.recipient?.id : event.sender?.id;

      if (!psid || !messageText) {
        return NextResponse.json({ success: true, skip: "no_id_or_text" });
      }

      // Check if Lead already exists via PSID
      const { data: identity } = await supabase
        .from("meta_identities")
        .select("lead_id")
        .eq("messenger_psid", psid)
        .maybeSingle();

      let leadId = identity?.lead_id;

      if (!leadId) {
        // New User: Fetch details from Meta Graph API
        const token = process.env.META_PAGE_ACCESS_TOKEN;
        const res = await fetch(`https://graph.facebook.com/v24.0/${psid}?fields=first_name,last_name,profile_pic&access_token=${token}`);
        const profile = await res.json();
        
        const fullName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Messenger User";

        // Step 1: Insert into leads
        const { data: newLead, error: lErr } = await supabase
          .from("leads")
          .insert([{ full_name: fullName, source: "messenger" }])
          .select("id")
          .single();

        if (lErr) throw lErr;
        leadId = newLead.id;

        // Step 2: Create entry in meta_identities
        const { error: iErr } = await supabase
          .from("meta_identities")
          .insert([{
            lead_id: leadId,
            messenger_psid: psid,
            raw_metadata: profile
          }]);
        
        if (iErr) throw iErr;
      }

      // Step 3: Log Message in lead_messages
      // If isEcho is true, sender is "bot" (or "agent"), else "user"
      await supabase.from("lead_messages").insert([{
        lead_id: leadId,
        sender: isEcho ? "bot" : "user",
        message_text: messageText,
        metadata: { mid: message.mid }
      }]);
    }

    // --- PART B: META LEAD ADS (FORM) LOGIC ---
    else if (entry?.changes?.[0]?.value?.leadgen_id) {
      const leadgenId = entry.changes[0].value.leadgen_id;

      const { data: existingIdentity } = await supabase
        .from("meta_identities")
        .select("lead_id")
        .eq("meta_lead_id", leadgenId)
        .maybeSingle();

      if (!existingIdentity) {
        const token = process.env.META_PAGE_ACCESS_TOKEN;
        const res = await fetch(`https://graph.facebook.com/v24.0/${leadgenId}?access_token=${token}`);
        const leadDetails = await res.json();

        if (leadDetails.error) throw new Error(leadDetails.error.message);

        const findField = (names: string[]) => 
          leadDetails.field_data?.find((f: any) => names.includes(f.name.toLowerCase()))?.values?.[0] || "";

        const leadPayload = {
          full_name: findField(["full_name", "name", "first_name"]),
          email: findField(["email"]),
          phone: findField(["phone_number", "phone"]),
          city: findField(["city"]),
          postal_code: findField(["post_code", "postal_code", "zip"]),
          source: "meta_ad"
        };

        const { data: lead, error: lErr } = await supabase
          .from("leads")
          .insert([leadPayload])
          .select("id")
          .single();

        if (lErr) throw lErr;

        const { error: iErr } = await supabase
          .from("meta_identities")
          .insert([{
            lead_id: lead.id,
            meta_lead_id: leadgenId,
            raw_metadata: leadDetails
          }]);
        
        if (iErr) throw iErr;
      }
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("Webhook Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 200 });
  }
}