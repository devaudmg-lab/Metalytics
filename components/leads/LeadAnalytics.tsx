"use client";

import React, { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  Download,
  Users,
  ShieldAlert,
  Map,
  TrendingUp,
  Clock,
  Zap,
  Activity,
} from "lucide-react";
import * as XLSX from "xlsx";

function MetricCard({ label, val, sub, icon, color, glow }: any) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-sm relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-500 shadow-sm">
      <div
        className={`absolute -right-4 -top-4 w-24 h-24 blur-3xl opacity-10 group-hover:opacity-20 transition-opacity ${glow}`}
      />
      <div className="relative z-10 text-center sm:text-left">
        <div
          className={`mb-3 w-10 h-10 rounded-sm bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto sm:mx-0 ${color}`}
        >
          {icon}
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider">
          {label}
        </p>
        <h3 className="text-3xl text-slate-900 dark:text-slate-50 mt-1 font-semibold">
          {val}
        </h3>
        <p className="text-slate-600 dark:text-slate-500 text-[9px] font-bold mt-1 uppercase tracking-tight">
          {sub}
        </p>
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
      hour: `${i}:00`,
      verified: 0,
      outside: 0,
      total: 0,
    }));
    let todayCount = 0;
    const todayStr = new Date().toISOString().split("T")[0];

    data.forEach((lead) => {
      const date = new Date(lead.created_at);
      const dateStr = date.toISOString().split("T")[0];
      const hour = date.getHours();
      const zip = lead.postal_code || "N/A";
      const dayLabel = date.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
      });

      if (!dailyMap[dayLabel])
        dailyMap[dayLabel] = { name: dayLabel, verified: 0, outside: 0 };
      lead.is_filtered
        ? dailyMap[dayLabel].verified++
        : dailyMap[dayLabel].outside++;
      hourlyDist[hour].total++;
      lead.is_filtered
        ? hourlyDist[hour].verified++
        : hourlyDist[hour].outside++;
      if (!zipMap[zip])
        zipMap[zip] = { zip, verified: 0, outside: 0, total: 0 };
      zipMap[zip].total++;
      lead.is_filtered ? zipMap[zip].verified++ : zipMap[zip].outside++;
      if (dateStr === todayStr) todayCount++;
    });

    return {
      total: data.length,
      verified: data.filter((l) => l.is_filtered).length,
      outside: data.length - data.filter((l) => l.is_filtered).length,
      today: todayCount,
      timeSeries: Object.values(dailyMap).slice(-12),
      hourly: hourlyDist,
      zips: Object.values(zipMap).sort((a: any, b: any) => b.total - a.total),
    };
  }, [data]);

  const generateReport = () => {
    const wsData = stats?.zips.map((z: any) => ({
      "Postal Code": z.zip,
      "Total Leads": z.total,
      "Verified (Inside)": z.verified,
      "Flagged (Outside)": z.outside,
      "Quality Score": ((z.verified / z.total) * 100).toFixed(1) + "%",
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(wsData || []);
    XLSX.utils.book_append_sheet(wb, ws, "Regional Quality Report");
    XLSX.writeFile(wb, `Lead_Intelligence_${new Date().getTime()}.xlsx`);
  };

  if (!stats) return null;

  return (
    <div className="relative h-full px-2 custom-scrollbar overflow-y-auto dark:bg-[#020617]">
      {/* STICKY TOP TAGS */}
      <div className="sticky top-0 z-40 flex justify-center pt-2 pb-6 pointer-events-none ">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 px-6 py-2 rounded-full flex items-center gap-6 shadow-xl pointer-events-auto">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
              Verified:
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {stats.verified}
            </span>
          </div>
          <div className="w-px h-4 bg-slate-200 dark:bg-slate-700" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
              Flagged:
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {stats.outside}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6 md:space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700 ">
        {/* Metrics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total Inflow"
            val={stats.total}
            sub="Gross Leads"
            icon={<Users size={20} />}
            color="text-primary-btn"
            glow="bg-indigo-500"
          />
          <MetricCard
            label="Efficiency"
            val={`${((stats.verified / stats.total) * 100).toFixed(1)}%`}
            sub="Market Fit"
            icon={<Activity size={20} />}
            color="text-sky-500"
            glow="bg-sky-500"
          />
          <MetricCard
            label="Flagged"
            val={stats.outside}
            sub="Filtered Out"
            icon={<ShieldAlert size={20} />}
            color="text-rose-500"
            glow="bg-rose-500"
          />
          <MetricCard
            label="Velocity"
            val={`+${stats.today}`}
            sub="Captured Today"
            icon={<Zap size={20} />}
            color="text-emerald-500"
            glow="bg-emerald-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Trend Area Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 md:p-8 rounded-sm h-[400px] md:h-[450px]">
            <div className="flex justify-between items-center mb-10">
              <h4 className="text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <TrendingUp size={16} className="text-indigo-500" /> Quality
                Trajectory
              </h4>
            </div>
            <ResponsiveContainer width="100%" height="80%">
              <AreaChart data={stats.timeSeries}>
                <defs>
                  <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  className="text-slate-100 dark:text-slate-800"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={10}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={10}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "none",
                    borderRadius: "8px",
                    color: "#f8fafc",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="verified"
                  name="Verified"
                  stroke="#6366f1"
                  fill="url(#indigoGrad)"
                  strokeWidth={3}
                  dot={{ fill: "#6366f1", r: 4 }}
                />
                <Area
                  type="monotone"
                  dataKey="outside"
                  name="Flagged"
                  stroke="#f43f5e"
                  fill="transparent"
                  strokeWidth={2}
                  strokeDasharray="6 6"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Hourly Heatmap */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 md:p-8 rounded-sm h-[400px] md:h-[450px]">
            <h4 className="text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-10 flex items-center gap-2">
              <Clock size={16} className="text-emerald-500" /> Peak Inflow
            </h4>
            <ResponsiveContainer width="100%" height="80%">
              <LineChart data={stats.hourly}>
                <XAxis
                  dataKey="hour"
                  stroke="#64748b"
                  fontSize={9}
                  axisLine={false}
                  tickLine={false}
                  interval={5}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "none",
                    borderRadius: "8px",
                    color: "#f8fafc",
                  }}
                />
                <Line
                  type="step"
                  dataKey="total"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Regional Market Share Bar Chart */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 md:p-10 rounded-sm">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
              <div className="text-center md:text-left">
                <h4 className="text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center justify-center md:justify-start gap-2">
                  <Map size={20} className="text-indigo-500" /> Regional
                  Intelligence
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-500 mt-2 font-medium">
                  Market distribution by postal code
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => setLimitZips(!limitZips)}
                  className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-4 md:px-6 py-2.5 rounded-sm text-[9px] uppercase font-bold hover:text-primary-btn cursor-pointer transition-all"
                >
                  {limitZips ? "Expand List" : "Collapse List"}
                </button>
                <button
                  onClick={generateReport}
                  className="bg-primary-btn text-white px-6 md:px-8 py-2.5 rounded-sm text-[9px] uppercase font-bold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Download size={14} /> Export XLSX
                </button>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={limitZips ? stats.zips.slice(0, 10) : stats.zips}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  className="text-slate-100 dark:text-slate-800"
                  vertical={false}
                />
                <XAxis
                  dataKey="zip"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(99, 102, 241, 0.05)" }}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "none",
                    borderRadius: "8px",
                    color: "#f8fafc",
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{
                    paddingBottom: "20px",
                    fontSize: "9px",
                    textTransform: "uppercase",
                    fontWeight: "900",
                  }}
                />
                <Bar
                  name="Verified"
                  dataKey="verified"
                  stackId="a"
                  fill="#6366f1"
                  barSize={35}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  name="Flagged"
                  dataKey="outside"
                  stackId="a"
                  fill="#cbd5e1"
                  className="dark:fill-slate-700"
                  barSize={35}
                  radius={[0, 0, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
