"use client";

import Link from "next/link";
import Image from "next/image";
import { Github, Menu, X, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import SearchBar from "./SearchBar";

const navLinks = [
  { name: "Dashboard", href: "/" },
  { name: "Blocks", href: "/blocks" },
  { name: "Checkpoints", href: "/checkpoints" },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-6 transition-all duration-300">
      <nav className={`mx-auto max-w-7xl transition-all duration-300 rounded-2xl ${
        scrolled ? "bg-black/50 backdrop-blur-xl border border-white/5 shadow-[0_10px_40px_rgba(0,0,0,0.8)]" : "bg-transparent border border-transparent"
      }`}>
        <div className="px-6 h-16 flex items-center justify-between gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0 group gap-3">
            <div className="w-8 h-8 rounded-full bg-[#00E599]/10 border border-[#00E599]/30 flex items-center justify-center group-hover:bg-[#00E599]/20 transition-colors shadow-[0_0_15px_rgba(0,229,153,0.2)] p-1.5">
              <Image 
                src="/logo/quanta-transparent-bg-logo.svg" 
                alt="Quanta" 
                width={20} 
                height={20} 
                className="w-full h-full object-contain group-hover:drop-shadow-[0_0_8px_rgba(0,229,153,0.8)] transition-all"
              />
            </div>
            <span className="text-xl font-black tracking-tight text-white font-sans group-hover:text-[#00E599] transition-colors">
              QuaScan
            </span>
            <span className="bg-[#00E599]/10 text-[#00E599] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#00E599]/20 uppercase tracking-widest">
              Beta
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 px-4 py-2 rounded-xl transition-all"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Search Bar & External Links */}
          <div className="hidden lg:flex items-center justify-end flex-1 gap-4">
            <div className="flex-1 max-w-md">
              <SearchBar />
            </div>

            <div className="flex items-center gap-2 border-l border-white/10 pl-4">
              <Link
                href="https://quantachain.gitbook.io/quantachain-docs"
                target="_blank"
                className="inline-flex items-center justify-center w-10 h-10 text-gray-400 hover:text-[#00E599] hover:bg-white/5 rounded-xl transition-all"
                title="API Docs"
              >
                <BookOpen className="w-5 h-5" />
              </Link>
              <Link
                href="https://github.com/quantachain/quanta"
                target="_blank"
                className="inline-flex items-center justify-center w-10 h-10 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                title="GitHub"
              >
                <Github className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute w-[calc(100%-2rem)] left-4 top-24">
          <div className="quantum-panel p-6 flex flex-col gap-6">
            <div className="pb-4 border-b border-white/10">
              <SearchBar />
            </div>
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="flex items-center gap-3 py-3 text-white font-medium text-sm rounded-xl hover:bg-white/5 transition-colors px-4"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <div className="pt-4 border-t border-white/10 flex items-center gap-4">
              <Link href="https://quantachain.gitbook.io/quantachain-docs" target="_blank" className="flex-1 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl py-3 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
                <BookOpen className="w-4 h-4" /> Docs
              </Link>
              <Link href="https://github.com/quantachain/quanta" target="_blank" className="flex-1 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl py-3 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
                <Github className="w-4 h-4" /> GitHub
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
