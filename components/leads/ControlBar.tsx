"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Calendar,
  MessageSquare,
  LayoutGrid,
  List,
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import * as XLSX from "xlsx";
import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameDay,
  isWithinInterval,
  addMonths,
  subMonths,
  addDays,
  isToday,
  isBefore,
  isValid,
} from "date-fns";

// --- Sub-component: Visual Calendar Grid ---
const DualCalendar = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}: any) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkSize = () => setIsMobile(window.innerWidth < 768);
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  const monthsToShow = isMobile
    ? [currentMonth]
    : [currentMonth, addMonths(currentMonth, 1)];
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  const handleDateClick = (day: Date) => {
    if (!start || (start && end)) {
      setStartDate(format(day, "yyyy-MM-dd"));
      setEndDate("");
    } else {
      if (isBefore(day, start)) {
        setStartDate(format(day, "yyyy-MM-dd"));
        setEndDate(format(start, "yyyy-MM-dd"));
      } else {
        setEndDate(format(day, "yyyy-MM-dd"));
      }
    }
  };

  const renderMonth = (month: Date) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const rows = [];
    let days = [];
    let day = calendarStart;

    while (day <= calendarEnd) {
      for (let i = 0; i < 7; i++) {
        const d = day;
        const isSelected =
          (start && isSameDay(d, start)) || (end && isSameDay(d, end));
        const inRange = start && end && isWithinInterval(d, { start, end });
        const isDifferentMonth = !isSameDay(startOfMonth(d), monthStart);

        days.push(
          <div
            key={format(d, "yyyy-MM-dd-HH-mm-ss")}
            onClick={() => !isDifferentMonth && handleDateClick(d)}
            className={`relative h-10 w-full flex items-center justify-center text-[14px] cursor-pointer transition-all
              ${
                isDifferentMonth
                  ? "text-transparent pointer-events-none"
                  : "text-foreground font-medium"
              }
              ${inRange && !isSelected ? "bg-primary-btn/10" : ""}
              ${
                isSelected
                  ? "bg-primary-btn text-white rounded-sm z-10"
                  : "hover:bg-toggle rounded-sm"
              }
              ${
                isToday(d) && !isSelected
                  ? "border border-primary-btn/40 rounded-sm"
                  : ""
              }
            `}
          >
            {format(d, "d")}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={`row-${day.getTime()}`} className="grid grid-cols-7 gap-px">
          {days}
        </div>
      );
      days = [];
    }
    return rows;
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 p-6 bg-card">
      {monthsToShow.map((m, idx) => (
        <div key={`month-${idx}`} className="flex-1 min-w-[260px]">
          <div className="flex items-center justify-between mb-6">
            <button
              type="button"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className={`p-2 hover:bg-toggle rounded-sm text-muted-foreground hover:text-foreground transition-colors ${
                !isMobile && idx === 1 ? "invisible" : ""
              }`}
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-xs font-bold uppercase tracking-widest text-foreground">
              {format(m, "MMMM yyyy")}
            </span>
            <button
              type="button"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className={`p-2 hover:bg-toggle rounded-sm text-muted-foreground hover:text-foreground transition-colors ${
                !isMobile && idx === 0 ? "invisible" : ""
              }`}
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="grid grid-cols-7 mb-4">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div
                key={d}
                className="text-[10px] text-center text-muted-foreground font-bold uppercase tracking-tighter"
              >
                {d}
              </div>
            ))}
          </div>
          {renderMonth(m)}
        </div>
      ))}
    </div>
  );
};

export default function ControlBar({
  viewMode,
  setViewMode,
  filterMode,
  setFilterMode,
  searchQuery,
  setSearchQuery,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  data,
}: any) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setIsCalendarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const exportToExcel = () => {
    if (!data || data.length === 0) return;
    const excelRows = data.map((item: any) => ({
      "Full Name": item.full_name,
      "Phone Number": item.phone,
      City: item.city || "N/A",
      "Postal Code": item.postal_code,
      Status: item.is_filtered ? "Verified" : "Outside Area",
      Date: item.created_at
        ? format(new Date(item.created_at), "dd/MM/yyyy HH:mm")
        : "N/A",
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
    XLSX.writeFile(
      workbook,
      `Leads_Report_${format(new Date(), "yyyy-MM-dd")}.xlsx`
    );
  };

  const quickOptions = [
    { label: "Today", get: () => ({ s: new Date(), e: new Date() }) },
    {
      label: "Yesterday",
      get: () => {
        const yest = subDays(new Date(), 1);
        return { s: yest, e: yest };
      },
    },
    {
      label: "Last 7 Days",
      get: () => ({ s: subDays(new Date(), 7), e: new Date() }),
    },
    {
      label: "This Month",
      get: () => ({ s: startOfMonth(new Date()), e: new Date() }),
    },
  ];

  const displayDateRange = () => {
    if (!startDate) return "Select Dates";
    const s = new Date(startDate);
    const e = endDate ? new Date(endDate) : null;
    if (!isValid(s)) return "Select Dates";
    return `${format(s, "dd MMM")} - ${
      e && isValid(e) ? format(e, "dd MMM") : "..."
    }`;
  };

  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-card p-4 rounded-sm border border-border-custom shadow-sm transition-colors duration-300">
      <div className="flex flex-col sm:flex-row items-stretch gap-3 flex-1">
        {/* View switcher */}
        <div className="flex items-center bg-toggle p-1 rounded-sm border border-border-custom">
          {[
            { id: "whatsapp", icon: <MessageSquare size={16} /> },
            { id: "card", icon: <LayoutGrid size={16} /> },
            { id: "table", icon: <List size={16} /> },
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setViewMode(mode.id)}
              className={`p-2.5 px-4 rounded-sm cursor-pointer transition-all ${
                viewMode === mode.id
                  ? "bg-primary-btn text-white shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {mode.icon}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <input
            type="text"
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border-custom rounded-sm py-3 pl-12 text-sm outline-none focus:border-primary-btn/50 transition-all text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch gap-3">
        {/* Date Picker Button */}
        <div className="relative" ref={calendarRef}>
          <button
            type="button"
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            className="w-full h-full flex items-center gap-2 bg-background px-4 py-3 rounded-sm border border-border-custom min-w-[200px] hover:border-primary-btn/50 transition-all text-sm font-medium text-foreground cursor-pointer"
          >
            <Calendar size={16} className="text-muted-foreground" />
            <span className="truncate">{displayDateRange()}</span>
            <ChevronDown
              size={14}
              className={`ml-auto text-muted-foreground transition-transform duration-300 ${
                isCalendarOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isCalendarOpen && (
            <div className="fixed inset-x-4 top-20 md:absolute md:inset-auto md:top-full md:right-0 mt-2 z-[999] bg-card border border-border-custom shadow-2xl rounded-sm overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in duration-200 max-h-[85vh] md:max-h-none">
              {/* Sidebar Quick Select */}
              <div className="w-full md:w-44 bg-toggle/50 border-b md:border-b-0 md:border-r border-border-custom p-4 space-y-1">
                <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest px-2 pb-3">
                  Quick Select
                </p>
                {quickOptions.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => {
                      setStartDate(format(opt.get().s, "yyyy-MM-dd"));
                      setEndDate(format(opt.get().e, "yyyy-MM-dd"));
                      setIsCalendarOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-primary-btn/10 hover:text-primary-btn rounded-sm transition cursor-pointer"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Calendar Section */}
              <div className="flex flex-col cursor-pointer">
                <DualCalendar
                  startDate={startDate}
                  setStartDate={setStartDate}
                  endDate={endDate}
                  setEndDate={setEndDate}
                />
                <div className="p-4 border-t border-border-custom flex gap-3 justify-end bg-toggle/30">
                  <button
                    type="button"
                    onClick={() => {
                      setStartDate("");
                      setEndDate("");
                      setIsCalendarOpen(false);
                    }}
                    className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCalendarOpen(false)}
                    className="bg-primary-btn hover:bg-primary-hover text-white px-6 py-2 rounded-sm text-sm font-bold transition  shadow-primary-btn/20"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Status Toggle */}
          <button
            type="button"
            onClick={() =>
              setFilterMode(filterMode === "all" ? "filtered" : "all")
            }
            className={`flex-1 px-6 py-3 rounded-sm border text-[11px] uppercase font-black cursor-pointer transition-all ${
              filterMode === "filtered"
                ? "bg-primary-btn/10 border-primary-btn text-primary-btn"
                : "bg-background border-border-custom text-muted-foreground"
            }`}
          >
            {filterMode === "filtered" ? "Verified" : "All Leads"}
          </button>

          {/* Export Button */}
          <button
            type="button"
            onClick={exportToExcel}
            className="flex-1 bg-primary-btn hover:bg-primary-hover text-white px-6 py-3 rounded-sm text-[11px] uppercase font-black tracking-widest flex items-center justify-center gap-2 transition-all  shadow-primary-btn/20 cursor-pointer"
          >
            <Download size={14} /> <span>Export</span>
          </button>
        </div>
      </div>
    </div>
  );
}
