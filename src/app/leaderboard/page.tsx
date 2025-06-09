"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { MoreVertical } from "lucide-react";
import { useUser } from "@/context/UserContext";

interface User {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  total_spent: number;
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [dropdownIndex, setDropdownIndex] = useState<number | null>(null);
  const user = useUser();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data } = await supabase
        .from("users")
        .select("id, username, display_name, avatar_url, total_spent")
        .order("total_spent", { ascending: false })
        .limit(100);

      if (data) setUsers(data);
    };

    fetchLeaderboard();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".dropdown-wrapper")) {
        setDropdownIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-white">
      <h1 className="text-4xl font-bold text-center mb-10">🏆 Leaderboard</h1>
      <motion.ul
        className="space-y-4"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: { staggerChildren: 0.05 },
          },
        }}
      >
        {users.map((u, index) => {
          const isOwnProfile = u.id === user?.id;

          return (
            <motion.li
              key={u.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              className={`relative bg-[#12081c] p-4 rounded-xl flex items-center justify-between transition shadow-sm border border-white/5 ${
                index === 0
                  ? "ring-2 ring-yellow-400"
                  : index === 1
                  ? "ring-2 ring-gray-400"
                  : index === 2
                  ? "ring-2 ring-orange-400"
                  : ""
              }`}
            >
              <div className="flex items-center gap-4 flex-1">
                <span className="text-lg font-bold w-6 text-right text-gray-400">
                  {index + 1}
                </span>
                <Image
                  src={
                    u.avatar_url ||
                    `https://api.dicebear.com/7.x/thumbs/png?seed=${u.display_name}`
                  }
                  alt={u.display_name}
                  width={48}
                  height={48}
                  className="rounded-full border border-white/10"
                />
                <div>
                  <p className="font-semibold text-white">{u.display_name}</p>
                  <p className="text-xs text-purple-400">@{u.username}</p>
                </div>
              </div>

              <span className="font-mono text-green-400 text-sm ml-2">
                €{u.total_spent.toFixed(2)}
              </span>

              {/* Dropdown */}
              <div className="relative ml-4 dropdown-wrapper">
                <button
                  onClick={() =>
                    setDropdownIndex(dropdownIndex === index ? null : index)
                  }
                  className="text-white hover:bg-white/10 p-1 rounded-full transition"
                >
                  <MoreVertical size={20} />
                </button>

                {dropdownIndex === index && (
                  <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded-xl shadow-lg z-50 overflow-hidden">
                    <Link
                      href={`/profile/${u.username}`}
                      className="block px-4 py-3 hover:bg-gray-100 transition text-sm"
                    >
                      Profile
                    </Link>
                    {!isOwnProfile && (
                      <Link
                        href={`/trade/new?to=${u.username}`}
                        className="block px-4 py-3 hover:bg-gray-100 transition text-sm"
                      >
                        Send Trade Request
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </motion.li>
          );
        })}
      </motion.ul>
    </div>
  );
}
