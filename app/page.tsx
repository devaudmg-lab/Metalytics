"use client";

import Link from "next/link";
import { BarChart3, MapPin, ArrowRight, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-300">
      
      <div className="max-w-5xl w-full text-center px-5 sm:px-8 relative z-10">
        
        {/* Badge: Using glass effect and primary-btn for the glow */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 shadow-sm animate-in fade-in slide-in-from-top-4 duration-1000">
          <Zap size={14} className="text-primary-btn fill-primary-btn/20" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            v1.0 Real-time Engine
          </span>
        </div>

        {/* Header Section: Using foreground variables and gradient logic */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-6 leading-[1.1] font-bold text-foreground tracking-tight">
          Manage Meta Leads <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-primary-btn via-primary-btn to-emerald-500 bg-clip-text text-transparent">
            {" "}with Precision
          </span>
        </h1>
        
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-12 max-w-lg mx-auto font-medium leading-relaxed">
          Filter, verify, and export leads from Meta Ads in real-time. 
          Built for high-performance marketing teams.
        </p>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          
          {/* Dashboard Card */}
          <Link href="/leads" className="group">
            <div className="relative h-full p-8 glass border-border-custom hover:border-primary-btn/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary-btn/10">
              <div className="w-14 h-14 bg-toggle rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary-btn transition-all duration-500 shadow-inner">
                <BarChart3 className="w-7 h-7 text-primary-btn group-hover:text-white transition-colors" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
                Leads Dashboard 
                <ArrowRight size={20} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary-btn" />
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Live stream of incoming leads. Automatically filters by your allowed service areas with instant validation.
              </p>
            </div>
          </Link>

          {/* Locations Card */}
          <Link href="/locations" className="group">
            <div className="relative h-full p-8 glass border-border-custom hover:border-emerald-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/10">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-500 transition-all duration-500 shadow-inner">
                <MapPin className="w-7 h-7 text-emerald-500 group-hover:text-white transition-colors" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
                Service Areas
                <ArrowRight size={20} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-emerald-500" />
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Add city names or postal codes. System will automatically flag and categorize leads outside these zones.
              </p>
            </div>
          </Link>
        </div>

        {/* Footer Info: Using border-custom and muted variables */}
        <div className="mt-16 pt-10 border-t border-border-custom flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-12">
          <div className="flex items-center gap-3">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              System Online
            </span>
          </div>
          <div className="hidden sm:block h-6 w-[1px] bg-border-custom"></div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              End-to-End Encrypted
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}