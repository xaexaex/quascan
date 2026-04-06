"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery) return;

    if (/^\d+$/.test(cleanQuery)) {
      router.push(`/block/${cleanQuery}`);
    } else if (cleanQuery.length === 42) {
      router.push(`/address/${cleanQuery}`);
    } else if (cleanQuery.length === 64) {
      router.push(`/tx/${cleanQuery}`);
    } else {
      alert("Invalid search format. Must be Block Height, 42-char Address, or 64-char Tx Hash.");
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full">
      <div className="relative flex items-center bg-white border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-[#00E599]/30 focus-within:border-[#00E599] transition-all overflow-hidden group shadow-sm">
        <div className="pl-3 pr-2 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#00E599]">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Block Height, Address, or Tx Hash..."
          className="w-full py-2.5 pr-4 text-sm bg-transparent font-mono focus:outline-none placeholder:text-gray-400 text-black"
        />
        <button
          type="submit"
          className="text-[10px] font-bold text-gray-500 hover:text-[#00E599] px-3 py-1.5 mr-1 bg-gray-50 border border-gray-200 rounded-lg shadow-sm transition-colors"
        >
          /
        </button>
      </div>
    </form>
  );
}
