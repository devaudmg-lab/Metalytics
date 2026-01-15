// app/chat/loading.tsx
export default function ChatLoading() {
  return (
    <div className="flex h-[calc(100vh-120px)] w-full border border-slate-200 dark:border-slate-800 rounded-sm overflow-hidden bg-white dark:bg-[#080808] shadow-xl">
      
      {/* Sidebar Skeleton */}
      <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full animate-pulse">
        {/* Header & Tabs Skeleton */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/50 space-y-4">
          <div className="h-7 w-20 bg-slate-200 dark:bg-slate-800 rounded-md" />
          <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-sm gap-1">
            <div className="h-8 flex-1 bg-white dark:bg-slate-800 rounded-sm shadow-sm" />
            <div className="h-8 flex-1 bg-transparent border border-slate-200 dark:border-slate-800 rounded-sm" />
            <div className="h-8 flex-1 bg-transparent border border-slate-200 dark:border-slate-800 rounded-sm" />
          </div>
        </div>

        {/* Search Placeholder */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/50">
          <div className="h-9 w-full bg-slate-50 dark:bg-slate-900 rounded-full" />
        </div>

        {/* Leads List Skeleton */}
        <div className="flex-1 overflow-hidden p-2 space-y-1">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 border-b border-slate-50 dark:border-slate-800/30 last:border-0">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex justify-between">
                  <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-2 w-12 bg-slate-100 dark:bg-slate-900 rounded" />
                </div>
                <div className="h-2 w-32 bg-slate-100 dark:bg-slate-900 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Window Skeleton */}
      <div className="hidden md:flex flex-1 flex-col bg-slate-50/50 dark:bg-[#0a0a0a] animate-pulse">
        {/* Window Header */}
        <div className="p-4 bg-white dark:bg-[#080808] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-2 w-24 bg-slate-100 dark:bg-slate-900 rounded" />
            </div>
          </div>
          {/* Status Badge Placeholder - Indigo tint */}
          <div className="h-8 w-28 bg-indigo-100/50 dark:bg-indigo-900/20 rounded-full" />
        </div>

        {/* Messages Placeholder */}
        <div className="flex-1 p-6 space-y-6">
          {/* Incoming Message */}
          <div className="flex justify-start">
            <div className="h-12 w-64 bg-white dark:bg-slate-800 rounded-2xl rounded-bl-sm shadow-sm border border-slate-100 dark:border-slate-700/50" />
          </div>
          
          {/* Outgoing Message - Indigo Tint */}
          <div className="flex justify-end">
            <div className="h-10 w-48 bg-indigo-100/40 dark:bg-indigo-900/30 rounded-2xl rounded-br-sm border border-indigo-200/20 dark:border-indigo-500/10" />
          </div>

          {/* Incoming Message (Longer) */}
          <div className="flex justify-start">
            <div className="h-16 w-80 bg-white dark:bg-slate-800 rounded-2xl rounded-bl-sm shadow-sm border border-slate-100 dark:border-slate-700/50" />
          </div>

          {/* Date Separator */}
          <div className="flex justify-center">
            <div className="h-2 w-32 bg-slate-200 dark:bg-slate-800/50 rounded-full" />
          </div>

          {/* Outgoing Message */}
          <div className="flex justify-end">
            <div className="h-12 w-56 bg-indigo-100/40 dark:bg-indigo-900/30 rounded-2xl rounded-br-sm border border-indigo-200/20 dark:border-indigo-500/10" />
          </div>
        </div>

        {/* Input Area Placeholder */}
        <div className="p-4 bg-white dark:bg-[#080808] border-t border-slate-200 dark:border-slate-800 flex gap-2">
          <div className="h-12 flex-1 bg-slate-100 dark:bg-slate-900 rounded-full" />
          <div className="h-12 w-12 bg-slate-200 dark:bg-slate-800 rounded-full shrink-0" />
        </div>
      </div>

    </div>
  );
}