import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="py-16 sm:py-24 border-t border-gray-100 bg-transparent text-black">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-16">
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-3 mb-6 group">
              <Image
                src="/logo/quanta-transparent-bg-logo.svg"
                alt="Quanta Scan Logo"
                width={48}
                height={48}
                className="w-12 h-12 transition-transform group-hover:scale-110"
              />
              <span className="text-3xl font-bold tracking-tighter">
                Quanta<span className="text-[#00E599]">Scan</span>
              </span>
            </Link>
            <p className="text-gray-500 max-w-sm text-base leading-relaxed mb-6">
              The official block explorer for Quanta Chain. Track blocks, transactions, and network metrics in real-time.
            </p>
          </div>

          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-bold mb-6 text-sm uppercase tracking-wider text-gray-900">Explorer</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><Link href="/" className="hover:text-[#00E599] transition-colors">Dashboard</Link></li>
                <li><Link href="/blocks" className="hover:text-[#00E599] transition-colors">Latest Blocks</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-sm uppercase tracking-wider text-gray-900">Network</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><Link href="https://rpc.quantachain.org/health" target="_blank" className="hover:text-[#00E599] transition-colors">RPC Health</Link></li>
                <li><Link href="https://quantachain.org/faucet" target="_blank" className="hover:text-[#00E599] transition-colors">Faucet</Link></li>
                <li>
                  <span className="flex items-center gap-2 cursor-not-allowed">
                    Nodes <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-semibold">Soon</span>
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-sm uppercase tracking-wider text-gray-900">Resources</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><Link href="https://quantachain.org" target="_blank" className="hover:text-[#00E599] transition-colors">Main Website</Link></li>
                <li><Link href="https://github.com/quantachain/quanta" target="_blank" className="hover:text-[#00E599] transition-colors">GitHub</Link></li>
                <li><Link href="https://quantachain.gitbook.io/quantachain-docs" target="_blank" className="hover:text-[#00E599] transition-colors">Documentation</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-100 text-sm text-gray-500 gap-4">
          <p className="font-mono text-xs">© {new Date().getFullYear()} Quanta Chain. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
