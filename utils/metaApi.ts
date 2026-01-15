
const VERSION = "v21.0";
const BASE_URL = `https://graph.facebook.com/${VERSION}`;

/**
 * Send a standard text message.
 * Only works if the 24-hour session window is active.
 */
export async function sendWhatsAppText(to: string, bodyText: string) {
    const phoneId = process.env.META_WHATSAPP_PHONE_NUMBER_ID;
    const token = process.env.META_ACCESS_TOKEN;

    // Ensure 'to' number has no '+' and no spaces
    const cleanTo = to.replace(/\D/g, "");

    const res = await fetch(`${BASE_URL}/${phoneId}/messages`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: cleanTo,
            type: "text",
            text: { preview_url: false, body: bodyText },
        }),
    });

    const data = await res.json();
    if (data.error) {
        throw new Error(data.error.message);
    }
    return data;
}

/**
 * Send a Template Message.
 * Used to start a conversation or re-open the 24h window.
 */
export async function sendWhatsAppTemplate(
    to: string,
    templateName: string,
    languageCode = "en_US"
) {
    const phoneId = process.env.META_WHATSAPP_PHONE_NUMBER_ID;
    const token = process.env.META_ACCESS_TOKEN;
    const cleanTo = to.replace(/\D/g, "");

    const res = await fetch(`${BASE_URL}/${phoneId}/messages`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            messaging_product: "whatsapp",
            to: cleanTo,
            type: "template",
            template: {
                name: templateName,
                language: { code: languageCode },
            },
        }),
    });

    const data = await res.json();
    if (data.error) {
        throw new Error(data.error.message);
    }
    return data;
}


export async function deleteWhatsAppMessage(to: string, messageId: string) {
    const phoneId = process.env.META_WHATSAPP_PHONE_NUMBER_ID;
    const token = process.env.META_ACCESS_TOKEN;
    const cleanTo = to.replace(/\D/g, "");

    const res = await fetch(`${BASE_URL}/${phoneId}/messages`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: cleanTo,
            type: "protocol",
            protocol: {
                type: "revoke",
                key: {
                    id: messageId
                }
            }
        }),
    });

    const data = await res.json();
    if (data.error) {
        throw new Error(data.error.message);
    }
    return data;
}
/**
 * Fetch all approved templates for the business account.
 */
export async function getWhatsAppTemplates() {
    const wabaId = process.env.META_WHATSAPP_BUSINESS_ACCOUNT_ID;
    const token = process.env.META_ACCESS_TOKEN;

    const res = await fetch(`${BASE_URL}/${wabaId}/message_templates?status=APPROVED&limit=100`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await res.json();
    if (data.error) {
        throw new Error(data.error.message);
    }
    return data;
}
