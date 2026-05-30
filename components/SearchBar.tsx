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
      <div className="relative flex items-center bg-surface-2 border border-border rounded-xl focus-within:border-accent focus-within:ring-1 focus-within:ring-accent/30 transition-all overflow-hidden group shadow-sm">
        <div className="pl-4 pr-2 flex items-center pointer-events-none text-text-muted group-focus-within:text-accent transition-colors">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Block, Address, Tx..."
          className="w-full py-2.5 pr-2 text-xs font-semibold bg-transparent focus:outline-none placeholder:text-text-muted text-text-primary"
          spellCheck={false}
        />
        <button
          type="submit"
          className="mr-1.5 p-2 bg-accent hover:bg-accent/90 text-white rounded-lg transition-colors flex items-center justify-center cursor-pointer shadow-sm shadow-accent/20"
          aria-label="Search Submit"
        >
          <Search className="w-3.5 h-3.5" />
        </button>
      </div>
    </form>
  );
}

