"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Mail,
  Phone,
  StickyNote,
  Loader2,
  Search,
  ExternalLink,
  ClipboardList,
  ChevronLeft,
  ArrowRight,
  MessageSquare,
  MapPinned,
  X,
  Copy,
  Check,
  PencilIcon,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import AddLocationForm from "../locations/AddLocationForm";
import { formatDate } from "date-fns";

export default function ViewWhatsApp({ data, onSave, savingId }: any) {
  const supabase = createClient();

  // --- FILTER: Sirf Meta Ad leads ---
  const adLeadsOnly = useMemo(() => {
    return data?.filter((lead: any) => lead.source === "meta_ad") || [];
  }, [data]);

  const [selectedId, setSelectedId] = useState<string | null>(
    adLeadsOnly[0]?.id || null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeLeadData, setActiveLeadData] = useState({ city: "", zip: "" });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!selectedId && adLeadsOnly.length > 0) {
      setSelectedId(adLeadsOnly[0].id);
    }
  }, [adLeadsOnly, selectedId]);

  const filteredLeads = useMemo(() => {
    return adLeadsOnly.filter(
      (lead: any) =>
        lead.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone?.includes(searchTerm)
    );
  }, [adLeadsOnly, searchTerm]);

  const selectedLead = adLeadsOnly.find((l: any) => l.id === selectedId);

  // --- ROBUST DATA EXTRACTION ---
  const getRawData = (lead: any) => {
    if (!lead) return null;

    // Check multiple paths for safety (Array vs Object)
    const identities = lead.meta_identities;
    const identity = Array.isArray(identities) ? identities[0] : identities;
    const raw = identity?.raw_metadata || lead.raw_data;

    try {
      return typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch (e) {
      console.error("Error parsing metadata:", e);
      return null;
    }
  };

  const handleSelectLead = (id: string) => {
    setSelectedId(id);
    setIsMobileDetailOpen(true);
  };

  const openLocationModal = (e: React.MouseEvent, lead: any) => {
    e.stopPropagation();
    const raw = getRawData(lead);

    const city =
      raw?.field_data?.find((f: any) => f.name.toLowerCase().includes("city"))
        ?.values?.[0] || "VIC";
    const zip =
      raw?.field_data?.find(
        (f: any) =>
          f.name.toLowerCase().includes("zip") ||
          f.name.toLowerCase().includes("post_code")
      )?.values?.[0] || "";

    setActiveLeadData({ city, zip });
    setIsModalOpen(true);
  };

  const handleCopy = async () => {
    if (selectedLead?.email) {
      await navigator.clipboard.writeText(selectedLead.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex h-[calc(100vh-180px)] md:h-[calc(100vh-200px)] w-full gap-0 bg-card dark:bg-[#050505] text-foreground antialiased overflow-hidden border border-gray-200 dark:border-white/5 rounded-sm md:rounded-sm shadow-xl relative transition-colors duration-300">
      {/* 1. MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-card dark:bg-[#0a0a0a] w-full max-w-lg rounded-sm border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/[0.02]">
              <h3 className="text-sm font-bold uppercase text-primary-btn flex items-center gap-2">
                <MapPinned size={14} /> Add Service Region
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
              >
                <X size={18} className="cursor-pointer" />
              </button>
            </div>
            <div className="p-8">
              <AddLocationForm
                defaultCity={activeLeadData.city}
                defaultZip={activeLeadData.zip}
                onSuccess={() => setIsModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. LEFT SIDEBAR */}
      <aside
        className={`${
          isMobileDetailOpen ? "hidden" : "flex"
        } lg:flex w-full lg:w-80 flex-col border-r border-gray-100 dark:border-white/5 bg-white dark:bg-[#080808]`}
      >
        <div className="p-4 md:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] md:text-[15px] text-primary-btn font-semibold tracking-wider">
              Incoming
            </h3>
            <span className="px-2 py-0.5 rounded-sm bg-primary-btn/10 text-primary-btn text-[10px] md:text-[15px] font-bold">
              {filteredLeads.length} Leads
            </span>
          </div>
          <div className="relative group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-800 group-focus-within:text-primary-btn transition-colors"
              size={14}
            />
            <input
              type="text"
              placeholder="Search by name, email..."
              className="w-full bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-white/5 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-primary-btn/30 transition-all placeholder:text-gray-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-6 custom-scrollbar">
          {filteredLeads.length > 0 ? (
            filteredLeads.map((lead: any) => (
              <button
                key={lead.id}
                onClick={() => handleSelectLead(lead.id)}
                className={`w-full text-left p-4 mb-2 border rounded-sm transition-all duration-300 flex items-start gap-3 relative group cursor-pointer
                  ${
                    selectedId === lead.id
                      ? "bg-primary-btn/5 border-primary-btn/30 ring-1 ring-primary-btn/10"
                      : "bg-white dark:bg-zinc-900/20 border-gray-100 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20"
                  }
                  ${!lead.is_filtered && "border-l-4 border-l-red-500"}`}
              >
                <div className="flex-1 truncate">
                  <div className="flex justify-between items-start">
                    <p
                      className={`text-sm md:text-lg font-semibold truncate ${
                        selectedId === lead.id
                          ? "text-primary-btn"
                          : "text-foreground"
                      }`}
                    >
                      {lead.full_name || "Untitled Lead"}
                    </p>
                    <ArrowRight
                      size={14}
                      className={`text-primary-btn transition-all ${
                        selectedId === lead.id
                          ? "opacity-100 translate-x-0"
                          : "opacity-0 -translate-x-2"
                      }`}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-[15px] text-gray-500 font-medium tracking-tight">
                      {lead.created_at
                        ? formatDate(new Date(lead.created_at), "MMM dd, yyyy")
                        : "N/A"}
                    </p>
                    {!lead.is_filtered && (
                      <div
                        onClick={(e) => openLocationModal(e, lead)}
                        className="p-1.5 rounded-sm dark:bg-red-950/30 text-white bg-primary-btn cursor-pointer hover:scale-110 transition-all duration-100"
                      >
                        <MapPinned size={14} />
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-20">
              <MessageSquare size={32} className="mx-auto mb-2 opacity-10" />
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">
                No matching leads
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* 3. MAIN AREA */}
      <div
        className={`${
          isMobileDetailOpen ? "flex" : "hidden"
        } lg:flex flex-1 flex-col lg:flex-row overflow-hidden`}
      >
        <main className="flex-1 flex flex-col bg-white dark:bg-[#080808] relative overflow-y-auto">
          {selectedLead ? (
            <div className="flex flex-col h-full">
              <header className="p-6 md:p-10 border-b border-gray-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => setIsMobileDetailOpen(false)}
                    className="lg:hidden p-2 bg-gray-100 dark:bg-zinc-800 rounded-full"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl md:text-4xl font-bold tracking-tight">
                        {selectedLead.full_name}
                      </h2>
                      <span
                        className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider border ${
                          selectedLead.is_filtered
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                            : "bg-red-500/10 border-red-500/20 text-red-500"
                        }`}
                      >
                        {selectedLead.is_filtered
                          ? "Verified Region"
                          : "Out of Region"}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex items-center gap-2 text-sm text-gray-800 dark:text-zinc-400 bg-gray-50 dark:bg-white/5 px-3 py-1.5 rounded-sm">
                        <Mail size={14} className="text-primary-btn" />
                        <span className="truncate max-w-[200px]">
                          {selectedLead.email || "No Email"}
                        </span>
                        <button
                          onClick={handleCopy}
                          className="hover:text-primary-btn"
                        >
                          {copied ? (
                            <Check size={14} className="text-emerald-500" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-800 dark:text-zinc-400 bg-gray-50 dark:bg-white/5 px-3 py-1.5 rounded-sm">
                        <Phone size={14} className="text-emerald-500" />
                        <span>{selectedLead.phone || "No Phone"}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() =>
                    window.open(
                      `https://wa.me/${selectedLead.phone?.replace(/\D/g, "")}`,
                      "_blank"
                    )
                  }
                  className="w-full md:w-auto px-6 py-3 bg-primary-btn text-white rounded-sm font-bold text-xs uppercase flex items-center justify-center gap-3 hover:brightness-110 shadow-lg shadow-primary-btn/20 transition-all"
                >
                  Message on WhatsApp <ExternalLink size={14} />
                </button>
              </header>

              <div className="p-6 md:p-10 flex-1">
                <div className="max-w-3xl space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xs uppercase text-gray-500 tracking-widest">
                      <StickyNote size={16} className="text-primary-btn" /> Lead
                      Observations
                    </div>
                    {savingId === selectedLead.id && (
                      <div className="flex items-center gap-2 text-primary-btn text-xs font-bold animate-pulse">
                        <Loader2 size={14} className="animate-spin" /> Saving...
                      </div>
                    )}
                  </div>
                  <textarea
                    key={selectedLead.id}
                    className="w-full h-64 bg-gray-50 dark:bg-zinc-900/30 border border-gray-200 dark:border-white/10 rounded-sm p-8 text-lg outline-none focus:border-primary-btn/40 focus:ring-4 focus:ring-primary-btn/5 transition-all resize-none shadow-inner"
                    placeholder="Add private notes about this prospect..."
                    defaultValue={selectedLead.notes || ""}
                    onBlur={(e) => onSave(selectedLead.id, e.target.value)}
                  />
                </div>
                <div className="lg:hidden mt-12 border-t pt-10">
                  <IntelligenceContent
                    selectedLead={selectedLead}
                    getRawData={getRawData}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20">
              <MessageSquare size={64} className="mb-4" />
              <p className="text-xl font-bold uppercase tracking-[0.2em]">
                Select a lead to begin
              </p>
            </div>
          )}
        </main>

        {/* 4. RIGHT SIDEBAR */}
        <aside className="hidden lg:block w-[400px] border-l border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-[#080808] overflow-y-auto custom-scrollbar">
          <IntelligenceContent
            selectedLead={selectedLead}
            getRawData={getRawData}
          />
        </aside>
      </div>
    </div>
  );
}

function IntelligenceContent({ selectedLead, getRawData }: any) {
  const supabase = createClient();
  const [isEditingZip, setIsEditingZip] = useState(false);
  const [editedZip, setEditedZip] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (selectedLead) {
      setEditedZip(selectedLead.postal_code || "");
    }
  }, [selectedLead]);

  if (!selectedLead) return null;

  const raw = getRawData(selectedLead);

  // Logic for identity normalization
  const identity = Array.isArray(selectedLead.meta_identities)
    ? selectedLead.meta_identities[0]
    : selectedLead.meta_identities;

  const handleUpdatePostal = async () => {
    if (!editedZip) return;
    setIsUpdating(true);
    const { error } = await supabase
      .from("leads")
      .update({ postal_code: editedZip })
      .eq("id", selectedLead.id);
    if (!error) {
      setIsEditingZip(false);
      selectedLead.postal_code = editedZip; // Local UI update
    }
    setIsUpdating(false);
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-black flex items-center gap-2">
          <ClipboardList size={16} /> Lead Data Intelligence
        </h3>
      </div>

      <div className="space-y-3">
        {!raw?.field_data ? (
          <div className="py-12 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-sm text-center">
            <p className="text-[10px] font-bold text-gray-800 uppercase tracking-widest">
              Metadata Not Available
            </p>
          </div>
        ) : (
          raw.field_data.map((field: any, i: number) => {
            if (["full_name", "email", "phone_number"].includes(field.name))
              return null;

            const isPostalField =
              field.name.toLowerCase().includes("post_code") ||
              field.name.toLowerCase().includes("zip");

            return (
              <div
                key={i}
                className="group p-5 bg-white dark:bg-zinc-900/40 border border-gray-200 dark:border-white/5 rounded-sm hover:border-primary-btn/20 transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs uppercase text-gray-700 dark:text-zinc-600">
                    {field.name.replace(/_/g, " ")}
                  </span>
                  {isPostalField && !isEditingZip && (
                    <PencilIcon
                      size={14}
                      className="text-gray-500 hover:text-primary-btn cursor-pointer transition-colors"
                      onClick={() => setIsEditingZip(true)}
                    />
                  )}
                </div>

                {isPostalField && isEditingZip ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      className="flex-1 bg-gray-50 dark:bg-zinc-800 border border-primary-btn/30 rounded-sm px-3 py-1.5 text-sm outline-none font-bold"
                      value={editedZip}
                      onChange={(e) => setEditedZip(e.target.value)}
                      autoFocus
                    />
                    <button
                      onClick={handleUpdatePostal}
                      disabled={isUpdating}
                      className="p-2 bg-emerald-500 text-white rounded-sm hover:bg-emerald-600 disabled:opacity-50"
                    >
                      {isUpdating ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Check size={14} />
                      )}
                    </button>
                    <button
                      onClick={() => setIsEditingZip(false)}
                      className="p-2 bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-gray-300 rounded-sm hover:bg-gray-300"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <p className="text-[15px] font-bold text-foreground break-words">
                    {isPostalField
                      ? selectedLead.postal_code || field.values?.[0]
                      : field.values?.[0] || "—"}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="pt-8 border-t border-gray-100 dark:border-white/5 space-y-4">
        <div className="flex justify-between items-center text-[11px] font-bold">
          <span className="text-gray-800 uppercase tracking-widest">
            Meta Lead ID
          </span>
          <span className="bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-sm font-mono text-gray-800 dark:text-zinc-400 select-all">
            {identity?.meta_lead_id || "N/A"}
          </span>
        </div>

        {/* Time Zones Section */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[11px] font-bold">
            <span className="text-gray-800 uppercase tracking-widest">
              Captured (AUS)
            </span>
            <span className="text-gray-800 dark:text-zinc-400">
              {new Date(selectedLead.created_at).toLocaleString("en-AU", {
                timeZone: "Australia/Melbourne",
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </span>
          </div>

          <div className="flex justify-between items-center text-[11px] font-bold">
            <span className="text-gray-800 uppercase tracking-widest">
              Captured (IND)
            </span>
            <span className="text-gray-800 dark:text-zinc-400">
              {new Date(selectedLead.created_at).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
