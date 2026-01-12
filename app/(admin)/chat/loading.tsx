// app/chat/loading.tsx
export default function ChatLoading() {
  return (
    <div className="flex h-[calc(100vh-120px)] w-full border border-gray-200 dark:border-white/5 rounded-sm overflow-hidden bg-white dark:bg-[#080808] shadow-xl">
      
      {/* Sidebar Skeleton */}
      <div className="w-full md:w-80 lg:w-96 border-r border-gray-200 dark:border-white/5 flex flex-col h-full animate-pulse">
        {/* Header & Tabs Skeleton */}
        <div className="p-4 border-b border-gray-100 dark:border-white/5 space-y-4">
          <div className="h-7 w-20 bg-gray-200 dark:bg-zinc-800 rounded-md" />
          <div className="flex bg-gray-100 dark:bg-zinc-900/50 p-1 rounded-sm gap-1">
            <div className="h-8 flex-1 bg-white dark:bg-zinc-800 rounded-sm" />
            <div className="h-8 flex-1 bg-transparent border border-gray-200 dark:border-zinc-800 rounded-sm" />
            <div className="h-8 flex-1 bg-transparent border border-gray-200 dark:border-zinc-800 rounded-sm" />
          </div>
        </div>

        {/* Search Placeholder */}
        <div className="px-4 py-3 border-b border-gray-100 dark:border-white/5">
          <div className="h-9 w-full bg-gray-50 dark:bg-zinc-900 rounded-full" />
        </div>

        {/* Leads List Skeleton */}
        <div className="flex-1 overflow-hidden p-2 space-y-1">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 border-b border-gray-50 dark:border-white/5 last:border-0">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-800 shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex justify-between">
                  <div className="h-3 w-24 bg-gray-200 dark:bg-zinc-800 rounded" />
                  <div className="h-2 w-12 bg-gray-100 dark:bg-zinc-900 rounded" />
                </div>
                <div className="h-2 w-32 bg-gray-100 dark:bg-zinc-900 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Window Skeleton */}
      <div className="hidden md:flex flex-1 flex-col bg-gray-50 dark:bg-[#0a0a0a] animate-pulse">
        {/* Window Header */}
        <div className="p-4 bg-white dark:bg-[#080808] border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-800" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 dark:bg-zinc-800 rounded" />
              <div className="h-2 w-24 bg-gray-100 dark:bg-zinc-900 rounded" />
            </div>
          </div>
          <div className="h-8 w-28 bg-emerald-100/50 dark:bg-emerald-900/20 rounded-full" />
        </div>

        {/* Messages Placeholder */}
        <div className="flex-1 p-6 space-y-6">
          <div className="flex justify-start">
            <div className="h-12 w-64 bg-white dark:bg-zinc-800 rounded-2xl rounded-bl-sm shadow-sm" />
          </div>
          <div className="flex justify-end">
            <div className="h-10 w-48 bg-blue-100 dark:bg-blue-900/30 rounded-2xl rounded-br-sm" />
          </div>
          <div className="flex justify-start">
            <div className="h-16 w-80 bg-white dark:bg-zinc-800 rounded-2xl rounded-bl-sm shadow-sm" />
          </div>
          <div className="flex justify-center">
            <div className="h-2 w-32 bg-gray-200 dark:bg-zinc-900 rounded-full" />
          </div>
          <div className="flex justify-end">
            <div className="h-12 w-56 bg-blue-100 dark:bg-blue-900/30 rounded-2xl rounded-br-sm" />
          </div>
        </div>

        {/* Input Area Placeholder */}
        <div className="p-4 bg-white dark:bg-[#080808] border-t border-gray-200 dark:border-white/5 flex gap-2">
          <div className="h-12 flex-1 bg-gray-100 dark:bg-zinc-900 rounded-full" />
          <div className="h-12 w-12 bg-gray-200 dark:bg-zinc-800 rounded-full shrink-0" />
        </div>
      </div>

    </div>
  );
}