"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { motion } from "framer-motion";

interface User {
  id: string;
  display_name: string;
  avatar_url?: string;
  total_spent: number;
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, display_name, avatar_url, total_spent")
        .order("total_spent", { ascending: false })
        .limit(100);

      if (!error && data) {
        setUsers(data as User[]);
      } else {
        console.error("Failed to load leaderboard:", error);
      }

      setLoading(false);
    };

    fetchLeaderboard();
  }, []);

  if (loading)
    return <p className="text-center py-10">Loading leaderboard...</p>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">🏆 Leaderboard</h1>
      <motion.ul
        className="space-y-4"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.06,
            },
          },
        }}
      >
        {users.map((user, index) => (
          <motion.li
            key={user.id}
            className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <span className="text-lg font-bold w-6 text-right">
              {index + 1}
            </span>
            <Image
              src={
                user.avatar_url ||
                `https://api.dicebear.com/7.x/thumbs/png?seed=${user.display_name}`
              }
              alt={user.display_name}
              width={40}
              height={40}
              className="rounded-full"
            />
            <div className="flex-1">
              <p className="font-semibold">{user.display_name}</p>
            </div>
            <span className="font-mono text-gray-700">
              €{user.total_spent.toFixed(2)}
            </span>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}
