"use client";

import { useMemo } from "react";
import { MessageSquare, Phone, User, Search } from "lucide-react";
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

    // 🎯 Filtering Logic: Based on lead.source
    const filteredLeads = useMemo(() => {
        return leads.filter((lead) => {
            if (activeTab === "all") return true;
            if (activeTab === "messenger") return lead.source === "messenger";
            if (activeTab === "whatsapp") return lead.source === "whatsapp";
            return true;
        });
    }, [leads, activeTab]);

    return (
        <div className="w-full flex flex-col h-full bg-white dark:bg-[#080808]">
            {/* Header Section */}
            <div className="p-4 border-b border-gray-100 dark:border-white/5">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Inbox</h2>
                    <Search size={20} className="text-gray-400 cursor-pointer" />
                </div>

                {/* WhatsApp Style Tabs */}
                <div className="flex bg-gray-100 dark:bg-zinc-900/50 p-1 rounded-lg gap-1">
                    <TabButton
                        active={activeTab === "all"}
                        onClick={() => onTabChange("all")}
                        label="All"
                    />
                    <TabButton
                        active={activeTab === "messenger"}
                        onClick={() => onTabChange("messenger")}
                        label="Chats"
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
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {filteredLeads.length === 0 ? (
                    <div className="p-10 text-center flex flex-col items-center">
                        <div className="w-12 h-12 bg-gray-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-3">
                            <MessageSquare size={20} className="text-gray-300" />
                        </div>
                        <p className="text-sm text-gray-400 italic">No {activeTab} conversations</p>
                    </div>
                ) : (
                    filteredLeads.map((lead) => {
                        const isSelected = selectedLeadId === lead.id;
                        return (
                            <button
                                key={lead.id}
                                onClick={() => onSelectLead(lead.id)}
                                className={`w-full p-4 flex items-center gap-3 border-b border-gray-100 dark:border-white/5 transition-all outline-none ${
                                    isSelected 
                                    ? "bg-blue-50 dark:bg-blue-900/10 border-r-4 border-r-blue-600" 
                                    : "hover:bg-gray-50 dark:hover:bg-white/5"
                                }`}
                            >
                                {/* Avatar */}
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                                    lead.source === 'meta_ad' 
                                    ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600" 
                                    : "bg-blue-100 dark:bg-blue-900/30 text-blue-600"
                                }`}>
                                    <User size={22} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className={`text-[15px] truncate ${isSelected ? "font-bold text-blue-600" : "font-semibold text-gray-900 dark:text-gray-100"}`}>
                                            {lead.full_name || "New Prospect"}
                                        </h4>
                                        <span className="text-[10px] text-gray-400 font-medium">
                                            {lead.created_at ? formatDistanceToNow(new Date(lead.created_at), { addSuffix: false }) : ""}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center gap-1.5">
                                        {lead.source === 'meta_ad' ? (
                                            <span className="text-[8px] bg-orange-500 text-white px-1 py-0.5 rounded font-black tracking-tighter">AD</span>
                                        ) : (
                                            <MessageSquare size={12} className="text-blue-500" />
                                        )}
                                        <p className="text-[13px] text-gray-500 dark:text-gray-400 truncate">
                                            {lead.source === 'meta_ad' ? "Meta Lead Form" : "Messenger Chat"}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}

// Sub-component for Tabs
function TabButton({ active, onClick, label, icon }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-bold uppercase rounded-md transition-all ${
                active 
                ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-white shadow-sm" 
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-400"
            }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}