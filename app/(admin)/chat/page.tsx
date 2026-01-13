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
        const channel = supabase.channel("chat_leads_updates")
            .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, () => fetchLeads())
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [fetchLeads]);

    const selectedLead = useMemo(() => {
        return leads.find((l) => l.id === selectedLeadId) || null;
    }, [leads, selectedLeadId]);

    // 2. Fetch Messages (Realtime logic remains same as it's table-based)
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

        const channel = supabase.channel(`chat_messages_${selectedLeadId}`)
            .on("postgres_changes", 
                { event: "INSERT", schema: "public", table: "lead_messages", filter: `lead_id=eq.${selectedLeadId}` },
                (payload) => setMessages((prev) => [...prev, payload.new])
            )
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [selectedLeadId, supabase]);

    // 3. Smart Send Message Handler (WhatsApp vs Messenger)
    const handleSendMessage = async (text: string) => {
        if (!selectedLead) return;

        const identity = selectedLead.meta_identities;
        const source = selectedLead.source; // 'messenger', 'whatsapp', or 'meta_ad'

        let endpoint = "/api/chat/send"; // Default Messenger API
        let payload: any = { text, lead_id: selectedLeadId };

        // Check if it's a WhatsApp lead
        if (source === "whatsapp" || (!identity?.messenger_psid && identity?.whatsapp_number)) {
            endpoint = "/api/chat/send-whatsapp";
            payload.recipient_wa_id = identity?.whatsapp_number;
            payload.recipient_id = identity?.whatsapp_number; // Backup for safety
        } else {
            // It's a Messenger/Meta Ad lead
            if (!identity?.messenger_psid) {
                alert("No Messenger PSID found for this lead.");
                return;
            }
            payload.recipient_id = identity.messenger_psid;
        }

        if (!payload.recipient_id && !payload.recipient_wa_id) {
            alert("Contact ID not found.");
            return;
        }

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (!response.ok) alert(`Error: ${result.error}`);
        } catch (err) { 
            alert("Network error. Please check your connection."); 
        }
    };

    return (
        <div className="flex h-[calc(100vh-80px)] md:h-[calc(100vh-120px)] w-full border-gray-200 dark:border-white/5 md:rounded-sm overflow-hidden shadow-xl bg-white dark:bg-black">
            
            {/* Sidebar */}
            <div className={`${selectedLeadId ? 'hidden md:flex' : 'flex'} w-full md:w-[350px] lg:w-[400px] border-r border-gray-200 dark:border-white/5`}>
                <ChatSidebar
                    leads={leads}
                    selectedLeadId={selectedLeadId}
                    onSelectLead={setSelectedLeadId}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />
            </div>

            {/* Chat Window */}
            <div className={`${selectedLeadId ? 'flex' : 'hidden md:flex'} flex-1`}>
                <ChatWindow
                    lead={selectedLead}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isLoading={isLoadingMessages}
                    onBack={() => setSelectedLeadId(null)} 
                    // Yahan aap source bhi pass kar sakte hain taaki UI mein icon dikhe
                    platform={selectedLead?.source}
                />
            </div>
        </div>
    );
}