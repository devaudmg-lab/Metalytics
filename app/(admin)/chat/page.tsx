"use client";

import { useEffect, useState, useCallback } from "react";
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

    // --- 1. Fetch Leads with Joined Identity ---
    const fetchLeads = useCallback(async () => {
        const { data, error } = await supabase
            .from("leads")
            .select(`
                *,
                meta_identities (
                    messenger_psid,
                    meta_lead_id
                )
            `) // Humne join kiya taaki Messenger ID mil sake
            .order("created_at", { ascending: false });

        if (data) setLeads(data);
    }, [supabase]);

    useEffect(() => {
        fetchLeads();

        // Realtime subscription for leads
        const channel = supabase
            .channel("chat_leads_updates")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "leads" },
                () => fetchLeads()
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [fetchLeads]);

    // --- 2. Helper to find selected lead details ---
    const selectedLead = leads.find((l) => l.id === selectedLeadId) || null;
    
    // Naya tareeka PSID nikalne ka (Joined table se)
    const currentPsid = selectedLead?.meta_identities?.[0]?.messenger_psid;

    // --- 3. Fetch Messages ---
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
                    event: "INSERT",
                    schema: "public",
                    table: "lead_messages",
                    filter: `lead_id=eq.${selectedLeadId}`
                },
                (payload) => {
                    setMessages((prev) => [...prev, payload.new]);
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [selectedLeadId, supabase]);

    // --- 4. Send Message Logic (Updated for New Schema) ---
    const handleSendMessage = async (text: string) => {
        // Validation: Check if we have a PSID to reply to
        if (!currentPsid) {
            alert("This lead doesn't have a Messenger ID (It might be a manual lead or Form lead).");
            return;
        }

        try {
            const response = await fetch("/api/chat/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text,
                    recipient_id: currentPsid, // Corrected PSID
                    lead_id: selectedLeadId
                })
            });

            const data = await response.json();

            if (!response.ok || data.error) {
                alert(`Failed to send: ${data.error}`);
            } else {
                console.log("Message sent successfully!");
            }

        } catch (err: any) {
            alert("Network error while sending message.");
        }
    };

    return (
        <div className="flex h-[calc(100vh-120px)] w-full border border-gray-200 dark:border-white/5 rounded-sm overflow-hidden shadow-xl bg-white dark:bg-black">
            <ChatSidebar
                leads={leads}
                selectedLeadId={selectedLeadId}
                onSelectLead={setSelectedLeadId}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />
            <ChatWindow
                lead={selectedLead}
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoadingMessages}
            />
        </div>
    );
}