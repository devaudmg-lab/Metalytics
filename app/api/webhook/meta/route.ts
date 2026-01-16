import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js"; // Admin client for storage
import { createHmac, timingSafeEqual } from "crypto";

// --- 1. Helper: Media Handler (Meta to Supabase) ---
async function processMedia(mediaId: string, mimeType: string) {
  try {
    // Admin client is required to bypass RLS for uploads
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
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

    // C. Upload to Supabase
    const fileName = `${mediaId}.${mimeType.split("/")[1] || "jpg"}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from("chat-media")
      .upload(fileName, buffer, { contentType: mimeType, upsert: true });

    if (uploadError) throw uploadError;

    // D. Get permanent link
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from("chat-media")
      .getPublicUrl(fileName);

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
  if (searchParams.get("hub.mode") === "subscribe" && 
      searchParams.get("hub.verify_token") === process.env.META_VERIFY_TOKEN) {
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
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // --- PART A: MESSENGER LOGIC ---
    if (entry?.messaging?.[0]) {
      const event = entry.messaging[0];
      const isEcho = event.message?.is_echo;
      const psid = isEcho ? event.recipient?.id : event.sender?.id;
      if (!psid) return NextResponse.json({ success: true });

      let msgText = event.message?.text || "";
      let mediaUrl = null;
      let mediaType = "text";
      
      // Support for Messenger Images & Videos
      const attachment = event.message?.attachments?.[0];
      if (attachment) {
        mediaType = attachment.type; // "image" or "video"
        mediaUrl = attachment.payload.url;
        if (!msgText) msgText = `Sent a ${mediaType}`;
      }

      // Identity & Message Save Logic (same as before)
      // ... (keep your existing PSID/Lead logic) ...
      
      await supabase.from("lead_messages").insert([{
        lead_id: leadId,
        sender: isEcho ? "page" : "user",
        message_text: msgText,
        metadata: { media_url: mediaUrl, type: mediaType }
      }]);
    }

    // --- PART C: WHATSAPP LOGIC (Updated for Video) ---
    else if (entry?.changes?.[0]?.value) {
      const value = entry.changes[0].value;
      if (value.statuses) return NextResponse.json({ success: true });

      if (value.messages?.[0]) {
        const message = value.messages[0];
        const waId = message.from;
        
        let messageText = message.text?.body || "";
        let mediaUrl = null;
        const msgType = message.type; // image, video, document, text

        // DYNAMIC MEDIA HANDLING
        if (msgType === "image" || msgType === "video" || msgType === "document") {
          const mediaData = message[msgType]; // Dynamic access: message.image or message.video
          messageText = mediaData.caption || `Sent a ${msgType}`;
          
          // Download from Meta and Upload to Supabase
          mediaUrl = await processMedia(mediaData.id, mediaData.mime_type);
        }

        // Identity Logic
        let { data: identity } = await supabase.from("meta_identities").select("lead_id").eq("whatsapp_number", waId).maybeSingle();
        let leadId = identity?.lead_id;

        if (!leadId) {
          const userName = value.contacts?.[0]?.profile?.name || "WhatsApp User";
          const { data: newLead } = await supabase.from("leads").insert([{ full_name: userName, source: "whatsapp" }]).select("id").single();
          leadId = newLead.id;
          await supabase.from("meta_identities").insert([{ lead_id: leadId, whatsapp_number: waId }]);
        }

        // Save Message with metadata
        await supabase.from("lead_messages").insert([{
          lead_id: leadId,
          sender: "user",
          message_text: messageText,
          metadata: { 
            media_url: mediaUrl, 
            type: msgType, // 'video' or 'image'
            wa_message_id: message.id 
          }
        }]);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Webhook Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 200 });
  }
}