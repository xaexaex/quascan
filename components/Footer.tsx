import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border)] py-6 px-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)] font-medium">

        {/* Logo + copyright */}
        <div className="flex items-center gap-2">
          <Image
            src="/logo/quanta-transparent-bg-logo.svg"
            alt="QuaScan"
            width={18}
            height={18}
            className="object-contain opacity-60"
          />
          <span>© {currentYear} QuantaChain. All rights reserved.</span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-5">
          <Link href="/blocks" className="hover:text-[var(--text-primary)] transition-colors">Blocks</Link>
          <a href="https://quantachain.org" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text-primary)] transition-colors">Website</a>
          <a href="https://github.com/quantachain/quanta" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text-primary)] transition-colors">GitHub</a>
          <a href="https://quantachain.gitbook.io/quantachain-docs" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text-primary)] transition-colors">Docs</a>
        </div>

      </div>
    </footer>
  );
}
