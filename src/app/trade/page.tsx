"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";

export default function TradePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("id, username, display_name, avatar_url")
        .ilike("username", `%${query}%`);

      if (!error) setResults(data || []);
      setLoading(false);
    };

    const delay = setTimeout(() => fetchUsers(), 300); // debounce
    return () => clearTimeout(delay);
  }, [query]);

  return (
    <div className="max-w-3xl mx-auto p-8 text-white">
      <h1 className="text-3xl font-bold mb-4">🔁 Send a Trade Request</h1>
      <input
        type="text"
        placeholder="Search for user by username..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full mb-6 px-4 py-2 rounded bg-gray-900 border border-gray-700 text-white"
      />

      {loading && <p className="text-gray-400">Searching...</p>}

      <div className="space-y-4">
        {results.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between bg-[#130a1f] p-4 rounded-lg"
          >
            <div className="flex items-center gap-4">
              <Image
                src={user.avatar_url || "/default-avatar.png"}
                alt="avatar"
                width={40}
                height={40}
                className="rounded-full"
              />
              <div>
                <p className="font-semibold">{user.display_name}</p>
                <p className="text-sm text-purple-400">@{user.username}</p>
              </div>
            </div>

            <Link
              href={`/trade/new?to=${user.username}`}
              className="text-sm bg-white text-black font-bold px-4 py-2 rounded hover:bg-gray-200 transition"
            >
              Send Trade Request
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
