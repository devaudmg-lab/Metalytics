import { MapPinned, Settings2, Globe } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden animate-pulse">
      {/* Background Decorative Glow placeholders */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full -z-10" />

      <div className="max-w-6xl mx-auto p-6 md:p-12 space-y-12 relative z-10">
        
        {/* HEADER SECTION SKELETON */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 dark:bg-zinc-800 rounded-xl" />
              <div className="h-3 w-32 bg-gray-100 dark:bg-zinc-900 rounded-full" />
            </div>
            <div className="h-14 w-64 md:w-96 bg-gray-200 dark:bg-zinc-800 rounded-lg" />
            <div className="h-4 w-full md:w-[450px] bg-gray-100 dark:bg-zinc-900 rounded-full" />
          </div>

          <div className="flex bg-card dark:bg-zinc-900/40 border border-gray-200 dark:border-white/5 p-6 rounded-sm items-center gap-6 shadow-sm">
            <div className="space-y-2 text-right">
              <div className="h-3 w-20 bg-gray-100 dark:bg-zinc-900 rounded-full ml-auto" />
              <div className="h-8 w-12 bg-gray-200 dark:bg-zinc-800 rounded-md ml-auto" />
            </div>
            <div className="p-4 bg-gray-100 dark:bg-white/5 rounded-sm h-14 w-14" />
          </div>
        </div>

        {/* ADD FORM SKELETON */}
        <div className="grid grid-cols-1 gap-6 p-2 h-20 bg-gray-50/50 dark:bg-zinc-900/20 rounded-sm border border-dashed border-gray-200 dark:border-white/5 items-center px-10">
           <div className="h-4 w-48 bg-gray-200 dark:bg-zinc-800 rounded-full" />
        </div>

        {/* TABLE SKELETON */}
        <div className="space-y-6">
           <div className="flex items-center gap-3 px-4">
              <div className="w-6 h-6 bg-gray-100 dark:bg-zinc-900 rounded-lg" />
              <div className="h-3 w-40 bg-gray-100 dark:bg-zinc-900 rounded-full" />
           </div>

           <div className="bg-card dark:bg-zinc-900/20 rounded-sm border border-gray-200 dark:border-white/5 overflow-hidden shadow-xl">
            <div className="w-full">
              {/* Table Header Placeholder */}
              <div className="h-16 bg-gray-50 dark:bg-white/[0.02] border-b border-gray-200 dark:border-white/5" />
              
              {/* Table Rows Placeholders */}
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-8 border-b border-gray-100 dark:border-white/[0.03] flex justify-between items-center">
                  <div className="space-y-3">
                    <div className="h-6 w-32 bg-gray-200 dark:bg-zinc-800 rounded-md" />
                    <div className="h-2 w-20 bg-gray-100 dark:bg-zinc-900 rounded-full" />
                  </div>
                  <div className="h-4 w-24 bg-gray-100 dark:bg-zinc-900 rounded-full" />
                  <div className="h-8 w-16 bg-gray-200 dark:bg-zinc-800 rounded-full" />
                  <div className="flex gap-2">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-zinc-800 rounded-xl" />
                    <div className="w-10 h-10 bg-gray-100 dark:bg-zinc-800 rounded-xl" />
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