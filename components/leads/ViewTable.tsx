"use client";

import { MapPin, Phone, Mail, Calendar, ExternalLink, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function ViewTable({ data }: any) {
  return (
    <div className="bg-card dark:bg-card/90 backdrop-blur-xl rounded-[1.5rem] md:rounded-sm border border-gray-200 dark:border-white/10 overflow-hidden h-full flex flex-col shadow-sm transition-all duration-300">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[800px]">
          {/* Header */}
          <thead className="sticky top-0 z-20 bg-gray-50 dark:bg-[#111] border-b border-gray-200 dark:border-white/10 shadow-sm">
            <tr>
              <th className="p-6 text-[10px] md:text-[11px]  text-gray-700 dark:text-zinc-500 uppercase ">Lead Information</th>
              <th className="p-6 text-[10px] md:text-[11px]  text-gray-700 dark:text-zinc-500 uppercase ">Location Details</th>
              <th className="p-6 text-[10px] md:text-[11px]  text-gray-700 dark:text-zinc-500 uppercase ">Contact Method</th>
              <th className="p-6 text-[10px] md:text-[11px]  text-gray-700 dark:text-zinc-500 uppercase ">Status & Date</th>
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {data.map((lead: any) => (
              <tr 
                key={lead.id} 
                className="group hover:bg-gray-50/50 dark:hover:bg-white/3 transition-all cursor-pointer relative"
              >
                {/* 1. Name Column */}
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-inner transition-transform group-hover:scale-110
                      ${lead.is_filtered 
                        ? 'bg-primary-btn text-white' 
                        : 'bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-500 border border-red-200 dark:border-red-500/20'}`}>
                      {lead.full_name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="text-foreground  text-base group-hover:text-primary-btn transition-colors lowercase first-letter:uppercase">
                        {lead.full_name}
                      </p>
                      <p className="text-[10px] text-gray-700 dark:text-zinc-600 font-bold uppercase  mt-0.5 font-mono">
                        ID: {lead.id.slice(0, 8)}
                      </p>
                    </div>
                  </div>
                </td>

                {/* 2. Location Column */}
                <td className="p-6">
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-gray-300 dark:text-zinc-600 group-hover:text-primary-btn transition-colors" />
                    <div>
                      <p className="text-sm font-bold text-gray-700 dark:text-zinc-200">{lead.city}</p>
                      <p className="text-xs text-gray-700 dark:text-zinc-500 font-medium ">{lead.postal_code}</p>
                    </div>
                  </div>
                </td>

                {/* 3. Contact Column */}
                <td className="p-6">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-zinc-400">
                      <Mail size={14} className="opacity-40" />
                      <span className="text-sm font-medium hover:text-primary-btn transition-colors">{lead.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 dark:text-zinc-400">
                      <Phone size={14} className="opacity-40" />
                      <span className="text-sm font-medium">{lead.phone}</span>
                    </div>
                  </div>
                </td>

                {/* 4. Status Column */}
                <td className="p-6">
                  <div className="flex flex-col gap-2">
                    <div className={`flex items-center gap-2 w-fit px-3 py-1 rounded-full border text-[9px]  uppercase 
                      ${lead.is_filtered 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-emerald-500/20' 
                        : 'bg-red-500/10 text-red-600 dark:text-red-500 border-red-500/20'}`}>
                      {lead.is_filtered ? <CheckCircle2 size={12}/> : <ShieldAlert size={12}/>}
                      {lead.is_filtered ? 'Verified' : 'Outside Region'}
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-zinc-600 text-xs">
                      <Calendar size={12} />
                      <span className="font-bold">{new Date(lead.created_at).toLocaleDateString()}</span>
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