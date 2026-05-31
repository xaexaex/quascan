"use client";

import Link from "next/link";
import Image from "next/image";
import { Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.redirect) {
          router.push(data.redirect);
          setSearchQuery("");
          return;
        }
      }
    } catch {}
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Blocks", href: "/blocks" },
    { name: "Validators", href: "/validators" },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-3 px-4 pointer-events-none">
      <nav
        className={`pointer-events-auto w-full max-w-3xl transition-all duration-300 rounded-2xl px-4 h-12 flex items-center justify-between gap-3 ${
          scrolled
            ? "bg-[var(--navbar-bg)] backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.22)]"
            : "bg-[var(--navbar-bg)]/60 backdrop-blur-md shadow-[0_2px_16px_rgba(0,0,0,0.08)]"
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center flex-shrink-0 gap-2 group">
          <Image
            src="/logo/quanta-transparent-bg-logo.svg"
            alt="Quanta"
            width={22}
            height={22}
            className="object-contain group-hover:drop-shadow-[0_0_6px_var(--accent)] transition-all"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
          <span className="text-sm font-black tracking-tight text-[var(--text-primary)] font-sans group-hover:text-[var(--accent)] transition-colors">
            QuaScan
          </span>
          <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-[var(--accent-light)] text-[var(--accent)] border border-[var(--accent)]/25 leading-none">
            Testnet
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden sm:flex items-center gap-0.5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                  isActive
                    ? "text-[var(--accent)] bg-[var(--accent-light)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Mini search */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 max-w-[220px] items-center bg-[var(--surface-2)] rounded-xl px-3 h-8 gap-2 focus-within:ring-1 focus-within:ring-[var(--accent)]/40 transition-all"
        >
          <svg className="w-3 h-3 text-[var(--text-muted)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Block / Tx / Address..."
            className="bg-transparent text-[10px] font-medium text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none w-full"
          />
        </form>

        {/* Right side: theme toggle (removed) */}
        <div className="flex items-center gap-2 flex-shrink-0">
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-4 right-4 pointer-events-auto quantum-panel p-3 flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-150">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`py-2.5 px-4 text-sm font-semibold rounded-xl transition-colors ${
                  isActive ? "text-[var(--accent)] bg-[var(--accent-light)]" : "text-[var(--text-secondary)] hover:bg-[var(--surface-2)]"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
