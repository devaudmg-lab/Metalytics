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
    <div className="flex h-[calc(100vh-180px)] md:h-[calc(100vh-200px)] w-full gap-0 bg-white dark:bg-[#020617] text-slate-900 dark:text-slate-100 antialiased overflow-hidden border border-slate-200 dark:border-slate-800 rounded-sm shadow-xl relative transition-colors duration-300">
      {/* 1. MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-950 w-full max-w-lg rounded-sm border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <h3 className="text-sm font-bold uppercase text-primary-btn flex items-center gap-2">
                <MapPinned size={14} /> Add Service Region
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X size={18} className="cursor-pointer text-slate-500" />
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
        } lg:flex w-full lg:w-80 flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#020617]`}
      >
        <div className="p-4 md:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] md:text-[15px] text-primary-btn font-semibold tracking-wider">
              Incoming
            </h3>
            <span className="px-2 py-0.5 rounded-sm bg-indigo-100 dark:bg-indigo-500/10 text-primary-btn text-[10px] md:text-[15px] font-bold">
              {filteredLeads.length} Leads
            </span>
          </div>
          <div className="relative group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
              size={14}
            />
            <input
              type="text"
              placeholder="Search leads..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-400"
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
                      ? "bg-indigo-50 dark:bg-indigo-500/5 border-indigo-200 dark:border-indigo-500/30 ring-1 ring-indigo-500/10"
                      : "bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }
                  ${!lead.is_filtered && "border-l-4 border-l-rose-500"}`}
              >
                <div className="flex-1 truncate">
                  <div className="flex justify-between items-start">
                    <p
                      className={`text-sm md:text-lg font-semibold truncate ${
                        selectedId === lead.id
                          ? "text-primary-btn"
                          : "text-slate-900 dark:text-slate-100"
                      }`}
                    >
                      {lead.full_name || "Untitled Lead"}
                    </p>
                    <ArrowRight
                      size={14}
                      className={`text-indigo-500 transition-all ${
                        selectedId === lead.id
                          ? "opacity-100 translate-x-0"
                          : "opacity-0 -translate-x-2"
                      }`}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-[15px] text-slate-500 dark:text-slate-400 font-medium tracking-tight">
                      {lead.created_at
                        ? formatDate(new Date(lead.created_at), "MMM dd, yyyy")
                        : "N/A"}
                    </p>
                    {!lead.is_filtered && (
                      <div
                        onClick={(e) => openLocationModal(e, lead)}
                        className="p-1.5 rounded-sm bg-rose-500 text-white cursor-pointer hover:scale-110 transition-all duration-100"
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
              <MessageSquare
                size={32}
                className="mx-auto mb-2 opacity-10 text-slate-400"
              />
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
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
        <main className="flex-1 flex flex-col bg-white dark:bg-[#020617] relative overflow-y-auto">
          {selectedLead ? (
            <div className="flex flex-col h-full">
              <header className="p-6 md:p-10 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => setIsMobileDetailOpen(false)}
                    className="lg:hidden p-2 bg-slate-100 dark:bg-slate-800 rounded-full"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {selectedLead.full_name}
                      </h2>
                      <span
                        className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider border ${
                          selectedLead.is_filtered
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                            : "bg-rose-500/10 border-rose-500/20 text-rose-500"
                        }`}
                      >
                        {selectedLead.is_filtered
                          ? "Verified Region"
                          : "Out of Region"}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-sm border border-slate-200 dark:border-slate-800">
                        <Mail size={14} className="text-indigo-500" />
                        <span className="truncate max-w-[200px]">
                          {selectedLead.email || "No Email"}
                        </span>
                        <button
                          onClick={handleCopy}
                          className="hover:text-indigo-500 transition-colors cursor-pointer"
                        >
                          {copied ? (
                            <Check size={14} className="text-emerald-500" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-sm border border-slate-200 dark:border-slate-800">
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
                  className="w-full md:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm font-bold text-xs uppercase flex items-center justify-center gap-3  shadow-emerald-500/20 cursor-pointer transition-all"
                >
                  Message on WhatsApp <ExternalLink size={14} />
                </button>
              </header>

              <div className="p-6 md:p-10 flex-1">
                <div className="max-w-3xl space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xs uppercase text-slate-500 tracking-widest">
                      <StickyNote size={16} className="text-indigo-500" /> Lead
                      Observations
                    </div>
                    {savingId === selectedLead.id && (
                      <div className="flex items-center gap-2 text-indigo-500 text-xs font-bold animate-pulse">
                        <Loader2 size={14} className="animate-spin" /> Saving...
                      </div>
                    )}
                  </div>
                  <textarea
                    key={selectedLead.id}
                    className="w-full h-64 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-sm p-8 text-lg outline-none focus:border-indigo-500/40 focus:ring-4 focus:ring-indigo-500/5 transition-all resize-none shadow-sm dark:text-slate-200"
                    placeholder="Add private notes about this prospect..."
                    defaultValue={selectedLead.notes || ""}
                    onBlur={(e) => onSave(selectedLead.id, e.target.value)}
                  />
                </div>
                <div className="lg:hidden mt-12 border-t border-slate-100 dark:border-slate-800 pt-10">
                  <IntelligenceContent
                    selectedLead={selectedLead}
                    getRawData={getRawData}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20 text-slate-400">
              <MessageSquare size={64} className="mb-4" />
              <p className="text-xl font-bold uppercase tracking-[0.2em]">
                Select a lead to begin
              </p>
            </div>
          )}
        </main>

        <aside className="hidden lg:block w-[400px] border-l border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-[#020617] overflow-y-auto custom-scrollbar">
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
      selectedLead.postal_code = editedZip;
    }
    setIsUpdating(false);
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <ClipboardList size={16} className="text-indigo-500" /> Lead Data
          Intelligence
        </h3>
      </div>

      <div className="space-y-3">
        {!raw?.field_data ? (
          <div className="py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-sm text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
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
                className="group p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm hover:border-indigo-500/30 transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs uppercase text-slate-500 font-bold tracking-tight">
                    {field.name.replace(/_/g, " ")}
                  </span>
                  {isPostalField && !isEditingZip && (
                    <PencilIcon
                      size={14}
                      className="text-slate-400 hover:text-indigo-500 cursor-pointer transition-colors"
                      onClick={() => setIsEditingZip(true)}
                    />
                  )}
                </div>
                {isPostalField && isEditingZip ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      className="flex-1 bg-slate-50 dark:bg-slate-800 border border-indigo-500/50 rounded-sm px-3 py-1.5 text-sm outline-none font-bold text-slate-900 dark:text-white"
                      value={editedZip}
                      onChange={(e) => setEditedZip(e.target.value)}
                      autoFocus
                    />
                    <button
                      onClick={handleUpdatePostal}
                      disabled={isUpdating}
                      className="p-2 bg-emerald-600 text-white rounded-sm hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {isUpdating ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Check size={14} />
                      )}
                    </button>
                    <button
                      onClick={() => setIsEditingZip(false)}
                      className="p-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-sm"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <p className="text-[15px] font-bold text-slate-900 dark:text-slate-100 break-words">
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

      <div className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex justify-between items-center text-[11px] font-bold">
          <span className="text-slate-500 uppercase tracking-widest">
            Meta Lead ID
          </span>
          <span className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-sm font-mono text-slate-600 dark:text-slate-400 select-all border border-slate-200 dark:border-slate-800">
            {identity?.meta_lead_id || "N/A"}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-[11px] font-bold">
            <span className="text-slate-500 uppercase tracking-widest">
              Captured (AUS)
            </span>
            <span className="text-slate-700 dark:text-slate-400">
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
            <span className="text-slate-500 uppercase tracking-widest">
              Captured (IND)
            </span>
            <span className="text-slate-700 dark:text-slate-400">
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
