"use client";

import { useMemo, useState } from "react";
import { MessageSquare, Phone, User, Search, X, Zap } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "messenger" && lead.source === "messenger") ||
        (activeTab === "whatsapp" && lead.source === "whatsapp");

      const matchesSearch =
        lead.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.source?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesTab && matchesSearch;
    });
  }, [leads, activeTab, searchQuery]);

  return (
    <div className="w-full flex flex-col h-full bg-white dark:bg-slate-950 transition-colors">
      {/* Header Section */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800/50">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-50 uppercase">
            Inbox
          </h2>

          {/* Search Input UI */}
          <div className="relative flex-1 ml-4 group">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
            />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-900 border border-transparent focus:border-indigo-500/30 rounded-full py-2 pl-9 pr-8 text-sm focus:ring-4 focus:ring-indigo-500/5 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-500 transition-all font-medium"
            />
            {searchQuery && (
              <X
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer hover:text-slate-600 dark:hover:text-slate-200"
                onClick={() => setSearchQuery("")}
              />
            )}
          </div>
        </div>

        {/* Action Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl gap-1">
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
            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-3">
              <Search
                size={20}
                className="text-slate-300 dark:text-slate-700"
              />
            </div>
            <p className="text-sm text-slate-400 italic">
              {searchQuery
                ? `No results for "${searchQuery}"`
                : `No ${activeTab} conversations`}
            </p>
          </div>
        ) : (
          filteredLeads.map((lead) => {
            const isSelected = selectedLeadId === lead.id;
            const isWhatsApp = lead.source === "whatsapp";
            const isMetaAd = lead.source === "meta_ad";

            return (
              <button
                key={lead.id}
                onClick={() => onSelectLead(lead.id)}
                className={`w-full p-5 flex items-center gap-4 border-b border-slate-50 dark:border-slate-800/40 cursor-pointer transition-all outline-none relative group ${
                  isSelected
                    ? "bg-indigo-50/50 dark:bg-indigo-500/5 border-l-4 border-l-indigo-600 dark:border-l-indigo-500"
                    : "hover:bg-slate-50 dark:hover:bg-slate-900/50 border-l-4 border-l-transparent"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-105 ${
                    isSelected
                      ? "bg-primary-btn text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  <User size={20} />
                </div>

                <div className="flex-1 min-w-0 text-left">
                  <div className="flex justify-between items-center mb-1">
                    <h4
                      className={`text-[15px] truncate transition-colors ${
                        isSelected
                          ? "font-bold text-primary-btn dark:text-indigo-400"
                          : "font-bold text-slate-900 dark:text-slate-100"
                      }`}
                    >
                      {lead.full_name || "New Prospect"}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                      {lead.created_at
                        ? formatDistanceToNow(new Date(lead.created_at), {
                            addSuffix: false,
                          })
                        : ""}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isMetaAd ? (
                      <div className="flex items-center gap-1 text-orange-500">
                        <Zap size={10} fill="currentColor" />
                        <span className="text-[11px] font-black uppercase tracking-tighter">
                          Meta Lead
                        </span>
                      </div>
                    ) : isWhatsApp ? (
                      <div className="flex items-center gap-1 text-emerald-500">
                        <Phone size={10} />
                        <span className="text-[11px] font-black uppercase tracking-tighter">
                          WhatsApp
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-primary-btn">
                        <MessageSquare size={10} />
                        <span className="text-[11px] font-black uppercase tracking-tighter">
                          Messenger
                        </span>
                      </div>
                    )}
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

function TabButton({ active, onClick, label, icon }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer ${
        active
          ? "bg-white dark:bg-slate-800 text-primary-btn shadow-sm"
          : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
