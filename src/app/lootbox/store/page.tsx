"use client";

import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { supabase } from "@/lib/supabase";

const rarities = ["common", "rare", "epic", "legendary"] as const;

const rarityMeta: Record<
  (typeof rarities)[number],
  { color: string; price: number }
> = {
  common: { color: "gray", price: 1 },
  rare: { color: "blue", price: 5 },
  epic: { color: "purple", price: 50 },
  legendary: { color: "orange", price: 500 },
};

export default function LootboxStore() {
  const user = useUser();
  const [quantities, setQuantities] = useState<Record<string, number>>({
    common: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
  });

  const [loading, setLoading] = useState(false);

  const buyLootbox = async (rarity: string) => {
    const quantity = quantities[rarity];
    if (!user?.id || quantity <= 0) return;

    setLoading(true);
    const { error } = await supabase.rpc("buy_lootboxes", {
      p_user_id: user.id,
      p_rarity: rarity,
      p_quantity: quantity,
    });

    if (error) {
      alert(error.message);
    } else {
      alert(`Bought ${quantity} ${rarity} box${quantity > 1 ? "es" : ""}!`);
      setQuantities((q) => ({ ...q, [rarity]: 0 }));
    }

    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-8 text-white">
      <h1 className="text-4xl font-bold mb-8 text-center">🛒 Buy Lootboxes</h1>

      <div className="grid grid-cols-2 gap-6">
        {rarities.map((rarity) => {
          const meta = rarityMeta[rarity];
          return (
            <div
              key={rarity}
              className={`p-4 rounded-xl bg-[#0d0614] border border-${meta.color}-500`}
            >
              <h2
                className={`text-${meta.color}-400 text-xl font-bold capitalize`}
              >
                {rarity}
              </h2>
              <p className="text-sm mb-3 text-gray-300">
                Price: €{meta.price} each
              </p>

              <input
                type="number"
                min={0}
                value={quantities[rarity]}
                onChange={(e) =>
                  setQuantities((q) => ({
                    ...q,
                    [rarity]: parseInt(e.target.value || "0"),
                  }))
                }
                className="w-full bg-gray-800 text-white p-2 rounded mb-3"
              />

              <button
                onClick={() => buyLootbox(rarity)}
                disabled={loading || quantities[rarity] <= 0}
                className="w-full bg-white text-black font-semibold py-2 rounded hover:bg-gray-200 transition disabled:opacity-50"
              >
                {loading ? "Processing..." : "Buy"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
