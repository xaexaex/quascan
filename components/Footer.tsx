"use client";

import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ borderTop: "1px solid var(--c-border)", marginTop: "auto" }}>
      <div className="container" style={{ padding: "48px 40px 32px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 32, marginBottom: 40 }}>

          {/* Brand */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M7 2H17V7H22V17H17V22H7V17H2V7H7V2ZM9 9V15H15V9H9Z" fill="var(--c-accent)" />
              </svg>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontStyle: "italic", fontSize: "1.0625rem", color: "var(--c-text-1)" }}>
                QuaScan
              </span>
            </Link>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--c-text-3)", letterSpacing: "0.04em", lineHeight: 1.7, maxWidth: 260 }}>
              Falcon-512 secured post-quantum blockchain<br />explorer with AI execution layer.<br />
              <span style={{ color: "var(--c-text-2)", marginTop: 6, display: "inline-block" }}>By QUANTALABS PVT LTD</span>
            </p>
          </div>

          {/* Nav columns */}
          <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
            {/* Explorer */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--c-text-3)" }}>
                Explorer
              </span>
              {[
                { label: "Blocks",     href: "/blocks" },
                { label: "Transactions", href: "/transactions" },
                { label: "Mempool", href: "/mempool" },
                { label: "Validators", href: "/validators" },
              ].map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--c-text-2)", transition: "color var(--t)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--c-text-1)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--c-text-2)")}
                >
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Resources */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--c-text-3)" }}>
                Resources
              </span>
              {[
                { label: "Website", href: "https://quantachain.org" },
                { label: "GitHub",  href: "https://github.com/quantachain/quanta" },
                { label: "Docs",    href: "https://quantachain.gitbook.io/quantachain-docs" },
              ].map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--c-text-2)", transition: "color var(--t)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--c-text-1)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--c-text-2)")}
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: "1px solid var(--c-border)", paddingTop: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--c-text-3)", letterSpacing: "0.04em" }}>
            © {year} QuantaChain. All rights reserved.
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--c-text-3)", letterSpacing: "0.04em" }}>
            Falcon-512 · Post-Quantum · Open Source
          </span>
        </div>
      </div>
    </footer>
  );
}
