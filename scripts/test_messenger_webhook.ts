import { createHmac } from "crypto";
import * as dotenv from "dotenv";

dotenv.config();

async function testWebhook() {
    const appSecret = process.env.META_APP_SECRET;
    if (!appSecret) {
        console.error("Please set META_APP_SECRET in .env");
        process.exit(1);
    }

    // 1. Construct a Fake Payload matching Meta's structure
    const payload = {
        object: "page",
        entry: [
            {
                id: "123456789",
                time: Date.now(),
                messaging: [
                    {
                        sender: { id: "TEST_PSID_12345" }, // Fake Sender ID
                        recipient: { id: "PAGE_ID" },
                        timestamp: Date.now(),
                        message: {
                            mid: "mid.1234567890",
                            text: "Hello from the test script!",
                        },
                    },
                ],
            },
        ],
    };

    const body = JSON.stringify(payload);

    // 2. Generate Signature (HMAC SHA256)
    const hmac = createHmac("sha256", appSecret);
    const digest = hmac.update(body).digest("hex");
    const signature = `sha256=${digest}`;

    console.log("Sending simulated webhook to localhost...");

    try {
        const res = await fetch("http://localhost:3000/api/webhook/meta", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-hub-signature-256": signature,
            },
            body: body,
        });

        console.log("Response Status:", res.status);
        const text = await res.text();
        console.log("Response Body:", text);

        if (res.ok) {
            console.log("\n✅ Webhook accepted the payload!");
            console.log("Check your 'leads' table in Supabase for a new lead with messenger_psid = 'TEST_PSID_12345'");
        } else {
            console.error("\n❌ Webhook rejected the request.");
        }

    } catch (err) {
        console.error("Failed to send request. Is the server running? npm run dev?");
        console.error(err);
    }
}

testWebhook();
