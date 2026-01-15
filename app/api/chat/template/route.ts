import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { sendWhatsAppTemplate } from "@/utils/metaApi";

export async function POST(req: NextRequest) {
    try {
        const { leadId, templateName, phoneOverride } = await req.json(); // phoneOverride for new leads who don't have ID yet (optional logic)
        const supabase = await createClient();

        let phone = phoneOverride;
        let finalLeadId = leadId;

        if (leadId) {
            // Fetch Lead Phone
            const { data: lead } = await supabase
                .from("leads")
                .select("id, phone")
                .eq("id", leadId)
                .single();

            if (!lead?.phone) return NextResponse.json({ error: "Lead has no phone" }, { status: 400 });
            phone = lead.phone;
        }

        if (!phone) return NextResponse.json({ error: "Phone number required" }, { status: 400 });

        // 1. Send Template via Meta
        const metaRes = await sendWhatsAppTemplate(phone, templateName || "hello_world");
        const waMessageId = metaRes.messages?.[0]?.id;

        // 2. Log to DB if we have a leadId
        if (finalLeadId) {
            // Log the template sent
            await supabase.from("lead_messages").insert([
                {
                    lead_id: finalLeadId,
                    sender: "page",
                    message_text: `Template: ${templateName}`,
                    wa_message_id: waMessageId,
                    status: "sent",
                    direction: "outbound",
                    type: "template"
                },
            ]);

            // OPTIONAL: Sending a template technically doesn't "open" the window for US to type text yet.
            // The window opens only when THEY reply. 
            // So we do NOT update last_interaction_at here.
        }

        return NextResponse.json({ success: true, waMessageId });

    } catch (error: any) {
        console.error("Template Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
