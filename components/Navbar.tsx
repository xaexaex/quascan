import Link from "next/link";
import { Search, Menu } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#00E599] rounded-full flex items-center justify-center">
            <span className="text-black font-bold text-xl">Q</span>
          </div>
          <span className="text-2xl font-bold text-black">QuantaScan</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-gray-600 hover:text-[#00E599] transition-colors font-medium">
            Home
          </Link>
          <Link href="/blocks" className="text-gray-600 hover:text-[#00E599] transition-colors font-medium">
            Blocks
          </Link>
          <Link href="/mempool" className="text-gray-600 hover:text-[#00E599] transition-colors font-medium">
            Mempool
          </Link>
          <Link href="/peers" className="text-gray-600 hover:text-[#00E599] transition-colors font-medium">
            Peers
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2 border border-gray-200">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search blocks, transactions..."
              className="bg-transparent border-none outline-none text-sm w-64"
            />
          </div>
          <button className="md:hidden p-2">
            <Menu className="w-6 h-6 text-black" />
          </button>
        </div>
      </div>
    </nav>
  );
}
