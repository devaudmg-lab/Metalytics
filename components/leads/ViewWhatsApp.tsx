"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  Mail, Phone, StickyNote, Loader2, 
  Database, Clock, MessageSquare,
  ExternalLink, ClipboardList, Info,
  Search, Zap, Hash, Calendar, ArrowRight
} from "lucide-react";

export default function ViewWhatsApp({ data, onSave, savingId }: any) {
  const [selectedId, setSelectedId] = useState<string | null>(data[0]?.id || null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fix: Ensure the first lead is selected if data changes or loads
  useEffect(() => {
    if (!selectedId && data.length > 0) {
      setSelectedId(data[0].id);
    }
  }, [data, selectedId]);

  const filteredLeads = useMemo(() => {
    return data.filter((lead: any) => 
      lead.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.includes(searchTerm)
    );
  }, [data, searchTerm]);

  const selectedLead = data.find((l: any) => l.id === selectedId);

  const getRawData = (lead: any) => {
    try {
      return typeof lead.raw_data === 'string' ? JSON.parse(lead.raw_data) : lead.raw_data;
    } catch (e) { return null; }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] w-full gap-0 bg-[#050505] text-zinc-300 antialiased overflow-hidden border border-white/5 rounded-[3rem] shadow-3xl">
      
      {/* LEFT: SIDEBAR */}
      <aside className="w-80 flex flex-col border-r border-white/5 bg-[#080808]">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black tracking-[0.3em] text-blue-500 uppercase">Incoming</h3>
            <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[9px] font-bold">{filteredLeads.length} Leads</span>
          </div>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={14} />
            <input 
              type="text" 
              placeholder="Search by name, email, phone..."
              className="w-full bg-zinc-900/50 border border-white/5 rounded-xl py-2.5 pl-9 pr-4 text-xs outline-none focus:border-blue-500/30 transition-all placeholder:text-zinc-700"
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
                onClick={() => setSelectedId(lead.id)}
                className={`w-full text-left p-4 mb-2 rounded-2xl transition-all duration-300 flex items-center gap-3 relative group
                  ${selectedId === lead.id ? 'bg-zinc-900 border border-white/10 shadow-xl' : 'hover:bg-white/[0.02] border border-transparent'} `}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs transition-all duration-500
                  ${selectedId === lead.id ? 'bg-blue-600 text-white scale-110' : 'bg-zinc-800 text-zinc-500'}`}>
                  {lead.full_name?.charAt(0) || '?'}
                </div>
                <div className="flex-1 truncate">
                  <p className={`text-xs font-bold truncate transition-colors ${selectedId === lead.id ? 'text-white' : 'text-zinc-400'}`}>
                    {lead.full_name || "New Prospect"}
                  </p>
                  <p className="text-[9px] text-zinc-600 font-medium mt-0.5">{new Date(lead.created_at).toLocaleDateString()}</p>
                </div>
                {selectedId === lead.id && <ArrowRight size={12} className="text-blue-500 animate-pulse" />}
              </button>
            ))
          ) : (
            <div className="text-center py-10 text-zinc-700 text-[10px] font-bold uppercase tracking-widest">No results found</div>
          )}
        </div>
      </aside>

      {/* CENTER: MAIN INTERFACE */}
      <main className="flex-1 flex flex-col bg-gradient-to-b from-zinc-900/20 to-black relative">
        {selectedLead ? (
          <div className="flex flex-col h-full">
            <header className="p-10 flex justify-between items-start border-b border-white/5 bg-white/[0.01]">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-4xl font-black text-white tracking-tight leading-none italic">{selectedLead.full_name}</h2>
                  <div className="px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[8px] font-black uppercase tracking-widest">Active Lead</div>
                </div>
                <div className="flex items-center gap-4 text-zinc-500">
                  <span className="flex items-center gap-1.5 text-xs font-medium"><Mail size={12}/> {selectedLead.email || 'No Email'}</span>
                  <span className="flex items-center gap-1.5 text-xs font-medium"><Phone size={12}/> {selectedLead.phone || 'No Phone'}</span>
                </div>
              </div>
              
              <button 
                onClick={() => window.open(`https://wa.me/${selectedLead.phone?.replace(/\D/g, '')}`, '_blank')}
                className="relative flex items-center gap-3 bg-white text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-tighter hover:bg-emerald-500 hover:text-white transition-all duration-300"
              >
                CONNECT ON WHATSAPP <ExternalLink size={14} />
              </button>
            </header>

            <div className="flex-1 p-10 overflow-y-auto">
              <div className="max-w-3xl space-y-10">
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <StickyNote size={16} className="text-blue-500" />
                      <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Admin Strategy & Notes</span>
                    </div>
                    {savingId === selectedLead.id && <Loader2 size={16} className="animate-spin text-blue-500" />}
                  </div>
                  <div className="relative">
                    {/* KEY BUG FIX: Added 'key' to force re-render when lead changes */}
                    <textarea 
                      key={selectedLead.id}
                      className="w-full bg-zinc-900/40 border border-white/10 rounded-[2.5rem] p-10 text-lg text-white outline-none focus:border-blue-500/40 focus:bg-zinc-900/60 transition-all min-h-[350px] shadow-inner placeholder:text-zinc-800"
                      placeholder="Input lead outcome, next steps, or internal observations..."
                      defaultValue={selectedLead.notes || ""}
                      onBlur={(e) => onSave(selectedLead.id, e.target.value)}
                    />
                    <div className="absolute bottom-6 right-8 text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Auto-Saving Enabled</div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center space-y-4 text-zinc-800">
            <Zap size={48} className="opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Select a prospect</p>
          </div>
        )}
      </main>

      {/* RIGHT: INTELLIGENCE PANEL */}
      {selectedLead && (
        <aside className="w-[450px] border-l border-white/5 bg-[#080808] overflow-y-auto custom-scrollbar">
          <div className="p-8 space-y-10">
            <div className="space-y-2">
              <h3 className="text-white font-black text-[11px] uppercase tracking-[0.4em] flex items-center gap-2">
                <ClipboardList size={14} className="text-blue-500" /> Lead IQ
              </h3>
              <p className="text-[10px] text-zinc-600 font-medium">Form responses mapped from Meta Ads.</p>
            </div>

            <div className="space-y-4">
              {(() => {
                const raw = getRawData(selectedLead);
                if (!raw?.field_data) return <div className="p-10 border border-dashed border-white/5 rounded-3xl text-center text-zinc-800 text-xs">No Meta Data Found</div>;

                return raw.field_data.map((field: any, i: number) => {
                  if (["full_name", "email", "phone_number"].includes(field.name)) return null;

                  return (
                    <div key={i} className="group p-6 rounded-[2rem] bg-zinc-900/50 border border-white/5 hover:border-blue-500/20 transition-all">
                      <p className="text-[10px] font-black uppercase tracking-wider text-zinc-600 group-hover:text-blue-500/70 transition-colors mb-2">
                        {field.name.replace(/_/g, ' ')}
                      </p>
                      <p className="text-sm text-zinc-200 font-bold">
                        {field.values?.[0] || "No Answer"}
                      </p>
                    </div>
                  );
                });
              })()}
            </div>

            <div className="pt-8 space-y-6 border-t border-white/5">
              <div className="bg-blue-600/5 rounded-3xl p-6 border border-blue-500/10 space-y-4 text-[10px] font-bold">
                <div className="flex justify-between">
                  <span className="text-zinc-600 uppercase tracking-widest">Meta ID</span>
                  <span className="text-zinc-400 font-mono">{selectedLead.meta_lead_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600 uppercase tracking-widest">Entry</span>
                  <span className="text-zinc-400">{new Date(selectedLead.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}