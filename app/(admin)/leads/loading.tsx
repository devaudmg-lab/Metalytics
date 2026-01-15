"use client";

import { Search, MessageSquare, StickyNote, ClipboardList } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen space-y-4 md:space-y-8 pb-10 md:pb-20 animate-pulse transition-colors duration-300">
      
      {/* 1. CONTROL BAR SKELETON */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-card p-4 rounded-sm border border-border-custom shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch gap-3 flex-1">
          {/* View Switcher Placeholder */}
          <div className="w-48 h-12 bg-toggle rounded-sm opacity-50" />
          {/* Search Bar Placeholder */}
          <div className="flex-1 h-12 bg-background/50 border border-border-custom rounded-sm" />
        </div>
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="w-44 h-12 bg-toggle rounded-sm opacity-50" />
          <div className="w-32 h-12 bg-primary-btn/20 rounded-sm" />
        </div>
      </div>

      {/* 2. MAIN VIEW SKELETON (WhatsApp View Style) */}
      <main className="flex-1 rounded-sm border border-border-custom bg-card overflow-hidden min-h-[600px] shadow-xl relative transition-colors">
        
        {/* Sub-Header info bar */}
        <div className="border-b border-border-custom bg-background h-14 w-full" />

        <div className="flex h-[calc(100vh-250px)] w-full">
          
          {/* LEFT SIDEBAR SKELETON */}
          <aside className="hidden lg:flex w-80 flex-col border-r border-border-custom bg-card">
            <div className="p-6 space-y-4">
              <div className="h-4 w-20 bg-muted rounded-none" />
              <div className="h-10 w-full bg-toggle rounded-sm" />
            </div>
            <div className="flex-1 px-3 space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="p-4 border border-border-custom rounded-none space-y-3 opacity-60">
                  <div className="h-4 w-3/4 bg-muted rounded-none" />
                  <div className="h-3 w-1/2 bg-toggle rounded-none" />
                </div>
              ))}
            </div>
          </aside>

          {/* CENTER PANEL SKELETON */}
          <div className="flex-1 flex flex-col bg-background/30">
            <header className="p-10 border-b border-border-custom space-y-4">
              <div className="h-10 w-64 bg-toggle rounded-sm" />
              <div className="flex gap-4">
                <div className="h-4 w-32 bg-muted rounded-none opacity-40" />
                <div className="h-4 w-32 bg-muted rounded-none opacity-40" />
              </div>
            </header>
            <div className="p-10 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                 <div className="w-8 h-8 bg-primary-btn/10 rounded-none" />
                 <div className="h-4 w-40 bg-toggle rounded-none" />
              </div>
              <div className="w-full h-64 bg-card/50 border border-border-custom rounded-none" />
            </div>
          </div>

          {/* RIGHT PANEL SKELETON (Intelligence) */}
          <aside className="hidden xl:block w-[400px] border-l border-border-custom bg-card p-8 space-y-6">
            <div className="h-4 w-40 bg-muted rounded-none mb-8 opacity-60" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-5 bg-background/50 border border-border-custom rounded-none space-y-3">
                <div className="h-3 w-20 bg-primary-btn/20 rounded-none" />
                <div className="h-4 w-full bg-toggle rounded-none" />
              </div>
            ))}
          </aside>

        </div>
      </main>

      {/* 3. ANALYTICS SECTION SKELETON */}
      <section className="bg-card border border-border-custom rounded-sm p-10 h-80">
        <div className="flex gap-4 mb-8">
          <div className="w-12 h-12 bg-toggle rounded-sm" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-muted rounded-none" />
            <div className="h-3 w-48 bg-toggle rounded-none opacity-60" />
          </div>
        </div>
        <div className="w-full h-32 bg-background border border-border-custom rounded-sm" />
      </section>

    </div>
  );
}