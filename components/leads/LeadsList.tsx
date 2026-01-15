"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";

import ViewWhatsApp from "./ViewWhatsApp";
import ViewCards from "./ViewCards";
import ViewTable from "./ViewTable";
import ControlBar from "./ControlBar";
import LeadAnalytics from "./LeadAnalytics";
import { BarChart3, Layers } from "lucide-react";

export default function LeadsList({ initialLeads }: { initialLeads: any[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [viewMode, setViewMode] = useState<"card" | "table" | "whatsapp">("whatsapp");
  const [filterMode, setFilterMode] = useState<"all" | "filtered">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel("realtime_leads")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leads" },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            const { data: newLead } = await supabase
              .from("leads")
              .select("*, meta_identities(*)")
              .eq("id", payload.new.id)
              .single();
            
            if (newLead) setLeads((prev) => [newLead, ...prev]);
          }
          if (payload.eventType === "UPDATE") {
            setLeads((prev) =>
              prev.map((l) => (l.id === payload.new.id ? { ...l, ...payload.new } : l))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const displayData = useMemo(() => {
    return leads.filter((lead) => {
      const matchesMode = filterMode === "all" ? true : lead.is_filtered;
      const searchLower = searchQuery.toLowerCase();
      
      const matchesSearch =
        lead.full_name?.toLowerCase().includes(searchLower) ||
        lead.email?.toLowerCase().includes(searchLower) ||
        lead.phone?.includes(searchQuery) ||
        lead.city?.toLowerCase().includes(searchLower);
      
      const d = new Date(lead.created_at);
      const leadLocalDate = d.toISOString().split('T')[0];

      const matchesDate =
        (startDate ? leadLocalDate >= startDate : true) &&
        (endDate ? leadLocalDate <= endDate : true);
      
      return matchesMode && matchesSearch && matchesDate;
    });
  }, [leads, filterMode, searchQuery, startDate, endDate]);

  const handleSaveNote = async (id: string, text: string) => {
    setSavingId(id);
    await supabase.from("leads").update({ notes: text }).eq("id", id);
    setSavingId(null);
  };

  return (
    <div className="flex flex-col min-h-screen space-y-4 md:space-y-6 pb-10 md:pb-20 transition-colors duration-300">
      
      {/* Sticky Header Control Section */}
      <section className="sticky top-20 z-40 w-full animate-in fade-in slide-in-from-top-2 duration-500">
        <ControlBar
          viewMode={viewMode}
          setViewMode={setViewMode}
          filterMode={filterMode}
          setFilterMode={setFilterMode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          data={displayData}
        />
      </section>

      {/* Main Container: Changed to rounded-sm and border-border-custom */}
      <main className="flex-1 rounded-sm border border-border-custom bg-card shadow-sm overflow-hidden min-h-[500px] transition-all">
        
        {/* Sub-header with metadata info */}
        <div className="border-b border-border-custom bg-toggle/30 flex flex-col sm:flex-row items-start sm:items-center px-6 py-4 justify-between gap-4">
          <div className="flex items-center gap-3 text-foreground text-sm uppercase">
            <Layers size={14} className="text-primary-btn" />
            <span>{displayData.length}</span> Records Synchronized
          </div>
          <div className="text-sm text-muted-foreground flex items-center gap-2 uppercase">
            Active View: 
            <span className="text-primary-btn bg-primary-btn/10 px-3 py-1 rounded-sm border border-primary-btn/20">
              {viewMode}
            </span>
          </div>
        </div>
        
        <div className="relative">
          <div className="animate-in fade-in duration-700">
            {viewMode === "whatsapp" && (
              <ViewWhatsApp
                data={displayData}
                onSave={handleSaveNote}
                savingId={savingId}
              />
            )}
            {viewMode === "card" && (
              <div className="p-6">
                 <ViewCards data={displayData} />
              </div>
            )}
            {viewMode === "table" && (
              <div className="overflow-x-auto custom-scrollbar">
                <ViewTable data={displayData} />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Analytics Section: Sharp edges and theme variables */}
      <section className="bg-card border border-border-custom rounded-sm p-6 md:p-10 mt-4 shadow-sm transition-all relative overflow-hidden dark:bg-[#020617]">
        {/* Decorative corner glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-btn/5 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-10 relative z-10">
          <div className="p-4 bg-primary-btn/10 rounded-sm w-fit border border-primary-btn/20">
            <BarChart3 size={24} className="text-primary-btn" />
          </div>
          <div>
            <h2 className="text-foreground font-black text-[12px] md:text-[14px] uppercase tracking-widest">
              Market <span className="text-primary-btn">Intelligence</span>
            </h2>
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-1.5">
              Visualizing real-time data trends & geographic distribution
            </p>
          </div>
        </div>
        
        <div className="w-full relative z-10">
          <LeadAnalytics data={displayData} />
        </div>
      </section>
    </div>
  );
}