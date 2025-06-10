"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

const rarities = ["common", "rare", "epic", "legendary"] as const;

const rarityColors: Record<(typeof rarities)[number], string> = {
  common: "border-gray-500 text-gray-400",
  rare: "border-blue-500 text-blue-400",
  epic: "border-purple-500 text-purple-400",
  legendary: "border-orange-500 text-orange-400",
};

const rarityGlow: Record<(typeof rarities)[number], string> = {
  common: "shadow-[0_0_12px_#9ca3af]",
  rare: "shadow-[0_0_14px_#60a5fa]",
  epic: "shadow-[0_0_14px_#a78bfa]",
  legendary: "shadow-[0_0_16px_#f97316]",
};

const rarityTextColors: Record<(typeof rarities)[number], string> = {
  common: "text-gray-400",
  rare: "text-blue-400",
  epic: "text-purple-400",
  legendary: "text-orange-400",
};

export default function LootboxInventory() {
  const user = useUser();
  const [boxes, setBoxes] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(false);
  const [isOpeningAnim, setIsOpeningAnim] = useState(false);
  const [drop, setDrop] = useState<{
    product_name: string;
    purchase_index: number;
    rarity: "common" | "rare" | "epic" | "legendary";
  } | null>(null);

  const fetchLootboxes = async () => {
    const { data } = await supabase
      .from("lootboxes")
      .select("rarity")
      .eq("user_id", user?.id)
      .eq("opened", false);

    const counts: Record<string, number> = {};
    data?.forEach((box) => {
      counts[box.rarity] = (counts[box.rarity] || 0) + 1;
    });

    setBoxes(counts);
    setLoading(false);
  };

  const router = useRouter();
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
      }
    };

    checkAuth();
  }, [router]);

  const playSound = (src: string) => {
    const audio = new Audio(src);
    audio.play().catch((err) => console.error("Audio play error:", err));
  };

  const openBox = async (rarity: string) => {
    if (opening || !user?.id) return;
    setOpening(true);
    setIsOpeningAnim(true);
    setDrop(null);

    playSound("/sounds/lootbox_open.mp3");

    await new Promise((r) => setTimeout(r, 350));

    const { data, error } = await supabase.rpc("open_lootbox", {
      p_user_id: user.id,
      p_rarity: rarity,
    });

    if (error) {
      alert(error.message);
    } else if (data && data.length > 0) {
      const dropInfo = data[0];

      setDrop({
        product_name: dropInfo.product_name,
        purchase_index: dropInfo.purchase_index,
        rarity: dropInfo.product_rarity,
      });
      await fetchLootboxes();
    }

    setTimeout(() => {
      playSound("/sounds/lootbox_reveal.mp3");
    }, 2000);

    setIsOpeningAnim(false);
    setOpening(false);
  };

  useEffect(() => {
    if (user) fetchLootboxes();
  }, [user]);

  if (loading)
    return <p className="text-white p-8">Loading your lootboxes...</p>;

  return (
    <div className="max-w-xl mx-auto p-8 text-white">
      <h1 className="text-3xl font-bold mb-6">🎁 Your Lootboxes</h1>

      <div className="grid grid-cols-2 gap-4">
        {rarities.map((rarity) => (
          <div
            key={rarity}
            className={`p-4 rounded-lg bg-[#0d0614] border transition-all duration-300 ${
              rarityColors[rarity]
            } ${isOpeningAnim ? "animate-pulse scale-105" : ""}`}
          >
            <h3
              className={`capitalize text-lg font-semibold ${
                rarityColors[rarity].split(" ")[1]
              }`}
            >
              {rarity}
            </h3>
            <p className="text-gray-300 text-sm mb-3">
              You have: {boxes[rarity] || 0}
            </p>
            <button
              onClick={() => openBox(rarity)}
              disabled={opening || (boxes[rarity] || 0) <= 0}
              className="bg-white text-black px-4 py-2 rounded font-semibold hover:bg-gray-200 transition disabled:opacity-50"
            >
              {opening && isOpeningAnim ? "Opening..." : "Open"}
            </button>
          </div>
        ))}
      </div>

      {drop && (
        <motion.div
          className={`mt-8 p-6 rounded-lg bg-[#1a102a] text-center border border-white/10 ${
            drop ? rarityGlow[drop.rarity] : ""
          }`}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <h2 className="text-xl font-bold mb-2 text-green-400">🎉 You got:</h2>
          <p className="text-white text-lg font-semibold">
            {drop.product_name}
          </p>
          <p
            className={`text-sm font-medium mt-1 ${
              rarityTextColors[drop.rarity]
            }`}
          >
            {drop.rarity.charAt(0).toUpperCase() + drop.rarity.slice(1)}
          </p>
          <p className="text-sm text-purple-400 mt-1">#{drop.purchase_index}</p>
        </motion.div>
      )}

      <div className="mt-10 flex justify-center">
        <Link
          href="/lootbox/store"
          className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-3 rounded-full shadow-md transition"
        >
          + Buy More Lootboxes
        </Link>
      </div>
    </div>
  );
}
