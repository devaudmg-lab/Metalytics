import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createHmac, timingSafeEqual } from "crypto";

/**
 * Helper to verify that the request actually came from Meta.
 * It hashes the raw request body using your App Secret and compares it 
 * to the signature Meta sent in the header.
 */
function verifySignature(payload: string, signature: string | null) {
  if (!signature) return false;

  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret) {
    console.error("Missing META_APP_SECRET environment variable");
    return false;
  }

  const [algo, sig] = signature.split("=");
  const hmac = createHmac("sha256", appSecret);
  const digest = hmac.update(payload).digest("hex");

  // Use timingSafeEqual to prevent timing attacks
  return timingSafeEqual(Buffer.from(sig, "utf8"), Buffer.from(digest, "utf8"));
}

/**
 * 1. GET HANDLER: Verification handshake with Meta
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN;

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook Verified successfully!");
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

/**
 * 2. POST HANDLER: Receiving the Lead Data
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text(); // Required for signature verification
  const signature = req.headers.get("x-hub-signature-256");

  // Step 1: Security check
  if (!verifySignature(rawBody, signature)) {
    console.error("Signature verification failed.");
    return NextResponse.json({ error: "Invalid Signature" }, { status: 401 });
  }

  try {
    const body = JSON.parse(rawBody);
    const supabase = await createClient();

    // Step 2: Check if this is a lead generation event
    const leadgenId = body.entry?.[0]?.changes?.[0]?.value?.leadgen_id;
    
    if (!leadgenId) {
      // Return 200 to acknowledge other types of Meta notifications 
      // even if we aren't processing them.
      return NextResponse.json({ skip: "Not a leadgen event" });
    }

    // Step 3: Fetch the full details from Meta Graph API
    // We explicitly request field_data and created_time
    const metaResponse = await fetch(
      `https://graph.facebook.com/v24.0/${leadgenId}?fields=field_data,created_time&access_token=${process.env.META_ACCESS_TOKEN}`
    );
    
    const leadDetails = await metaResponse.json();

    if (leadDetails.error) {
      console.error("Meta API Error:", leadDetails.error);
      throw new Error(leadDetails.error.message);
    }

    // Step 4: Map the complex field_data array to a flat object
    const findField = (names: string[]) => {
      const field = leadDetails.field_data?.find((f: any) =>
        names.includes(f.name.toLowerCase())
      );
      return field?.values?.[0] || "";
    };

    const newLead = {
      meta_lead_id: leadgenId,
      full_name: findField(["full_name", "full name", "name", "first_name"]),
      email: findField(["email", "e-mail"]),
      phone: findField(["phone_number", "phone", "mobile"]),
      city: findField(["city", "town"]),
      raw_data: leadDetails, // Keeping the full payload just in case
      created_at: leadDetails.created_time || new Date().toISOString(),
    };

    // Step 5: Insert or Update in Supabase
    // upsert ensures we don't save the same lead twice if Meta retries the webhook
    const { error } = await supabase
      .from("leads")
      .upsert([newLead], { onConflict: "meta_lead_id" });

    if (error) {
      console.error("Supabase Error:", error);
      throw error;
    }

    // Success response to Meta
    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("Webhook processing error:", err.message);
    
    /** * IMPORTANT: Return a 200 even on processing errors if you want Meta 
     * to stop retrying. If you want Meta to try again later, return a 500.
     */
    return NextResponse.json({ error: err.message }, { status: 200 });
  }
}