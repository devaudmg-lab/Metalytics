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

    // Fetch Leads (Initial load)
    useEffect(() => {
        const fetchLeads = async () => {
            const { data, error } = await supabase
                .from("leads")
                .select("*")
                .order("created_at", { ascending: false }); // Ideally order by last_message_time if available

            if (data) setLeads(data);
        };

        fetchLeads();

        // Subscribe to NEW leads or updates
        const channel = supabase
            .channel("chat_leads_updates")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "leads" },
                (payload) => {
                    fetchLeads(); // Simple refresh for V1
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const selectedLead = leads.find((l) => l.id === selectedLeadId) || null;

    // Fetch Messages when lead is selected
    useEffect(() => {
        if (!selectedLeadId) {
            setMessages([]);
            return;
        }

        const fetchMessages = async () => {
            setIsLoadingMessages(true);
            // Fetch stored messenger messages
            const { data, error } = await supabase
                .from("lead_messages")
                .select("*")
                .eq("lead_id", selectedLeadId)
                .order("created_at", { ascending: true });

            if (data) setMessages(data);
            setIsLoadingMessages(false);
        };

        fetchMessages();

        // Subscribe to NEW messages for this lead
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

        return () => {
            supabase.removeChannel(channel);
        };
    }, [selectedLeadId]);

    // Send Message Logic
    const handleSendMessage = async (text: string) => {
        if (!selectedLead?.messenger_psid) {
            alert("Cannot reply. No Messenger PSID found.");
            return;
        }

        try {
            const response = await fetch("/api/chat/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text,
                    recipient_id: selectedLead.messenger_psid,
                    lead_id: selectedLeadId
                })
            });

            const data = await response.json();

            if (!response.ok || data.error) {
                console.error("Send Error:", data.error);
                alert(`Failed to send: ${data.error}`);
            } else {
                // Success! The message will appear via Realtime subscription (or regular fetch)
                // We don't need to manually insert into 'messages' state here if realtime is working.
                // But for V1, we can optimistically append if needed.
                // For now, let's rely on the DB subscription we already set up.
                console.log("Message sent!", data);
            }

        } catch (err: any) {
            console.error("Network Error:", err);
            alert("Failed to send message (Network error)");
        }
    };

    return (
        <div className="flex h-[calc(100vh-120px)] w-full border border-gray-200 dark:border-white/5 rounded-sm overflow-hidden shadow-xl">
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
