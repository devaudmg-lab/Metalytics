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

  // 1. Fetch leads
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

  // 2. Fetch Messages & Realtime Listener with Deduplication
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
            setMessages((prev) => {
              // Check if we have an optimistic message matching this new DB record
              // We check by text content and the 'is_optimistic' flag
              const optimisticIdx = prev.findLastIndex(
                (m) =>
                  m.metadata?.is_optimistic === true &&
                  m.message_text === payload.new.message_text
              );

              if (optimisticIdx !== -1) {
                // SWAP: Replace the optimistic message with the real one from DB
                const updated = [...prev];
                updated[optimisticIdx] = payload.new;
                return updated;
              }

              // If no optimistic match, just add as a new message (e.g., incoming message)
              return [...prev, payload.new];
            });
          } else if (payload.eventType === "UPDATE") {
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

  // 3. Smart Send Message Handler
  const handleSendMessage = async (text: string, mediaUrl?: string) => {
    if (!selectedLead || !selectedLeadId) return;

    const identity = selectedLead.meta_identities;
    const source = selectedLead.source;
    const tempId = crypto.randomUUID();

    // --- OPTIMISTIC UPDATE ---
    const optimisticMessage = {
      id: tempId,
      lead_id: selectedLeadId,
      sender: "page",
      message_text: text,
      direction: "outbound",
      status: "sent",
      created_at: new Date().toISOString(),
      metadata: {
        media_url: mediaUrl,
        is_optimistic: true, // This flag allows the listener to identify it
      },
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    // PREPARE API CALL
    let endpoint = "/api/chat/send";
    const payload: any = {
      text,
      lead_id: selectedLeadId,
      media_url: mediaUrl,
    };

    if (source === "whatsapp" || (!identity?.messenger_psid && identity?.whatsapp_number)) {
      endpoint = "/api/chat/send-whatsapp";
      payload.recipient_wa_id = identity?.whatsapp_number;
    } else {
      if (!identity?.messenger_psid) {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        return;
      }
      payload.recipient_id = identity.messenger_psid;
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const result = await response.json();
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        alert(`Failed: ${result.error}`);
      }
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] md:h-[calc(100vh-120px)] w-full border border-slate-200 dark:border-slate-800 md:rounded-xl overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-black/40 bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className={`${selectedLeadId ? "hidden md:flex" : "flex"} w-full md:w-[350px] lg:w-[400px] border-r border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10`}>
        <ChatSidebar
          leads={leads}
          selectedLeadId={selectedLeadId}
          onSelectLead={setSelectedLeadId}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      <div className={`${selectedLeadId ? "flex" : "hidden md:flex"} flex-1 bg-white dark:bg-slate-950`}>
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