"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const NAV_LINKS = [
  { href: "/",           label: "Home" },
  { href: "/blocks",     label: "Blocks" },
  { href: "/validators", label: "Validators" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          height: "var(--nav-h)",
          zIndex: 100,
          display: "flex",
          alignItems: "stretch",
          borderBottom: `1px solid ${scrolled ? "var(--c-border-mid)" : "var(--c-border)"}`,
          background: scrolled ? "rgba(13,4,2,0.97)" : "rgba(13,4,2,0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          transition: "background 0.25s ease, border-color 0.25s ease",
        }}
      >
        {/* Logo cell */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "0 24px",
            borderRight: "1px solid var(--c-border)",
            flexShrink: 0,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path fillRule="evenodd" clipRule="evenodd" d="M7 2H17V7H22V17H17V22H7V17H2V7H7V2ZM9 9V15H15V9H9Z" fill="#D4FF28" />
          </svg>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontStyle: "italic",
              fontSize: "1.1875rem",
              color: "var(--c-text-1)",
              letterSpacing: "-0.01em",
            }}
          >
            QuaScan
          </span>
        </Link>

        {/* Desktop nav links */}
        <div
          className="nav-desktop-links"
          style={{ display: "flex", alignItems: "stretch", flex: 1 }}
        >
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "0 22px",
                  fontFamily: "var(--font-body)",
                  fontWeight: 400,
                  fontSize: "0.8125rem",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: active ? "var(--c-text-1)" : "var(--c-text-3)",
                  borderRight: "1px solid var(--c-border)",
                  borderBottom: active ? "2px solid var(--c-accent)" : "2px solid transparent",
                  transition: "color var(--t)",
                }}
                onMouseEnter={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.color = "var(--c-text-2)";
                }}
                onMouseLeave={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.color = "var(--c-text-3)";
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right — Testnet badge */}
        <div
          className="nav-desktop-right"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "0 20px",
            marginLeft: "auto",
            borderLeft: "1px solid var(--c-border)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.625rem",
              color: "var(--c-accent)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              border: "1px solid var(--c-accent-mid)",
              background: "var(--c-accent-dim)",
              padding: "4px 10px",
            }}
          >
            Testnet
          </span>
        </div>

        {/* Hamburger — mobile only */}
        <button
          id="nav-hamburger"
          className="nav-hamburger"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          style={{
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            width: 56,
            background: "transparent",
            border: "none",
            borderLeft: "1px solid var(--c-border)",
            cursor: "pointer",
            flexShrink: 0,
            padding: 0,
            color: "var(--c-text-2)",
            marginLeft: "auto",
          }}
        >
          {open ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="3" y1="7" x2="21" y2="7" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="17" x2="21" y2="17" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div
          style={{
            position: "fixed",
            top: "var(--nav-h)",
            left: 0, right: 0, bottom: 0,
            background: "rgba(13,4,2,0.98)",
            backdropFilter: "blur(20px)",
            zIndex: 99,
            display: "flex",
            flexDirection: "column",
            padding: "8px 0 32px",
            overflowY: "auto",
          }}
        >
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "20px 28px",
                  borderBottom: "1px solid var(--c-border)",
                  fontFamily: "var(--font-display)",
                  fontWeight: 500,
                  fontSize: "1.375rem",
                  fontStyle: active ? "italic" : "normal",
                  color: active ? "var(--c-accent)" : "var(--c-text-1)",
                  letterSpacing: "-0.01em",
                  gap: 12,
                }}
              >
                {active && (
                  <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--c-accent)", flexShrink: 0 }} />
                )}
                {link.label}
              </Link>
            );
          })}
        </div>
      )}

      <style>{`
        @media (max-width: 720px) {
          .nav-desktop-links { display: none !important; }
          .nav-desktop-right  { display: none !important; }
          .nav-hamburger      { display: flex !important; }
        }
      `}</style>
    </>
  );
}
