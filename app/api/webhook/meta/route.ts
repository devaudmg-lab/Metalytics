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
  return timingSafeEqual(Buffer.from(sig, "utf8"), Buffer.from(digest, "utf8"));
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

  console.log("hello");

  const body = JSON.parse(rawBody);
  const supabase = await createClient();
  const entry = body.entry?.[0];

  console.log("this is the entry = ", entry);

  try {
    // --- PART A: MESSENGER LOGIC ---
    if (entry?.messaging?.[0]) {
      const event = entry.messaging[0];
      console.log("this is the event = ", event);

      const messageText = event.message?.text;

      const isEcho = event.message?.is_echo;
      const psid = isEcho ? event.recipient?.id : event.sender?.id;

      console.log("this is the event = ", isEcho);

      // Ignore echoes (messages sent by the page itself)
      if (!psid) {
        return NextResponse.json({ success: true, skip: "no_id" });
      }

      // Check if PSID already exists in meta_identities
      const { data: identity } = await supabase
        .from("meta_identities")
        .select("lead_id")
        .eq("messenger_psid", psid)
        .maybeSingle();

      let leadId = identity?.lead_id;

      if (!leadId) {
        // Naya Messenger User: Fetch details from Meta Graph API
        const token = process.env.META_PAGE_ACCESS_TOKEN;
        const res = await fetch(
          `https://graph.facebook.com/v24.0/${psid}?fields=first_name,last_name,profile_pic&access_token=${token}`
        );
        const profile = await res.json();

        const fullName =
          `${profile.first_name || ""} ${profile.last_name || ""}`.trim() ||
          "Messenger User";

        // Step 1: Insert into leads (Database Trigger automatic check karega postal_code)
        const { data: newLead, error: lErr } = await supabase
          .from("leads")
          .insert([{ full_name: fullName, source: "messenger" }])
          .select("id")
          .single();

        if (lErr) throw lErr;
        leadId = newLead.id;

        // Step 2: Create entry in meta_identities
        const { error: iErr } = await supabase.from("meta_identities").insert([
          {
            lead_id: leadId,
            messenger_psid: psid,
            raw_metadata: profile,
          },
        ]);

        if (iErr) throw iErr;
      }

      // Step 3: Log Message in lead_messages
      if (messageText) {
        await supabase.from("lead_messages").insert([
          {
            lead_id: leadId,
            sender: isEcho ? "page" : "user",
            message_text: messageText,
          },
        ]);
      }
    }

    // --- PART B: META LEAD ADS (FORM) LOGIC ---
    else if (entry?.changes?.[0]?.value?.leadgen_id) {
      const leadgenId = entry.changes[0].value.leadgen_id;

      console.log("this is the leadgenId Meta_Lead = ",leadgenId);

      // Check if this lead was already processed
      const { data: existingIdentity } = await supabase
        .from("meta_identities")
        .select("lead_id")
        .eq("meta_lead_id", leadgenId)
        .maybeSingle();

      if (!existingIdentity) {
        // Fetch Lead Details using leadgen_id
        const token = process.env.META_PAGE_ACCESS_TOKEN;
        const res = await fetch(
          `https://graph.facebook.com/v24.0/${leadgenId}?access_token=${token}`
        );
        const leadDetails = await res.json();

        if (leadDetails.error) throw new Error(leadDetails.error.message);

        // Map form fields (adjust names based on your Facebook Form setup)
        const findField = (names: string[]) =>
          leadDetails.field_data?.find((f: any) =>
            names.includes(f.name.toLowerCase())
          )?.values?.[0] || "";

        const leadPayload = {
          full_name: findField(["full_name", "name", "first_name"]),
          email: findField(["email"]),
          phone: findField(["phone_number", "phone"]),
          city: findField(["city"]),
          postal_code: findField(["post_code", "postal_code", "zip"]),
          source: "meta_ad", // Set source automatically
        };

        // Step 1: Insert into leads
        const { data: lead, error: lErr } = await supabase
          .from("leads")
          .insert([leadPayload])
          .select("id")
          .single();

        if (lErr) throw lErr;

        // Step 2: Insert into meta_identities
        const { error: iErr } = await supabase.from("meta_identities").insert([
          {
            lead_id: lead.id,
            meta_lead_id: leadgenId,
            raw_metadata: leadDetails,
          },
        ]);

        if (iErr) throw iErr;
      }
    }

    // --- PART C: WHATSAPP LOGIC ---
    else if (entry?.changes?.[0]?.value) {
      const value = entry.changes[0].value;

      console.log("this is the value WHATSAPP LOGIC = ",value);
      // 1. Skip if it's just a status update (delivered/read)
      if (value.statuses) {
        return NextResponse.json({ success: true, skip: "status_update" });
      }

      // 2. Process incoming messages
      if (value.messages?.[0]) {
        const message = value.messages[0];
        const contact = value.contacts?.[0];
        const waId = message.from;
        const messageText = message.text?.body;
        const userName = contact?.profile?.name || "WhatsApp User";

        // Check if identity exists
        let { data: identity } = await supabase
          .from("meta_identities")
          .select("lead_id")
          .eq("whatsapp_number", waId)
          .maybeSingle();

        let leadId = identity?.lead_id;

        if (!leadId) {
          // Create new lead
          const { data: newLead, error: lErr } = await supabase
            .from("leads")
            .insert([{ full_name: userName, source: "whatsapp" }])
            .select("id")
            .single();

          if (lErr) throw lErr;
          leadId = newLead.id;

          // Create identity
          await supabase.from("meta_identities").insert([
            {
              lead_id: leadId,
              whatsapp_number: waId,
              raw_metadata: { contact, message_id: message.id },
            },
          ]);
        }

        // 3. Log Message only if text exists
        if (messageText) {
          await supabase.from("lead_messages").insert([
            {
              lead_id: leadId,
              sender: "user", // WhatsApp Webhook yahan sirf incoming message bhej raha hai
              message_text: messageText,
            },
          ]);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Webhook Error:", err.message);
    // Return 200 to Meta even on error so they don't keep retrying if it's a code issue
    return NextResponse.json({ error: err.message }, { status: 200 });
  }
}
