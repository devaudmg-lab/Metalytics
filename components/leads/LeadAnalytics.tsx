"use client";

import React, { useMemo, useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  AreaChart, Area, LineChart, Line, CartesianGrid, Legend 
} from "recharts";
import { 
  Download, Users, ShieldCheck, ShieldAlert, 
  Map, TrendingUp, Clock, Zap, Activity, Info
} from "lucide-react";
import * as XLSX from "xlsx";

// 1. Elegant Slim Scrollbar Styles (Add this to your globals.css or keep here)
const scrollbarStyles = `
  .custom-slim-scroll::-webkit-scrollbar { width: 5px; height: 5px; }
  .custom-slim-scroll::-webkit-scrollbar-track { background: transparent; }
  .custom-slim-scroll::-webkit-scrollbar-thumb { 
    background: rgba(255, 255, 255, 0.05); 
    border-radius: 20px; 
  }
  .custom-slim-scroll:hover::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.3); }
`;

function MetricCard({ label, val, sub, icon, color, glow }: any) {
  return (
    <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-[2.5rem] relative overflow-hidden group hover:border-white/10 transition-all duration-500">
      <div className={`absolute -right-4 -top-4 w-24 h-24 blur-3xl opacity-10 group-hover:opacity-20 transition-opacity ${glow}`} />
      <div className="relative z-10 text-center sm:text-left">
        <div className={`mb-3 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mx-auto sm:mx-0 ${color}`}>
          {icon}
        </div>
        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">{label}</p>
        <h3 className="text-3xl font-black text-white mt-1 tracking-tighter">{val}</h3>
        <p className="text-zinc-600 text-[9px] font-bold mt-1 uppercase tracking-widest">{sub}</p>
      </div>
    </div>
  );
}

export default function LeadAnalytics({ data }: { data: any[] }) {
  const [limitZips, setLimitZips] = useState(true);

  const stats = useMemo(() => {
    if (!data || data.length === 0) return null;
    const zipMap: any = {};
    const dailyMap: any = {};
    const hourlyDist = Array.from({ length: 24 }, (_, i) => ({ 
      hour: `${i}:00`, verified: 0, outside: 0, total: 0 
    }));
    let todayCount = 0;
    const todayStr = new Date().toISOString().split("T")[0];

    data.forEach((lead) => {
      const date = new Date(lead.created_at);
      const dateStr = date.toISOString().split("T")[0];
      const hour = date.getHours();
      const zip = lead.postal_code || "N/A";
      const dayLabel = date.toLocaleDateString("en-US", { month: "short", day: "2-digit" });

      if (!dailyMap[dayLabel]) dailyMap[dayLabel] = { name: dayLabel, verified: 0, outside: 0 };
      lead.is_filtered ? dailyMap[dayLabel].verified++ : dailyMap[dayLabel].outside++;
      hourlyDist[hour].total++;
      lead.is_filtered ? hourlyDist[hour].verified++ : hourlyDist[hour].outside++;
      if (!zipMap[zip]) zipMap[zip] = { zip, verified: 0, outside: 0, total: 0 };
      zipMap[zip].total++;
      lead.is_filtered ? zipMap[zip].verified++ : zipMap[zip].outside++;
      if (dateStr === todayStr) todayCount++;
    });

    return {
      total: data.length,
      verified: data.filter(l => l.is_filtered).length,
      outside: data.length - data.filter(l => l.is_filtered).length,
      today: todayCount,
      timeSeries: Object.values(dailyMap).slice(-12),
      hourly: hourlyDist,
      zips: Object.values(zipMap).sort((a: any, b: any) => b.total - a.total),
    };
  }, [data]);

  const generateReport = () => {
    const wsData = stats?.zips.map((z:any) => ({
      "Postal Code": z.zip,
      "Total Leads": z.total,
      "Verified (Inside)": z.verified,
      "Flagged (Outside)": z.outside,
      "Quality Score": ((z.verified / z.total) * 100).toFixed(1) + "%"
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(wsData || []);
    XLSX.utils.book_append_sheet(wb, ws, "Regional Quality Report");
    XLSX.writeFile(wb, `Lead_Intelligence_${new Date().getTime()}.xlsx`);
  };

  if (!stats) return null;

  return (
    <div className="relative h-[calc(100vh-140px)] overflow-y-auto px-2 custom-slim-scroll">
      <style>{scrollbarStyles}</style>

      {/* CENTER TOP TAGS: Floating Quality Metrics */}
      <div className="sticky top-0 z-50 flex justify-center pt-2 pb-6 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 px-6 py-2 rounded-full flex items-center gap-6 shadow-2xl pointer-events-auto">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Verified:</span>
            <span className="text-sm font-black text-white">{stats.verified}</span>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Flagged:</span>
            <span className="text-sm font-black text-white">{stats.outside}</span>
          </div>
        </div>
      </div>

      <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {/* Metrics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <MetricCard label="Total Inflow" val={stats.total} sub="Gross Leads" icon={<Users size={20}/>} color="text-white" glow="bg-white" />
          <MetricCard label="Efficiency" val={`${((stats.verified/stats.total)*100).toFixed(1)}%`} sub="Market Fit" icon={<Activity size={20}/>} color="text-blue-500" glow="bg-blue-500" />
          <MetricCard label="Flagged" val={stats.outside} sub="Filtered Out" icon={<ShieldAlert size={20}/>} color="text-red-500" glow="bg-red-500" />
          <MetricCard label="Velocity" val={`+${stats.today}`} sub="Captured Today" icon={<Zap size={20}/>} color="text-emerald-500" glow="bg-emerald-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Trend Area Chart */}
          <div className="lg:col-span-2 bg-[#0a0a0a] border border-white/5 p-8 rounded-[3rem] h-[450px]">
            <div className="flex justify-between items-center mb-10">
              <h4 className="text-white font-black text-[11px] uppercase tracking-[0.3em] flex items-center gap-2">
                <TrendingUp size={16} className="text-blue-500"/> Quality Trajectory
              </h4>
            </div>
            <ResponsiveContainer width="100%" height="80%">
              <AreaChart data={stats.timeSeries}>
                <defs>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#111" vertical={false} />
                <XAxis dataKey="name" stroke="#333" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#333" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{backgroundColor: '#000', border: '1px solid #222', borderRadius: '15px'}} />
                <Area type="monotone" dataKey="verified" name="Verified" stroke="#3b82f6" fill="url(#blueGrad)" strokeWidth={4} dot={{fill: '#3b82f6', r: 4}} />
                <Area type="monotone" dataKey="outside" name="Flagged" stroke="#ef4444" fill="transparent" strokeWidth={2} strokeDasharray="6 6" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Hourly Heatmap */}
          <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[3rem] h-[450px]">
            <h4 className="text-white font-black text-[11px] uppercase tracking-[0.3em] mb-10 flex items-center gap-2">
              <Clock size={16} className="text-emerald-500"/> Peak Inflow
            </h4>
            <ResponsiveContainer width="100%" height="80%">
              <LineChart data={stats.hourly}>
                <XAxis dataKey="hour" stroke="#333" fontSize={9} axisLine={false} tickLine={false} interval={5} />
                <Tooltip contentStyle={{backgroundColor: '#000', border: 'none'}} />
                <Line type="step" dataKey="total" stroke="#10b981" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Regional Market Share Bar Chart */}
          <div className="lg:col-span-3 bg-[#0a0a0a] border border-white/5 p-10 rounded-[3.5rem]">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
              <div className="text-center md:text-left">
                <h4 className="text-white font-black text-sm uppercase tracking-[0.4em] flex items-center justify-center md:justify-start gap-2">
                  <Map size={20} className="text-blue-500"/> Regional Intelligence
                </h4>
                <p className="text-zinc-600 text-[10px] mt-2 font-black uppercase tracking-widest">Market distribution across postal codes</p>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setLimitZips(!limitZips)}
                  className="bg-white/[0.03] border border-white/10 text-zinc-400 px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] hover:text-white hover:bg-white/10 transition-all"
                >
                  {limitZips ? "Expand Data" : "Collapse Data"}
                </button>
                <button 
                  onClick={generateReport}
                  className="bg-blue-600 text-white px-8 py-3 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-2xl shadow-blue-900/40 hover:bg-blue-500 transition-all"
                >
                  <Download size={14}/> Export XLSX
                </button>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={450}>
              <BarChart data={limitZips ? stats.zips.slice(0, 10) : stats.zips}>
                <CartesianGrid strokeDasharray="3 3" stroke="#111" vertical={false} />
                <XAxis dataKey="zip" stroke="#444" fontSize={11} tickLine={false} axisLine={false} angle={-45} textAnchor="end" height={60} />
                <YAxis stroke="#444" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} contentStyle={{backgroundColor: '#000', border: '1px solid #222', borderRadius: '15px'}} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '40px', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '900' }} />
                <Bar name="Verified" dataKey="verified" stackId="a" fill="#3b82f6" barSize={40} radius={[4, 4, 0, 0]} />
                <Bar name="Flagged" dataKey="outside" stackId="a" fill="#18181b" className="border-gray-600" barSize={40} radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}