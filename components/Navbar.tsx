"use client";

import Link from "next/link";
import Image from "next/image";
import { Github, Menu, X, Activity, Box, BookOpen, Send } from "lucide-react";
import { useState, useEffect } from "react";
import SearchBar from "./SearchBar";

const navLinks = [
  { name: "Dashboard", href: "/", icon: Activity },
  { name: "Blocks", href: "/blocks", icon: Box },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${scrolled
      ? "bg-white border-b border-gray-200"
      : "bg-white border-b border-gray-100"
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px]">
        <div className="flex items-center justify-between h-full gap-8">
          {/* Logo & Core Links */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
              <Image
                src="/logo/quanta-transparent-bg-logo.svg"
                alt="Quanta Scan Logo"
                width={32}
                height={32}
                className="w-8 h-8 transition-transform group-hover:scale-110"
                priority
              />
              <span className="text-2xl font-black tracking-tight text-gray-900">
                Quanta<span className="text-[#00E599]">Scan</span>
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm font-bold text-gray-600 hover:text-black transition-colors flex items-center gap-1.5"
                >
                  <link.icon className="w-4 h-4 text-gray-400" />
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Search Bar & External Links */}
          <div className="hidden lg:flex items-center justify-end flex-1 gap-6">
            <div className="flex-1 max-w-lg">
              <SearchBar />
            </div>
            
            <div className="flex items-center gap-4 border-l border-gray-200 pl-6">
               <Link
                href="https://quantachain.gitbook.io/quantachain-docs"
                target="_blank"
                className="text-gray-400 hover:text-gray-900 transition-colors"
                title="API Docs"
              >
                <BookOpen className="w-5 h-5" />
              </Link>
              <Link
                href="https://github.com/quantachain/quanta"
                target="_blank"
                className="text-gray-400 hover:text-gray-900 transition-colors"
                title="GitHub"
              >
                <Github className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-end text-gray-600 hover:text-black transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white shadow-xl absolute w-full left-0 top-[72px]">
          <div className="px-4 py-4 sm:px-6 flex flex-col gap-4">
            <div className="pb-4 border-b border-gray-100">
              <SearchBar />
            </div>
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="flex items-center gap-3 py-3 text-gray-600 hover:text-black font-bold transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <link.icon className="w-5 h-5 text-gray-400" />
                  {link.name}
                </Link>
              ))}
            </div>
            <div className="pt-4 border-t border-gray-100 flex items-center gap-6">
              <Link href="https://quantachain.gitbook.io/quantachain-docs" className="text-gray-500 flex items-center gap-2 text-sm font-bold">
                <BookOpen className="w-4 h-4" /> API Docs
              </Link>
              <Link href="https://github.com/quantachain/quanta" className="text-gray-500 flex items-center gap-2 text-sm font-bold">
                <Github className="w-4 h-4" /> GitHub
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
