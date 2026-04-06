import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-16 sm:py-20 border-t border-gray-100 bg-white text-black">
      <div className="container mx-auto px-6">

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-16">

          {/* Brand */}
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-2 mb-5 group">
              <span className="text-2xl font-black tracking-tight text-black">
                Qua<span className="text-[#00E599]">Scan</span>
              </span>
              <span className="bg-[#00E599]/10 text-[#00E599] text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border border-[#00E599]/20">
                Beta
              </span>
            </Link>
            <p className="text-gray-500 max-w-sm text-sm leading-relaxed mb-6">
              The official block explorer for Quanta Chain — a quantum-resistant blockchain
              built with NIST-standardized post-quantum cryptography. Track blocks,
              transactions, and network metrics in real-time.
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              {/* Discord */}
              <a
                href="https://discord.gg/7KmMBrrJEz"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#00E599] hover:text-[#00E599] transition-all hover:scale-110"
                aria-label="Discord"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </a>

              {/* X / Twitter */}
              <a
                href="https://x.com/quantachain"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#00E599] hover:text-[#00E599] transition-all hover:scale-110"
                aria-label="X (Twitter)"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* Telegram */}
              <a
                href="https://t.me/quantanetwork"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#00E599] hover:text-[#00E599] transition-all hover:scale-110"
                aria-label="Telegram"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" />
                </svg>
              </a>

              {/* GitHub */}
              <a
                href="https://github.com/quantachain/quanta"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#00E599] hover:text-[#00E599] transition-all hover:scale-110"
                aria-label="GitHub"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Link Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">

            {/* Explorer */}
            <div>
              <h4 className="font-bold mb-5 text-xs uppercase tracking-wider text-gray-900">Explorer</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><Link href="/" className="hover:text-[#00E599] transition-colors">Dashboard</Link></li>
                <li><Link href="/blocks" className="hover:text-[#00E599] transition-colors">All Blocks</Link></li>
                <li>
                  <Link href="https://quantachain.org" target="_blank" className="hover:text-[#00E599] transition-colors flex items-center gap-1.5">
                    Quanta Website
                    <span className="text-[9px] bg-[#00E599]/10 text-[#00E599] px-1.5 py-0.5 rounded font-bold uppercase border border-[#00E599]/20">Live</span>
                  </Link>
                </li>
                <li>
                  <Link href="https://quantachain.org/faucet" target="_blank" className="hover:text-[#00E599] transition-colors flex items-center gap-1.5">
                    Faucet
                    <span className="text-[9px] bg-[#00E599]/10 text-[#00E599] px-1.5 py-0.5 rounded font-bold uppercase border border-[#00E599]/20">Live</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Ecosystem */}
            <div>
              <h4 className="font-bold mb-5 text-xs uppercase tracking-wider text-gray-900">Ecosystem</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li>
                  <Link href="https://chromewebstore.google.com/detail/quanta-wallet/glofbcgdmodmaohealombcgoapdbdaff" target="_blank" rel="noopener noreferrer" className="hover:text-[#00E599] transition-colors flex items-center gap-1.5">
                    Wallet
                    <span className="text-[9px] bg-[#00E599]/10 text-[#00E599] px-1.5 py-0.5 rounded font-bold uppercase border border-[#00E599]/20">Live</span>
                  </Link>
                </li>
                <li><span className="text-gray-400 flex items-center gap-1.5">Mining Pool <span className="text-[9px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded font-bold uppercase">Soon</span></span></li>
              </ul>
            </div>

            {/* Developers */}
            <div>
              <h4 className="font-bold mb-5 text-xs uppercase tracking-wider text-gray-900">Developers</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><a href="https://github.com/quantachain/quanta" target="_blank" rel="noopener noreferrer" className="hover:text-[#00E599] transition-colors">GitHub</a></li>
                <li><a href="https://quantachain.gitbook.io/quantachain-docs" target="_blank" rel="noopener noreferrer" className="hover:text-[#00E599] transition-colors">Documentation</a></li>
                <li><a href="https://quantachain.org/docs/WHITEPAPER.docx" className="hover:text-[#00E599] transition-colors">Whitepaper</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-bold mb-5 text-xs uppercase tracking-wider text-gray-900">Company</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><a href="https://quantachain.org/team" target="_blank" className="hover:text-[#00E599] transition-colors">About</a></li>
                <li><a href="https://quantachain.org/community" target="_blank" className="hover:text-[#00E599] transition-colors">Community</a></li>
                <li><a href="mailto:contact@quantachain.org" className="hover:text-[#00E599] transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-100 text-xs text-gray-400 gap-4">
          <p className="font-mono">© {currentYear} QuantaChain. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="https://quantachain.org/privacy" target="_blank" className="hover:text-black transition-colors">Privacy Policy</a>
            <a href="https://quantachain.org/terms" target="_blank" className="hover:text-black transition-colors">Terms of Service</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
