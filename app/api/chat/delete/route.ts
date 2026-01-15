import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { deleteWhatsAppMessage } from "@/utils/metaApi";

export async function POST(req: NextRequest) {
    try {
        const { messageId } = await req.json(); // The internal DB ID or wamid
        const supabase = await createClient();

        // 1. Fetch the actual wamid from your database first
        // This ensures you are sending the 'wamid.HBg...' to Meta
        // 1. Fetch message AND Lead Phone
        const { data: msgData, error: msgError } = await supabase
            .from("lead_messages")
            .select(`
                wa_message_id,
                lead_id,
                leads ( phone )
            `)
            .eq("id", messageId)
            .single();

        if (msgError || !msgData) throw new Error("Message not found");

        const wamid = msgData.wa_message_id;
        // @ts-ignore - Supabase types might imply array, but single() handles it. Adjust if needed.
        const phone = msgData.leads?.phone;

        if (!wamid || !phone) throw new Error("Missing WhatsApp ID or Lead Phone");

        // 2. Call Meta API to delete for everyone
        await deleteWhatsAppMessage(phone, wamid);

        // 3. Update Supabase
        await supabase
            .from("lead_messages")
            .update({ status: "deleted" })
            .eq("id", messageId);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Delete Error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}