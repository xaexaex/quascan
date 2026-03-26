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
    } else if (cleanQuery.startsWith("0x") && cleanQuery.length === 42) {
      router.push(`/address/${cleanQuery}`);
    } else if (cleanQuery.length === 64) {
      alert("Search by Hash is not supported on this node yet. Searching by Block Height or Address only.");
    } else {
      alert("Invalid search format.");
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full">
      <div className="relative flex items-center bg-gray-50 border border-gray-200 rounded-lg focus-within:ring-2 ring-[#00E599]/20 focus-within:border-[#00E599] transition-all overflow-hidden group">
        <div className="pl-3 pr-2 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#00E599]">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Block Height or Address..."
          className="w-full py-2.5 pr-4 text-sm bg-transparent focus:outline-none placeholder:text-gray-400 text-gray-900"
        />
        <button
          type="submit"
          className="text-xs font-bold text-gray-500 hover:text-gray-900 px-3 py-1.5 mr-1 bg-white border border-gray-200 rounded-md shadow-sm transition-colors"
        >
          /
        </button>
      </div>
    </form>
  );
}
