import { NextRequest, NextResponse } from "next/server";
import { getWhatsAppTemplates } from "@/utils/metaApi";

export async function GET(req: NextRequest) {
    try {
        const data = await getWhatsAppTemplates();
        return NextResponse.json({ success: true, templates: data.data });
    } catch (error: any) {
        console.error("Fetch Templates Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
