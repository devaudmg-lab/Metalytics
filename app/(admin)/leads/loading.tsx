import { Search, MessageSquare, StickyNote, ClipboardList } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen space-y-4 md:space-y-8 pb-10 md:pb-20 animate-pulse">
      
      {/* 1. CONTROL BAR SKELETON */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-md border border-gray-200 dark:border-zinc-800 shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch gap-3 flex-1">
          {/* View Switcher Placeholder */}
          <div className="w-48 h-12 bg-gray-100 dark:bg-zinc-800 rounded-sm" />
          {/* Search Bar Placeholder */}
          <div className="flex-1 h-12 bg-gray-50 dark:bg-zinc-800/50 rounded-sm" />
        </div>
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="w-44 h-10 bg-gray-100 dark:bg-zinc-800 rounded-md" />
          <div className="w-32 h-10 bg-gray-100 dark:bg-zinc-800 rounded-sm" />
        </div>
      </div>

      {/* 2. MAIN VIEW SKELETON (WhatsApp View Style) */}
      <main className="flex-1 rounded-[1.5rem] md:rounded-sm border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#050505] overflow-hidden min-h-[600px] shadow-xl relative">
        
        {/* Sub-Header info bar */}
        <div className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 h-14 w-full" />

        <div className="flex h-[calc(100vh-250px)] w-full">
          
          {/* LEFT SIDEBAR SKELETON */}
          <aside className="hidden lg:flex w-80 flex-col border-r border-gray-100 dark:border-white/5 bg-white dark:bg-[#080808]">
            <div className="p-6 space-y-4">
              <div className="h-4 w-20 bg-gray-200 dark:bg-zinc-800 rounded-full" />
              <div className="h-10 w-full bg-gray-100 dark:bg-zinc-900 rounded-sm" />
            </div>
            <div className="flex-1 px-3 space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="p-4 border border-gray-100 dark:border-zinc-800 rounded-sm space-y-3">
                  <div className="h-4 w-3/4 bg-gray-200 dark:bg-zinc-800 rounded-full" />
                  <div className="h-3 w-1/2 bg-gray-100 dark:bg-zinc-900 rounded-full" />
                </div>
              ))}
            </div>
          </aside>

          {/* CENTER PANEL SKELETON */}
          <div className="flex-1 flex flex-col bg-white dark:bg-[#080808]">
            <header className="p-10 border-b border-gray-100 dark:border-white/5 space-y-4">
              <div className="h-10 w-64 bg-gray-200 dark:bg-zinc-800 rounded-lg" />
              <div className="flex gap-4">
                <div className="h-4 w-32 bg-gray-100 dark:bg-zinc-900 rounded-full" />
                <div className="h-4 w-32 bg-gray-100 dark:bg-zinc-900 rounded-full" />
              </div>
            </header>
            <div className="p-10 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                 <div className="w-8 h-8 bg-gray-100 dark:bg-zinc-800 rounded-lg" />
                 <div className="h-4 w-40 bg-gray-100 dark:bg-zinc-800 rounded-full" />
              </div>
              <div className="w-full h-64 bg-gray-50 dark:bg-zinc-900/40 border border-gray-100 dark:border-white/5 rounded-sm" />
            </div>
          </div>

          {/* RIGHT PANEL SKELETON (Intelligence) */}
          <aside className="hidden xl:block w-[400px] border-l border-gray-100 dark:border-white/5 bg-white dark:bg-[#080808] p-8 space-y-6">
            <div className="h-4 w-40 bg-gray-200 dark:bg-zinc-800 rounded-full mb-8" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-5 bg-gray-50 dark:bg-zinc-900/50 border border-gray-100 dark:border-white/5 rounded-sm space-y-3">
                <div className="h-3 w-20 bg-gray-200 dark:bg-zinc-800 rounded-full" />
                <div className="h-4 w-full bg-gray-100 dark:bg-zinc-900 rounded-full" />
              </div>
            ))}
          </aside>

        </div>
      </main>

      {/* 3. ANALYTICS SECTION SKELETON */}
      <section className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-sm p-10 h-80">
        <div className="flex gap-4 mb-8">
          <div className="w-12 h-12 bg-gray-100 dark:bg-zinc-800 rounded-sm" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-200 dark:bg-zinc-800 rounded-full" />
            <div className="h-3 w-48 bg-gray-100 dark:bg-zinc-900 rounded-full" />
          </div>
        </div>
        <div className="w-full h-32 bg-gray-50 dark:bg-zinc-800/30 rounded-lg" />
      </section>

    </div>
  );
}