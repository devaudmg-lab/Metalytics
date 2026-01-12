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
            // Nayi lead aane par humein uski meta_identities bhi chahiye hogi
            // Isliye hum naye lead ko firse fetch karte hain detail ke sath
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
      
      // Search logic for name, email, phone or city
      const matchesSearch =
        lead.full_name?.toLowerCase().includes(searchLower) ||
        lead.email?.toLowerCase().includes(searchLower) ||
        lead.phone?.includes(searchQuery) ||
        lead.city?.toLowerCase().includes(searchLower);
      
      // Date Filter logic
      const d = new Date(lead.created_at);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const leadLocalDate = `${year}-${month}-${day}`;

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
    <div className="flex flex-col min-h-screen space-y-4 md:space-y-8 pb-10 md:pb-20 transition-colors duration-300">
      
      <section className="sticky top-0 z-40 w-full animate-in fade-in slide-in-from-top-4 duration-500">
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

      <main className="flex-1 rounded-[1.5rem] md:rounded-sm border border-gray-200 dark:border-border-custom bg-card/50 dark:bg-card/20 backdrop-blur-md overflow-hidden min-h-[400px] shadow-sm">
        <div className="border-b border-gray-200 dark:border-border-custom bg-gray-50/50 dark:bg-white/5 flex flex-col sm:flex-row items-start sm:items-center px-6 md:px-8 py-4 justify-between gap-2">
          <div className="flex items-center gap-2 text-tx-black dark:text-zinc-500 font-bold text-[10px] md:text-[15px] ">
            <Layers size={14}/>
            <span>{displayData.length}</span> Records Found
          </div>
          <div className="text-[10px] md:text-[15px] text-tx-black dark:text-zinc-600 flex items-center gap-2 font-bold">
            View Mode: <span className="text-primary-btn bg-toggle dark:bg-primary-btn/10 px-2 py-0.5 rounded">{viewMode}</span>
          </div>
        </div>
        
        <div>
          <div className="animate-in fade-in duration-500">
            {viewMode === "whatsapp" && (
              <ViewWhatsApp
                data={displayData}
                onSave={handleSaveNote}
                savingId={savingId}
              />
            )}
            {viewMode === "card" && <ViewCards data={displayData} />}
            {viewMode === "table" && (
              <div className="overflow-x-auto custom-scrollbar">
                <ViewTable data={displayData} />
              </div>
            )}
          </div>
        </div>
      </main>

      <section className="bg-card border border-gray-200 dark:border-border-custom rounded-[1.5rem] md:rounded-sm p-6 md:p-10 mt-6 md:mt-12 shadow-sm transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8 md:mb-12">
          <div className="p-3 bg-prtext-primary-btn/10 dark:bg-prtext-primary-btn/5 rounded-sm w-fit border border-prtext-primary-btn/20">
            <BarChart3 size={24} className="text-primary-btn dark:text-primary-btn" />
          </div>
          <div>
            <h2 className=" text-tx-black dark:text-zinc-500 font-bold text-[10px] md:text-[15px]">
              Market <span className="text-primary-btn dark:text-primary-btn">Intelligence</span>
            </h2>
            <p className="text-xs uppercase text-gray-700 dark:text-zinc-600 mt-1">
               Visualizing real-time data trends
            </p>
          </div>
        </div>
        
        <div className="w-full">
          <LeadAnalytics data={displayData} />
        </div>
      </section>
    </div>
  );
}