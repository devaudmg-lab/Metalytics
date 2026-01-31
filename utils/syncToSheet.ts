export const syncToSheet = async (payload: any[]) => {
  const SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SPREADSHEET_WEB_APP || "";

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

  // Check if we are in the browser or on the server
  const isBrowser = typeof window !== "undefined";

  const fetchOptions: RequestInit = {
    method: "POST",
    body: JSON.stringify(cleanedPayload),
    // Standard header that works for both
    headers: { "Content-Type": "text/plain;charset=utf-8" },
  };

  // Only apply 'no-cors' if we are in the browser
  if (isBrowser) {
    fetchOptions.mode = "no-cors";
  }

  try {
    const res = await fetch(SCRIPT_URL, fetchOptions);

    // Note: with no-cors, res.ok will always be false and status 0
    // We just assume success if no error was thrown
    console.log("✅ Sync attempt finished");
  } catch (error) {
    console.error("❌ Sync Error:", error);
    throw error;
  }
};
