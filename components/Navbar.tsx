"use client";

import Link from "next/link";
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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
      ? "bg-white border-b border-gray-200 shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
      : "bg-white/0 border-b border-transparent"
      }`}>
      <div className="container mx-auto px-6 h-20">
        <div className="flex items-center justify-between h-full gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0 group">
            <span className="text-2xl font-black tracking-tight text-black">
              Qua<span className="text-[#00E599]">Scan</span>
            </span>
            <span className="bg-[#00E599]/10 text-[#00E599] text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ml-2 relative -top-3 border border-[#00E599]/20">
              Beta
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-semibold text-gray-600 hover:text-[#00E599] transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Search Bar & External Links */}
          <div className="hidden lg:flex items-center justify-end flex-1 gap-6">
            <div className="flex-1 max-w-lg">
              <SearchBar />
            </div>

            <div className="flex items-center gap-4 border-l border-gray-100 pl-6">
              <Link
                href="https://quantachain.gitbook.io/quantachain-docs"
                target="_blank"
                className="inline-flex items-center justify-center w-10 h-10 text-gray-600 hover:text-[#00E599] transition-all hover:bg-gray-50 rounded-full hover:scale-110"
                title="API Docs"
              >
                <BookOpen className="w-5 h-5" />
              </Link>
              <Link
                href="https://github.com/quantachain/quanta"
                target="_blank"
                className="inline-flex items-center justify-center w-10 h-10 text-gray-600 hover:text-[#00E599] transition-all hover:bg-gray-50 rounded-full hover:scale-110"
                title="GitHub"
              >
                <Github className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center text-gray-600 hover:text-black transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white shadow-lg absolute w-full left-0 top-20">
          <div className="container mx-auto px-6 py-6 flex flex-col gap-6">
            <div className="pb-4 border-b border-gray-100">
              <SearchBar />
            </div>
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="flex items-center gap-3 py-2 text-gray-600 hover:text-[#00E599] font-semibold transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <div className="pt-4 border-t border-gray-100 flex items-center gap-6">
              <Link href="https://quantachain.gitbook.io/quantachain-docs" target="_blank" className="text-gray-600 hover:text-[#00E599] flex items-center gap-2 text-sm font-semibold transition-colors">
                <BookOpen className="w-4 h-4" /> API Docs
              </Link>
              <Link href="https://github.com/quantachain/quanta" target="_blank" className="text-gray-600 hover:text-[#00E599] flex items-center gap-2 text-sm font-semibold transition-colors">
                <Github className="w-4 h-4" /> GitHub
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
