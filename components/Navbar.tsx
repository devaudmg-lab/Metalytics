"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, MapPinned, Activity, Menu, X, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext'; 

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-border-custom bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 md:h-20 flex items-center justify-between">
        
        {/* Logo Section */}
        <div className="flex items-center gap-4 md:gap-8">
          <Link href="/" className="flex items-center gap-2 md:gap-3 group">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-primary-btn rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-all">
              <Activity size={20} className="text-white" />
            </div>
            <span className="text-lg md:text-xl font-bold er text-gray-900 dark:text-white">
              META<span className="text-primary-btn">LYTICS</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink 
              href="/leads" 
              icon={<LayoutDashboard size={16} />} 
              label="Dashboard" 
              active={isActive('/leads')} 
            />
            <NavLink 
              href="/locations" 
              icon={<MapPinned size={16} />} 
              label="Locations" 
              active={isActive('/locations')} 
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex flex-col items-end mr-3">
            <span className="text-[10px] font-bold text-gray-700 uppercase">System Status</span>
            <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Live
            </span>
          </div>

          {/* 3. Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-primary-btn transition-all group"
            aria-label="Toggle Theme"
          >
            {theme === "light" ? (
              <Moon size={18} className="group-active:scale-90 transition-transform" />
            ) : (
              <Sun size={18} className="text-yellow-500 group-active:scale-90 transition-transform" />
            )}
          </button>

          <div className="w-9 h-9 rounded-full bg-primary-btn flex items-center justify-center text-white text-xs font-bold ring-2 ring-offset-2 ring-primary-btn/20 dark:ring-offset-black">
            AD
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden p-2 text-black dark:text-gray-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-border-custom px-4 py-6 flex flex-col gap-3 animate-in slide-in-from-top duration-300">
          <MobileNavLink 
            href="/leads" 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            active={isActive('/leads')} 
            onClick={() => setIsMenuOpen(false)}
          />
          <MobileNavLink 
            href="/locations" 
            icon={<MapPinned size={20} />} 
            label="Locations" 
            active={isActive('/locations')} 
            onClick={() => setIsMenuOpen(false)}
          />
        </div>
      )}
    </nav>
  );
}

// Reusable NavLink components remain same...
function NavLink({ href, icon, label, active }: any) {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-2 px-4 py-2 text-[12px] rounded-[4px] font-bold uppercase  transition-all ${
        active 
        ? 'bg-primary-btn/10 text-primary-btn' 
        : 'text-gray-500 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'
      }`}
    >
      {icon} {label}
    </Link>
  );
}

function MobileNavLink({ href, icon, label, active, onClick }: any) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className={`flex items-center gap-4 p-4 rounded-[4px] font-bold transition-all ${
        active 
        ? 'bg-primary-btn/10 text-primary-btn' 
        : 'text-black dark:text-gray-400 bg-gray-50 dark:bg-white/5'
      }`}
    >
      {icon} {label}
    </Link>
  );
}