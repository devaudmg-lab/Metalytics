"use client";

import Link from "next/link";
import { BarChart3, MapPin, ArrowRight, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center bg-background text-foreground selection:bg-primary-btn/30 overflow-x-hidden relative py-12 md:py-0 transition-colors duration-300">

      <div className="max-w-5xl w-full text-center px-5 sm:px-8">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-card dark:bg-white/5 border border-gray-200 dark:border-white/10 mb-6 md:mb-8 shadow-sm">
          <Zap size={12} className="text-primary-btn fill-primary-btn md:w-[14px]" />
          <span className="text-[9px] md:text-[10px] font-bold uppercase  text-gray-500 dark:text-zinc-400">
            v1.0 Real-time Engine
          </span>
        </div>

        {/* Header Section */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl  mb-4 md:mb-6 er leading-[1.1] text-gray-900 dark:text-white">
          Manage Meta Leads <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-primary-btn to-emerald-500 bg-clip-text text-transparent">
            {" "}with Precision
          </span>
        </h1>
        
        <p className="text-sm sm:text-base md:text-lg text-black dark:text-zinc-400 mb-10 md:mb-12 max-w-lg mx-auto font-medium leading-relaxed">
          Filter, verify, and export leads from Meta Ads in real-time. 
          Built for high-performance marketing teams.
        </p>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-left">
          
          {/* Dashboard Card */}
          <Link href="/leads" className="group">
            <div className="relative h-full p-6 md:p-8 bg-card dark:bg-card border border-gray-200 dark:border-border-custom rounded-[1.5rem] md:rounded-sm hover:border-primary-btn/50 transition-all duration-500 hover:shadow-xl dark:hover:shadow-primary-btn/5">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-toggle dark:bg-primary-btn/10 rounded-xl md:rounded-sm flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 group-hover:bg-primary-btn transition-all duration-500">
                <BarChart3 className="w-6 h-6 md:w-7 md:h-7 text-primary-btn group-hover:text-white" />
              </div>
              <h2 className="text-xl md:text-2xl  text-gray-900 dark:text-white mb-2 md:mb-3  flex items-center gap-2">
                Leads Dashboard 
                <ArrowRight size={18} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all hidden md:block text-primary-btn" />
              </h2>
              <p className="text-gray-500 dark:text-zinc-500 text-xs md:text-sm leading-relaxed">
                Live stream of incoming leads. Automatically filters by your allowed service areas.
              </p>
            </div>
          </Link>

          {/* Locations Card */}
          <Link href="/locations" className="group">
            <div className="relative h-full p-6 md:p-8 bg-card dark:bg-card border border-gray-200 dark:border-border-custom rounded-[1.5rem] md:rounded-sm hover:border-emerald-500/50 transition-all duration-500 hover:shadow-xl dark:hover:shadow-emerald-500/5">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-emerald-500/10 rounded-xl md:rounded-sm flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 group-hover:bg-emerald-600 transition-all duration-500">
                <MapPin className="w-6 h-6 md:w-7 md:h-7 text-emerald-500 group-hover:text-white" />
              </div>
              <h2 className="text-xl md:text-2xl  text-gray-900 dark:text-white mb-2 md:mb-3  flex items-center gap-2">
                Service Areas
                <ArrowRight size={18} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all hidden md:block text-emerald-500" />
              </h2>
              <p className="text-gray-500 dark:text-zinc-500 text-xs md:text-sm leading-relaxed">
                Add city names or postal codes. System will automatically flag leads outside these zones.
              </p>
            </div>
          </Link>
        </div>

        {/* Footer Info */}
        <div className="mt-12 md:mt-16 pt-8 md:pt-10 border-t border-gray-200 dark:border-border-custom flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full absolute top-0 left-0 animate-ping"></div>
            </div>
            <span className="text-[10px] md:text-[11px]  uppercase  text-gray-700 dark:text-zinc-500">
              System Online
            </span>
          </div>
          <div className="hidden sm:block h-4 w-[1px] bg-gray-200 dark:bg-white/10"></div>
          <span className="text-[10px] md:text-[11px]  uppercase  text-gray-700 dark:text-zinc-500">
            End-to-End Encrypted
          </span>
        </div>
      </div>
    </div>
  );
}