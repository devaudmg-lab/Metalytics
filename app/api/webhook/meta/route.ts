import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js"; // Direct import for Admin usage
import { createHmac, timingSafeEqual } from "crypto";
import { syncToSheet } from "@/utils/syncToSheet";

// --- 1. Helper: Media Handler (Meta to Supabase Storage) ---
async function processMedia(
  mediaId: string,
  mimeType: string,
  supabaseAdmin: any,
) {
  try {
    const waToken = process.env.META_ACCESS_TOKEN;

    // A. Get temporary URL from Meta
    const metaRes = await fetch(`https://graph.facebook.com/v24.0/${mediaId}`, {
      headers: { Authorization: `Bearer ${waToken}` },
    });
    const metaData = await metaRes.json();
    if (!metaData.url) return null;

    // B. Download binary data
    const fileRes = await fetch(metaData.url, {
      headers: { Authorization: `Bearer ${waToken}` },
    });
    const buffer = Buffer.from(await fileRes.arrayBuffer());

    // C. Upload to Supabase Storage using Admin Client
    const extension = mimeType.split("/")[1] || "jpg";
    const fileName = `${mediaId}.${extension}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from("chat-media")
      .upload(fileName, buffer, { contentType: mimeType, upsert: true });

    if (uploadError) throw uploadError;

    // D. Get Public URL
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from("chat-media").getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error("Media Processing Error:", error);
    return null;
  }
}

// --- 2. Security Verification ---
function verifySignature(payload: string, signature: string | null) {
  if (!signature) return false;
  const appSecret = process.env.META_APP_SECRET;
  const [algo, sig] = signature.split("=");
  const hmac = createHmac("sha256", appSecret!);
  const digest = hmac.update(payload, "utf8").digest("hex");
  return timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(digest, "hex"));
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
  const entry = body.entry?.[0];

  // --- INTEGRATED ADMIN CLIENT ---
  // We initialize this here to bypass RLS and handle Storage
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  try {
    // --- PART A: MESSENGER LOGIC ---
    if (entry?.messaging?.[0]) {
      const event = entry.messaging[0];
      const isEcho = event.message?.is_echo;
      const psid = isEcho ? event.recipient?.id : event.sender?.id;
      if (!psid) return NextResponse.json({ success: true });

      let messageText = event.message?.text || "";
      let mediaUrl = null;
      let mediaType = "text";

      const attachment = event.message?.attachments?.[0];
      if (attachment) {
        mediaType = attachment.type;
        mediaUrl = attachment.payload.url;
        if (!messageText) messageText = `Sent a ${mediaType}`;
      }

      const { data: identity } = await supabaseAdmin
        .from("meta_identities")
        .select("lead_id")
        .eq("messenger_psid", psid)
        .maybeSingle();
      let leadId = identity?.lead_id;

      if (!leadId) {
        const token = process.env.META_PAGE_ACCESS_TOKEN;
        const res = await fetch(
          `https://graph.facebook.com/v24.0/${psid}?fields=first_name,last_name&access_token=${token}`,
        );
        const profile = await res.json();
        const fullName =
          `${profile.first_name || ""} ${profile.last_name || ""}`.trim() ||
          "Messenger User";

        const { data: newLead } = await supabaseAdmin
          .from("leads")
          .insert([{ full_name: fullName, source: "messenger" }])
          .select("id")
          .single();
        leadId = newLead?.id;
        await supabaseAdmin
          .from("meta_identities")
          .insert([
            { lead_id: leadId, messenger_psid: psid, raw_metadata: profile },
          ]);
      }

      await supabaseAdmin.from("lead_messages").insert([
        {
          lead_id: leadId,
          sender: isEcho ? "page" : "user",
          message_text: messageText,
          direction: isEcho ? "outbound" : "inbound",
          status: "delivered",
          metadata: { media_url: mediaUrl, type: mediaType },
        },
      ]);

      if (!isEcho)
        await supabaseAdmin
          .from("leads")
          .update({ last_interaction_at: new Date().toISOString() })
          .eq("id", leadId);
    }

    // --- PART B: META LEAD ADS ---
    else if (entry?.changes?.[0]?.value?.leadgen_id) {
      const leadgenId = entry.changes[0].value.leadgen_id;
      const { data: existing } = await supabaseAdmin
        .from("meta_identities")
        .select("lead_id")
        .eq("meta_lead_id", leadgenId)
        .maybeSingle();

      if (!existing) {
        const token = process.env.META_PAGE_ACCESS_TOKEN;
        const res = await fetch(
          `https://graph.facebook.com/v24.0/${leadgenId}?access_token=${token}`,
        );
        const details = await res.json();
        const findField = (names: string[]) =>
          details.field_data?.find((f: any) =>
            names.includes(f.name.toLowerCase()),
          )?.values?.[0] || "";

        const { data: lead } = await supabaseAdmin
          .from("leads")
          .insert([
            {
              full_name: findField(["full_name", "name"]),
              email: findField(["email"]),
              phone: findField(["phone_number", "phone"]),
              postal_code: findField(["post_code", "zip"]),
              source: "meta_ad",
            },
          ])
          .select("id")
          .single();

        await supabaseAdmin.from("meta_identities").insert([
          {
            lead_id: lead?.id,
            meta_lead_id: leadgenId,
            raw_metadata: details,
          },
        ]);

        // Construct the payload to match what syncToSheet expects
        const leadForSheet = {
          created_at: new Date().toISOString(),
          postal_code: findField(["post_code", "zip"]),
          // logic for is_filtered depends on your app's criteria
          is_filtered: true,
        };

        // Call the sync function (awaiting is optional depending on if you want to block)
        syncToSheet([leadForSheet]).catch((err) =>
          console.error("Sheet Sync Failed", err),
        );
      }
    }

    // --- PART C: WHATSAPP LOGIC ---
    else if (entry?.changes?.[0]?.value) {
      const value = entry.changes[0].value;

      console.log(value);

      // 1. HANDLE STATUS UPDATES (Sent -> Delivered -> Read)
      if (value.statuses?.[0]) {
        const statusUpdate = value.statuses[0];
        const waMessageId = statusUpdate.id;
        const newStatus = statusUpdate.status; // 'delivered', 'read', 'failed', 'sent'
        console.log(newStatus);

        // Update the message status based on the WhatsApp ID
        const { error: updateError } = await supabaseAdmin
          .from("lead_messages")
          .update({
            status: newStatus,
            // Optional: you can store the timestamp of the status change in metadata
            metadata: {
              last_status_update: new Date().toISOString(),
              whatsapp_status_raw: newStatus,
            },
          })
          .eq("wa_message_id", waMessageId);

        if (updateError) console.error("Error updating status:", updateError);

        return NextResponse.json({ success: true });
      }

      if (value.messages?.[0]) {
        const message = value.messages[0];
        const waId = message.from;
        let messageText = message.text?.body || "";
        let mediaUrl = null;
        const msgType = message.type;

        if (["image", "video", "document", "audio"].includes(msgType)) {
          const mediaData = message[msgType];
          messageText = mediaData.caption || `Sent a ${msgType}`;
          mediaUrl = await processMedia(
            mediaData.id,
            mediaData.mime_type,
            supabaseAdmin,
          );
        }

        const { data: identity } = await supabaseAdmin
          .from("meta_identities")
          .select("lead_id")
          .eq("whatsapp_number", waId)
          .maybeSingle();
        let leadId = identity?.lead_id;

        if (!leadId) {
          const userName =
            value.contacts?.[0]?.profile?.name || "WhatsApp User";
          const { data: newLead } = await supabaseAdmin
            .from("leads")
            .insert([{ full_name: userName, source: "whatsapp" }])
            .select("id")
            .single();
          leadId = newLead?.id;
          await supabaseAdmin
            .from("meta_identities")
            .insert([{ lead_id: leadId, whatsapp_number: waId }]);
        }

        await supabaseAdmin.from("lead_messages").insert([
          {
            lead_id: leadId,
            sender: "user",
            message_text: messageText,
            wa_message_id: message.id,
            direction: "inbound",
            status: "delivered",
            metadata: { media_url: mediaUrl, type: msgType },
          },
        ]);

        await supabaseAdmin
          .from("leads")
          .update({ last_interaction_at: new Date().toISOString() })
          .eq("id", leadId);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Webhook Error:", err);
    return NextResponse.json({ error: err.message }, { status: 200 });
  }
}
