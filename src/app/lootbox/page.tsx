"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/context/UserContext";

const rarities = ["common", "rare", "epic", "legendary"] as const;

const rarityColors: Record<(typeof rarities)[number], string> = {
  common: "border-gray-500 text-gray-400",
  rare: "border-blue-500 text-blue-400",
  epic: "border-purple-500 text-purple-400",
  legendary: "border-orange-500 text-orange-400",
};

export default function LootboxInventory() {
  const user = useUser();
  const [boxes, setBoxes] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(false);
  const [drop, setDrop] = useState<{
    product_name: string;
    purchase_index: number;
  } | null>(null);

  const fetchLootboxes = async () => {
    const { data, error } = await supabase
      .from("lootboxes")
      .select("rarity")
      .eq("user_id", user?.id)
      .eq("opened", false);

    if (error) {
      console.error(error);
      return;
    }

    const counts: Record<string, number> = {};
    data?.forEach((box) => {
      counts[box.rarity] = (counts[box.rarity] || 0) + 1;
    });

    setBoxes(counts);
    setLoading(false);
  };

  const openBox = async (rarity: string) => {
    if (opening || !user?.id) return;
    setOpening(true);
    setDrop(null);

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
      });
      await fetchLootboxes();
    }

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
            className={`p-4 rounded-lg bg-[#0d0614] border ${rarityColors[rarity]}`}
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
              {opening ? "Opening..." : "Open"}
            </button>
          </div>
        ))}
      </div>

      {drop && (
        <div className="mt-8 p-6 rounded-lg bg-[#1a102a] text-center">
          <h2 className="text-xl font-bold mb-2 text-green-400">You got:</h2>
          <p className="text-white text-lg font-semibold">
            {drop.product_name}
          </p>
          <p className="text-sm text-purple-400">#{drop.purchase_index}</p>
        </div>
      )}
    </div>
  );
}
