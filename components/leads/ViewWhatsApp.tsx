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
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import AddLocationForm from "../locations/AddLocationForm";

export default function ViewWhatsApp({ data, onSave, savingId }: any) {
  const supabase = createClient();
  const [selectedId, setSelectedId] = useState<string | null>(
    data[0]?.id || null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);

  // --- NEW STATE FOR LOCATION CHECKING ---
  const [allowedZips, setAllowedZips] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeLeadData, setActiveLeadData] = useState({ city: "", zip: "" });

  const [copied,setCopied] = useState(false)


  // 1. Fetch existing allowed postal codes on mount
  useEffect(() => {
    const fetchAllowedLocations = async () => {
      const { data: locations, error } = await supabase
        .from("allowed_locations")
        .select("postal_code");

      if (!error && locations) {
        setAllowedZips(locations.map((loc: any) => String(loc.postal_code)));
      }
    };
    fetchAllowedLocations();
  }, [supabase]);

  useEffect(() => {
    if (!selectedId && data.length > 0) {
      setSelectedId(data[0].id);
    }
  }, [data, selectedId]);

  const filteredLeads = useMemo(() => {
    return data.filter(
      (lead: any) =>
        lead.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone?.includes(searchTerm)
    );
  }, [data, searchTerm]);

  const selectedLead = data.find((l: any) => l.id === selectedId);

  const handleSelectLead = (id: string) => {
    setSelectedId(id);
    setIsMobileDetailOpen(true);
  };

  const getRawData = (lead: any) => {
    try {
      return typeof lead.raw_data === "string"
        ? JSON.parse(lead.raw_data)
        : lead.raw_data;
    } catch (e) {
      return null;
    }
  };

  // Helper to open modal with pre-filled data
  const openLocationModal = (e: React.MouseEvent, lead: any) => {
    e.stopPropagation();
    const raw = getRawData(lead);

    // Attempt to auto-find city and zip from metadata
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
  await navigator.clipboard.writeText(selectedLead.email);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000); // 2 second baad reset
};

  return (
    <div className="flex h-[calc(100vh-180px)] md:h-[calc(100vh-200px)] w-full gap-0 bg-card dark:bg-[#050505] text-foreground antialiased overflow-hidden border border-gray-200 dark:border-white/5 rounded-sm md:rounded-sm shadow-xl relative transition-colors duration-300">
      {/* MODAL OVERLAY */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-card dark:bg-[#0a0a0a] w-full max-w-lg rounded-sm border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/[0.02]">
              <h3 className="text-sm font-bold uppercase  text-primary-btn flex items-center gap-2">
                <MapPinned size={14} /> Add Service Region
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
              >
                <X size={18} className="cursor-pointer"/>
              </button>
            </div>
            <div className="p-8">
              <AddLocationForm
                defaultCity={activeLeadData.city}
                defaultZip={activeLeadData.zip}
                onSuccess={() => {
                  setIsModalOpen(false);
                  // Optimistically update the list so the tag disappears immediately
                  setAllowedZips((prev) => [...prev, activeLeadData.zip]);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* LEFT: SIDEBAR */}
      <aside
        className={`${
          isMobileDetailOpen ? "hidden" : "flex"
        } lg:flex w-full lg:w-80 flex-col border-r border-gray-100 dark:border-white/5 bg-white dark:bg-[#080808]`}
      >
        <div className="p-4 md:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] md:text-[15px] text-primary-btn font-semibold">
              Incoming
            </h3>
            <span className="px-2 py-0.5 rounded-smd bg-primary-btn/10 text-primary-btn text-[10px] md:text-[15px] font-bold">
              {filteredLeads.length} Leads
            </span>
          </div>
          <div className="relative group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-primary-btn transition-colors"
              size={14}
            />
            <input
              type="text"
              placeholder="Search leads..."
              className="w-full bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-white/5 py-2.5 pl-9 pr-4 md:text-lg text-sm outline-none focus:border-primary-btn/30 transition-all placeholder:text-gray-700 dark:placeholder:text-zinc-700 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-6 custom-scrollbar">
          {filteredLeads.length > 0 ? (
            filteredLeads.map((lead: any) => {
              // Extract zip for this specific lead to check status
              const raw = getRawData(lead);
              const leadZip =
                raw?.field_data?.find(
                  (f: any) =>
                    f.name.toLowerCase().includes("zip") ||
                    f.name.toLowerCase().includes("post_code")
                )?.values?.[0] || "";
              const isAlreadyAllowed = allowedZips.includes(String(leadZip));

              return (
                <button
                  key={lead.id}
                  onClick={() => handleSelectLead(lead.id)}
                  className={`w-full text-left p-4 mb-2 border border-gray-300 rounded-sm transition-all duration-300 flex items-start gap-3 relative group cursor-pointer
                    ${
                      lead.is_filtered
                        ? "bg-white dark:bg-zinc-700/10"
                        : "bg-red-200/30 dark:bg-red-900/10"
                    }`}
                >
                  <div className="flex-1 truncate">
                    <div className="flex justify-between items-start">
                      <p
                        className={`md:text-lg text-sm font-semibold truncate ${
                          selectedId === lead.id
                            ? "text-primary-btn dark:text-white"
                            : "text-black dark:text-zinc-400"
                        }`}
                      >
                        {lead.full_name || "New Prospect"}
                      </p>
                      <ArrowRight
                        size={12}
                        className={`text-primary-btn transition-all shrink-0 ${
                          selectedId === lead.id
                            ? "opacity-100 translate-x-0"
                            : "opacity-0 -translate-x-2"
                        }`}
                      />
                    </div>

<div className="flex justify-between">

                    <p className="text-sm text-gray-700 dark:text-zinc-600 font-medium">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </p>

                    {/* ADD POSTAL TAG - Only rendered if NOT in allowedZips and leadZip exists */}
                    {!isAlreadyAllowed && leadZip && (
                      <div
                      onClick={(e) => openLocationModal(e, lead)}
                      className="inline-flex items-center p-1 rounded-sm bg-primary-btn border border-emerald-500/20 text-white dark:text-white text-sm font-bold cursor-pointer"
                      >
                        <MapPinned size={14} />
                      </div>
                    )}
                      </div>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="text-center py-10 text-gray-700 text-[10px] font-bold uppercase ">
              No results
            </div>
          )}
        </div>
      </aside>

      {/* CENTER & RIGHT CONTENT */}
      <div
        className={`${
          isMobileDetailOpen ? "flex" : "hidden"
        } lg:flex flex-1 flex-col lg:flex-row overflow-hidden dark:bg-[#080808]`}
      >
        {/* MAIN CHAT AREA */}
        <main className="flex-1 flex flex-col bg-white dark:bg-[#080808] relative overflow-y-auto transition-colors">
          {selectedLead ? (
            <div className="flex flex-col h-full">
              {/* Header */}
              <header className="p-6 md:p-10 flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-gray-100 dark:border-white/5 bg-white dark:bg-white/[0.01]">
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => setIsMobileDetailOpen(false)}
                    className="lg:hidden p-2 -ml-2 bg-gray-100 dark:bg-zinc-800 rounded-full text-foreground"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl sm:text-2xl md:text-4xl text-foreground  leading-none  font-semibold">
                        {selectedLead.full_name}
                      </h2>
                      <div className="flex gap-2">
                        <div
                          className={`px-2 py-1 rounded-smd border text-[10px] uppercase  ${
                            selectedLead.is_filtered
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                              : "bg-red-500/10 border-red-500/20 text-red-500"
                          }`}
                        >
                          {selectedLead.is_filtered ? "Verified" : "Flagged"}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-500 dark:text-zinc-500">
                      <span className="flex items-center gap-1.5 text-[11px] md:text-sm  truncate max-w-[300px] text-gray-700">
                        <Mail size={12} className="text-primary-btn" />{" "}
                        {selectedLead.email || "No Email"}
                        {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} className="text-primary-btn cursor-pointer" onClick={()=>handleCopy()}/>}
                      </span>
                      <span className="flex items-center gap-1.5 text-[11px] md:text-sm text-gray-700">
                        <Phone size={12} className="text-emerald-500" />{" "}
                        {selectedLead.phone || "No Phone"}
                      </span>
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
                  className="w-full sm:w-auto flex items-center justify-center gap-3 bg-primary-btn text-white px-2 py-1 md:px-4 md:py-2 rounded-xl md:rounded-sm text-[10px] md:text-sm uppercase  hover:brightness-110 transition-all"
                >
                  OPEN WHATSAPP <ExternalLink size={14} />
                </button>
              </header>

              {/* Notes Section */}
              <div className="flex-1 p-6 md:p-10 ">
                <section className="space-y-4 max-w-3xl ">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-primary-btn/10 rounded-lg">
                        <StickyNote size={16} className="text-primary-btn" />
                      </div>
                      <span className="text-[15px]  text-gray-500 dark:text-zinc-500">
                        Internal Observations
                      </span>
                    </div>
                    {savingId === selectedLead.id && (
                      <Loader2
                        size={16}
                        className="animate-spin text-primary-btn"
                      />
                    )}
                  </div>
                  <textarea
                    key={selectedLead.id}
                    className="w-full bg-gray-50 dark:bg-zinc-900/40 border border-gray-200 dark:border-white/10 rounded-[1.5rem] md:rounded-sm p-6 md:p-8 text-sm md:md:text-lg text-sm text-foreground outline-none focus:border-primary-btn/40 transition-all min-h-[200px] md:min-h-[300px] shadow-inner"
                    placeholder="Type notes about this lead..."
                    defaultValue={selectedLead.notes || ""}
                    onBlur={(e) => onSave(selectedLead.id, e.target.value)}
                  />
                </section>

                <div className="lg:hidden mt-8">
                  <IntelligenceContent
                    selectedLead={selectedLead}
                    getRawData={getRawData}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-700 p-10 text-center">
              <MessageSquare size={48} className="mb-4 opacity-20" />
              <p className="md:text-lg text-sm uppercase ">
                Select a lead to view intelligence
              </p>
            </div>
          )}
        </main>

        {/* RIGHT: INTELLIGENCE PANEL */}
        <aside className="hidden lg:block w-[350px] lg:w-[450px] border-l border-gray-100 dark:border-white/5 bg-white dark:bg-[#080808] overflow-y-auto custom-scrollbar">
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
  if (!selectedLead) return null;
  const raw = getRawData(selectedLead);

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="space-y-2">
        <h3 className="text-foreground text-[10px] md:text-[15px] flex items-center gap-2 font-semibold">
          <ClipboardList size={14} className="text-primary-btn" /> Lead Data
          Intelligence
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {!raw?.field_data ? (
          <div className="p-10 border border-dashed border-gray-200 dark:border-white/5 rounded-smxl text-center text-gray-700 text-[10px] font-bold uppercase">
            No Metadata Available
          </div>
        ) : (
          raw.field_data.map((field: any, i: number) => {
            if (["full_name", "email", "phone_number"].includes(field.name))
              return null;
            return (
              <div
                key={i}
                className="p-5 rounded-sm bg-white dark:bg-zinc-900/50 border border-gray-300 dark:border-white/5 transition-all hover:border-primary-btn/20"
              >
                <p className="text-xs uppercase  text-gray-700 dark:text-zinc-600 mb-1">
                  {field.name.replace(/_/g, " ")}
                </p>
                <p className="md:text-[15px] text-sm text-foreground font-[550] wrap-break-word">
                  {field.values?.[0] || "No Answer"}
                </p>
              </div>
            );
          })
        )}
      </div>

      <div className="pt-6 border-t border-gray-100 dark:border-white/5 space-y-2 text-[12px]">
        <div className="flex justify-between items-center font-bold">
          <span className="text-gray-700 dark:text-zinc-600  ">
            Meta Lead ID
          </span>
          <span className="text-foreground font-mono bg-gray-100 dark:bg-white/5 px-2 py-1 rounded">
            {selectedLead.meta_lead_id || "N/A"}
          </span>
        </div>
        <div className="flex justify-between items-center font-bold">
          <span className="text-gray-700 dark:text-zinc-600  ">
            Capture Date(IND)
          </span>
          <span className="text-foreground">
            {new Date(selectedLead.created_at).toLocaleString("en-AU", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </span>
        </div>
        <div className="flex justify-between items-center font-bold">
          <span className="text-gray-700 dark:text-zinc-600  ">
            Capture Date(AUS)
          </span>
          <span className="text-foreground">
            {new Date(selectedLead.created_at).toLocaleString("en-AU", {
              timeZone: "Australia/Melbourne",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </span>
        </div>
      </div>
    </div>
  );
}