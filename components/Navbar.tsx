"use client";

import Link from "next/link";
import Image from "next/image";
import { Github, Menu, X, BookOpen, Sun, Moon, ChevronDown, User } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import SearchBar from "./SearchBar";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Blocks", href: "/blocks" },
    { name: "Checkpoints", href: "/checkpoints" },
  ];

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 pt-4 px-4 sm:px-6 lg:px-8 transition-all duration-300 ${
      scrolled ? "bg-background/80 backdrop-blur-md shadow-md border-b border-border" : "bg-transparent"
    }`}>
      <nav className="mx-auto max-w-7xl transition-all duration-300">
        <div className="px-6 h-16 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0 group gap-3">
            <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center group-hover:bg-accent/20 transition-all shadow-[0_0_15px_var(--accent-light)] p-1.5">
              <Image 
                src="/logo/quanta-transparent-bg-logo.svg" 
                alt="Quanta" 
                width={20} 
                height={20} 
                className="w-full h-full object-contain group-hover:drop-shadow-[0_0_8px_var(--accent)] transition-all"
                onError={(e) => {
                  // Fallback if logo file is not loaded
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <span className="text-lg font-black tracking-tight text-text-primary font-sans group-hover:text-accent transition-colors">
              QuaScan
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all ${
                    isActive 
                      ? "text-accent bg-accent/10 border border-accent/20" 
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-2 border border-transparent"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>


          {/* Right Hand Controls */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Switch */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-surface-2 border border-border text-text-secondary hover:text-accent transition-all hover:scale-105"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-9 h-9 flex items-center justify-center text-text-secondary hover:text-text-primary bg-surface-2 border border-border rounded-xl transition-all"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute w-[calc(100%-2rem)] left-4 top-20 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="quantum-panel p-5 flex flex-col gap-5 border border-border">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`flex items-center gap-3 py-2.5 text-xs uppercase tracking-wider font-bold rounded-xl transition-colors px-4 ${
                      isActive 
                        ? "text-accent bg-accent/10" 
                        : "text-text-secondary hover:bg-surface-2"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}

