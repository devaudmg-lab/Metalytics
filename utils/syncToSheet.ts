export const syncToSheet = async (payload: any[]) => {
  const SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SPREADSHEET_WEB_APP || "";

  const cleanedPayload = payload.map((item) => {
    let dateObj = new Date(item.created_at);

    // Agar date invalid hai, toh aaj ki date use karo
    if (isNaN(dateObj.getTime())) {
      dateObj = new Date();
    }

    return {
      // Sirf wahi data bhejo jo Sheet ko chahiye
      date: dateObj.toLocaleDateString("en-US"), // MM/DD/YYYY format
      hour: dateObj.getHours() + ":00",
      postal_code: item.postal_code || "N/A",
      status: item.is_filtered ? "Verified" : "Outside",
    };
  });

  try {
    await fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cleanedPayload),
    });
    console.log("✅ Sync Done!");
  } catch (error) {
    console.error("❌ Sync Error:", error);
  }
};
