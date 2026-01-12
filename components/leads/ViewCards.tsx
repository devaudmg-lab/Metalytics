"use client";

import { useMemo } from "react";
import { Mail, Phone, MapPin, Calendar, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function ViewCards({ data }: any) {
  // --- Logic: Sirf Meta Ad leads filter karein ---
  const adLeadsOnly = useMemo(() => {
    return data?.filter((lead: any) => lead.source === "meta_ad") || [];
  }, [data]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 p-1 md:p-4">
      {adLeadsOnly.map((lead: any) => (
        <div 
          key={lead.id} 
          className={`group relative p-6 md:p-8 rounded-[2rem] md:rounded-sm border transition-all duration-500 hover:-translate-y-2
            ${lead.is_filtered 
              ? 'bg-card border-gray-200 dark:border-white/5 hover:border-primary-btn/40 hover:shadow-xl dark:hover:shadow-[0_20px_50px_rgba(59,130,246,0.1)]' 
              : 'bg-red-50/50 dark:bg-[#1a0a0a] border-red-100 dark:border-red-900/20 hover:border-red-500/40 hover:shadow-xl dark:hover:shadow-[0_20px_50px_rgba(239,68,68,0.1)]'
            }`}
        >
          {/* Subtle Background Icon Glow */}
          <div className={`absolute top-0 right-0 p-6 md:p-10 opacity-[0.05] dark:opacity-[0.03] transition-opacity group-hover:opacity-[0.1] dark:group-hover:opacity-[0.08] 
            ${lead.is_filtered ? 'text-primary-btn' : 'text-red-500'}`}>
            {lead.is_filtered ? <CheckCircle2 size={100} /> : <ShieldAlert size={100} />}
          </div>

          <div className="relative z-10">
            {/* Header: Name & Status */}
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-1">
                <h3 className="text-foreground text-xl md:text-2xl group-hover:text-primary-btn transition-colors lowercase first-letter:uppercase font-semibold">
                  {lead.full_name}
                </h3>
                <div className="flex items-center gap-2">
                   <div className={`w-2 h-2 rounded-full ${lead.is_filtered ? 'bg-primary-btn animate-pulse' : 'bg-red-500'}`} />
                   <span className="text-[10px] uppercase text-gray-700 dark:text-zinc-500 font-bold">
                     {lead.is_filtered ? 'Verified Lead' : 'Outside Region'}
                   </span>
                </div>
              </div>
            </div>

            {/* Content: Contact Details */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4 text-black dark:text-zinc-400 group-hover:text-foreground transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center border border-gray-200 dark:border-white/5">
                  <Mail size={18} className="text-primary-btn/70" />
                </div>
                <span className="text-sm font-semibold truncate">{lead.email}</span>
              </div>
              
              <div className="flex items-center gap-4 text-black dark:text-zinc-400 group-hover:text-foreground transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center border border-gray-200 dark:border-white/5">
                  <Phone size={18} className="text-emerald-500/70" />
                </div>
                <span className="text-sm font-semibold">{lead.phone}</span>
              </div>
            </div>

            {/* Footer: Location & Date (Multi-Timezone) */}
            <div className="pt-6 border-t border-gray-100 dark:border-white/5 space-y-4">
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 px-4 py-2 rounded-sm border border-gray-200 dark:border-white/5">
                <MapPin size={14} className={lead.is_filtered ? "text-primary-btn" : "text-red-500"} />
                <span className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                  {lead.city || "Postal Code"}:- {lead.postal_code || "Not Provided"}
                </span>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                {/* Australia Time */}
                <div className="flex items-center justify-between text-gray-700 dark:text-zinc-500 border-b border-gray-50 dark:border-white/[0.02] pb-1">
                  <div className="flex items-center gap-2">
                    <Calendar size={12} className="text-primary-btn/50" />
                    <span className="text-[10px] font-black uppercase tracking-tighter">AUS (MEL)</span>
                  </div>
                  <span className="text-[10px] font-bold">
                    {new Date(lead.created_at).toLocaleString("en-AU", { 
                      timeZone: "Australia/Melbourne",
                      day: "2-digit", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit", hour12: true 
                    })}
                  </span>
                </div>

                {/* India Time */}
                <div className="flex items-center justify-between text-gray-700 dark:text-zinc-500">
                  <div className="flex items-center gap-2">
                    <Calendar size={12} className="text-orange-500/50" />
                    <span className="text-[10px] font-black uppercase tracking-tighter">IND (IST)</span>
                  </div>
                  <span className="text-[10px] font-bold">
                    {new Date(lead.created_at).toLocaleString("en-IN", { 
                      timeZone: "Asia/Kolkata",
                      day: "2-digit", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit", hour12: true 
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}