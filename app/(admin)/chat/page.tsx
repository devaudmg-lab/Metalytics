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

    const fetchLeads = useCallback(async () => {
        const { data } = await supabase
            .from("leads")
            .select(`*, meta_identities ( messenger_psid )`)
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
    
    const currentPsid = selectedLead?.meta_identities?.messenger_psid;

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

    const handleSendMessage = async (text: string) => {
        const activePsid = selectedLead?.meta_identities?.messenger_psid;
        if (!activePsid) {
            alert("No Messenger ID found for this lead.");
            return;
        }
        try {
            const response = await fetch("/api/chat/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text, recipient_id: activePsid, lead_id: selectedLeadId })
            });
            const result = await response.json();
            if (!response.ok) alert(`Error: ${result.error}`);
        } catch (err) { alert("Network error."); }
    };

    return (
        // Wrapper: Mobile par full screen (h-screen), Desktop par h-[calc...]
        <div className="flex h-[calc(100vh-60px)] md:h-[calc(100vh-120px)] w-full border-gray-200 dark:border-white/5 md:rounded-sm overflow-hidden shadow-xl bg-white dark:bg-black">
            
            {/* Sidebar View Control */}
            <div className={`${selectedLeadId ? 'hidden md:flex' : 'flex'} w-full md:w-[350px] lg:w-[400px] border-r border-gray-200 dark:border-white/5`}>
                <ChatSidebar
                    leads={leads}
                    selectedLeadId={selectedLeadId}
                    onSelectLead={setSelectedLeadId}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />
            </div>

            {/* Chat Window View Control */}
            <div className={`${selectedLeadId ? 'flex' : 'hidden md:flex'} flex-1`}>
                <ChatWindow
                    lead={selectedLead}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isLoading={isLoadingMessages}
                    // Back logic pass ki hai
                    onBack={() => setSelectedLeadId(null)} 
                />
            </div>
        </div>
    );
}