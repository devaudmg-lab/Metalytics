"use client";

import { MapPinned, Settings2, Globe } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 relative overflow-hidden animate-pulse">
      {/* Background Decorative Glow placeholders - Updated to Indigo */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-slate-500/5 blur-[100px] rounded-full -z-10" />

      <div className="max-w-6xl mx-auto p-6 md:p-12 space-y-12 relative z-10">
        
        {/* HEADER SECTION SKELETON */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              <div className="h-3 w-32 bg-slate-100 dark:bg-slate-900 rounded-full" />
            </div>
            <div className="h-14 w-64 md:w-96 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="h-4 w-full md:w-[450px] bg-slate-100 dark:bg-slate-900 rounded-full" />
          </div>

          <div className="flex bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-6 rounded-sm items-center gap-6 shadow-sm">
            <div className="space-y-2 text-right">
              <div className="h-3 w-20 bg-slate-100 dark:bg-slate-900 rounded-full ml-auto" />
              <div className="h-8 w-12 bg-slate-200 dark:bg-slate-800 rounded-md ml-auto" />
            </div>
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-sm h-14 w-14" />
          </div>
        </div>

        {/* ADD FORM SKELETON */}
        <div className="grid grid-cols-1 gap-6 p-2 h-20 bg-slate-50/50 dark:bg-slate-900/20 rounded-sm border border-dashed border-slate-200 dark:border-slate-800 items-center px-10">
           <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded-full" />
        </div>

        {/* TABLE SKELETON */}
        <div className="space-y-6">
           <div className="flex items-center gap-3 px-4">
              <div className="w-6 h-6 bg-slate-100 dark:bg-slate-900 rounded-lg" />
              <div className="h-3 w-40 bg-slate-100 dark:bg-slate-900 rounded-full" />
           </div>

           <div className="bg-white dark:bg-slate-900/40 rounded-sm border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
            <div className="w-full">
              {/* Table Header Placeholder */}
              <div className="h-16 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800" />
              
              {/* Table Rows Placeholders */}
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-8 border-b border-slate-100 dark:border-slate-800/50 flex flex-wrap justify-between items-center gap-4">
                  <div className="space-y-3">
                    <div className="h-6 w-40 bg-slate-200 dark:bg-slate-800 rounded-md" />
                    <div className="h-2 w-24 bg-slate-100 dark:bg-slate-900 rounded-full" />
                  </div>
                  
                  <div className="hidden md:block h-4 w-32 bg-slate-100 dark:bg-slate-900 rounded-full" />
                  <div className="h-8 w-24 bg-slate-100 dark:bg-slate-800 rounded-full" />
                  
                  <div className="flex gap-2">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}