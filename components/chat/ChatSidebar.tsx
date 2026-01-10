"use client";

import { useMemo } from "react";
import { MessageSquare, Phone, Search, User } from "lucide-react";
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

    const filteredLeads = useMemo(() => {
        return leads.filter((lead) => {
            if (activeTab === "messenger") return !!lead.messenger_psid;
            // For WhatsApp, only show if we have actual WhatsApp history (Placeholder: currently hidden to avoid confusion)
            if (activeTab === "whatsapp") return false;
            return true;
        });
    }, [leads, activeTab]);

    return (
        <div className="w-full md:w-80 lg:w-96 border-r border-gray-200 dark:border-white/5 bg-white dark:bg-[#080808] flex flex-col h-full">
            {/* Header & Tabs */}
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

            {/* Search (Visual Placeholder) */}
            <div className="px-4 py-2 border-b border-gray-100 dark:border-white/5">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        className="w-full bg-gray-50 dark:bg-zinc-900 border-none rounded-full py-2 pl-9 pr-4 text-sm outline-none focus:ring-1 ring-primary-btn/30"
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {filteredLeads.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-sm">
                        No contacts found in {activeTab}.
                    </div>
                ) : (
                    filteredLeads.map((lead) => (
                        <button
                            key={lead.id}
                            onClick={() => onSelectLead(lead.id)}
                            className={`w-full p-4 flex items-center gap-3 border-b border-gray-100 dark:border-white/5 transition-colors hover:bg-gray-50 dark:hover:bg-white/5 text-left ${selectedLeadId === lead.id ? "bg-primary-btn/5 dark:bg-primary-btn/10 border-l-4 border-l-primary-btn" : "border-l-4 border-l-transparent"
                                }`}
                        >
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                {/* Avatar Placeholder */}
                                <User size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 className={`text-sm font-semibold truncate ${selectedLeadId === lead.id ? "text-primary-btn" : "text-gray-900 dark:text-white"}`}>
                                        {lead.full_name || "Unknown User"}
                                    </h4>
                                    <span className="text-[10px] text-gray-400 uppercase">
                                        {lead.created_at ? formatDistanceToNow(new Date(lead.created_at), { addSuffix: true }) : ""}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* Source Icons */}
                                    {lead.messenger_psid && <div title="Messenger"><MessageSquare size={12} className="text-blue-500" /></div>}
                                    {lead.phone && <div title="WhatsApp"><Phone size={12} className="text-emerald-500" /></div>}

                                    <p className="text-xs text-gray-500 truncate flex-1">
                                        {/* Preview: real message would go here */}
                                        {lead.messenger_psid ? "Messenger contact" : "Lead contact"}
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
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-bold uppercase rounded-sm transition-all ${active
                ? "bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm"
                : "text-gray-500"
                }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}
