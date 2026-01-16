"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import ChatSidebar, { ChatTab } from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";

export default function ChatPage() {
  const supabase = createClient();
  const [leads, setLeads] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ChatTab>("all");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // 1. Fetch leads with both Messenger and WhatsApp identities
  const fetchLeads = useCallback(async () => {
    const { data } = await supabase
      .from("leads")
      .select(`*, meta_identities ( messenger_psid, whatsapp_number )`)
      .order("created_at", { ascending: false });
    if (data) setLeads(data);
  }, [supabase]);

  useEffect(() => {
    fetchLeads();
    const channel = supabase
      .channel("chat_leads_updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leads" },
        () => fetchLeads()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLeads, supabase]);

  const selectedLead = useMemo(() => {
    return leads.find((l) => l.id === selectedLeadId) || null;
  }, [leads, selectedLeadId]);

  // 2. Fetch Messages (Realtime logic)
  // 2. Fetch Messages (Updated for Realtime Status Updates)
  useEffect(() => {
    if (!selectedLeadId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setIsLoadingMessages(true);
      const { data } = await supabase
        .from("lead_messages")
        .select("*")
        .eq("lead_id", selectedLeadId)
        .order("created_at", { ascending: true });
      if (data) setMessages(data);
      setIsLoadingMessages(false);
    };

    fetchMessages();

    // Change event from "INSERT" to "*" to catch status updates (ticks)
    const channel = supabase
      .channel(`chat_messages_${selectedLeadId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "lead_messages",
          filter: `lead_id=eq.${selectedLeadId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setMessages((prev) => [...prev, payload.new]);
          } else if (payload.eventType === "UPDATE") {
            // This updates the specific message when the 'status' changes
            setMessages((prev) =>
              prev.map((msg) => (msg.id === payload.new.id ? payload.new : msg))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedLeadId, supabase]);

  // 3. Smart Send Message Handler (WhatsApp vs Messenger)
  // 3. Smart Send Message Handler (Updated for Media Support)
  const handleSendMessage = async (text: string, mediaUrl?: string) => {
    if (!selectedLead || !selectedLeadId) return;

    const identity = selectedLead.meta_identities;
    const source = selectedLead.source;
    const tempId = crypto.randomUUID(); // Unique ID for optimistic UI

    // 1. OPTIMISTIC UPDATE
    // We add the message to the state immediately so the UI feels "snappy"
    const optimisticMessage = {
      id: tempId,
      lead_id: selectedLeadId,
      sender: "page",
      message_text: text,
      direction: "outbound",
      status: "sent", // Shows the first grey tick instantly
      created_at: new Date().toISOString(),
      metadata: {
        media_url: mediaUrl,
        is_optimistic: true,
      },
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    // 2. PREPARE API CALL
    let endpoint = "/api/chat/send";
    const payload: any = {
      text,
      lead_id: selectedLeadId,
      media_url: mediaUrl,
    };

    // Route logic based on Lead Source
    if (
      source === "whatsapp" ||
      (!identity?.messenger_psid && identity?.whatsapp_number)
    ) {
      endpoint = "/api/chat/send-whatsapp";
      payload.recipient_wa_id = identity?.whatsapp_number;
      payload.recipient_id = identity?.whatsapp_number;
    } else {
      if (!identity?.messenger_psid) {
        console.error("No Messenger PSID found.");
        // Remove optimistic message if we can't send
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        return;
      }
      payload.recipient_id = identity.messenger_psid;
    }

    // 3. EXECUTE SEND
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const result = await response.json();
        console.error(`API Error: ${result.error}`);

        // Remove the optimistic message from UI since it failed to send
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        alert(`Failed to send: ${result.error || "Unknown error"}`);
      }
      // Note: We don't need to manually update the state on success because
      // your Realtime listener will handle the "INSERT" from the database.
      // We can filter out the optimistic message once the real one arrives.
    } catch (err) {
      console.error("Network error sending message.", err);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] md:h-[calc(100vh-120px)] w-full border border-slate-200 dark:border-slate-800 md:rounded-xl overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-black/40 bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Sidebar - Integrated with Slate Theme */}
      <div
        className={`${
          selectedLeadId ? "hidden md:flex" : "flex"
        } w-full md:w-[350px] lg:w-[400px] border-r border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10`}
      >
        <ChatSidebar
          leads={leads}
          selectedLeadId={selectedLeadId}
          onSelectLead={setSelectedLeadId}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      {/* Chat Window - Integrated with Indigo Accents */}
      <div
        className={`${
          selectedLeadId ? "flex" : "hidden md:flex"
        } flex-1 bg-white dark:bg-slate-950`}
      >
        <ChatWindow
          lead={selectedLead}
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoadingMessages}
          onBack={() => setSelectedLeadId(null)}
          platform={selectedLead?.source}
        />
      </div>
    </div>
  );
}
