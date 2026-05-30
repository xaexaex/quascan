"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery) return;

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(cleanQuery)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.redirect) {
          router.push(data.redirect);
          return;
        }
      }
      alert("No results found for your search.");
    } catch (e) {
      alert("Error occurred during search.");
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full">
      <div className="relative flex items-center bg-white/5 border border-white/10 rounded-xl focus-within:border-[#00E599]/50 focus-within:bg-white/10 transition-all overflow-hidden group shadow-lg shadow-black/50">
        <div className="pl-4 pr-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#00E599] transition-colors">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Block, Address, Tx..."
          className="w-full py-2.5 pr-4 text-sm bg-transparent font-medium focus:outline-none placeholder:text-gray-600 text-white"
        />
        <div className="pr-2">
          <button
            type="submit"
            className="text-xs font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5 transition-colors"
          >
            /
          </button>
        </div>
      </div>
    </form>
  );
}
