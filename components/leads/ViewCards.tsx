"use client";

import { useMemo } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";

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
            ${
              lead.is_filtered
                ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 hover:shadow-xl dark:hover:shadow-[0_20px_50px_rgba(99,102,241,0.1)]"
                : "bg-rose-50/50 dark:bg-[#1a0e0f] border-rose-100 dark:border-rose-900/20 hover:border-rose-500/40 hover:shadow-xl dark:hover:shadow-[0_20px_50px_rgba(244,63,94,0.1)]"
            }`}
        >
          {/* Subtle Background Icon Glow */}
          <div
            className={`absolute top-0 right-0 p-6 md:p-10 opacity-[0.05] dark:opacity-[0.03] transition-opacity group-hover:opacity-[0.1] dark:group-hover:opacity-[0.08] 
            ${lead.is_filtered ? "text-indigo-500" : "text-rose-500"}`}
          >
            {lead.is_filtered ? (
              <CheckCircle2 size={100} />
            ) : (
              <ShieldAlert size={100} />
            )}
          </div>

          <div className="relative z-10">
            {/* Header: Name & Status */}
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-1">
                <h3 className="text-slate-900 dark:text-slate-100 text-xl md:text-2xl group-hover:text-primary-btn dark:group-hover:text-indigo-400 transition-colors lowercase first-letter:uppercase font-semibold">
                  {lead.full_name}
                </h3>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      lead.is_filtered
                        ? "bg-indigo-500 animate-pulse"
                        : "bg-rose-500"
                    }`}
                  />
                  <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold tracking-wider">
                    {lead.is_filtered ? "Verified Lead" : "Outside Region"}
                  </span>
                </div>
              </div>
            </div>

            {/* Content: Contact Details */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4 text-slate-700 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center border border-slate-200 dark:border-slate-700/50">
                  <Mail size={18} className="text-indigo-500/70" />
                </div>
                <span className="text-sm font-semibold truncate">
                  {lead.email}
                </span>
              </div>

              <div className="flex items-center gap-4 text-slate-700 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center border border-slate-200 dark:border-slate-700/50">
                  <Phone size={18} className="text-emerald-500/70" />
                </div>
                <span className="text-sm font-semibold">{lead.phone}</span>
              </div>
            </div>

            {/* Footer: Location & Date (Multi-Timezone) */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-sm border ${
                  lead.is_filtered
                    ? "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700"
                    : "bg-rose-500/5 dark:bg-rose-500/5 border-rose-200/50 dark:border-rose-900/30"
                }`}
              >
                <MapPin
                  size={14}
                  className={
                    lead.is_filtered ? "text-indigo-500" : "text-rose-500"
                  }
                />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {lead.city || "Postal Code"}:-{" "}
                  {lead.postal_code || "Not Provided"}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {/* Australia Time */}
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 border-b border-slate-50 dark:border-slate-800/50 pb-1">
                  <div className="flex items-center gap-2">
                    <Calendar size={12} className="text-indigo-400" />
                    <span className="text-[10px] font-black uppercase tracking-tighter">
                      AUS (MEL)
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    {new Date(lead.created_at).toLocaleString("en-AU", {
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

                {/* India Time */}
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Calendar size={12} className="text-orange-400" />
                    <span className="text-[10px] font-black uppercase tracking-tighter">
                      IND (IST)
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    {new Date(lead.created_at).toLocaleString("en-IN", {
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
        </div>
      ))}
    </div>
  );
}
