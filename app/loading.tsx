export default function Loading() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Decorative Glow (Common across your app) */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full -z-10" />
      
      <div className="max-w-6xl mx-auto p-6 md:p-12 space-y-10 animate-pulse">
        
        {/* 1. Generic Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 dark:bg-zinc-800 rounded-lg" />
              <div className="w-32 h-3 bg-gray-200 dark:bg-zinc-800 rounded-full" />
            </div>
            <div className="w-full max-w-md h-12 bg-gray-200 dark:bg-zinc-800 rounded-xl" />
            <div className="w-full max-w-sm h-4 bg-gray-100 dark:bg-zinc-900 rounded-full" />
          </div>

          {/* Generic Stats/Icon Box */}
          <div className="hidden md:flex bg-gray-50 dark:bg-zinc-900/40 border border-gray-200 dark:border-white/5 p-6 rounded-sm items-center gap-6">
            <div className="space-y-2">
              <div className="w-16 h-2 bg-gray-200 dark:bg-zinc-800 rounded-full ml-auto" />
              <div className="w-10 h-6 bg-gray-200 dark:bg-zinc-800 rounded-md ml-auto" />
            </div>
            <div className="w-12 h-12 bg-gray-200 dark:bg-zinc-800 rounded-sm" />
          </div>
        </div>

        {/* 2. Content Area Placeholder (Flexible for Forms or Search Bars) */}
        <div className="w-full h-16 bg-gray-50/50 dark:bg-zinc-900/20 border border-dashed border-gray-200 dark:border-white/10 rounded-sm" />

        {/* 3. Main Data/List Skeleton */}
        <div className="space-y-4">
          {/* Section Label */}
          <div className="w-40 h-3 bg-gray-100 dark:bg-zinc-900 rounded-full ml-2" />
          
          <div className="bg-card dark:bg-zinc-900/10 border border-gray-200 dark:border-white/5 rounded-sm overflow-hidden shadow-sm">
            {/* Header row of the list */}
            <div className="h-14 bg-gray-50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5" />
            
            {/* Generic List Items */}
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className="p-6 border-b border-gray-50 dark:border-white/5 flex items-center justify-between"
              >
                <div className="flex flex-col gap-3">
                  <div className="w-48 h-4 bg-gray-200 dark:bg-zinc-800 rounded-full" />
                  <div className="w-32 h-3 bg-gray-100 dark:bg-zinc-900 rounded-full" />
                </div>
                
                <div className="flex gap-4 items-center">
                   <div className="hidden sm:block w-24 h-6 bg-gray-100 dark:bg-zinc-900 rounded-full" />
                   <div className="w-8 h-8 bg-gray-100 dark:bg-zinc-800 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}