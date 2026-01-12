"use client";

import { useMemo } from "react";
import { MessageSquare, Phone, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export type ChatTab = "all" | "messenger" | "whatsapp";

interface ChatSidebarProps {
    leads: any[];
    selectedLeadId: string | null;
    onSelectLead: (id: string) => void;
    activeTab: ChatTab;
    onTabChange: (tab: ChatTab) => void;
}

export default function ChatSidebar({
    leads,
    selectedLeadId,
    onSelectLead,
    activeTab,
    onTabChange,
}: ChatSidebarProps) {

    // 🎯 Fixed Filtering Logic
    const filteredLeads = useMemo(() => {
        return leads.filter((lead) => {
            // 1. ALL TAB: Sab dikhao
            if (activeTab === "all") return true;

            // 2. MESSENGER TAB: Sirf wahi jiska source 'messenger' hai
            // Pehle yahan !!lead.messenger_psid tha jo ab leads table mein nahi hai
            if (activeTab === "messenger") {
                return lead.source === "messenger";
            }

            // 3. WHATSAPP TAB: Future logic
            if (activeTab === "whatsapp") {
                return lead.source === "whatsapp";
            }

            return true;
        });
    }, [leads, activeTab]);

    return (
        <div className="w-full md:w-80 lg:w-96 border-r border-gray-200 dark:border-white/5 bg-white dark:bg-[#080808] flex flex-col h-full">
            {/* Tabs Header */}
            <div className="p-4 border-b border-gray-100 dark:border-white/5">
                <h2 className="text-xl font-bold mb-4">Inbox</h2>
                <div className="flex bg-gray-100 dark:bg-zinc-900/50 p-1 rounded-sm gap-1">
                    <TabButton
                        active={activeTab === "all"}
                        onClick={() => onTabChange("all")}
                        label="All"
                    />
                    <TabButton
                        active={activeTab === "messenger"}
                        onClick={() => onTabChange("messenger")}
                        label="Messenger"
                        icon={<MessageSquare size={14} />}
                    />
                    <TabButton
                        active={activeTab === "whatsapp"}
                        onClick={() => onTabChange("whatsapp")}
                        label="WhatsApp"
                        icon={<Phone size={14} />}
                    />
                </div>
            </div>

            {/* Leads List */}
            <div className="flex-1 overflow-y-auto">
                {filteredLeads.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm italic">
                        No conversations in {activeTab}.
                    </div>
                ) : (
                    filteredLeads.map((lead) => (
                        <button
                            key={lead.id}
                            onClick={() => onSelectLead(lead.id)}
                            className={`w-full p-4 flex items-center gap-3 border-b border-gray-100 dark:border-white/5 transition-colors hover:bg-gray-50 dark:hover:bg-white/5 text-left ${
                                selectedLeadId === lead.id 
                                ? "bg-primary-btn/5 dark:bg-primary-btn/10 border-l-4 border-l-primary-btn" 
                                : "border-l-4 border-l-transparent"
                            }`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                lead.source === 'meta_ad' 
                                ? "bg-orange-100 dark:bg-orange-900/20 text-orange-600" 
                                : "bg-blue-100 dark:bg-blue-900/20 text-blue-600"
                            }`}>
                                <User size={18} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 className="text-sm font-semibold truncate text-gray-900 dark:text-white">
                                        {lead.full_name || "Unknown User"}
                                    </h4>
                                    <span className="text-[10px] text-gray-400 uppercase">
                                        {lead.created_at ? formatDistanceToNow(new Date(lead.created_at), { addSuffix: true }) : ""}
                                    </span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    {lead.source === 'meta_ad' ? (
                                        <span className="text-[9px] bg-orange-500 text-white px-1 rounded-sm font-bold">AD</span>
                                    ) : (
                                        <MessageSquare size={12} className="text-blue-500" />
                                    )}
                                    <p className="text-xs text-gray-500 truncate flex-1">
                                        {lead.source === 'meta_ad' ? "Meta Ad Form" : "Messenger Chat"}
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}

function TabButton({ active, onClick, label, icon }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-bold uppercase rounded-sm transition-all ${
                active 
                ? "bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm" 
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}