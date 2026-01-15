"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MapPinned,
  Activity,
  Menu,
  X,
  Sun,
  Moon,
  MessageSquare,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border-custom bg-background/80 backdrop-blur-xl transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 md:h-20 flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-4 md:gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 md:gap-3 group cursor-pointer"
          >
            <div className="w-9 h-9 md:w-10 md:h-10 bg-primary-btn rounded-sm flex items-center justify-center  group-hover:rotate-3 transition-all cursor-pointer">
              <Activity size={20} className="text-white" />
            </div>
            <span className="text-lg md:text-xl font-black tracking-tighter text-foreground uppercase">
              META<span className="text-primary-btn">LYTICS</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink
              href="/leads"
              icon={<LayoutDashboard size={14} />}
              label="Dashboard"
              active={isActive("/leads")}
            />
            <NavLink
              href="/locations"
              icon={<MapPinned size={14} />}
              label="Locations"
              active={isActive("/locations")}
            />
            <NavLink
              href="/chat"
              icon={<MessageSquare size={14} />}
              label="Inbox"
              active={isActive("/chat")}
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex flex-col items-end mr-3">
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
              System Status
            </span>
            <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-none animate-pulse"></span>
              LIVE ENGINE
            </span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-sm bg-toggle border border-border-custom text-muted-foreground hover:text-primary-btn hover:border-primary-btn/30 transition-all group cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === "light" ? (
              <Moon
                size={18}
                className="group-active:scale-90 transition-transform cursor-pointer"
              />
            ) : (
              <Sun
                size={18}
                className="text-yellow-500 group-active:scale-90 transition-transform cursor-pointer"
              />
            )}
          </button>

          {/* User Profile Avatar - Changed to Square */}
          <div className="w-9 h-9 rounded-sm bg-primary-btn flex items-center justify-center text-white text-xs font-black ring-1 ring-offset-2 ring-primary-btn/20 dark:ring-offset-background cursor-pointer">
            AD
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 text-foreground cursor-pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X size={24} className="cursor-pointer" />
            ) : (
              <Menu size={24} className="cursor-pointer" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-card border-b border-border-custom px-4 py-6 flex flex-col gap-2 animate-in slide-in-from-top-2 duration-300">
          <MobileNavLink
            href="/leads"
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
            active={isActive("/leads")}
            onClick={() => setIsMenuOpen(false)}
          />
          <MobileNavLink
            href="/locations"
            icon={<MapPinned size={18} />}
            label="Locations"
            active={isActive("/locations")}
            onClick={() => setIsMenuOpen(false)}
          />
          <MobileNavLink
            href="/chat"
            icon={<MessageSquare size={18} />}
            label="Inbox"
            active={isActive("/chat")}
            onClick={() => setIsMenuOpen(false)}
          />
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, icon, label, active }: any) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-4 py-2 text-[11px] rounded-sm uppercase transition-all cursor-pointer ${
        active
          ? "bg-primary-btn/10 text-primary-btn"
          : "text-muted-foreground hover:bg-toggle hover:text-foreground"
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
      className={`flex items-center gap-4 p-4 rounded-sm uppercase text-[11px] transition-all cursor-pointer ${
        active
          ? "bg-primary-btn/10 text-primary-btn"
          : "text-foreground bg-toggle/50 border border-border-custom"
      }`}
    >
      {icon} {label}
    </Link>
  );
}
