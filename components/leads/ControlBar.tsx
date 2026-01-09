"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Search, Calendar, MessageSquare, LayoutGrid, List, 
  Download, ChevronDown, ChevronLeft, ChevronRight 
} from "lucide-react";
import * as XLSX from "xlsx";
import { 
  format, subDays, startOfMonth, endOfMonth, startOfWeek, 
  endOfWeek, isSameDay, isWithinInterval, addMonths, subMonths, 
  addDays, isToday, isBefore 
} from "date-fns";

// --- Sub-component: Visual Calendar Grid ---
const DualCalendar = ({ startDate, setStartDate, endDate, setEndDate }: any) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Logic to determine if we show 1 or 2 months based on window width
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkSize = () => setIsMobile(window.innerWidth < 768);
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  const monthsToShow = isMobile ? [currentMonth] : [currentMonth, addMonths(currentMonth, 1)];

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
        const isSelected = (start && isSameDay(d, start)) || (end && isSameDay(d, end));
        const inRange = start && end && isWithinInterval(d, { start, end });
        const isDifferentMonth = !isSameDay(startOfMonth(d), monthStart);

        days.push(
          <div
            key={d.toString()}
            onClick={() => !isDifferentMonth && handleDateClick(d)}
            className={`relative h-10 w-full flex items-center justify-center text-[15px] cursor-pointer transition-all
              ${isDifferentMonth ? "text-transparent pointer-events-none" : "text-foreground font-medium"}
              ${inRange && !isSelected ? "bg-primary-btn/10" : ""}
              ${isSelected ? "bg-primary-btn text-white rounded-md z-10" : "hover:bg-gray-100 dark:hover:bg-white/5 rounded-md"}
              ${isToday(d) && !isSelected ? "border border-primary-btn/40 rounded-md" : ""}
            `}
          >
            {format(d, "d")}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(<div key={day.toString()} className="grid grid-cols-7 gap-0 ">{days}</div>);
      days = [];
    }
    return rows;
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 p-4 bg-white dark:bg-[#0a0a0a]">
      {monthsToShow.map((m, idx) => (
        <div key={idx} className="flex-1 min-w-[260px]">
          <div className="flex items-center justify-between mb-4 px-2">
            <button 
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} 
              className={`p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full ${(idx === 1 && !isMobile) ? 'invisible' : ''}`}
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-[11px] font-bold uppercase ">{format(m, "MMMM yyyy")}</span>
            <button 
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} 
              className={`p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full ${(idx === 0 && !isMobile) ? 'invisible' : ''}`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-7 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} className="text-[12px] text-center text-gray-600 font-bold uppercase">{d}</div>
            ))}
          </div>
          {renderMonth(m)}
        </div>
      ))}
    </div>
  );
};

// --- Main ControlBar Component ---
export default function ControlBar({ 
  viewMode, setViewMode, filterMode, setFilterMode, 
  searchQuery, setSearchQuery, startDate, setStartDate, 
  endDate, setEndDate, data 
}: any) {
  
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const exportToExcel = () => {
    const excelRows = data.map((item: any) => ({
      "Full Name": item.full_name, "Phone Number": item.phone, "City": item.city || "N/A",
      "Postal Code": item.postal_code, "Status": item.is_filtered ? "Verified" : "Outside Area",
      "Date": new Date(item.created_at).toLocaleString("en-AU")
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
    XLSX.writeFile(workbook, `Leads_Report_${format(new Date(), "yyyy-MM-dd")}.xlsx`);
  };

  const quickOptions = [
    { label: "Today", get: () => ({ s: new Date(), e: new Date() }) },
    { label: "Yesterday", get: () => ({ s: subDays(new Date(), 1), e: subDays(new Date(), 1) }) },
    { label: "Last 7 Days", get: () => ({ s: subDays(new Date(), 7), e: new Date() }) },
    { label: "This Month", get: () => ({ s: startOfMonth(new Date()), e: new Date() }) },
  ];

  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-card dark:bg-card/80 backdrop-blur-xl p-4 rounded-md border border-gray-200 dark:border-border-custom shadow-sm">
      
      {/* Group 1: Search and View Mode */}
      <div className="flex flex-col sm:flex-row items-stretch gap-3 flex-1">
        {/* View Switcher */}
        <div className="flex items-center bg-gray-100 dark:bg-black/40 p-1 rounded-sm border border-gray-200 dark:border-white/5 self-start sm:self-auto">
          {[{ id: 'whatsapp', icon: <MessageSquare size={16}/> }, { id: 'card', icon: <LayoutGrid size={16}/> }, { id: 'table', icon: <List size={16}/> }].map((mode) => (
            <button 
              key={mode.id} 
              onClick={() => setViewMode(mode.id)} 
              className={`p-2.5 px-4 rounded-sm transition-all ${viewMode === mode.id ? 'bg-primary-btn text-white' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
            >
              {mode.icon}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search leads..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/5 rounded-sm py-3 pl-12 text-sm outline-none focus:border-primary-btn/40 transition-all"
          />
        </div>
      </div>

      {/* Group 2: Actions and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch gap-3">
        {/* DATE PICKER */}
<div className="relative" ref={calendarRef}>
  <button 
    onClick={() => setIsCalendarOpen(!isCalendarOpen)}
    className="w-full flex items-center gap-2 bg-white px-3 py-2 rounded-md border border-gray-300 min-w-[180px] hover:border-blue-500 transition-all text-sm font-medium"
  >
    <Calendar size={16} className="text-gray-600" />
    <span className="truncate text-gray-800">
      {startDate ? `${format(new Date(startDate), "dd MMM")} - ${endDate ? format(new Date(endDate), "dd MMM") : '...'}` : 'Select Dates'}
    </span>
    <ChevronDown size={14} className={`ml-auto text-gray-500 transition-transform ${isCalendarOpen ? 'rotate-180' : ''}`} />
  </button>

  {isCalendarOpen && (
    <div className="fixed inset-x-4 top-20 md:absolute md:inset-auto md:top-full md:right-0 mt-2 z-[999] bg-white border border-gray-200 shadow-xl rounded-md overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in duration-200 max-h-[85vh] overflow-y-auto md:max-h-none">

      {/* Presets */}
      <div className="w-full md:w-44 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-200 p-3 space-y-1">
        <p className="text-xs uppercase text-gray-400 font-semibold tracking-wider px-2 pb-2">
          Quick Select
        </p>

        {quickOptions.map((opt) => (
          <button 
            key={opt.label} 
            onClick={() => { 
              setStartDate(format(opt.get().s, "yyyy-MM-dd")); 
              setEndDate(format(opt.get().e, "yyyy-MM-dd")); 
              setIsCalendarOpen(false); 
            }}
            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition "
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Calendar Section */}
      <div className="flex flex-col">
        <DualCalendar 
          startDate={startDate} 
          setStartDate={setStartDate} 
          endDate={endDate} 
          setEndDate={setEndDate} 
        />

        <div className="p-3 border-t border-gray-200 flex gap-2 justify-end bg-gray-50">
          <button 
            onClick={() => { setStartDate(""); setEndDate(""); setIsCalendarOpen(false); }} 
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-md transition"
          >
            Cancel
          </button>

          <button 
            onClick={() => setIsCalendarOpen(false)} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-sm font-medium transition"
          >
            Update
          </button>
        </div>
      </div>

    </div>
  )}
</div>


        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setFilterMode(filterMode === 'all' ? 'filtered' : 'all')}
            className={`flex-1 px-4 py-3 rounded-sm border text-[11px] uppercase  font-bold transition-all ${filterMode === 'filtered' ? 'bg-primary-btn/10 border-primary-btn text-primary-btn' : 'bg-gray-50 dark:bg-black/40 border-gray-200 dark:border-white/5 text-gray-600 dark:text-gray-300'}`}
          >
            {filterMode === 'filtered' ? 'Verified' : 'All Leads'}
          </button>
          
          <button 
            onClick={exportToExcel} 
            className="flex-1 bg-primary-btn hover:bg-blue-500 text-white px-5 py-3 rounded-sm text-[11px] uppercase  flex items-center justify-center gap-2 transition-colors"
          >
            <Download size={14} /> <span>Export</span>
          </button>
        </div>
      </div>
    </div>
  );
}