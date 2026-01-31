export const syncToSheet = async (payload: any[]) => {
  const SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SPREADSHEET_WEB_APP || "";

  if (!SCRIPT_URL) {
    console.error("❌ Google Script URL is missing");
    return;
  }

  const cleanedPayload = payload.map((item) => {
    let dateObj = new Date(item.created_at);
    if (isNaN(dateObj.getTime())) dateObj = new Date();

    return {
      date: dateObj.toLocaleDateString("en-US"),
      hour: dateObj.getHours() + ":00",
      postal_code: item.postal_code || "N/A",
      status: item.is_filtered ? "Verified" : "Outside",
    };
  });

  const isBrowser = typeof window !== "undefined";

  const fetchOptions: RequestInit = {
    method: "POST",
    // Google Apps Script requires text/plain to avoid CORS preflight issues
    // and to parse the body correctly via e.postData.contents
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(cleanedPayload),
    // Critical for Node.js environments to follow the Google 302 redirect
    redirect: "follow",
  };

  // Only use no-cors in the browser to bypass strict CORS checks
  if (isBrowser) {
    fetchOptions.mode = "no-cors";
  }

  try {
    const res = await fetch(SCRIPT_URL, fetchOptions);

    // In Node.js (Server), we can actually check the response!
    if (!isBrowser) {
      const text = await res.text();
      console.log("✅ Server Sync Response:", text);
    } else {
      console.log("✅ Browser Sync attempt finished");
    }
  } catch (error) {
    console.error("❌ Sync Error:", error);
    throw error;
  }
};
