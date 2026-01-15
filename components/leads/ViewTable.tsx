"use client";

import { useMemo } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Calendar,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";

export default function ViewTable({ data }: any) {
  // --- Logic: Sirf Meta Ad leads filter karein ---
  const adLeadsOnly = useMemo(() => {
    return data?.filter((lead: any) => lead.source === "meta_ad") || [];
  }, [data]);

  return (
    <div className="bg-white dark:bg-slate-900/90 backdrop-blur-xl rounded-sm border border-slate-200 dark:border-slate-800 overflow-hidden h-full flex flex-col shadow-sm transition-all duration-300">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[900px]">
          {/* Header */}
          <thead className="sticky top-0 z-20 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shadow-sm">
            <tr>
              <th className="p-6 text-[10px] md:text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
                Lead Information
              </th>
              <th className="p-6 text-[10px] md:text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
                Location Details
              </th>
              <th className="p-6 text-[10px] md:text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
                Contact Method
              </th>
              <th className="p-6 text-[10px] md:text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
                Status & Timezones
              </th>
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {adLeadsOnly.map((lead: any) => (
              <tr
                key={lead.id}
                className="group hover:bg-slate-50/50 dark:hover:bg-indigo-500/5 transition-all cursor-pointer relative"
              >
                {/* 1. Name Column */}
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-inner transition-transform group-hover:scale-110
                      ${
                        lead.is_filtered
                          ? "bg-primary-btn text-white shadow-indigo-200 dark:shadow-none"
                          : "bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20"
                      }`}
                    >
                      {lead.full_name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="text-slate-900 dark:text-slate-100 text-base group-hover:text-primary-btn dark:group-hover:text-indigo-400 transition-colors lowercase first-letter:uppercase font-semibold">
                        {lead.full_name}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-500 font-bold uppercase mt-0.5 font-mono tracking-tighter">
                        ID: {lead.id.slice(0, 8)}
                      </p>
                    </div>
                  </div>
                </td>

                {/* 2. Location Column */}
                <td className="p-6">
                  <div className="flex items-center gap-3">
                    <MapPin
                      size={16}
                      className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 transition-colors"
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                        {lead.city || "N/A"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 font-medium">
                        {lead.postal_code || "---"}
                      </p>
                    </div>
                  </div>
                </td>

                {/* 3. Contact Column */}
                <td className="p-6">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Mail size={14} className="opacity-40" />
                      <span className="text-sm font-medium hover:text-primary-btn dark:hover:text-indigo-400 transition-colors">
                        {lead.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Phone size={14} className="opacity-40" />
                      <span className="text-sm font-medium">{lead.phone}</span>
                    </div>
                  </div>
                </td>

                {/* 4. Status & Multi-Timezone Column */}
                <td className="p-6">
                  <div className="flex flex-col gap-3">
                    {/* Status Badge */}
                    <div
                      className={`flex items-center gap-2 w-fit px-3 py-1 rounded-full border text-[9px] uppercase font-bold
                      ${
                        lead.is_filtered
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                      }`}
                    >
                      {lead.is_filtered ? (
                        <CheckCircle2 size={12} />
                      ) : (
                        <ShieldAlert size={12} />
                      )}
                      {lead.is_filtered ? "Verified" : "Outside Region"}
                    </div>

                    {/* Dates */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-500 text-[10px] font-bold">
                        <span className="w-6 text-indigo-500/60">AUS</span>
                        <span className="text-slate-700 dark:text-slate-400">
                          {new Date(lead.created_at).toLocaleString("en-AU", {
                            timeZone: "Australia/Melbourne",
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-500 text-[10px] font-bold">
                        <span className="w-6 text-orange-500/60">IND</span>
                        <span className="text-slate-700 dark:text-slate-400">
                          {new Date(lead.created_at).toLocaleString("en-IN", {
                            timeZone: "Asia/Kolkata",
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
